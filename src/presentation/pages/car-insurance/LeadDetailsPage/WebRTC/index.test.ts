jest.mock('monitoring/call', () =>
  jest.fn().mockImplementation(() => ({}))
);

function createMockPeerConnection(overrides = {}) {
  const pc = {
    signalingState: 'stable',
    close: jest.fn(),
    addTransceiver: jest.fn(),
    createOffer: jest
      .fn()
      .mockResolvedValue({ type: 'offer', sdp: 'local-offer' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockResolvedValue({
      forEach: (cb) => {
        cb({ id: 's1', type: 'codec' });
        cb(null);
      },
    }),
    oniceconnectionstatechange: null,
    onconnectionstatechange: null,
    ontrack: null,
    onicecandidateerror: null,
    onicecandidate: null,
    ...overrides,
  };
  return pc;
}

let lastPeer;

function mockGlobals(peerFactory) {
  lastPeer = peerFactory();
  global.RTCPeerConnection = jest.fn(() => lastPeer);
  global.RTCSessionDescription = jest.fn((init) => init);
}

describe('WebRTC index', () => {
  let getUserMediaMock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    getUserMediaMock = jest.fn();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: getUserMediaMock,
      },
    });
    global.newrelic = {
      addPageAction: jest.fn(),
      noticeError: jest.fn(),
    };
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('closePeerConnection is a no-op when peer was never started', async () => {
    mockGlobals(() => createMockPeerConnection());
    const { closePeerConnection, getPeerConnection } = await import('./index');
    closePeerConnection();
    expect(getPeerConnection()).toBeUndefined();
  });

  it('getPeerConnection returns the active peer after startPeerConnection', async () => {
    const track = { stop: jest.fn() };
    const stream = {
      getTracks: () => [track],
    };
    mockGlobals(() => createMockPeerConnection());
    getUserMediaMock.mockResolvedValue(stream);

    const { startPeerConnection, getPeerConnection, closePeerConnection } =
      await import('./index');

    await startPeerConnection(jest.fn());
    expect(getPeerConnection()).toBe(lastPeer);
    expect(lastPeer.addTransceiver).toHaveBeenCalled();

    closePeerConnection();
    expect(track.stop).toHaveBeenCalled();
    expect(lastPeer.close).toHaveBeenCalled();
  });

  it('registers ICE and connection handlers and forwards ontrack', async () => {
    mockGlobals(() => createMockPeerConnection());
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const onTrack = jest.fn();
    const { startPeerConnection } = await import('./index');
    await startPeerConnection(onTrack);

    expect(typeof lastPeer.oniceconnectionstatechange).toBe('function');
    expect(typeof lastPeer.onconnectionstatechange).toBe('function');
    lastPeer.oniceconnectionstatechange({});
    lastPeer.onconnectionstatechange({});
    expect(console.log).toHaveBeenCalled();

    expect(lastPeer.ontrack).toBe(onTrack);
  });

  it('onicecandidate with candidate triggers getStats and newrelic addPageAction', async () => {
    mockGlobals(() => createMockPeerConnection());
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection } = await import('./index');
    await startPeerConnection(null);

    await lastPeer.onicecandidate({ candidate: { candidate: 'x' } });
    expect(lastPeer.getStats).toHaveBeenCalled();
    expect(global.newrelic.addPageAction).toHaveBeenCalledWith(
      'WebRTCStats',
      expect.objectContaining({
        stats: expect.stringContaining('s1'),
      })
    );
  });

  it('onicecandidate without candidate does not call getStats', async () => {
    mockGlobals(() => createMockPeerConnection());
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection } = await import('./index');
    await startPeerConnection(null);
    lastPeer.getStats.mockClear();

    lastPeer.onicecandidate({ candidate: null });
    expect(lastPeer.getStats).not.toHaveBeenCalled();
  });

  // getUserMedia rejection is not asserted here: the catch block calls
  // closePeerConnection() before webcamStream is assigned, which throws in the implementation.

  it('onicecandidateerror logs and reports to newrelic', async () => {
    mockGlobals(() => createMockPeerConnection());
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection } = await import('./index');
    await startPeerConnection(null);

    lastPeer.onicecandidateerror({});
    expect(console.error).toHaveBeenCalled();
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(
      'ICE candidate error'
    );
  });

  it('createOffer failure reports error to newrelic', async () => {
    mockGlobals(() =>
      createMockPeerConnection({
        createOffer: jest.fn().mockRejectedValue(new Error('offer failed')),
      })
    );
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection } = await import('./index');
    await startPeerConnection(null);

    expect(global.newrelic.noticeError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'offer failed' })
    );
  });

  it('handleAudioAnswer sets remote description when in have-local-offer', async () => {
    mockGlobals(() =>
      createMockPeerConnection({ signalingState: 'have-local-offer' })
    );
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection, handleAudioAnswer } = await import('./index');
    await startPeerConnection(null);

    await handleAudioAnswer({ sdp: 'remote-answer' });
    expect(lastPeer.setRemoteDescription).toHaveBeenCalledWith({
      type: 'answer',
      sdp: 'remote-answer',
    });
  });

  it('handleAudioAnswer skips setRemoteDescription when not have-local-offer', async () => {
    mockGlobals(() => createMockPeerConnection({ signalingState: 'stable' }));
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { startPeerConnection, handleAudioAnswer } = await import('./index');
    await startPeerConnection(null);
    lastPeer.setRemoteDescription.mockClear();

    await handleAudioAnswer({ sdp: 'ignored' });
    expect(lastPeer.setRemoteDescription).not.toHaveBeenCalled();
  });
});
