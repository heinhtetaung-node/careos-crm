import { useNewRelic } from '@careos/newrelic';
import { DenoiseTrackProcessor } from '@cc-livekit/denoise-plugin';
import { AudioTrack, RoomContext, useTracks } from '@livekit/components-react';
import FeatureFlags from 'config/flagsmithConfig';
import {
  useAddAgentToCallMutation,
  useAddLeadToCallMutation,
  useCreateCallMutation,
  useLazyGetJoinTokenQuery,
} from 'data/slices/callSlice/callSlice';
import { useFlags } from 'flagsmith/react';
import {
  ConnectionState,
  DisconnectReason,
  LocalAudioTrack,
  LogLevel,
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
  setLogLevel,
} from 'livekit-client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStopwatch } from 'react-timer-hook';

enum CallStatusAttribute {
  Dialing = 'dialing',
  Ringing = 'ringing',
  Automation = 'automation',
  Active = 'active',
  Hangup = 'hangup',
}

export enum LiveKitCallStatus {
  Idle = 'idle',
  AgentConnecting = 'agentConnecting',
  AgentConnected = 'agentConnected',
  DialingLead = 'dialingLead',
  Ringing = 'ringing',
  Active = 'active',
  Ended = 'ended',
}

interface LiveKitCallContextValue {
  liveKitCallStatus: LiveKitCallStatus;
  callDuration: number;
  hasCallStarted: boolean;
  ensureMicrophonePermission: () => Promise<boolean>;
  initiateCall: (agentName: string) => Promise<string>;
  dialPhoneNumber: (
    callName: string,
    leadName: string,
    phoneIndex: number
  ) => Promise<string>;
  endCall: () => Promise<void>;
}

const LiveKitCallContext = createContext<LiveKitCallContextValue | null>(null);

export function useLiveKitCall() {
  const context = useContext(LiveKitCallContext);
  if (!context) {
    throw new Error('useLiveKitCall must be used within LivekitRoomProvider');
  }
  return context;
}

function RoomManager() {
  const audioTracks = useTracks([Track.Source.Microphone]);

  return (
    <>
      {/* Handle audio tracks */}
      {audioTracks
        .filter((track) => !track.participant.isLocal)
        .map((trackRef) => (
          <AudioTrack
            key={trackRef.participant.sid}
            trackRef={trackRef}
            volume={1}
            muted={false}
          />
        ))}
    </>
  );
}

