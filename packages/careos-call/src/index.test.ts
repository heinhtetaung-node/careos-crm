import { Subject } from 'rxjs';

import Api from './api';
import MediaController from './media';
import Monitoring from './monitoring';
import NegotiationManager from './sdp-negotiator';
import { getMockCall } from './utils/test-utils';

var mockPeerEvent: jest.Mock;
var mockLocalEvent: jest.Mock;

var mockMonitor = {
  logCallOutcome: jest.fn(),
  logFailStep: jest.fn(),
  logRTCStats: jest.fn(),
  logStatusChange: jest.fn(),
  logLocalPeerConnection: jest.fn(),
  logRemotePeerConnection: jest.fn(),
  logReconnectOutcome: jest.fn(),
  stop: jest.fn(),
  start: jest.fn(),
} satisfies Monitoring;

const mockedNewRelic = {
  end: jest.fn(),
  save: jest.fn(),
  actionText: jest.fn(),
  createTracer: jest.fn(),
  getContext: jest.fn(),
  onEnd: jest.fn(),
  ignore: jest.fn(),
  setAttribute: jest.fn(),
  setName: jest.fn(),
} satisfies newrelic.BrowserInteraction;

jest.spyOn(newrelic, 'interaction').mockReturnValue(mockedNewRelic);

jest.mock('./monitoring', () =>
  jest.fn().mockImplementation(() => mockMonitor)
);

const mockRTC = {
  addTransceiver: jest.fn(),
  createOffer: jest.fn().mockResolvedValue('sdp'),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  onconnectionstatechange: (_e: any) => null,
  localDescription: { sdp: 'sdp' },
  close: jest.fn(),
  getReceivers: jest.fn().mockReturnValue([{ track: 'track' }]),
  getRTCStats: jest.fn().mockReturnValue([]),
};

jest.mock('./connection-event-listener/peer-event-listener', () => {
  mockPeerEvent = jest.fn();
  return mockPeerEvent;
});
jest.mock('./connection-event-listener/local-event-listener', () => {
  mockLocalEvent = jest.fn();
  return {
    ...jest.requireActual('./connection-event-listener/local-event-listener'),
    __esModule: true,
    default: mockLocalEvent,
  };
});
jest.spyOn(global, 'RTCPeerConnection').mockReturnValue(mockRTC as never);

