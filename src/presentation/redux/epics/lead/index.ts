import { ofType, combineEpics } from 'redux-observable';
import { merge, of, EMPTY, iif, from } from 'rxjs';
import {
  catchError,
  delayWhen,
  exhaustMap,
  map,
  mergeAll,
  pluck,
  switchMap,
  withLatestFrom,
  mergeMap,
} from 'rxjs/operators';

import LeadRepository from 'data/repository/lead';
import LeadDetail from 'data/repository/leadDetail/cloud';
import LeadUseCase from 'domain/usecases/lead';
import { LeadType } from 'presentation/components/ActivitySection/ActivityTab.helper';
import { initialPageState } from 'presentation/pages/admin/users/userPageHelper';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import {
  LeadActionTypes,
  getImportLeadSuccess,
} from 'presentation/redux/actions/leads/import';
import {
  getLeadRejectParticipantsFailed,
  getLeadRejectParticipantsSuccess,
  getLeadRejectRecording,
  getLeadRejectRecordingFailed,
  getLeadRejectRecordingSuccess,
  LeadRejectRecordingActions,
} from 'presentation/redux/actions/leads/lead-reject-recording';
import {
  LeadSourcesActionTypes,
  createLeadSourcesSuccess,
  createLeadSourcesFailed,
  updateLeadSourcesSuccess,
  updateLeadSourcesFailed,
  createLeadSourcesScoreFailed,
  createLeadSourcesScoreSuccess,
  createLeadSourcesScore,
  getLeadSourceSuccess,
  getLeadSourceFailed,
  getLeadSource,
  getLeadSourceScoreSuccess,
  getLeadSourceScoreFailed,
  updateLeadSourceScoreSuccess,
  updateLeadSourceScoreFailed,
  updateLeadSourceScore,
} from 'presentation/redux/actions/leads/sources';
import {
  UploadActionTypes,
  createDocumentLeadSuccess,
  createDocumentLeadFailed,
  deleteDocumentLeadSuccess,
  deleteDocumentLeadFailed,
  getDocumentLeadSuccess,
  getDocumentLeadFailed,
} from 'presentation/redux/actions/leads/upload';
import { showSnackBar, hideModal } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import getPageState from 'shared/helper/pageState.helper';
import { epicWithoutStateFn, epicWithStateFn } from 'shared/interfaces/common';
import { ICreateScore } from 'shared/interfaces/common/lead/sources';
import { IPageState } from 'shared/interfaces/common/table';

import {
  combineWithLatestFromValue,
  getAllSingleCommentData,
  getCallId,
  mapCommentToLeadData,
} from './helper';

import LookUpUserUsecase from '../../../../domain/usecases/admin/user/lookUpUserUseCase';
import GetLeadAssignmentUseCase from '../../../../domain/usecases/lead/lead-assignment/GetLeadAssignmentUseCase';
import destroyWhen, {
  delayLoading,
  delayLoadingForkJoin,
  customForkJoin,
} from '../../../../shared/helper/operator';
import { getLookUpUsersSuccess } from '../../actions/admin/user/index';
import {
  getLeadAssignmentFailed,
  getLeadAssignmentSuccess,
  getCommentLeadAssignmentSuccess,
  LeadAssignmentActions,
} from '../../actions/leads/lead-assignment';
import { PageActionTypes } from '../../actions/page';

const getLeadSourcesEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.GET_LEAD_SOURCES),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    switchMap(([action, productType]: any) => {
      const payload = {
        ...action.payload,
        filter: `${action.payload.filter} product in ("${productType}")`,
      };
      return new LeadUseCase.GetLeadSourcesUseCase().execute(payload).pipe(
        delayWhen(delayLoading),
        map((res: any) => getLeadSourceSuccess(res)),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE]),
        catchError((error: any) => of(getLeadSourceFailed(error.toString())))
      );
    })
  );

// INFO: Get score by source name
const getLeadSourceScoreEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.GET_LEAD_SOURCES_SCORE),
    switchMap((action: any) =>
      new LeadUseCase.GetLeadSourceScoreUseCase().execute(action.payload).pipe(
        map((res: any) => getLeadSourceScoreSuccess(res)),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE]),
        catchError((error: any) =>
          of(getLeadSourceScoreFailed(error.toString()))
        )
      )
    )
  );

const createLeadSourcesEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.CREATE_LEAD_SOURCES),
    exhaustMap((action: any) =>
      new LeadUseCase.CreateLeadSourcesUseCase().execute(action.payload).pipe(
        map((res: any) => {
          const data: ICreateScore = res._data;
          return createLeadSourcesSuccess({
            ...data,
            score: action.additionalParams.score,
          });
        }),
        catchError((error: any) =>
          of(createLeadSourcesFailed(error.toString()))
        )
      )
    )
  );

const createLeadSourcesSuccessEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SUCCESS),
    withLatestFrom(state$.pipe(pluck('leadSourceReducer', 'listReducer'))),
    map(([_action, state]: any) =>
      merge(
        of(
          showSnackBar({
            isOpen: true,
            message: getString('text.createLeadSourceSuccessfully'),
            status: CONSTANTS.snackBarConfig.type.success,
          })
        ),
        of(hideModal(CONSTANTS.ModalConfig.leadSourcesModal)),
        // INFO: Re-call API list
        of(
          getLeadSource({
            ...initialPageState,
            pageSize: state.pageSize,
          })
        )
      )
    ),
    mergeAll()
  );

const createLeadSourcesFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.CREATE_LEAD_SOURCES_FAILED),
    map((action: any) =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.createLeadSourceFail', {
            message: action.error,
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      )
    ),
    mergeAll()
  );

const createLeadSourcesScoreEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SCORE),
    exhaustMap((action: any) =>
      new LeadUseCase.CreateLeadSourcesScoreUseCase()
        .execute(action.payload)
        .pipe(
          map((res: any) => createLeadSourcesScoreSuccess(res)),
          catchError((error: any) =>
            of(createLeadSourcesScoreFailed(error.toString()))
          )
        )
    )
  );

const createLeadSourcesScoreFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SCORE_FAILED),
    map(() =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.createLeadSourceScoreFail'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      )
    ),
    mergeAll()
  );

const updateLeadSourcesEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.UPDATE_LEAD_SOURCES),
    withLatestFrom(state$.pipe(pluck('leadSourceReducer', 'sourceReducer'))),
    exhaustMap(([action, state]: any) =>
      new LeadUseCase.UpdateLeadSourcesUseCase().execute(action.payload).pipe(
        map((res: any) => {
          const _payload: ICreateScore = {
            name: action.payload.name,
            score: action.additionalParams.score,
            sourceName: action.additionalParams.scoreName,
          };
          if (state.scoreSource.name) {
            return merge(
              of(updateLeadSourceScore(_payload)),
              of(updateLeadSourcesSuccess(res))
            );
          }
          return merge(of(updateLeadSourcesSuccess(res)));
        }),
        mergeAll(),
        catchError((error: any) =>
          of(updateLeadSourcesFailed(error.toString()))
        )
      )
    )
  );

const updateLeadSourcesSuccessEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SUCCESS),
    withLatestFrom(state$.pipe(pluck('leadSourceReducer', 'listReducer'))),
    map(([state]: any) => {
      const pageState: IPageState = getPageState(
        state.listPageToken,
        state.pageIndex
      );
      if (state.showDeleted) {
        pageState.showDeleted = true;
      }
      pageState.orderBy = state.orderBy || [];
      pageState.filter = state.filter || '';
      return merge(
        of(
          showSnackBar({
            isOpen: true,
            message: getString('text.updateLeadSourceSuccessfully'),
            status: CONSTANTS.snackBarConfig.type.success,
          })
        ),
        of(hideModal(CONSTANTS.ModalConfig.leadSourcesModal)),
        // TODO: After integrate lead source list API
        of(
          getLeadSource({
            ...pageState,
            pageSize: state.pageSize,
          })
        )
      );
    }),
    mergeAll()
  );

const updateLeadSourcesFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_FAILED),
    map((action: any) =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateLeadSourceFail', {
            message: action.error,
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      )
    ),
    mergeAll()
  );

const updateLeadSourceScoreEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SCORE),
    exhaustMap((action: any) =>
      new LeadUseCase.UpdateLeadSourceScoreUseCase()
        .execute(action.payload)
        .pipe(
          map((res: any) => updateLeadSourceScoreSuccess(res)),
          catchError((error: any) =>
            of(updateLeadSourceScoreFailed(error.toString()))
          )
        )
    )
  );

const updateLeadSourcesScoreFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SCORE_FAILED),
    map(() =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateLeadSourceScoreFail'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      )
    ),
    mergeAll()
  );

const filterLeadSourceEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadSourcesActionTypes.FILTER_SOURCE),
    withLatestFrom(
      state$.pipe(pluck('leadSourceReducer')),
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    map(([, state, productType]: any) => {
      const { listReducer } = state;
      return {
        type: LeadSourcesActionTypes.GET_LEAD_SOURCES,
        payload: {
          currentPage: 1,
          pageToken: '',
          pageSize: listReducer.pageSize,
          orderBy: listReducer.orderBy,
          filter: `${listReducer.filter} product in ("${productType}")`,
        },
      };
    })
  );

const getLeadAssignmentEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadAssignmentActions.GET_LEAD_ASSIGNMENT),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      ),
      state$.pipe(pluck('leadsReducer', 'leadAssignmentReducer', 'pageState'))
    ),
    switchMap(([action, productName, pageState]) => {
      const payload = action.payload.pageSize
        ? {
            ...action.payload,
          }
        : { ...action.payload, ...pageState };

      return new GetLeadAssignmentUseCase().execute(payload, productName).pipe(
        delayWhen(delayLoading),
        map((res) => getLeadAssignmentSuccess(res, action.payload.tableType)),
        catchError((err) => of(getLeadAssignmentFailed(err, payload))),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      );
    })
  );

const getLeadAssignmentSuccessEpic: epicWithStateFn = (action$, state) =>
  action$.pipe(
    ofType(LeadAssignmentActions.GET_LEAD_ASSIGNMENT_SUCCESS),
    combineWithLatestFromValue(state),
    exhaustMap(([, leadData, totalItem, tableType]: any[]) => {
      const api = getAllSingleCommentData(leadData);
      return iif(
        () => tableType === TABLE_LEAD_TYPE.LEAD_REJECTION,
        mapCommentToLeadData(api, leadData, totalItem),
        of(getCommentLeadAssignmentSuccess(leadData, totalItem))
      ).pipe(destroyWhen(action$, [PageActionTypes.DESTROY_PAGE]));
    })
  );

const getLeadAssignmentFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadAssignmentActions.GET_LEAD_ASSIGNMENT_FAILED),
    map((response) => {
      const { pageSize, currentPage } = response.payload;
      const fromRecord = (currentPage - 1) * pageSize;
      const recordLimit = 10000;
      const isMaxRecord = fromRecord + pageSize > recordLimit;
      let message = '';
      if (isMaxRecord) {
        message = getString('text.leadMaxRecord');
      } else if (response?.error?.message) {
        message = response.error.message;
      } else {
        message = getString('text.networkError');
      }
      return of(
        showSnackBar({
          isOpen: true,
          message,
          status: 'error',
          isNotClose: true,
        })
      );
    }),
    mergeAll()
  );

const getLeadImportListEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadActionTypes.GET_IMPORT_LEADS),
    withLatestFrom(state$.pipe(pluck('userReducer', 'lookUpUserReducer'))),
    switchMap(([action, userState]) => {
      if (userState?.data?.length) {
        return new LeadUseCase.GetImportLeadsUseCase()
          .execute(action.payload)
          .pipe(
            delayWhen(delayLoading),
            map((res) => {
              const importLeadList = res?.imports;
              return getImportLeadSuccess({
                importList: importLeadList,
                pageToken: res?.nextPageToken || '',
                currentPage: action.payload.currentPage,
                userList: userState.data,
              });
            }),
            destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
          );
      }
      return customForkJoin(
        new LeadUseCase.GetImportLeadsUseCase().execute(action.payload),
        new LookUpUserUsecase().execute()
      ).pipe(
        delayWhen(delayLoadingForkJoin),
        mergeMap(([importList, userList]) => {
          const importLeadList = importList?.imports;
          const lookUpUsers = userList?.selectData;
          return merge(
            of(
              getImportLeadSuccess({
                importList: importLeadList || [],
                pageToken: importList.nextPageToken || '',
                currentPage: action.payload.currentPage,
                userList: lookUpUsers || [],
              })
            ),
            of(getLookUpUsersSuccess(userList))
          );
        }),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      );
    })
  );

const getLeadRejectRecordedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING),
    switchMap((action: any) =>
      new LeadUseCase.GetLeadRecordingUseCase().execute(action.payload).pipe(
        map((res) => getLeadRejectRecordingSuccess(res)),
        catchError((err) =>
          of(
            getLeadRejectRecordingFailed({
              error: err.code,
              message: err.message,
            })
          )
        ),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      )
    )
  );

const getLeadRejectParticipantsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS),
    switchMap((action: any) =>
      new LeadUseCase.GetLeadParticipantUseCase().execute(action.payload).pipe(
        mergeMap((res) => {
          const callId = getCallId(res?.data?.participants[0]?.name);

          return merge(
            of(getLeadRejectParticipantsSuccess(res)),
            iif(
              () => res?.data?.participants?.length,
              of(getLeadRejectRecording(callId)),
              EMPTY
            )
          );
        }),
        catchError((err) => of(getLeadRejectParticipantsFailed(err))),
        destroyWhen(action$, [PageActionTypes.DESTROY_PAGE])
      )
    )
  );

