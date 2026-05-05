import { combineEpics, ofType } from 'redux-observable';
import { merge, of, timer } from 'rxjs';
import {
  catchError,
  delayWhen,
  exhaustMap,
  mergeMap,
  pluck,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  LeadActionTypes,
  saveAppointmentFail,
  saveAppointmentSuccess,
  getAppointmentSuccess,
  getAppointmentFail,
} from 'presentation/redux/actions/leadDetail/scheduleModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn, epicWithStateFn } from 'shared/interfaces/common';

import {
  formatUserId,
  handleData,
  DELAY_DATA_LOADING,
} from './scheduleModal.helper';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';
import destroyWhen from '../../../../../shared/helper/operator';

const saveAppointmentEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadActionTypes.SAVE_APPOINTMENT),
    withLatestFrom(state$.pipe(pluck('authReducer', 'data'))),
    exhaustMap(([action, state]) => {
      const newPayload = {
        ...action.payload,
        userId: formatUserId(state?.user?.name) || '',
      };
      return new LeadDetailUseCase.SaveAppointmentUseCase()
        .execute(newPayload)
        .pipe(
          pluck('data'),
          mergeMap((res) =>
            of(
              saveAppointmentSuccess(res),
              showSnackBar({
                isOpen: true,
                message: getString('text.createAppointmentSuccess'),
                status: 'success',
              })
            )
          ),
          catchError((error) =>
            merge(
              of(saveAppointmentFail(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: 'error',
                })
              )
            )
          )
        );
    })
  );

const getAppointmentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActionTypes.GET_APPOINTMENT),
    switchMap((action: any) => {
      const newPayload = action.payload;

      return new LeadDetailUseCase.GetAppointmentUseCase()
        .execute(newPayload)
        .pipe(
          pluck('data'),
          mergeMap((res) => {
            const data = handleData(res);
            return of(getAppointmentSuccess(data));
          }),
          catchError((error) =>
            merge(
              of(getAppointmentFail(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: 'error',
                })
              )
            )
          ),
          destroyWhen(action$, [LeadActionTypes.DESTROY_MODAL_SCHEDULE]),
          delayWhen(() => timer(DELAY_DATA_LOADING))
        );
    })
  );

const leadDetailScheduleEpic = combineEpics(
  saveAppointmentEpic,
  getAppointmentEpic
);

export default leadDetailScheduleEpic;
