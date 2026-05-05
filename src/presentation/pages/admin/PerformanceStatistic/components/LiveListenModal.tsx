import {
  AudioTrack,
  TrackReference,
  TrackReferenceOrPlaceholder,
  useConnectionState,
} from '@livekit/components-react';
import { Card, IconButton, Slider } from '@material-ui/core';
import {
  Close as CloseIcon,
  Fullscreen as OpenInFullIcon,
  Phone as PhoneIcon,
  Remove as RemoveIcon,
  SignalCellular4Bar as SignalIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@material-ui/icons';
import clsx from 'clsx';
import {
  ConnectionQuality,
  ConnectionState,
  Participant,
  ParticipantEvent,
} from 'livekit-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getString } from 'presentation/theme/localization';

interface LiveListenModalProps {
  agentName: string;
  customerName?: string;
  leadId?: string;
  callDuration?: string;
  onClose: () => void;
  audioTracks: TrackReferenceOrPlaceholder[];
}
function ConnectionQualityIndicator({
  participant,
}: Readonly<{
  participant?: Participant;
}>) {
  const [quality, setQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Unknown
  );
  useEffect(() => {
    if (!participant) return () => {};
    const onQualityChanged = (q: ConnectionQuality) => setQuality(q);
    setQuality(participant.connectionQuality);
    participant.on(ParticipantEvent.ConnectionQualityChanged, onQualityChanged);
    return () => {
      participant.off(
        ParticipantEvent.ConnectionQualityChanged,
        onQualityChanged
      );
    };
  }, [participant]);
  const getColor = (q: ConnectionQuality) => {
    switch (q) {
      case ConnectionQuality.Excellent:
        return 'text-green-500';
      case ConnectionQuality.Good:
        return 'text-green-400';
      case ConnectionQuality.Poor:
        return 'text-yellow-500';
      case ConnectionQuality.Lost:
        return 'text-red-500';
      default:
        return 'text-gray-300';
    }
  };
  return (
    <SignalIcon className={clsx('h-4 w-4 text-medium', getColor(quality))} />
  );
}
function SpeakingIndicator({
  trackRef,
  onSpeakingChange,
}: Readonly<{
  trackRef: TrackReferenceOrPlaceholder;
  onSpeakingChange: (isSpeaking: boolean) => void;
}>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const track = trackRef?.publication?.track;
    if (!track) return () => {};
    try {
      let mediaStreamTrack: MediaStreamTrack | null = null;
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      } else if ((track as any).track) {
        mediaStreamTrack = (track as any).track;
      } else if ((track as any).mediaStream) {
        const stream = (track as any).mediaStream as MediaStream;
        mediaStreamTrack = stream.getAudioTracks()[0] || null;
      }
      if (!mediaStreamTrack) return () => {};
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3; // Faster response for speaking detection
      const source = audioContext.createMediaStreamSource(
        new MediaStream([mediaStreamTrack])
      );
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i += 1) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const threshold = 20;
        onSpeakingChange(average > threshold);
      };
      intervalRef.current = setInterval(checkVolume, 100);
    } catch (error) {
      console.error('Error setting up speaking indicator', error);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current)
        audioContextRef.current.close().catch(console.error);
    };
  }, [trackRef, onSpeakingChange]);
  return null;
}
export default function LiveListenModal({
  agentName,
  customerName = getString(
    'performanceStatistic.liveListenModal.defaultCustomerName'
  ),
  leadId: leadHumanId,
  callDuration = '00:00',
  onClose,
  audioTracks,
}: Readonly<LiveListenModalProps>) {
  const connectionState = useConnectionState();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [duration, setDuration] = useState(callDuration);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [customerSpeaking, setCustomerSpeaking] = useState(false);
  useEffect(() => setDuration(callDuration), [callDuration]);
  const agentTrack = useMemo(
    () =>
      audioTracks.find((t) => {
        const attrs = (t.participant as any)._attributes ?? {};
        return !('sip.callID' in attrs);
      }),
    [audioTracks]
  );
  const customerTrack = useMemo(
    () =>
      audioTracks.find(
        (t) => 'sip.callID' in ((t.participant as any)._attributes ?? {})
      ),
    [audioTracks]
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => {
        const parts = prev.split(':');
        if (parts.length !== 2) return prev;
        const [minutes, seconds] = parts.map(Number);
        const totalSeconds = minutes * 60 + seconds + 1;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsMinimized(true);
  };
  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setIsMinimized(true);
  };
  const handleVolumeChange = (event: any, newValue: number | number[]) => {
    setVolume(newValue as number);
    if ((newValue as number) > 0) setIsMuted(false);
  };
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      setIsMuted(true);
    }
  };
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="bg-white shadow-lg border-2 border-[#0052A3] rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 p-3 pr-4">
            <div className="bg-[#0052A3] rounded-full p-2 flex items-center justify-center">
              <PhoneIcon className="h-4 w-4 text-white text-medium" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="font-semibold text-sm text-gray-900 m-0">
                  {getString(
                    'performanceStatistic.liveListenModal.liveListening'
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-600 truncate m-0">{agentName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {duration}
              </span>
              <IconButton
                size="small"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8"
              >
                <OpenInFullIcon className="h-4 w-4" />
              </IconButton>
              <IconButton
                size="small"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                onClick={onClose}
              >
                <CloseIcon className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </Card>
        {agentTrack && (
          <AudioTrack
            trackRef={agentTrack as unknown as TrackReference}
            volume={isMuted ? 0 : volume / 100}
          />
        )}
        {customerTrack && (
          <AudioTrack
            trackRef={customerTrack as unknown as TrackReference}
            volume={isMuted ? 0 : volume / 100}
          />
        )}
      </div>
    );
  }
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
    >
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 rounded-lg overflow-hidden">
        <div className="bg-[#0052A3] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2 flex items-center justify-center">
              <PhoneIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg m-0">
                {getString(
                  'performanceStatistic.liveListenModal.liveListenMode'
                )}
              </h2>
              <p className="text-white text-opacity-80 text-xs m-0">
                {getString(
                  'performanceStatistic.liveListenModal.silentMonitoringActive'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              className="h-9 w-9 hover:bg-white hover:bg-opacity-20 text-white"
              onClick={() => setIsMinimized(true)}
            >
              <RemoveIcon className="h-4 w-4" />
            </IconButton>
            <IconButton
              size="small"
              className="h-9 w-9 hover:bg-white hover:bg-opacity-20 text-white"
              onClick={onClose}
            >
              <CloseIcon className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
        <div className="px-6 py-5 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            {connectionState === ConnectionState.Connected ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                  {getString(
                    'performanceStatistic.liveListenModal.callInProgress'
                  )}
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                  {getString('performanceStatistic.liveListenModal.callEnded')}
                </span>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-3">
                <PhoneIcon className="h-4 w-4 text-[#0052A3]" />
                <span className="text-2xl font-bold text-primary">
                  {duration}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div
                className={clsx(
                  'flex items-center gap-3 pb-3 border-b border-gray-100 rounded-lg px-3 py-2 transition-all',
                  agentSpeaking ? 'bg-green-50 border-green-200' : ''
                )}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold">
                    {agentName.charAt(0)}
                  </div>
                  {agentSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                      <VolumeUpIcon className="w-3 h-3 text-white text-sm" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 m-0">
                    {getString('performanceStatistic.liveListenModal.agent')}
                  </p>
                  <p className="text-sm text-gray-600 m-0">{agentName}</p>
                </div>
                {agentTrack ? (
                  <div className="flex items-center gap-2">
                    <ConnectionQualityIndicator
                      participant={agentTrack.participant}
                    />
                    {agentSpeaking && (
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-2" />
                        <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-3" />
                        <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                    {getString('performanceStatistic.liveListenModal.left')}
                  </span>
                )}
              </div>
              <div
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  customerSpeaking ? 'bg-green-50 border border-green-200' : ''
                )}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {customerName.charAt(0)}
                  </div>
                  {customerSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                      <VolumeUpIcon className="w-3 h-3 text-white text-[12px]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 m-0">
                    {getString('performanceStatistic.liveListenModal.customer')}
                  </p>
                  <p className="text-sm text-gray-600 m-0">
                    {customerName} {leadHumanId ? `(${leadHumanId})` : ''}
                  </p>
                </div>
                {customerTrack ? (
                  <div className="flex items-center gap-2">
                    <ConnectionQualityIndicator
                      participant={customerTrack.participant}
                    />
                    {customerSpeaking && (
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-2" />
                        <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-3" />
                        <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                    {getString('performanceStatistic.liveListenModal.left')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 bg-white border-t border-gray-100">
          <div className="space-y-4">
            <div>
              <label
                className="text-sm font-medium text-gray-700 mb-3 block"
                htmlFor="volume-slider"
              >
                {getString(
                  'performanceStatistic.liveListenModal.audioControls'
                )}
              </label>

              <div className="flex items-center gap-4">
                <IconButton
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  data-testid="icon-volumeup"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <VolumeUpIcon className="h-5 w-5 text-gray-700" />
                  )}
                </IconButton>
                <div className="flex-1">
                  <Slider
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-labelledby="continuous-slider"
                    className="text-[#0052A3]"
                    data-testid="volume-slider"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">
                  {isMuted ? 0 : volume}%
                </span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <div className="text-amber-600 mt-0.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-12h-1.86v6h1.86V4zm0 8h-1.86v2h1.86v-2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 m-0">
                  {getString(
                    'performanceStatistic.liveListenModal.silentMonitoringActiveTitle'
                  )}
                </p>
                <p className="text-xs text-amber-700 mt-0.5 m-0">
                  {getString(
                    'performanceStatistic.liveListenModal.silentMonitoringDescription'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {agentTrack && (
        <>
          <AudioTrack
            trackRef={agentTrack as unknown as TrackReference}
            volume={isMuted ? 0 : volume / 100}
          />
          <SpeakingIndicator
            trackRef={agentTrack}
            onSpeakingChange={setAgentSpeaking}
          />
        </>
      )}
      {customerTrack && (
        <>
          <AudioTrack
            trackRef={customerTrack as unknown as TrackReference}
            volume={isMuted ? 0 : volume / 100}
          />
          <SpeakingIndicator
            trackRef={customerTrack}
            onSpeakingChange={setCustomerSpeaking}
          />
        </>
      )}
    </div>
  );
}
