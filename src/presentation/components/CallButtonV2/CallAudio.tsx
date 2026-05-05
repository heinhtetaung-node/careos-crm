import React, { useEffect, useRef } from 'react';
import { selectCareosCall } from 'data/slices/callSlice';
import { useSelector } from 'react-redux';

function CallAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { status, audio } = useSelector(selectCareosCall);
  useEffect(() => {
    if (status === 'ended' && audioRef.current) {
      audioRef.current.src = '/static/sounds/bleep.mp3';
      audioRef.current.srcObject = null;
      audioRef.current.volume = 0.05;
      const timeout = setTimeout(() => {
        if (audioRef.current) audioRef.current.src = '';
      }, 1000);
      return () => clearTimeout(timeout);
    }
    if (status === 'reconnecting' && audioRef.current) {
      audioRef.current.src = '/static/sounds/reconnect.mp3';
      audioRef.current.srcObject = null;
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
    }
    if (['ringing', 'incall'].includes(status) && audioRef.current) {
      audioRef.current.src = '';
      audioRef.current.srcObject = audio?.[0] as MediaStream;
      audioRef.current.volume = 1;
    }
  }, [status, audio]);
  return (
    <audio
      ref={audioRef}
      autoPlay
      loop={false}
      data-testid="unittest-audio-track"
    >
      <track kind="captions" label="lead_call" />
    </audio>
  );
}
export default CallAudio;
