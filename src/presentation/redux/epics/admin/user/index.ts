import { ofType, combineEpics } from 'redux-observable';
import {
  EMPTY,
  forkJoin,
  from,
  iif,
  merge,
  Observable,
  of,
  asyncScheduler,
} from 'rxjs';
import {
  catchError,
  delayWhen,
  exhaustMap,
  map,
  mergeAll,
  mergeMap,
  pluck,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { PRODUCT_TYPE } from '../../../../../config/TypeFilter';
import SelectorUseCase from 'domain/usecases/admin';
import GetUsersUseCase from 'domain/usecases/admin/user';
import { initialPageState } from 'presentation/pages/admin/users/userPageHelper';
import {
  UserActionTypes,
  createUserSuccess,
  addUserToTeam,
  addUserToTeamSuccess,
  createUserFailed,
  getUsersSuccess,
  editUserSuccess,
  editUserFailed,
  getUsers,
  deleteUserMembership,
  deleteUserMembershipSuccess,
  deleteUserMembershipFailed,
  deleteUserSuccess,
  deleteUserFailed,
  getTeamByUserSuccess,
  getTeamByUserFailed,
  getTeamInfo,
  getTeamInfoFailed,
  getTeamInfoSuccess,
  moveUserToTeam,
  moveUserToTeamSuccess,
  moveUserToTeamFailed,
  getListCreatedBySuccess,
  getListCreatedByFailed,
  importUserSuccess,
  importUserFailed,
  getUsersFailed,
} from 'presentation/redux/actions/admin/user';
import { resetFile } from 'presentation/redux/actions/importFile';
import { showSnackBar, hideModal } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import getPageState from 'shared/helper/pageState.helper';
import { processErrMessage } from 'shared/helper/utilities';
import {
  IAction,
  epicWithStateFn,
  epicWithoutStateFn,
} from 'shared/interfaces/common';
import {
  IHandleTeamMember,
  ICreateUser,
  IUser,
} from 'shared/interfaces/common/admin/user';

import ImportUserUseCase from '../../../../../domain/usecases/admin/user/ImportUserUseCase';
import GetRoleSelectorsUseCase from '../../../../../domain/usecases/typeSelector/role/GetRoleSelectorsUseCase';
import destroyWhen, {
  delayLoading,
  delayLoadingForkJoin,
} from '../../../../../shared/helper/operator';
import { PageActionTypes } from '../../../actions/page';
import { getRoleSelectorTypesSuccess } from '../../../actions/typeSelector/role';

interface IPageState {
  currentPage: number;
  pageToken: string;
  showDeleted?: boolean;
  orderBy?: string[];
}
const GET_ROLE_PAGE_SIZE = 15;

const getUsersEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.GET_USERS),
    withLatestFrom(
      state$.pipe(pluck('typeSelectorReducer', 'roleSelectorReducer')),
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    switchMap(([action, roleState]) => {
      if (roleState?.data?.roles?.length) {
        return new GetUsersUseCase.GetUsersUseCase()
          .execute(action.payload)
          .pipe(
            delayWhen(delayLoading),
            map((res) => {
              const users = res?.usersWithTeam.map((user: IUser) => ({
                ...user,
                teamProduct: user.teamProduct
                  ? PRODUCT_TYPE[user.teamProduct]
                  : '',
              }));
              return getUsersSuccess({
                users,
                pageToken: res?.nextPageToken || '',
                currentPage: action.payload.currentPage,
                roles: roleState.data.roles,
              });
            }),
            catchError((error) => of(getUsersFailed(error.message || ''))),
            destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
          );
      }
      return forkJoin([
        new GetUsersUseCase.GetUsersUseCase().execute(action.payload),
        new GetRoleSelectorsUseCase({
          pageSize: GET_ROLE_PAGE_SIZE,
        }).execute(),
      ]).pipe(
        delayWhen(delayLoadingForkJoin),
        mergeMap(([users, roles]) => {
          const userList = users?.usersWithTeam.map((user: IUser) => ({
            ...user,
            teamProduct: user.teamProduct ? PRODUCT_TYPE[user.teamProduct] : '',
          }));
          return merge(
            of(
              getUsersSuccess({
                users: userList || [],
                pageToken: users.nextPageToken || '',
                currentPage: action.payload.currentPage,
                roles: roles?.roles || [],
              })
            ),
            of(getRoleSelectorTypesSuccess(roles))
          );
        }),
        catchError((error) => of(getUsersFailed(error.message || ''))),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      );
    })
  );

// INFO: Get team which use belong to
const getTeamByUser: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.GET_TEAM_BY_USER),
    switchMap((action: IAction<string>) =>
      new GetUsersUseCase.GetTeamByUserUsecase(action.payload as string)
        .execute()
        .pipe(
          mergeMap((res) => {
            let teamName = '';
            if (res.members.length) {
              const teamMemberName = res.members[0].name;
              teamName = teamMemberName.substring(
                0,
                teamMemberName.indexOf('/members/')
              );
            }
            return merge(
              of(getTeamByUserSuccess(res)),
              iif(() => res?.members?.length, of(getTeamInfo(teamName)), EMPTY)
            );
          }),
          catchError((error) => of(getTeamByUserFailed(error.toString())))
        )
    )
  );

