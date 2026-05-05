import { combineEpics, ofType } from 'redux-observable';
import { EMPTY, merge, of } from 'rxjs';
import {
  mergeMap,
  pluck,
  exhaustMap,
  map,
  catchError,
  withLatestFrom,
  switchMap,
} from 'rxjs/operators';

import { websocketEnabled } from 'config/feature-flags';
import WebSocketGateway from 'data/gateway/websocket';
import CallCloud from 'data/repository/call/cloud';
import CallUseCase from 'domain/usecases/call';
import LeadUseCase from 'domain/usecases/lead';
import {
  LeadDetailActionTypes,
  connectedCall,
  failedCall,
  getCallParticipantsFailure,
  getCallParticipantsSuccess,
  joinCall,
  endCall,
  subscribeCall,
} from 'presentation/redux/actions/leads/detail';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { epicWithStateFn, epicWithoutStateFn } from 'shared/interfaces/common';
import { ISubscribeCall } from 'shared/interfaces/common/lead/detail';

import { CallStatus } from '../../reducers/leadDetail/call';

const handleCallMessage = (callMessage: any) => {
  let message = '';
  let status: CallStatus = CallStatus.Idle;

  // Event handlers
  // Start ringing when you add the participant to the call, easy to implement, we can refine it later
  if (callMessage?.state === 'RINGING') {
    status = CallStatus.Calling;
  }

  if (callMessage?.joinTime) {
    if (callMessage?.deleteTime) {
      message = getString('text.cannotContactCustomer');
      status = CallStatus.End;
    } else {
      message = getString('text.customerPickUpCall');
      status = CallStatus.Join;
    }
  }

  // In case there is no joinTime, it means the customer phone can't be connected.
  if (callMessage?.deleteTime && !callMessage?.joinTime) {
    message = getString('text.cannotContactCustomer');
    status = CallStatus.End;
  }

  return {
    status,
    message,
  };
};

export const subscribeCallEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.SUBSCRIBE_CALL),
    switchMap((action: { payload: ISubscribeCall }) => {
      if (!websocketEnabled) return EMPTY;
      const pattern = `call/v1alpha1/${action.payload.callName}`;
      const sdpsAnswerEvent = `call/v1alpha1/${action.payload.callParticipantName}/sdps/answer`;
      const _callSubscription = WebSocketGateway.getInstance().subscribe(
        pattern,
        { strictFiltering: true }
      );
      const _sdpSubscription = WebSocketGateway.getInstance().subscribe(
        sdpsAnswerEvent,
        { strictFiltering: true }
      );
      if (!_callSubscription) return EMPTY;
      if (!_sdpSubscription) return EMPTY;

      return merge(
        _callSubscription.pipe(
          pluck('body'),
          mergeMap((res: any) => {
            if (res?.deleteTime) {
              return of(endCall());
            }
            return EMPTY;
          })
        ),
        _sdpSubscription.pipe(
          mergeMap((res: any) =>
            of(
              connectedCall({
                callName: action.payload.callName,
                sdpAnswer: res.body,
                sdpAnswerResource: sdpsAnswerEvent,
              })
            )
          )
        )
      );
    })
  );

export const subscribeParticipantEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.SUBSCRIBE_CALL),
    switchMap((action: { payload: { callName: string } }) => {
      if (!websocketEnabled) return EMPTY;
      const _subscription = WebSocketGateway.getInstance().subscribe(
        `call/v1alpha1/${action.payload.callName}/participants/*`
      );
      if (!_subscription) return EMPTY;
      return _subscription.pipe(
        pluck('body'),
        mergeMap((res) => {
          const { status, message } = handleCallMessage(res);

          if (message) {
            if (status === CallStatus.Join) {
              return merge(
                of(joinCall()),
                of(
                  showSnackBar({
                    isOpen: true,
                    message,
                    status: CONSTANTS.snackBarConfig.type.success,
                  })
                )
              );
            }
            if (status === CallStatus.End) {
              return of(
                showSnackBar({
                  isOpen: true,
                  message,
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              );
            }
            if (status === CallStatus.Calling) {
              return of(
                showSnackBar({
                  isOpen: true,
                  message,
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              );
            }
          }

          return EMPTY;
        })
      );
    })
  );

const createCallEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.CALLING),
    withLatestFrom(
      state$.pipe(pluck('authReducer', 'data', 'user', 'name')),
      state$.pipe(pluck('leadsDetailReducer', 'lead', 'payload', 'name'))
    ),
    exhaustMap(([action, userName, leadName]) =>
      new CallUseCase.CreateCallUseCase()
        .execute({ ...action.payload, userName, leadName })
        .pipe(
          pluck('data'),
          mergeMap((res) => {
            const resData = {
              ...res,
            };
            return of(subscribeCall(resData));
          }),
          catchError((error) =>
            of(
              failedCall(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.cannotConnectCallServer'),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        )
    )
  );

const callParticipantEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.SUBSCRIBE_CALL),
    withLatestFrom(
      state$.pipe(
        pluck('leadsDetailReducer', 'callReducer', 'data', 'callStatus')
      )
    ),
    switchMap(([action, callStatus]) =>
      CallCloud.callParticipant(action.payload).pipe(
        pluck('data'),
        mergeMap((res) => {
          if (callStatus === CallStatus.Join) {
            return EMPTY;
          }

          return of(connectedCall(res));
        }),
        catchError((error) =>
          of(
            failedCall(error.toString()),
            showSnackBar({
              isOpen: true,
              message: getString('text.cannotConnectCallServer'),
              status: CONSTANTS.snackBarConfig.type.error,
            })
          )
        )
      )
    )
  );

const getCallParticipantsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.GET_CALL_PARTICIPANTS),
    switchMap((action: any) =>
      new LeadUseCase.GetLeadParticipantUseCase().execute(action.payload).pipe(
        pluck('data'),
        map((res) => getCallParticipantsSuccess(res)),
        catchError((err) => of(getCallParticipantsFailure(err)))
      )
    )
  );

const endCallEpic: epicWithStateFn = (action$, state) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.END_CALL),
    exhaustMap(() => {
      const sdpAnswerResource =
        state.value?.leadsDetailReducer?.callReducer?.data?.sdpAnswerResource;
      const callName =
        state.value?.leadsDetailReducer?.callReducer?.data?.callName;
      return new CallUseCase.EndCallUseCase()
        .execute(callName, sdpAnswerResource)
        .pipe(
          switchMap(() => EMPTY),
          // In some case the call will be deleted from the server, so it's ok to ignore this error.
          catchError(() => EMPTY)
        );
    })
  );

const callEpic = combineEpics(
  createCallEpic,
  getCallParticipantsEpic,
  subscribeCallEpic,
  subscribeParticipantEpic,
  endCallEpic,
  callParticipantEpic
);

export default callEpic;
