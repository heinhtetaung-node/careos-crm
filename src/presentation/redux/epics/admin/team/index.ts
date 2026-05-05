import { combineEpics, ofType } from 'redux-observable';
import { forkJoin, of } from 'rxjs';
import {
  switchMap,
  exhaustMap,
  withLatestFrom,
  pluck,
  map,
  catchError,
  mergeMap,
  delayWhen,
} from 'rxjs/operators';

import SelectorUseCase from 'domain/usecases/admin';
import CreateAdminTeamUseCase from 'domain/usecases/admin/team/CreateAdminTeamUseCase';
import {
  getTeams,
  getTeamsFailed,
  getTeamsSuccess,
  TeamActionTypes,
  editTeamFailed,
  editTeamSuccess,
  createTeamSuccess,
  createTeamFail,
  getTeamsNameSuccess,
  getTeamsNameFailed,
  getTeamsName,
  TeamDetailSelectorActionTypes,
  getTeamDetailSelectorSuccess,
  getTeamDetailSelectorFail,
} from 'presentation/redux/actions/admin/team';
import { showSnackBar, hideModal } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import getPageState from 'shared/helper/pageState.helper';
import {
  epicWithStateFn,
  epicWithoutStateFn,
  IAction,
} from 'shared/interfaces/common';
import { ICreateTeam } from 'shared/interfaces/common/admin/team';

import destroyWhen, {
  delayLoading,
} from '../../../../../shared/helper/operator';
import { PageActionTypes } from '../../../actions/page';

interface IPageState {
  currentPage: number;
  pageToken: string;
  showDeleted?: boolean;
  orderBy?: string[];
}

const createAdminTeamEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(TeamActionTypes.CREATE_TEAM),
    withLatestFrom(state$.pipe(pluck('teamReducer', 'listReducer'))),
    exhaustMap(([action, state]) =>
      new CreateAdminTeamUseCase(action.payload).execute().pipe(
        mergeMap((res) => {
          const pageState: IPageState = getPageState(
            state.listPageToken,
            state.pageIndex
          );
          if (state.showDeleted) {
            pageState.showDeleted = true;
          }
          pageState.orderBy = state.orderBy || [];
          return of(
            createTeamSuccess(res),
            showSnackBar({
              isOpen: true,
              message: getString('text.createTeamSuccess'),
              status: 'success',
            }),
            hideModal(CONSTANTS.ModalConfig.teamModal),
            getTeams({
              ...pageState,
              pageSize: state.pageSize,
              currentPage: 1,
              pageToken: '',
            }),
            getTeamsName({ ...pageState, pageSize: 300 })
          );
        }),
        catchError((error) =>
          of(
            createTeamFail(error),
            showSnackBar({
              isOpen: true,
              message: error.message || getString('text.createTeamFail'),
              status: 'error',
            })
          )
        )
      )
    )
  );

const getTeamsEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(TeamActionTypes.GET_TEAMS),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    switchMap(([action]) =>
      new SelectorUseCase.GetTeamsUseCase().execute(action.payload).pipe(
        delayWhen(delayLoading),
        map((res: any) =>
          getTeamsSuccess({
            teams: res?.teamsWithUsers || [],
            pageToken: res?.nextPageToken || '',
            currentPage: action.payload.currentPage,
          })
        ),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE]),
        catchError((error) =>
          of(getTeamsFailed(error.toString() || 'Get team failed'))
        )
      )
    )
  );

// INFO: Edit Team
const editTeamEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(TeamActionTypes.EDIT_TEAM),
    withLatestFrom(state$.pipe(pluck('teamReducer', 'listReducer'))),
    exhaustMap(([action, state]) =>
      new SelectorUseCase.EditTeamUseCase(
        action.payload as ICreateTeam,
        action.name
      )
        .execute()
        .pipe(
          mergeMap((res) => {
            const pageState: IPageState = getPageState(
              state.listPageToken,
              state.pageIndex
            );
            if (state.showDeleted) {
              pageState.showDeleted = true;
            }
            pageState.orderBy = state.orderBy || [];
            return of(
              editTeamSuccess(res),
              hideModal(CONSTANTS.ModalConfig.teamModal),
              showSnackBar({
                isOpen: true,
                message: getString('text.updateTeamSuccessfully'),
                status: CONSTANTS.snackBarConfig.type.success,
              }),
              getTeams({
                ...pageState,
                pageSize: state.pageSize,
                filter: state.filter,
              })
            );
          }),
          catchError((error) =>
            of(
              editTeamFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.updateTeamFail'),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

const addFilterTeamEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(TeamActionTypes.ADD_TEAM_FILTER),
    withLatestFrom(state$.pipe(pluck('teamReducer'))),
    map(([_, state]: any) => {
      const { listReducer } = state;
      return {
        type: TeamActionTypes.GET_TEAMS,
        payload: {
          currentPage: 1,
          pageToken: '',
          pageSize: listReducer.pageSize,
          orderBy: listReducer.orderBy,
          filter: `${listReducer.filter}`,
        },
        userOption: {
          currentPage: 1,
          pageIndex: 1,
          pageSize: 200,
          pageToken: '',
        },
      };
    })
  );

const getTeamsNameEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(TeamActionTypes.GET_TEAMS_NAME),
    switchMap((action: any) =>
      forkJoin([
        new SelectorUseCase.GetTeamsUseCase().execute(action.payload),
      ]).pipe(
        map((res: any) => {
          const [teamList] = res;
          return getTeamsNameSuccess({
            teams: teamList?.teamsWithUsers || [],
            pageToken: teamList?.nextPageToken || '',
            currentPage: action.payload.currentPage,
          });
        }),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE]),
        catchError((error) =>
          of(getTeamsNameFailed(error.toString() || 'Get teams name failed'))
        )
      )
    )
  );

const getTeamDetailSelectorEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(TeamDetailSelectorActionTypes.GET_TEAM_DETAIL_TYPES),
    switchMap((action: IAction<any>) =>
      new SelectorUseCase.GetTeamDetailSelectorsUseCase(action.payload as any)
        .execute()
        .pipe(
          map((res) => getTeamDetailSelectorSuccess(res)),
          catchError((error) => of(getTeamDetailSelectorFail(error.toString())))
        )
    )
  );

const adminEpic = combineEpics(
  createAdminTeamEpic,
  editTeamEpic,
  getTeamsEpic,
  getTeamsNameEpic,
  addFilterTeamEpic,
  getTeamDetailSelectorEpic
);

export default adminEpic;