// INFO: Get all team informations of each user
const getTeamInfoEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.GET_TEAM_INFO),
    switchMap((action: IAction<string>) =>
      new GetUsersUseCase.GetTeamInfoUseCase(action.payload as string)
        .execute()
        .pipe(
          map((res) => getTeamInfoSuccess(res)),
          catchError((error) => of(getTeamInfoFailed(error.toString())))
        )
    )
  );

// INFO: Create User
const createUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.CREATE_USER),
    withLatestFrom(state$.pipe(pluck('userReducer', 'listReducer'))),
    exhaustMap(([action, state]) =>
      new SelectorUseCase.CreateUserUseCase(action.payload as ICreateUser)
        .execute()
        .pipe(
          mergeMap((res: any) => {
            const addTeamPayload: IHandleTeamMember = {
              user: res?._data.name,
              team: action.team,
            };

            const pageState: IPageState = getPageState(
              state.listPageToken,
              state.pageIndex
            );
            if (state.showDeleted) {
              pageState.showDeleted = true;
            }
            pageState.orderBy = state.orderBy || [];
            return merge(
              of(createUserSuccess(res)),
              of(hideModal(CONSTANTS.ModalConfig.userModal)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.createUserSuccessfully'),
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              ),
              iif(
                () => action.isSaleAgent || action.isBackOffice,
                of(addUserToTeam(addTeamPayload)),
                EMPTY
              ),
              of(
                getUsers({
                  ...pageState,
                  pageSize: state.pageSize,
                  currentPage: 1,
                  pageToken: '',
                })
              )
            );
          }),
          catchError((error) =>
            of(
              createUserFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.createUserFail', {
                  message: processErrMessage(error.toString()),
                }),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

// INFO: Add new user to team
const addUserToTeamEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.ADD_USER_TO_TEAM),
    exhaustMap((action: IAction<IHandleTeamMember>) =>
      new SelectorUseCase.AddUserToTeamUseCase(
        action.payload as IHandleTeamMember
      )
        .execute()
        .pipe(
          map((res) => addUserToTeamSuccess(res)),
          catchError(() =>
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.addUserToTeamFail'),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

// INFO: Edit User
const editUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.EDIT_USER),
    withLatestFrom(state$.pipe(pluck('userReducer', 'listReducer'))),
    exhaustMap(([action, state]) => {
      const {
        name,
        isSalesAgent,
        isBackOffice,
        teamMember,
        team,
        isChangeTeam,
        isAddNewMember,
      } = action.condition;
      return new SelectorUseCase.EditUserUseCase(
        action.payload as ICreateUser,
        name
      )
        .execute()
        .pipe(
          mergeMap((res) => {
            let actionHandle: Observable<any> = EMPTY;
            if (!isSalesAgent && !isBackOffice && teamMember) {
              actionHandle = of(deleteUserMembership(teamMember));
            } else if (isChangeTeam) {
              const moveTeamPayload: IHandleTeamMember = {
                user: name,
                team: teamMember,
                name: team,
              };
              actionHandle = of(moveUserToTeam(moveTeamPayload));
            } else if (team && isAddNewMember) {
              const addTeamPayload: IHandleTeamMember = {
                user: name,
                team,
              };
              actionHandle = of(addUserToTeam(addTeamPayload));
            }
            const pageState: IPageState = getPageState(
              state.listPageToken,
              state.pageIndex
            );
            if (state.showDeleted) {
              pageState.showDeleted = true;
            }
            pageState.orderBy = state.orderBy || [];
            return merge(
              of(
                getUsers({
                  ...pageState,
                  pageSize: state.pageSize,
                  filter: state.filter,
                }),
                showSnackBar({
                  isOpen: true,
                  message: getString('text.updateUserSuccessfully'),
                  status: CONSTANTS.snackBarConfig.type.success,
                }),
                asyncScheduler
              ),
              of(editUserSuccess(res)),
              of(hideModal(CONSTANTS.ModalConfig.userModal)),
              actionHandle
            );
          }),
          catchError((error) =>
            of(
              editUserFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.updateUserFail', {
                  message: processErrMessage(error.toString()),
                }),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        );
    })
  );

// INFO: Remove Membership
const deleteMembershipEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.DELETE_USER_MEMBERSHIP),
    exhaustMap((action: IAction<string>) =>
      new SelectorUseCase.DeleteMembershipUseCase(action.payload as string)
        .execute()
        .pipe(
          map((res) => deleteUserMembershipSuccess(res)),
          catchError((error) =>
            of(deleteUserMembershipFailed(error.toString()))
          )
        )
    )
  );

