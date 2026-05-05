import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import LeadDetailRepository from 'data/repository/leadDetail';
import {
  LeadDetailActionTypes,
  getInstallmentSuccess,
  getInstallmentFailed,
} from 'presentation/redux/actions/leads/detail';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import ResponseModel from '../../../../../models/response';

const getPaymentOptionsEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadDetailActionTypes.GET_INSTALLMENT),
    switchMap((action) => {
      const leadDetailRepo = new LeadDetailRepository();
      return leadDetailRepo.getPaymentOptions(action.payload).pipe(
        map((res: ResponseModel<any>) => res.data.selectData),
        map((res) => getInstallmentSuccess(res)),
        catchError((error) => of(getInstallmentFailed(error)))
      );
    })
  );

export default getPaymentOptionsEpic;