describe('Careos Call', () => {
  let monitoring: Monitoring;

  beforeEach(() => {
    monitoring = new Monitoring();
    mockRTC.addTransceiver.mockClear();
    mockRTC.createOffer.mockClear();
    mockRTC.setLocalDescription.mockClear();
    mockRTC.setRemoteDescription.mockClear();
    mockRTC.close.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register tracks to rtc on prepare', async () => {
    jest
      .spyOn(MediaController.prototype, 'requestInputMedia')
      .mockResolvedValue({ getTracks: () => ['track'] } as any);
    const call = getMockCall(mockRTC);
    await call._prepare();
    expect(mockRTC.addTransceiver).toHaveBeenCalled();
  });

  it('should log failure to the monitoring', async () => {
    jest
      .spyOn(MediaController.prototype, 'requestInputMedia')
      .mockRejectedValue(Error('permission denied'));
    const call = getMockCall(mockRTC);
    await expect(() => call._prepare()).rejects.toThrow();
    expect(mockMonitor.logFailStep).toHaveBeenCalledWith(
      'PREPARING',
      Error('permission denied')
    );
  });

  it('should register call and agent as particant', async () => {
    const fn1 = jest
      .spyOn(Api.prototype, 'createCall')
      .mockResolvedValue({ name: 'callName' });
    const fn2 = jest
      .spyOn(Api.prototype, 'addAgentToCall')
      .mockResolvedValue({ name: 'participantName', state: 'active' });
    const call = getMockCall(mockRTC);
    await call._registerCall({ agent: 'agentName' });
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledWith({
      agentName: 'agentName',
      callName: 'callName',
    });
  });

  it('should log failure(fail to create call)', async () => {
    jest.spyOn(Api.prototype, 'createCall').mockResolvedValue({ name: '' });
    const call = getMockCall(mockRTC);
    await expect(() =>
      call._registerCall({ agent: 'agentName' })
    ).rejects.toThrow(Error('Cannot create call'));
  });

  it('should log failure(fail to add participant', async () => {
    jest
      .spyOn(Api.prototype, 'createCall')
      .mockResolvedValue({ name: 'callname' });
    jest
      .spyOn(Api.prototype, 'addAgentToCall')
      .mockResolvedValue({ name: '', state: '' });
    const call = getMockCall(mockRTC);
    await expect(() =>
      call._registerCall({ agent: 'agentName' })
    ).rejects.toThrow(Error('Cannot create participant'));
  });

  it('should set localDescription', async () => {
    const call = getMockCall(mockRTC);
    await call._createOffer();
    expect(mockRTC.setLocalDescription).toHaveBeenCalledWith('sdp');
  });

  it('should start exchanging sdp', async () => {
    jest
      .spyOn(NegotiationManager.prototype, 'start')
      .mockResolvedValue({ sdp: 'sdp', type: 'answer' });
    const call = getMockCall(mockRTC);
    const answer = await call._startSignalling('participantname', 'sdp');
    expect(answer).toEqual({ sdp: 'sdp', type: 'answer' });
  });

  it('should log fail sdp exchange', async () => {
    jest
      .spyOn(NegotiationManager.prototype, 'start')
      .mockRejectedValue('Exchange error');
    const call = getMockCall(mockRTC);
    await expect(() =>
      call._startSignalling('participantName', 'sdp')
    ).rejects.toBe('Exchange error');
    expect(mockMonitor.logFailStep).toHaveBeenCalledWith(
      'SIGNALLING',
      'Exchange error'
    );
  });

  it('should set the answer sdp and start connecting throught ice process', async () => {
    const call = getMockCall(mockRTC);
    const p = call._acceptAnswer({ sdp: 'sdp', type: 'answer' });
    mockRTC.onconnectionstatechange({
      currentTarget: { connectionState: 'connected' },
    });
    expect(mockRTC.setRemoteDescription).toHaveBeenCalled();
    await expect(p).resolves.not.toThrow();
  });

  it('should throw if the ice is not connected within timeframe', async () => {
    const call = getMockCall(mockRTC);
    const p = call._acceptAnswer({ sdp: 'sdp', type: 'answer' });
    expect(mockRTC.setRemoteDescription).toHaveBeenCalled();
    await expect(p).rejects.toThrow(Error('Timeout has occurred'));
    expect(mockMonitor.logFailStep).toHaveBeenCalledWith(
      'CONNECTING',
      Error('Timeout has occurred')
    );
  });

  it('should add lead as participants', async () => {
    const fn = jest
      .spyOn(Api.prototype, 'addLeadToCall')
      .mockResolvedValue({ state: 'created', name: 'participantName' });
    const call = getMockCall(mockRTC);
    await call._callLead({ call: 'callName', lead: 'leadName', phoneIndex: 0 });
    expect(fn).toHaveBeenCalled();
  });

  it('should log adding lead error', async () => {
    jest
      .spyOn(Api.prototype, 'addLeadToCall')
      .mockResolvedValue({ state: '', name: '' });
    const fn = jest.spyOn(monitoring, 'logFailStep');
    const call = getMockCall(mockRTC);
    await expect(() =>
      call._callLead({ call: 'callName', lead: 'leadName', phoneIndex: 0 })
    ).rejects.toThrow(Error('Cannot create participant'));
    expect(fn).toHaveBeenCalledWith(
      'CALLING',
      Error('Cannot create participant')
    );
  });

  it('should destroy call and clean up the resources on hangup', async () => {
    const call = getMockCall(mockRTC);
    const mockCleanup = jest
      .spyOn(call, '_cleanUpResources')
      .mockResolvedValue();
    const mockDeleteCall = jest
      .spyOn(Api.prototype, 'deleteCall')
      .mockResolvedValue({});
    call.currentCallName = 'callName';
    await call.hangUp();
    expect(mockCleanup).toHaveBeenCalled();
    expect(mockDeleteCall).toHaveBeenCalled();
  });

  it('should listen and change status according to connection status of the local', async () => {
    const call = getMockCall(mockRTC);
    const mockReconnect = jest.spyOn(call, '_reconnect');
    const mockSub = new Subject();
    mockLocalEvent.mockReturnValue(mockSub);
    call.currentCallName = 'callName';
    call._listenLocalPeerEvents();
    mockSub.next({ status: 'DISCONNECTED' });
    expect(call._status).toBe('CONNECTION_DISRURPTED');
    mockSub.next({ status: 'RECONNECTED' });
    expect(call._status).toBe('JOINED');
    mockSub.next({ status: 'CONNECTION_DISRUPTED' });
    expect(call._status).toBe('RECONNECTING');
    expect(mockReconnect).toHaveBeenCalled();
  });

  it('should listen and change status according to connection status of the peer', async () => {
    const call = getMockCall(mockRTC);
    const mockCleanup = jest.spyOn(call, '_cleanUpResources');
    const mockSub = new Subject();
    mockPeerEvent.mockReturnValue(mockSub);
    call._status = 'RINGING' as any;
    call._listenRemotePeerEvents();
    mockSub.next({ status: 'DISCONNECTED' });
    expect(call._status).toBe('DISCONNECTED');
    expect(mockCleanup).toHaveBeenCalled();
  });

  it('should get remote media stream', async () => {
    const call = getMockCall(mockRTC);
    call.rtc = mockRTC as any;
    const result = await call._getRemoteAudioStreams();
    expect(result).toEqual([['track']]);
  });

  it('should timeout if remote media stream is not provided', async () => {
    mockRTC.getReceivers.mockReturnValue([]);
    const call = getMockCall(mockRTC);
    await expect(() => call._getRemoteAudioStreams()).rejects.toThrow();
  });

  it('should clean up resources', async () => {
    const mockMediaClose = jest.spyOn(
      MediaController.prototype,
      'closeInputMedia'
    );
    const call = getMockCall(mockRTC);
    const mockRemoteEventListener = { unsubscribe: jest.fn() } as any;
    const mockLocalEventListener = { unsubscribe: jest.fn() } as any;
    call.currentRemoteListener = mockRemoteEventListener;
    call.currentLocalListener = mockLocalEventListener;
    call.currentCallName = 'callName';
    call.rtc = mockRTC as never;
    await call._cleanUpResources();
    // expect(mockRTC.close).toHaveBeenCalled();
    expect(mockRemoteEventListener.unsubscribe).toHaveBeenCalled();
    expect(mockLocalEventListener.unsubscribe).toHaveBeenCalled();
    expect(mockMediaClose).toHaveBeenCalled();
    expect(call.currentCallName).toBe(null);
    expect(call.currentRemoteListener).toBe(null);
    expect(call.currentLocalListener).toBe(null);
  });
});

