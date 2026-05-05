import { StateObservable } from 'redux-observable';
import { of, Subject } from 'rxjs';
import { toArray } from 'rxjs/operators';

import LeadApi from 'data/gateway/api/services/lead';
import ResponseModel from 'models/response';
import { LeadCouponActionTypes } from 'presentation/redux/actions/leadDetail/coupon';
import { UIActionTypes } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';

import { addCouponEpic } from '.';

jest.mock('models/response');

describe('couponEpic', () => {
  const state$ = new StateObservable(new Subject(), {
    leadsDetailReducer: {
      lead: {
        payload: {
          name: 'leads/4321',
        },
      },
    },
  });

  it('can add coupon successfully', async () => {
    const action$ = of({
      type: LeadCouponActionTypes.ADD_COUPON,
      payload: {
        voucher: 'mock voucher',
      },
    });

    const result$ = addCouponEpic(action$, state$, {
      apiServices: {
        LeadApi,
      },
    }).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: LeadCouponActionTypes.ADD_COUPON_SUCCESS,
        payload: {
          responseTimes: result?.[0].payload.responseTimes,
          voucher: {
            voucher: 'mock voucher',
          },
        },
      },
      {
        type: UIActionTypes.SHOW_SNACKBAR,
        payload: {
          isOpen: true,
          message: 'text.addCouponSuccess',
          status: CONSTANTS.snackBarConfig.type.success,
        },
      },
    ]);
  });

  it('returns lead not sync error if status code is 424', async () => {
    ResponseModel.createError = jest.fn().mockReturnValue({
      code: 424,
      message: 'mock',
    });

    const action$ = of({
      type: LeadCouponActionTypes.ADD_COUPON,
      payload: {
        voucher: 'leadNotSync',
      },
    });

    const result$ = addCouponEpic(action$, state$, {
      apiServices: {
        LeadApi,
      },
    }).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: LeadCouponActionTypes.ADD_COUPON_FAIL,
        payload: {
          code: 424,
          message: 'mock',
        },
      },
      {
        type: UIActionTypes.SHOW_SNACKBAR,
        payload: {
          isOpen: true,
          message: 'text.leadIsNotSync',
          status: CONSTANTS.snackBarConfig.type.error,
        },
      },
    ]);
  });
});
