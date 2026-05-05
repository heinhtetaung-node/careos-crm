import flagsmith from 'flagsmith';
import { StateObservable } from 'redux-observable';
import { of, Subject, throwError } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

import FeatureFlags from 'config/flagsmithConfig';
import CustomerApi from 'data/gateway/api/services/customer';
import OrderApi from 'data/gateway/api/services/order';
import UserApi from 'data/gateway/api/services/user';
import * as CONSTANTS from 'shared/constants';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import { OrderActionTypes } from '../../actions/order';
import { UIActionTypes } from '../../actions/ui';

import { fetchOrderEpic, updateDocumentStatusEpic } from './index';

const mockDocumentStatus = () =>
  of({
    data: {
      name: 'mock',
    },
  });

const mockGetUser = () => of({ _data: { firstName: 'Diego' } });

jest.mock('data/gateway/api/services/user', () =>
  jest.fn().mockImplementation(() => ({
    getUser: mockGetUser,
    getUserWithTeam: mockGetUser,
  }))
);

const mockGetOrder = (orderName: string) => {
  if (!orderName) {
    return throwError('Order not found!');
  }

  return of({
    data: {
      name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      customer: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      supervisor: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      convertBy: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
    },
  });
};

const mockGetOrderOnce = () =>
  of({
    data: {
      name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      customer: '',
      supervisor: '',
      convertBy: '',
    },
  });

jest.mock('data/gateway/api/services/order', () =>
  jest
    .fn(() => ({
      getOrder: mockGetOrder,
      updateDocumentStatus: mockDocumentStatus,
    }))
    // Mock for first call
    .mockImplementationOnce(() => ({
      getOrder: mockGetOrderOnce,
      updateDocumentStatus: mockDocumentStatus,
    }))
);

const mockGetCustomer = () => of({ _data: { firstName: 'John' } });

jest.mock('data/gateway/api/services/customer', () =>
  jest.fn().mockImplementation(() => ({ getCustomer: mockGetCustomer }))
);

const dependencies = {
  apiServices: {
    OrderApi,
    CustomerApi,
    UserApi,
  },
};

describe('Fetch Order Epic', () => {
  const state$ = new StateObservable(new Subject(), {
    state: { name: 'Mock' },
  });

  it('returns get detail success action', async () => {
    const action$ = of({
      type: OrderActionTypes.GET_DETAIL,
      payload: { orderName: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650' },
    });

    const result$ = fetchOrderEpic(action$, state$, dependencies).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: OrderActionTypes.GET_DETAIL_SUCCESS,
        payload: {
          name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
          customer: '',
          supervisor: '',
          convertBy: '',
        },
      },
    ]);
  });

  it('returns get detail success action with customer, sales agent, and supervisor data', async () => {
    const action$ = of({
      type: OrderActionTypes.GET_DETAIL,
      payload: { orderName: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650' },
    });

    const result$ = fetchOrderEpic(action$, state$, dependencies).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: OrderActionTypes.GET_DETAIL_SUCCESS,
        payload: {
          convertBy: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
          name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
          customer: { firstName: 'John' },
          supervisor: { firstName: 'Diego' },
        },
      },
    ]);
  });

  it('shows showSnackBar with error message if there is an error', async () => {
    const action$ = of({
      type: OrderActionTypes.GET_DETAIL,
      payload: { fake: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650' },
    });

    const result$ = fetchOrderEpic(action$, state$, dependencies).pipe(
      toArray() // buffers output until Epic naturally completes()
    );

    const result = await result$.toPromise();

    expect(result).toEqual([
      {
        type: OrderActionTypes.GET_DETAIL_FAILED,
        payload: 'Order not found!',
      },
      {
        type: UIActionTypes.SHOW_SNACKBAR,
        payload: {
          isOpen: true,
          message: 'text.errorMessage',
          status: CONSTANTS.snackBarConfig.type.error,
        },
      },
    ]);
  });
});

describe('Update Document Status Epic', () => {
  it('update successfully', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: OrderActionTypes.UPDATE_DOCUMENT_STATUS,
          payload: { status: OrderDocumentStatus.PENDING },
        },
      });

      const state$ = new StateObservable(new Subject(), {
        order: {
          payload: {
            name: 'test',
          },
        },
      });

      const output$ = updateDocumentStatusEpic(action$, state$, dependencies);

      expectObservable(output$).toBe('-(ab)', {
        a: {
          type: UIActionTypes.SHOW_SNACKBAR,
          payload: {
            isOpen: true,
            message: 'text.updateOrderSuccessfully',
            status: 'success',
          },
        },
        b: {
          type: OrderActionTypes.UPDATE_DOCUMENT_STATUS_SUCCESS,
          payload: {
            name: 'mock',
          },
        },
      });
    });
  });
});
