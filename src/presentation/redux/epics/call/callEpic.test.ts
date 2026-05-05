import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import WebSocketGateway from 'data/gateway/websocket';
import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';
import { UIActionTypes } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';

import { subscribeCallEpic, subscribeParticipantEpic } from '.';

jest.mock('data/gateway/websocket');

jest.mock('config/feature-flags', () => {
  return {
    websocketEnabled: true,
  };
});

const mockedWebSocketGateway = jest.mocked(WebSocketGateway);

describe('callEpic', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    scheduler.flush();
  });

  describe('subscribeParticipantEpic', () => {
    it('Status: Empty', () => {
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
            type: LeadDetailActionTypes.SUBSCRIBE_CALL,
            payload: {
              callName: 'calls/test',
            },
          },
        });

        const output$ = subscribeParticipantEpic(action$);

        expectObservable(output$).toBe('', []);
      });
    });

    it('Busy call', () => {
      mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
        subscribe: jest.fn().mockReturnValue(
          of({
            body: {
              state: 'BUSY',
              deleteTime: '0001-01-01T00:00:00Z',
              joinTime: null,
            },
          })
        ),
      });

      scheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: {
            type: LeadDetailActionTypes.SUBSCRIBE_CALL,
            payload: {
              callName: 'calls/test',
            },
          },
        });

        const output$ = subscribeParticipantEpic(action$);

        expectObservable(output$).toBe('-(a)', {
          a: {
            type: UIActionTypes.SHOW_SNACKBAR,
            payload: {
              isOpen: true,
              message: 'text.cannotContactCustomer',
              status: CONSTANTS.snackBarConfig.type.success,
            },
          },
        });
      });
    });

    it('Customer join call', () => {
      mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
        subscribe: jest.fn().mockReturnValue(
          of({
            body: {
              state: 'JOINED',
              joinTime: '0001-01-01T00:00:00Z',
              deleteTime: null,
            },
          })
        ),
      });

      scheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: {
            type: LeadDetailActionTypes.SUBSCRIBE_CALL,
            payload: {
              callName: 'calls/test',
            },
          },
        });

        const output$ = subscribeParticipantEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: {
            type: LeadDetailActionTypes.JOIN_CALL,
          },
          b: {
            type: UIActionTypes.SHOW_SNACKBAR,
            payload: {
              isOpen: true,
              message: 'text.customerPickUpCall',
              status: CONSTANTS.snackBarConfig.type.success,
            },
          },
        });
      });
    });

    it('Customer leave call', () => {
      mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
        subscribe: jest.fn().mockReturnValue(
          of({
            body: {
              state: 'JOINED',
              joinTime: '0001-01-01T00:00:00Z',
              deleteTime: '0001-01-01T00:00:00Z',
            },
          })
        ),
      });

      scheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: {
            type: LeadDetailActionTypes.SUBSCRIBE_CALL,
            payload: {
              callName: 'calls/test',
            },
          },
        });

        const output$ = subscribeParticipantEpic(action$);

        expectObservable(output$).toBe('-(a)', {
          a: {
            type: UIActionTypes.SHOW_SNACKBAR,
            payload: {
              isOpen: true,
              message: 'text.cannotContactCustomer',
              status: CONSTANTS.snackBarConfig.type.success,
            },
          },
        });
      });
    });
  });

  describe('subscribeCallEpic', () => {
    it('Status: CallEnd', () => {
      const sdpsAnswerEvent = 'call/v1alpha1/test/sdps/answer';
      mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
        subscribe: jest
          .fn()
          .mockReturnValueOnce(
            of({
              body: {
                deleteTime: '123456',
              },
              name: 'call/v1alpha1/calls/test',
            })
          )
          .mockReturnValue(
            of({
              body: {},
              name: sdpsAnswerEvent,
            })
          ),
      });

      scheduler.run(({ hot, expectObservable }) => {
        const action$ = hot('-a', {
          a: {
            type: LeadDetailActionTypes.SUBSCRIBE_CALL,
            payload: {
              callName: 'calls/test',
              callParticipantName: 'test',
            },
          },
        });

        const output$ = subscribeCallEpic(action$);

        expectObservable(output$).toBe('-(ab)', {
          a: {
            type: LeadDetailActionTypes.END_CALL,
          },
          b: {
            type: LeadDetailActionTypes.CONNECTED_CALL,
            payload: {
              callName: 'calls/test',
              sdpAnswer: {},
              sdpAnswerResource: sdpsAnswerEvent,
            },
          },
        });
      });
    });
  });
});
