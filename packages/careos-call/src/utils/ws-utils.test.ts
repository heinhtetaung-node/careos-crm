import { throwError } from 'rxjs';

import { subscribeEvent } from './ws-utils';

describe('ws-utils', () => {
  it('should warn and complete when websocket errors', (done) => {
    const error = new Error('socket closed');
    const consoleSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const ws = {
      multiplex: jest.fn().mockReturnValueOnce(throwError(() => error)),
    } as any;

    subscribeEvent(ws, '/pattern/*').subscribe({
      complete: () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'WebSocket event stream error',
          error
        );
        consoleSpy.mockRestore();
        done();
      },
    });
  });
});
