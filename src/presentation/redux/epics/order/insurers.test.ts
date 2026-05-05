import { StateObservable } from 'redux-observable';
import { of, throwError, Subject } from 'rxjs';

import { InsurersAllActions } from 'presentation/redux/actions/orders/all';

import getInsurersAllEpic from './insurers';

const mockInsurers = [
  {
    name: 'insurers/42',
    displayName: 'FPG Insurance',
    shortnameEn: '',
    shortnameTh: '',
    rating: 0,
    order: 3,
  },
  {
    name: 'insurers/40',
    displayName: 'Chubb Samaggi Insurance Co. (PLC)',
    shortnameEn: '',
    shortnameTh: '',
    rating: 0,
    order: 3,
  },
];

var mockGetInsurers = (size: number) => {
  if (size < 1) throwError('Invalid page size');
  return of({ data: mockInsurers });
};
jest.mock('data/gateway/api/services/insurer', () =>
  jest.fn().mockImplementationOnce(() => ({
    getInsurers: mockGetInsurers,
  }))
);

// FIXME
xdescribe('Get Insurers All Epic', () => {
  const state$ = new StateObservable(new Subject(), {
    state: { name: 'Mock' },
  });

  it('return get insurer all success action', async () => {
    const action$ = of({
      type: InsurersAllActions.GET_INSURERS_ALL,
      payload: {
        pageSize: 1000,
      },
    });

    const result$ = getInsurersAllEpic(action$, state$);

    const result = await result$.toPromise();

    expect(result).toEqual({
      type: InsurersAllActions.GET_INSURERS_ALL_SUCCESS,
      payload: {
        data: mockInsurers,
      },
    });
  });
});
