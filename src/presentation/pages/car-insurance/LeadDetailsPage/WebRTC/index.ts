import CallMonitor from 'monitoring/call';

let myPeerConnection: RTCPeerConnection;
let webcamStream: MediaStream; // MediaStream from webcam
let callMonitor: CallMonitor;
const mediaConstraints = {
  audio: true,
};
export function closePeerConnection() {
  if (myPeerConnection) {
    webcamStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    myPeerConnection.close();
  }
}
export function getPeerConnection() {
  return myPeerConnection;
}
export async function startPeerConnection(
  handleTrackEvent: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null
) {
  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };
  myPeerConnection = new RTCPeerConnection(configuration);
  callMonitor = new CallMonitor(myPeerConnection);
  myPeerConnection.oniceconnectionstatechange = (event) => {
    console.log('ICE connection state changed', event);
  };
  myPeerConnection.onconnectionstatechange = (event) => {
    console.log('Connection state changed', event);
  };
  myPeerConnection.ontrack = handleTrackEvent;
  const handleStats = (report: RTCStatsReport) => {
    const results: any[] = [];
    report.forEach((stat) => {
      const value = stat;
      if (value) {
        results.push({ name: stat.id, value });
      }
    });
    newrelic?.addPageAction?.('WebRTCStats', {
      stats: JSON.stringify(results),
    });
  };
  myPeerConnection.onicecandidateerror = (event) => {
    console.error('ICE candidate error', event);
    newrelic?.noticeError('ICE candidate error');
  };
  myPeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      myPeerConnection.getStats().then(handleStats);
    }
  };
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    webcamStream
      .getTracks()
      .forEach((track: MediaStreamTrack) =>
        myPeerConnection.addTransceiver(track, { streams: [webcamStream] })
      );
  } catch (e: unknown) {
    const err = e as Error;
    switch (err.name) {
      case 'NotFoundError':
        newrelic?.noticeError(
          'Unable to open your call because no camera and/or microphone'
        );
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        break;
      default:
        newrelic?.noticeError(
          `Error opening your camera and/or microphone: ${err.message}`
        );
        break;
    }
    closePeerConnection();
  }
  try {
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
  } catch (e) {
    const err = e as Error;
    newrelic?.noticeError(err);
  }
}
export async function handleAudioAnswer(message: { sdp: string }) {
  const desc = new RTCSessionDescription({ type: 'answer', sdp: message.sdp });
  if (myPeerConnection.signalingState === 'have-local-offer') {
    await myPeerConnection.setRemoteDescription(desc);
  }
}
