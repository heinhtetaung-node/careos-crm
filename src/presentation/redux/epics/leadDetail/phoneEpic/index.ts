import { combineEpics, ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { catchError, exhaustMap, mergeMap, pluck } from 'rxjs/operators';

import {
  LeadPhoneActionTypes,
  addPhoneFail,
  addPhoneSuccess,
} from 'presentation/redux/actions/leadDetail/phone';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const addPhoneEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadPhoneActionTypes.ADD_PHONE),
    exhaustMap((action) => {
      const newPayload = {
        ...action.payload,
        leadId: getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.AddPhoneUseCase().execute(newPayload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(addPhoneSuccess(res)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.addPhoneSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(addPhoneFail(error)),
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

const leadDetailPhoneEpic = combineEpics(addPhoneEpic);

export default leadDetailPhoneEpic;
