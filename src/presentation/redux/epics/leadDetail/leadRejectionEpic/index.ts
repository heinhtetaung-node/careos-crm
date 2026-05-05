import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { map, catchError, pluck, exhaustMap } from 'rxjs/operators';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import {
  leadRejectionSuccess,
  leadRejectionFail,
  LeadRejectionActionTypes,
} from 'presentation/redux/actions/leadDetail/leadRejection';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { epicWithoutStateFn } from 'shared/interfaces/common';

const leadRejectionEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadRejectionActionTypes.LEAD_REJECTION),
    exhaustMap((action) =>
      new LeadDetailUseCase.PostLeadRejectionUseCase()
        .execute({ ...action.payload })
        .pipe(
          pluck('data'),
          map((res) => leadRejectionSuccess(res)),
          catchError((error) =>
            merge(
              of(leadRejectionFail(error)),
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

export default leadRejectionEpic;
