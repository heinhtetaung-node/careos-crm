import { combineEpics, ofType } from 'redux-observable';
import { merge, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  mergeMap,
  pluck,
  withLatestFrom,
} from 'rxjs/operators';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import {
  LeadCouponActionTypes,
  addCouponSuccess,
  addCouponFail,
  deleteCouponSuccess,
  deleteCouponFail,
} from 'presentation/redux/actions/leadDetail/coupon';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import {
  epicWithDependencies,
  epicWithoutStateFn,
} from 'shared/interfaces/common';

export const addCouponEpic: epicWithDependencies = (
  action$,
  state$,
  { apiServices: { LeadApi } }
) =>
  action$.pipe(
    ofType(LeadCouponActionTypes.ADD_COUPON),
    withLatestFrom(
      state$.pipe(pluck('leadsDetailReducer', 'lead', 'payload', 'name'))
    ),
    exhaustMap(([action, name]) => {
      const newPayload = {
        ...action.payload,
        leadId: name.replace(/^leads\//, ''),
      };

      const leadApi = new LeadApi();
      return leadApi.addCoupon(newPayload).pipe(
        pluck('data'),
        mergeMap((res: any) =>
          merge(
            of(addCouponSuccess({ ...res, voucher: action.payload })),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.addCouponSuccess'),
                status: CONSTANTS.snackBarConfig.type.success,
              })
            )
          )
        ),
        catchError((error) => {
          let errorMsg = getString('text.invalidCoupon');

          // Lead is not sync with NANA
          if (error.code === 424) {
            errorMsg = getString('text.leadIsNotSync');
          }

          return merge(
            of(addCouponFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: errorMsg,
                status: CONSTANTS.snackBarConfig.type.error,
              })
            )
          );
        })
      );
    })
  );

const deleteCouponEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadCouponActionTypes.DELETE_COUPON),
    exhaustMap((action) => {
      const newPayload = {
        ...action.payload,
        leadId: getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.DeleteCouponUseCase()
        .execute(newPayload)
        .pipe(
          pluck('data'),
          mergeMap((res) =>
            merge(
              of(deleteCouponSuccess({ ...res, voucher: '' })),
              of(
                showSnackBar({
                  isOpen: true,
                  message: getString('text.deleteCouponSuccess'),
                  status: 'success',
                })
              )
            )
          ),
          catchError((error) =>
            merge(
              of(deleteCouponFail(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: 'error',
                })
              )
            )
          )
        );
    })
  );

const leadDetailCouponEpic = combineEpics(addCouponEpic, deleteCouponEpic);

export default leadDetailCouponEpic;