const createLeadDocumentEpic: epicWithStateFn = (action$) =>
  action$.pipe(
    ofType(UploadActionTypes.CREATE_DOCUMENTS_LEADS),
    switchMap((action: any) =>
      new LeadUseCase.CreateDocumentLeadUseCase().execute(action.payload).pipe(
        map((res: any) =>
          merge(
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.createDocumentSuccessfully'),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            ),
            of(createDocumentLeadSuccess(res))
          )
        ),
        mergeAll(),
        catchError((error: any) =>
          of(createDocumentLeadFailed(error.toString()))
        )
      )
    )
  );

const deleteLeadDocumentEpic: epicWithStateFn = (action$) =>
  action$.pipe(
    ofType(UploadActionTypes.DELETE_DOCUMENTS_LEADS),
    switchMap((action: any) =>
      new LeadUseCase.DeleteDocumentLeadUseCase().execute(action.payload).pipe(
        map((res: any) =>
          merge(
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.deleteDocumentSuccessfully'),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            ),
            of(deleteDocumentLeadSuccess(res))
          )
        ),
        mergeAll(),
        catchError((error: any) =>
          of(deleteDocumentLeadFailed(error.toString()))
        )
      )
    )
  );

export const getUploadedLeadDocumentEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UploadActionTypes.GET_DOCUMENTS_LEADS),
    withLatestFrom(state$.pipe(pluck('leadsDetailReducer', 'lead', 'payload'))),
    switchMap(([, state]: any) => {
      async function getComments() {
        const getCommentUsecase =
          new LeadUseCase.GetListDocumentUploadedLeadUseCase();
        const comments = [];
        let currentLead = state;
        while (currentLead.type === LeadType.RETAINER) {
          comments.push(
            getCommentUsecase
              .execute(currentLead.name)
              .pipe(pluck('data', 'documents'))
              .toPromise()
          );
          // eslint-disable-next-line no-await-in-loop
          currentLead = await LeadDetail.getLeadDetailById(
            currentLead.root.split('/')[1]
          ).toPromise();
        }
        comments.push(
          getCommentUsecase
            .execute(currentLead.name)
            .pipe(pluck('data', 'documents'))
            .toPromise()
        );
        return [].concat(...(await Promise.all(comments)));
      }
      return from(getComments()).pipe(
        map((res) => getDocumentLeadSuccess({ documents: res })),
        catchError((error: any) => of(getDocumentLeadFailed(error.toString())))
      );
    })
  );

const assignLeadsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadAssignmentActions.ASSIGN_LEADS),
    switchMap((action: any) =>
      LeadRepository.assignLeadsWithLog(
        action.payload.ids,
        action.payload.assignedTo
      ).pipe(
        map((response) => {
          const errorResponses = response.filter((x) => x.isError);
          action.payload.callback();
          if (errorResponses.length > 0) {
            return showSnackBar({
              isOpen: true,
              message: getString('leadAssignment.notAssigned', {
                unassigned: errorResponses.length,
              }),
              status: 'error',
              isNotClose: true,
            });
          }
          return showSnackBar({
            isOpen: true,
            message: getString('leadAssignment.bulkUpdateSuccess'),
            status: 'success',
          });
        }),
        catchError((err) => err)
      )
    )
  );

const unassignLeadsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadAssignmentActions.UNASSIGN_LEADS),
    switchMap((action: any) =>
      LeadRepository.unassignLeadsWithLog(action.payload.ids).pipe(
        map((response) => {
          const errorResponses = response.filter((x) => x.isError);
          action.payload.callback();
          if (errorResponses.length > 0) {
            return showSnackBar({
              isOpen: true,
              message: getString('leadAssignment.failToUnassign', {
                unassigned: errorResponses.length,
              }),
              status: 'error',
              isNotClose: true,
            });
          }
          return showSnackBar({
            isOpen: true,
            message: getString('leadAssignment.bulkUpdateSuccess'),
            status: 'success',
          });
        }),
        catchError((err) => err)
      )
    )
  );

const leadEpic = combineEpics(
  createLeadSourcesEpic,
  createLeadSourcesSuccessEpic,
  createLeadSourcesFailedEpic,
  updateLeadSourcesEpic,
  updateLeadSourcesSuccessEpic,
  updateLeadSourcesFailedEpic,
  createLeadSourcesScoreEpic,
  createLeadSourcesScoreFailedEpic,
  getLeadSourcesEpic,
  getLeadSourceScoreEpic,
  updateLeadSourceScoreEpic,
  updateLeadSourcesScoreFailedEpic,
  filterLeadSourceEpic,
  getLeadAssignmentEpic,
  getLeadAssignmentFailedEpic,
  getLeadImportListEpic,
  getLeadAssignmentSuccessEpic,
  getLeadRejectParticipantsEpic,
  getLeadRejectRecordedEpic,
  createLeadDocumentEpic,
  deleteLeadDocumentEpic,
  getUploadedLeadDocumentEpic,
  assignLeadsEpic,
  unassignLeadsEpic
);
export default leadEpic;
