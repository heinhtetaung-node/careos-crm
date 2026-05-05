import { throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { LeadCustomerDetailActionTypes } from 'presentation/redux/actions/leadDetail/updateCustomerDetail';

import { UIActionTypes } from '../../../actions/ui';

import updateCustomerDetailEpic from '.';

const mockedErrorResponse = () => throwError('error');

jest.mock('data/repository/leadDetail', () => () => ({
  updateLicensePlate: mockedErrorResponse,
}));

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: () => 'xyz',
}));

describe.skip('updateCustomerDetailEpic', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    scheduler.flush();
  });

  test('update DOB with no value', () => {
    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL,
          payload: {},
        },
      });

      const output$ = updateCustomerDetailEpic(action$);

      expectObservable(output$).toBe('-(ab)', {
        a: {
          type: LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL_FAIL,
          payload: 'error',
        },
        b: {
          type: UIActionTypes.SHOW_SNACKBAR,
          payload: {
            isOpen: true,
            message: 'text.updateLeadFail',
            status: 'error',
          },
        },
      });
    });
  });
});