export default function LivekitRoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nrAgent } = useNewRelic();
  const [liveKitCallStatus, setLiveKitCallStatus] = useState(
    LiveKitCallStatus.Idle
  );
  const [hasCallStarted, setHasCallStarted] = useState(false);
  const { totalSeconds, start, reset } = useStopwatch({ autoStart: false });

  const [createCall] = useCreateCallMutation();
  const [addAgentToCall] = useAddAgentToCallMutation();
  const [addLeadToCall] = useAddLeadToCallMutation();
  const [getJoinToken] = useLazyGetJoinTokenQuery();

  const featureFlags = useFlags([
    FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL,
    FeatureFlags.BROK_5436_ENABLE_LIVEKIT_FRONTEND_LOGLEVEL,
  ]);
  const defaultNoiseSuppression =
    featureFlags[
      FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL
    ]?.enabled ?? false;

  const enableCustomLogLevel =
    featureFlags[FeatureFlags.BROK_5436_ENABLE_LIVEKIT_FRONTEND_LOGLEVEL]
      ?.enabled ?? false;

  const logLevelLivekit = enableCustomLogLevel
    ? featureFlags[FeatureFlags.BROK_5436_ENABLE_LIVEKIT_FRONTEND_LOGLEVEL]
        ?.value
    : LogLevel.info;

  const denoiseProcessor = useMemo(() => new DenoiseTrackProcessor(), []);

  useEffect(() => {
    (window as any).denoise = {
      setEnabled: (enabled: boolean) => denoiseProcessor.setEnabled(enabled),
    };
  }, [denoiseProcessor]);

  useEffect(() => {
    setLogLevel(logLevelLivekit as LogLevel);
  }, [logLevelLivekit]);

  const room = useMemo(
    () =>
      new Room({
        adaptiveStream: true,
        audioOutput: {
          deviceId: 'default',
        },
        disconnectOnPageLeave: false,
      }),
    []
  );

  const ensureMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // First check if permission is already granted
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        if (permission.state === 'granted') {
          return true;
        }
      }

      // Request microphone permission by attempting to access the microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Stop the stream immediately as we only needed it to request permission
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error) {
      console.error('Microphone permission denied or error:', error);
      return false;
    }
  }, []);

  // Create call and connect to livekit room
  // Returns callName
  const initiateCall = useCallback(
    async (agentName: string): Promise<string> => {
      let callName: string | undefined;
      let sfuUrl: string | undefined;
      let token: string | undefined;

      // Reset hasCallStarted for new call attempt
      setHasCallStarted(false);

      // update call status for the consumer
      setLiveKitCallStatus(LiveKitCallStatus.AgentConnecting);

      try {
        // step 1: create call
        ({ name: callName } = await createCall().unwrap());

        // step 2: add agent to call
        const { name: agentParticipantName } = await addAgentToCall({
          callName,
          agentName,
        }).unwrap();

        // step 3: get join token
        ({ sfuUrl, token } = await getJoinToken(agentParticipantName).unwrap());

        nrAgent.addPageAction('LIVEKIT_INITIATE_CALL', { agentName, callName });
      } catch (error) {
        console.error('Failed to initiate call', error);
        setLiveKitCallStatus(LiveKitCallStatus.Ended);

        nrAgent.noticeError('Failed to initiate call', {
          callName: callName ?? '',
          error: JSON.stringify(error),
        });
        throw new Error('Failed to initiate call', { cause: error });
      }

      try {
        // step 4: connect to room
        await room.connect(sfuUrl, token);
        await room.localParticipant.setMicrophoneEnabled(true);

        nrAgent.addPageAction('LIVEKIT_CONNECT_TO_ROOM', {
          agentName,
          callName,
        });

        // update call status for the consumer
        setLiveKitCallStatus(LiveKitCallStatus.AgentConnected);
      } catch (error) {
        console.error('Failed to connect to livekit room', error);
        setLiveKitCallStatus(LiveKitCallStatus.Ended);

        nrAgent.noticeError('Failed to connect to livekit room', {
          callName,
          error: JSON.stringify(error),
        });
        throw new Error('Failed to connect to livekit room', { cause: error });
      }

      return callName;
    },
    [createCall, addAgentToCall, getJoinToken, room, nrAgent]
  );

  // Only after agent successfully joins the room, add lead to call
  // return leadParticipantName
  const dialPhoneNumber = useCallback(
    async (
      callName: string,
      leadName: string,
      phoneIndex: number
    ): Promise<string> => {
      setLiveKitCallStatus(LiveKitCallStatus.DialingLead);

      try {
        const { name: leadParticipantName } = await addLeadToCall({
          callName,
          leadName,
          phoneIndex,
        }).unwrap();

        // Mark call as started only after lead is successfully added to call
        setHasCallStarted(true);

        nrAgent.addPageAction('LIVEKIT_DIAL_PHONE_NUMBER', {
          callName,
          leadName,
          phoneIndex,
        });

        return leadParticipantName;
      } catch (error) {
        console.error('Failed to add lead to call', error);

        setLiveKitCallStatus(LiveKitCallStatus.Ended);

        nrAgent.noticeError('Failed to add lead to call', {
          callName,
          leadName,
          phoneIndex,
          error: JSON.stringify(error),
        });
        throw new Error('Failed to add lead to call', { cause: error });
      }
    },
    [addLeadToCall, nrAgent]
  );

  const endCall = useCallback(async (): Promise<void> => {
    setLiveKitCallStatus(LiveKitCallStatus.Ended);
    await room.disconnect();
  }, [room]);

  // Manage call duration timer based on call status
  useEffect(() => {
    // Start the timer when call becomes active
    if (liveKitCallStatus === LiveKitCallStatus.Active) {
      start();
    }

    // Reset duration when call ends (hasCallStarted is reset at start of next call)
    if (liveKitCallStatus === LiveKitCallStatus.Ended) {
      reset(undefined, false);
    }
  }, [liveKitCallStatus, start, reset]);

  useEffect(() => {
    room.on(RoomEvent.ParticipantAttributesChanged, (attributes) => {
      if (attributes['sip.callStatus']) {
        if (attributes['sip.callStatus'] === CallStatusAttribute.Active) {
          setLiveKitCallStatus(LiveKitCallStatus.Active);
        }
        if (attributes['sip.callStatus'] === CallStatusAttribute.Ringing) {
          setLiveKitCallStatus(LiveKitCallStatus.Ringing);
        }
        if (attributes['sip.callStatus'] === CallStatusAttribute.Hangup) {
          setLiveKitCallStatus(LiveKitCallStatus.Ended);
        }
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log('connectionStateChanged', state);
      if (state === ConnectionState.Disconnected) {
        setLiveKitCallStatus(LiveKitCallStatus.Ended);
      }
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('participantConnected', participant.name, participant);
      nrAgent.addPageAction('LIVEKIT_PARTICIPANT_CONNECTED', {
        roomID: room.name,
        identity: participant.identity,
        sipCallID: participant.attributes['sip.callID'],
        agentName: participant.attributes.user,
      });
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('participantDisconnected', participant.name, participant);
      nrAgent.addPageAction('LIVEKIT_PARTICIPANT_DISCONNECTED', {
        roomID: room.name,
        identity: participant.identity,
        sipCallID: participant.attributes['sip.callID'],
        agentName: participant.attributes.user,
      });
    });

    room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
      nrAgent.addPageAction('LIVEKIT_CONNECTION_QUALITY_CHANGED', {
        roomID: room.name,
        quality,
        identity: participant.identity,
        sipCallID: participant.attributes['sip.callID'],
        agentName: participant.attributes.user,
      });
    });

    room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
      // If the user does not intentionally disconnect the call, add a page action
      if (reason !== DisconnectReason.CLIENT_INITIATED) {
        nrAgent.addPageAction('LIVEKIT_DISCONNECTED', {
          roomID: room.name,
          reason: DisconnectReason[reason || DisconnectReason.UNKNOWN_REASON],
        });
      }
    });

    room.on(
      RoomEvent.TrackSubscriptionFailed,
      (trackSid: string, remoteParticipant: RemoteParticipant) => {
        nrAgent.addPageAction('LIVEKIT_TRACK_SUBSCRIPTION_FAILED', {
          roomID: room.name,
          trackSid,
          identity: remoteParticipant.identity,
          sipCallID: remoteParticipant.attributes['sip.callID'],
        });
      }
    );

    room.on(RoomEvent.MediaDevicesError, (error, kind) => {
      nrAgent.addPageAction('LIVEKIT_MEDIA_DEVICES_ERROR', {
        roomID: room.name,
        error: error.message,
        kind: kind || '',
      });
    });

    room.on(RoomEvent.Reconnecting, () => {
      nrAgent.addPageAction('LIVEKIT_RECONNECTING', { roomID: room.name });
    });

    room.on(RoomEvent.Reconnected, () => {
      nrAgent.addPageAction('LIVEKIT_RECONNECTED', { roomID: room.name });
    });

    room.on(RoomEvent.LocalTrackPublished, async (trackPublication) => {
      if (
        defaultNoiseSuppression &&
        trackPublication.source === Track.Source.Microphone &&
        trackPublication.track instanceof LocalAudioTrack
      ) {
        await trackPublication.track.setProcessor(denoiseProcessor);
      }
    });

    const cleanup = () => room.disconnect();

    window.addEventListener('unload', cleanup);

    return () => {
      window.removeEventListener('unload', cleanup);
      room.removeAllListeners();
    };
  }, [room, defaultNoiseSuppression, denoiseProcessor, nrAgent]);

  return (
    <RoomContext.Provider value={room}>
      <LiveKitCallContext.Provider
        value={{
          liveKitCallStatus,
          callDuration: totalSeconds,
          hasCallStarted,
          ensureMicrophonePermission,
          initiateCall,
          dialPhoneNumber,
          endCall,
        }}
      >
        <RoomManager />
        {children}
      </LiveKitCallContext.Provider>
    </RoomContext.Provider>
  );
}
