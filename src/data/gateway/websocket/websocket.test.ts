import { of, throwError } from 'rxjs';

import WebSocketGateway from '.';

var mockFn: jest.Mock;

jest.mock('rxjs/webSocket', () => {
  mockFn = jest.fn().mockReturnValue(of({}));
  return {
    ...jest.requireActual('rxjs/webSocket'),
    webSocket: jest.fn().mockReturnValue({ multiplex: mockFn }),
  };
});

describe('WebSocketGateway', () => {
  beforeEach(() => {
    mockFn.mockClear();
  });

  it('should call multiplex method with correct method(defaultCase)', () => {
    const ws = WebSocketGateway.getInstance();
    ws.subscribe('/pattern/*');
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn.mock.calls[0][0]()).toEqual({
      cmd: 'sub',
      params: {
        pattern: '/pattern/*',
      },
    });
    expect(mockFn.mock.calls[0][1]()).toEqual({});
    expect(mockFn.mock.calls[0][2]({ name: '/pattern/resname' })).toBeTruthy();
  });

  it('should call multiplex method with correct method(strictEqualCase)', () => {
    const ws = WebSocketGateway.getInstance();
    ws.subscribe('/pattern', { strictFiltering: true, emitUnsubscribe: true });
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn.mock.calls[0][0]()).toEqual({
      cmd: 'sub',
      params: {
        pattern: '/pattern',
      },
    });
    expect(mockFn.mock.calls[0][1]()).toEqual({
      cmd: 'unsub',
      params: {
        pattern: '/pattern',
      },
    });
    expect(mockFn.mock.calls[0][2]({ name: '/pattern/resname' })).toBeFalsy();
    expect(mockFn.mock.calls[0][2]({ name: '/pattern' })).toBeTruthy();
  });

  it('should swallow websocket errors and warn', (done) => {
    const consoleSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const ws = WebSocketGateway.getInstance();
    const error = new Error('socket closed');

    mockFn.mockReturnValueOnce(throwError(() => error));

    ws.subscribe('/pattern/*')?.subscribe({
      complete: () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'WebSocket subscription error',
          error
        );
        consoleSpy.mockRestore();
        done();
      },
    });
  });
});
