import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import {
  map,
  catchError,
  pluck,
  exhaustMap,
  withLatestFrom,
} from 'rxjs/operators';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import {
  updateLeadImportantSuccess,
  updateLeadImportantFailed,
  UpdateLeadImportantActionTypes,
} from 'presentation/redux/actions/leadDetail/updateLeadImportant';
import { showSnackBar } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';
import { epicWithStateFn } from 'shared/interfaces/common';

const updateLeadImportantEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT),
    withLatestFrom(state$.pipe(pluck('leadsDetailReducer'))),
    exhaustMap(([action, state]) =>
      new LeadDetailUseCase.UpdateLeadDataUseCase()
        .execute({
          leadId: state.lead.payload.name,
          ...action.payload,
        })
        .pipe(
          pluck('data'),
          map((res) => updateLeadImportantSuccess(res)),
          catchError((error) =>
            merge(
              of(updateLeadImportantFailed(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: CONSTANTS.snackBarConfig.type.error,
                })
              )
            )
          )
        )
    )
  );

export default updateLeadImportantEpic;
