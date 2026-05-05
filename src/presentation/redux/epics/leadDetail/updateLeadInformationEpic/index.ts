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
  updateLeadSuccess,
  updateLeadFailed,
  LeadDetailUpdateLeadDataActionTypes,
} from 'presentation/redux/actions/leadDetail/updateLeadData';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { epicWithStateFn } from 'shared/interfaces/common';

const updateLeadInformationEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA),
    withLatestFrom(state$.pipe(pluck('leadsDetailReducer'))),
    exhaustMap(([action, state]) =>
      new LeadDetailUseCase.UpdateLeadDataUseCase()
        .execute({
          leadId: state.lead.payload.name,
          ...action.payload,
        })
        .pipe(
          pluck('data'),
          map((res) => updateLeadSuccess(res)),
          catchError((error) =>
            merge(
              of(updateLeadFailed(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: 'error',
                })
              )
            )
          )
        )
    )
  );

export default updateLeadInformationEpic;
