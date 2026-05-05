import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { mergeMap, catchError, pluck, exhaustMap } from 'rxjs/operators';

import LeadDetailRepository from 'data/repository/leadDetail';
import {
  addLeadSuccess,
  addLeadFail,
  LeadDetailAddLeadActionTypes,
} from 'presentation/redux/actions/leadDetail/addLead';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { epicWithoutStateFn } from 'shared/interfaces/common';

const addLeadEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailAddLeadActionTypes.ADD_LEAD),
    exhaustMap((action) =>
      LeadDetailRepository.addLead(action?.payload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(addLeadSuccess(res)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.addLeadSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(addLeadFail(error)),
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

export default addLeadEpic;
