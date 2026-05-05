import MediaController from '../index';

const mockCloseFn = jest.fn();

const mockGetMedia = jest
  .fn()
  .mockResolvedValue({ getTracks: () => [{ stop: mockCloseFn }] } as any);

global.navigator = {
  mediaDevices: {
    getUserMedia: mockGetMedia,
  },
} as any;

describe('MediaController', () => {
  beforeEach(() => {
    mockGetMedia.mockClear();
    mockCloseFn.mockClear();
  });

  test('should request for media device', async () => {
    const mc = new MediaController();
    await mc.requestInputMedia();
    expect(mockGetMedia).toBeCalled();
  });

  test('should close media device', async () => {
    const mc = new MediaController();
    await mc.requestInputMedia();
    mc.closeInputMedia();
    expect(mockCloseFn).toBeCalled();
  });
});