// INFO: Move member to another team
const moveUserToTeamEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.MOVE_USER),
    exhaustMap((action: IAction<IHandleTeamMember>) =>
      new SelectorUseCase.MoveUserToTeamUseCase(
        action.payload as IHandleTeamMember
      )
        .execute()
        .pipe(
          map((res) => moveUserToTeamSuccess(res)),
          catchError((error) => of(moveUserToTeamFailed(error.toString())))
        )
    )
  );

const deleteUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.DELETE_USER),
    withLatestFrom(state$.pipe(pluck('userReducer', 'listReducer'))),
    switchMap(([action, state]) =>
      new SelectorUseCase.DeleteUserUseCase(action.payload as string)
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
              deleteUserSuccess(res),
              hideModal(CONSTANTS.ModalConfig.userModal),
              showSnackBar({
                isOpen: true,
                message: getString('text.suspendUserSuccess'),
                status: CONSTANTS.snackBarConfig.type.success,
              }),
              getUsers({
                ...pageState,
                pageSize: state.pageSize,
              })
            );
          }),
          catchError((error) =>
            of(
              deleteUserFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.suspendUserFailed'),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

const unDeleteUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.UNDELETE_USER),
    withLatestFrom(state$.pipe(pluck('userReducer', 'listReducer'))),
    exhaustMap(([action, state]) =>
      new SelectorUseCase.UnDeleteUserUseCase(action.payload as string)
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
              deleteUserSuccess(res),
              hideModal(CONSTANTS.ModalConfig.userModal),
              showSnackBar({
                isOpen: true,
                message: getString('text.activateUserSuccess'),
                status: CONSTANTS.snackBarConfig.type.success,
              }),
              getUsers({
                ...pageState,
                pageSize: state.pageSize,
              })
            );
          }),
          catchError((error) =>
            of(
              deleteUserFailed(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.activateUserFailed'),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

const filterUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.FILTER_USER),
    withLatestFrom(state$.pipe(pluck('userReducer'))),
    map(([_, state]: any) => {
      const { listReducer } = state;

      return {
        type: UserActionTypes.GET_USERS,
        payload: {
          currentPage: 1,
          pageToken: '',
          pageSize: listReducer.pageSize,
          orderBy: listReducer.orderBy,
          showDeleted: listReducer.showDeleted,
          filter: listReducer.filter,
        },
      };
    })
  );

const getListCreatedByEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.GET_LIST_CREATED_BY),
    exhaustMap((action: any) =>
      forkJoin([
        from(new GetUsersUseCase.GetUsersUseCase().execute(action.payload)),
      ]).pipe(
        map(([res]) =>
          getListCreatedBySuccess({
            users: res?.usersWithTeam || [],
            pageToken: res?.nextPageToken || '',
            currentPage: action.payload.currentPage,
          })
        ),
        catchError((error) =>
          of(
            getListCreatedByFailed(
              error.toString() || 'Get list created by failed'
            )
          )
        )
      )
    )
  );

const importUserEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.IMPORT_USER),
    withLatestFrom(
      state$.pipe(
        pluck(
          'importFileReducer',
          'setFileReducer',
          'data',
          'content',
          'result'
        )
      )
    ),
    map(([_, users]) => users),
    exhaustMap((users) =>
      new ImportUserUseCase().execute(users).pipe(
        map((res) => {
          if (res.success) {
            return importUserSuccess(res.message);
          }
          return importUserFailed(res.message);
        }),
        catchError((err) => {
          const message = err?.message;
          return of(
            importUserFailed(
              typeof message !== 'string' ? message?.join(',\n') : message
            )
          );
        })
      )
    )
  );

const importUserSuccessEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UserActionTypes.IMPORT_USER_SUCCESS),
    withLatestFrom(state$.pipe(pluck('userReducer', 'listReducer'))),
    exhaustMap(([action, state]) => {
      const pageState: IPageState = getPageState(
        state.listPageToken,
        state.pageIndex
      );
      if (state.showDeleted) {
        pageState.showDeleted = true;
      }
      pageState.orderBy = state.orderBy || [];
      return of(
        getUsers({
          ...pageState,
          pageSize: state.pageSize,
        }),
        showSnackBar({
          isOpen: true,
          message: action.payload,
          status: 'success',
        }),
        // INFO: Clear lead csv import after success.
        resetFile()
      );
    })
  );

const importUserFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(UserActionTypes.IMPORT_USER_FAILED),
    pluck('payload'),
    map((message) =>
      merge(
        of(
          getUsers(initialPageState),
          showSnackBar({
            isOpen: true,
            message,
            status: 'error',
            isNotClose: true,
          })
        )
      )
    ),
    mergeAll()
  );

const userEpic = combineEpics(
  createUserEpic,
  addUserToTeamEpic,
  getUsersEpic,
  editUserEpic,
  deleteMembershipEpic,
  deleteUserEpic,
  unDeleteUserEpic,
  getTeamByUser,
  getTeamInfoEpic,
  moveUserToTeamEpic,
  filterUserEpic,
  getListCreatedByEpic,
  importUserEpic,
  importUserSuccessEpic,
  importUserFailedEpic
);

export default userEpic;
