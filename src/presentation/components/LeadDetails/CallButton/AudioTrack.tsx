/* eslint-disable no-param-reassign */
import React from 'react';

import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';

interface AudioTrackProps {
  callState: { callStatus: CallStatus };
  stream: MediaStream | null;
}

function AudioTrack({ callState, stream }: AudioTrackProps) {
  const getRingSound = () => {
    switch (callState.callStatus) {
      case CallStatus.Calling:
        return `/static/sounds/bleep.mp3`;
      case CallStatus.End:
        return `/static/sounds/bleep.mp3`;
      default:
        return '';
    }
  };

  const isAutoPlay = () =>
    callState.callStatus === CallStatus.Calling ||
    callState.callStatus === CallStatus.Connecting ||
    callState.callStatus === CallStatus.Join ||
    callState.callStatus === CallStatus.End;

  return (
    <audio
      ref={(audio) => {
        if (audio) {
          if (
            callState.callStatus === CallStatus.Calling ||
            callState.callStatus === CallStatus.End
          ) {
            audio.src = getRingSound();
            audio.srcObject = null;
            audio.volume = 0.05;
          } else {
            audio.srcObject = stream;
            audio.src = '';
            audio.volume = 1;
          }
        }
      }}
      autoPlay={isAutoPlay()}
      loop={callState.callStatus === CallStatus.Calling}
    >
      <track kind="captions" label="lead_call" />
    </audio>
  );
}

export default React.memo(AudioTrack);
