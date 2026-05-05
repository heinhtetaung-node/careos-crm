import { combineEpics, ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import {
  getListInsurerSuccess,
  getListInsurerFail,
  LeadInsurerActionTypes,
} from 'presentation/redux/actions/leadDetail/insurer';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const getListInsurerEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadInsurerActionTypes.GET_LIST_INSURER),
    switchMap((action) =>
      new LeadDetailUseCase.GetListInsurerUseCase()
        .execute(action.payload)
        .pipe(
          map((res) => getListInsurerSuccess(res)),
          catchError((error) =>
            merge(
              of(getListInsurerFail(error)),
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

const insurerEpic = combineEpics(getListInsurerEpic);

export default insurerEpic;
