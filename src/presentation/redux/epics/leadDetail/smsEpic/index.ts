import { combineEpics, ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { catchError, mergeMap, pluck, switchMap } from 'rxjs/operators';

import {
  LeadSmsActionTypes,
  sendSmsFail,
  sendSmsSuccess,
} from 'presentation/redux/actions/leadDetail/sms';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const sendSmsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadSmsActionTypes.SEND_SMS),
    switchMap((action) => {
      const { leadId } = action.payload;
      const newPayload = {
        ...action.payload,
        leadId: leadId ?? getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.SendSmsUseCase().execute(newPayload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(sendSmsSuccess(res)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.sendSmsSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(sendSmsFail(error)),
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

const leadDetailSmsEpic = combineEpics(sendSmsEpic);

export default leadDetailSmsEpic;
