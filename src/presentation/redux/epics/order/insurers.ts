import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import InsurerApi from 'data/gateway/api/services/insurer';
import {
  InsurersAllActions,
  getInsurersAllFailed,
  getInsurersAllSuccess,
  GetInsurerAllAction,
} from 'presentation/redux/actions/orders/all';
import { epicWithStateFn } from 'shared/interfaces/common';

const insurerApi = new InsurerApi();
const getInsurersAllEpic: epicWithStateFn = (action$) =>
  action$.pipe(
    ofType(InsurersAllActions.GET_INSURERS_ALL),
    switchMap((action: GetInsurerAllAction) => {
      const { pageSize, pageToken = '' } = action.payload;
      return insurerApi.getInsurers(pageSize, pageToken).pipe(
        map((res) => getInsurersAllSuccess(res as any)),
        catchError((err) => of(getInsurersAllFailed(err)))
      );
    })
  );

export default getInsurersAllEpic;
