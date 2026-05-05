import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import WebSocketGateway from 'data/gateway/websocket';
import { LeadActivityTypes } from 'presentation/redux/actions/leadActivity';
import { LeadActionTypes } from 'presentation/redux/actions/leadDetail/email';

import subscribeMailUpdatesEpic from './mail';

jest.mock('data/gateway/websocket');

jest.mock('config/feature-flags', () => ({
  websocketEnabled: true,
}));

const mockedWebSocketGateway = jest.mocked(WebSocketGateway);

describe('subscribeMailUpdatesEpic', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    scheduler.flush();
  });

  it('should be EMPTY if no leadName provided', () => {
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
          type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
          payload: {},
        },
      });

      const output$ = subscribeMailUpdatesEpic(action$);

      expectObservable(output$).toBe('-');
    });
  });

  it('should sub for mails changes', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          body: {},
          name: 'mailer/v1alpha1/leads/xyz/mails/123',
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
          payload: {
            leadName: 'xyz',
          },
        },
      });

      const output$ = subscribeMailUpdatesEpic(action$);

      expectObservable(output$).toBe('-');
    });
  });

  it('should sub for mails changes locally and trigger increment action', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          name: 'mailer/v1alpha1/leads/xyz/mails/',
          body: {
            read: false,
            type: 'INBOUND',
          },
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
          payload: {
            leadName: 'xyz',
            isApiCallForUnreadMailCountDisabled: true,
          },
        },
      });

      const output$ = subscribeMailUpdatesEpic(action$);

      expectObservable(output$).toBe('-a', {
        a: {
          type: LeadActionTypes.INCREMENT_MAIL_READ_COUNT,
        },
      });
    });
  });
  it('should sub for mails changes locally and trigger decrement action', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          name: 'mailer/v1alpha1/leads/xyz/mails/',
          body: {
            read: true,
            type: 'INBOUND',
          },
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
          payload: {
            leadName: 'xyz',
            isApiCallForUnreadMailCountDisabled: true,
          },
        },
      });

      const output$ = subscribeMailUpdatesEpic(action$);

      expectObservable(output$).toBe('-a', {
        a: {
          type: LeadActionTypes.DECREMENT_MAIL_READ_COUNT,
        },
      });
    });
  });
  it('should sub for mails changes and trigger action for api call to get unread mail count', () => {
    mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
      subscribe: jest.fn().mockReturnValue(
        of({
          name: 'mailer/v1alpha1/leads/xyz/mails/',
          body: {
            type: 'INBOUND',
          },
        })
      ),
    });

    scheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: {
          type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
          payload: {
            leadName: 'xyz',
            isApiCallForUnreadMailCountDisabled: false,
          },
        },
      });

      const output$ = subscribeMailUpdatesEpic(action$);

      expectObservable(output$).toBe('-a', {
        a: {
          type: LeadActionTypes.GET_MAIL_READ_COUNT,
          payload: {
            orderLeadId: undefined,
          },
        },
      });
    });
  });
});