describe('Careos Call(Main sequence)', () => {
  let monitoring: Monitoring;

  beforeEach(() => {
    monitoring = new Monitoring();
    monitoring.start();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call all necessary steps with initiate calls', async () => {
    const mainCall = getMockCall(mockRTC);
    const fn1 = jest.spyOn(mainCall, '_prepare').mockResolvedValue();
    const fn2 = jest.spyOn(mainCall, '_registerCall').mockResolvedValue({
      callName: 'callName',
      participantName: 'participantName',
    });
    const fn3 = jest.spyOn(mainCall, '_createOffer').mockResolvedValue();
    const fn4 = jest
      .spyOn(mainCall, '_startSignalling')
      .mockResolvedValue({ sdp: 'sdp', type: 'answer' });
    const fn5 = jest.spyOn(mainCall, '_acceptAnswer').mockResolvedValue();
    const fn6 = jest.spyOn(mainCall, '_callLead').mockResolvedValue();
    const fn7 = jest
      .spyOn(mainCall, '_listenRemotePeerEvents')
      .mockResolvedValue(null as never);
    const fn8 = jest
      .spyOn(mainCall, '_getRemoteAudioStreams')
      .mockResolvedValue([]);
    const fn9 = jest
      .spyOn(mainCall, '_listenLocalPeerEvents')
      .mockReturnValue();
    await mainCall.initiateCall({
      agent: 'agentName',
      lead: 'leadName',
      phoneIndex: 0,
    });
    [fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8, fn9].forEach((f) =>
      expect(f).toHaveBeenCalled()
    );
    expect(mockMonitor.logCallOutcome).toHaveBeenCalledWith('INITIATED');
    expect(mockMonitor.logCallOutcome).toHaveBeenCalledWith('SUCCESS');
    expect(mockMonitor.logRTCStats).toHaveBeenCalled();
    await mainCall._cleanUpResources();
  });

  it('should log failed call attampt', async () => {
    const mainCall = getMockCall(mockRTC);
    jest.spyOn(mainCall, '_prepare').mockRejectedValue(Error('failed'));
    await expect(() =>
      mainCall.initiateCall({
        agent: 'agentName',
        lead: 'leadName',
        phoneIndex: 0,
      })
    ).rejects.toBeTruthy();
    expect(mockMonitor.logCallOutcome).toHaveBeenCalledWith('INITIATED');
    expect(mockMonitor.logCallOutcome).toHaveBeenCalledWith('FAIL');
    expect(mockMonitor.logRTCStats).not.toHaveBeenCalled();
  });
});
