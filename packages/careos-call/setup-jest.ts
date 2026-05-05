global.RTCSessionDescription = jest.fn((x) => x) as any;
global.RTCPeerConnection = jest.fn() as any;
global.newrelic = {
  addPageAction: jest.fn(),
  interaction: jest.fn(),
} as any;
global.MediaStream = jest.fn((x) => x) as any;
