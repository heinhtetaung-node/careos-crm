import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { map, catchError, pluck, exhaustMap } from 'rxjs/operators';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import {
  updateLeadStatusSuccess,
  updateLeadStatusFailed,
  LeadDetailUpdateLeadStatusActionTypes,
} from 'presentation/redux/actions/leadDetail/updateLeadStatus';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { epicWithoutStateFn } from 'shared/interfaces/common';

const updateLeadStatusEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS),
    exhaustMap((action) =>
      new LeadDetailUseCase.UpdateLeadStatusUseCase()
        .execute({ ...action.payload })
        .pipe(
          pluck('data'),
          map((res) => updateLeadStatusSuccess(res)),
          catchError((error) =>
            merge(
              of(updateLeadStatusFailed(error)),
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

export default updateLeadStatusEpic;
