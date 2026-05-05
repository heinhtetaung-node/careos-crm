import { StateObservable } from 'redux-observable';
import { of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import WebSocketGateway from 'data/gateway/websocket';
import { LeadActivityTypes } from 'presentation/redux/actions/leadActivity';

import { subscribeCommentUpdatesEpic } from './comment';

import { UIActionTypes } from '../../actions/ui';

jest.mock('data/gateway/websocket');

jest.mock('config/feature-flags', () => ({
  websocketEnabled: true,
}));

const mockedWebSocketGateway = jest.mocked(WebSocketGateway);

const state$ = new StateObservable(new Subject(), {
  authReducer: {
    data: {
      user: {
        name: 'user/xyz',
        firstName: 'first',
        lastName: 'last',
      },
    },
  },
});

describe('subscribeCommentUpdatesEpic', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    scheduler.flush();
  });

  it('Status: with no lead', () => {
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
          type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES,
          payload: {},
        },
      });

      const output$ = subscribeCommentUpdatesEpic(action$, state$);

      expectObservable(output$).toBe('-');
    });
  });

  test('Status: with leadName', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          body: {
            name: 'leads/xyz/comments/xyz',
          },
          name: 'lead/v1alpha2/leads/2097de20-5a00-4bad-bbfe-286b1403f6dc/comments/xyz',
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES,
          payload: {
            leadName: '2097de20-5a00-4bad-bbfe-286b1403f6dc',
          },
        },
      });

      const output$ = subscribeCommentUpdatesEpic(action$, state$);

      expectObservable(output$).toBe('-(ab)', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS,
          payload: {
            name: '',
          },
        },
        b: {
          type: UIActionTypes.SHOW_SNACKBAR,
          payload: {
            isOpen: true,
            message: 'text.commentUpdated',
            status: 'success',
          },
        },
      });
    });
  });
});
