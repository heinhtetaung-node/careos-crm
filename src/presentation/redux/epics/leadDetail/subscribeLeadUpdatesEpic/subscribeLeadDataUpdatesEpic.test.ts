import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import WebSocketGateway from 'data/gateway/websocket';
import { LeadDetailGetLeadActionTypes } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { LeadDetailUpdateLeadDataActionTypes } from 'presentation/redux/actions/leadDetail/updateLeadData';
import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';

import { UIActionTypes } from '../../../actions/ui';

import subscribeLeadDataUpdatesEpic from '.';

jest.mock('data/gateway/websocket');

jest.mock('config/feature-flags', () => ({
  websocketEnabled: true,
}));

const mockedWebSocketGateway = jest.mocked(WebSocketGateway);

describe('subscribeLeadDataUpdatesEpic', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    scheduler.flush();
  });

  it('should avoid update if no res found', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(of({})),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
          payload: {
            leadName: '2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        },
      });

      const output$ = subscribeLeadDataUpdatesEpic(action$);

      expectObservable(output$).toBe('-');
    });
  });

  it('should avoid update if res is empty', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          body: {},
          name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc',
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
          payload: {
            leadName: '2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        },
      });

      const output$ = subscribeLeadDataUpdatesEpic(action$);

      expectObservable(output$).toBe('-');
    });
  });

  test('Status: with no lead', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          body: {},
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
          payload: {},
        },
      });

      const output$ = subscribeLeadDataUpdatesEpic(action$);

      expectObservable(output$).toBe('-');
    });
  });

  test('Status: with leadName', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc',
          body: {
            status: true,
            name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
          payload: {
            leadName: '2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        },
      });

      const output$ = subscribeLeadDataUpdatesEpic(action$);

      expectObservable(output$).toBe('-(abc)', {
        a: {
          type: LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_SUCCESS,
          payload: {
            status: true,
            name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc',
            important: false,
          },
        },
        b: {
          type: LeadDetailGetLeadActionTypes.GET_LEAD_SUCCESS,
          payload: {
            status: true,
            name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        },
        c: {
          type: UIActionTypes.SHOW_SNACKBAR,
          payload: {
            isOpen: true,
            message: 'text.updatedInformation',
            status: 'success',
          },
        },
      });
    });
  });
});
