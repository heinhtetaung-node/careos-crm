import { ofType, combineEpics } from 'redux-observable';
import { merge, of } from 'rxjs';
import { catchError, pluck, switchMap, mergeAll, map } from 'rxjs/operators';

import {
  RemarkActions,
  addRemarkSuccess,
  addRemarkFail,
} from 'presentation/redux/actions/leadDetail/remark';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { epicWithDependencies } from 'shared/interfaces/common';

const addRemarkEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { LeadApi } }
) =>
  action$.pipe(
    ofType(RemarkActions.ADD_REMARK),
    switchMap((action) => {
      const leadApi = new LeadApi();
      return leadApi
        .updateLead(action.payload.leadId, {
          annotations: { remark: action.payload.remark },
        })
        .pipe(
          pluck('data'),
          map((res) =>
            merge(
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.remarkAdded'),
                  status: CONSTANTS.snackBarConfig.type.success,
                })
              ),
              of(addRemarkSuccess(res))
            )
          ),
          mergeAll(),
          catchError((error) =>
            of(
              addRemarkFail(error.toString()),
              showSnackBar({
                isOpen: true,
                message: getString('text.errorMessage', {
                  message: error.toString(),
                }),
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          )
        );
    })
  );

const remarkEpic = combineEpics(addRemarkEpic);
export default remarkEpic;
