import { ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import { concatMap, catchError, mergeMap } from 'rxjs/operators';

import {
  updateCustomerDetailSuccess,
  updateCustomerDetailFail,
  LeadCustomerDetailActionTypes,
} from 'presentation/redux/actions/leadDetail/updateCustomerDetail';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { epicWithoutStateFn } from 'shared/interfaces/common';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const updateCustomerDetailEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL),
    concatMap((action) => {
      const newPayload = {
        body: action.payload,
        leadId: getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.UpdateLicensePlateUseCase()
        .execute(newPayload)
        .pipe(
          mergeMap((res) =>
            merge(
              of(updateCustomerDetailSuccess(res)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.updateLeadSuccess'),
                  status: 'success',
                })
              )
            )
          ),
          catchError((error) =>
            merge(
              of(updateCustomerDetailFail(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.updateLeadFail'),
                  status: 'error',
                })
              )
            )
          )
        );
    })
  );

export default updateCustomerDetailEpic;
