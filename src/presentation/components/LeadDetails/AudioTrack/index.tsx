/* eslint-disable no-param-reassign */
import React from 'react';

import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';

function AudioTrack() {
  const callState = useAppSelector(
    (state) => state.leadsDetailReducer?.callReducer?.data
  );
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

  const allowedAutoPlayStatus = [
    CallStatus.Calling,
    CallStatus.Connecting,
    CallStatus.Join,
    CallStatus.End,
  ];
  const isAutoPlay = allowedAutoPlayStatus.includes(callState.callStatus);

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
            audio.srcObject = callState.audioStream;
            audio.src = '';
            audio.volume = 1;
          }
        }
      }}
      autoPlay={isAutoPlay}
      loop={callState.callStatus === CallStatus.Calling}
      data-testid="unittest-audio-track"
    >
      <track kind="captions" label="lead_call" />
    </audio>
  );
}
/**
 * @deprecated this should be removed and instead of this, CareosCall audio should be used
 */
export default React.memo(AudioTrack);
