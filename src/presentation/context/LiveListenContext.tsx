import { RoomContext, useTracks } from '@livekit/components-react';
import {
  useAddAgentToCallMutation,
  useLazyGetJoinTokenQuery,
} from 'data/slices/callSlice/callSlice';
import { useLazyGetLeadByIDQuery } from 'data/slices/leadSlice';
import { Room, RoomEvent, Track } from 'livekit-client';
import LiveListenModal from 'presentation/pages/admin/PerformanceStatistic/components/LiveListenModal';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useSnackbar from 'utils/snackbar';

interface LiveListenContextType {
  handleLiveListen: (
    activeCallId: string,
    agentName: string,
    leadId: string,
    callDuration: string
  ) => void;
  isLiveListenActive: boolean;
}
const LiveListenContext = createContext<LiveListenContextType | undefined>(
  undefined
);
export const useLiveListen = () => {
  const context = useContext(LiveListenContext);
  if (!context)
    throw new Error('useLiveListen must be used within a LiveListenProvider');
  return context;
};
export const LiveListenProvider = ({ children }: { children: ReactNode }) => {
  const [openPopupAudioRender, setOpenPopupAudioRender] = useState(false);
  const [currentAgentName, setCurrentAgentName] = useState<string>('');
  const [currentLeadId, setCurrentLeadId] = useState<string>('');
  const [currentCallDuration, setCurrentCallDuration] =
    useState<string>('00:00');
  const [openLeadName, setOpenLeadName] = useState('');
  const isSwitchingCallRef = useRef(false);
  const openPopupAudioRenderRef = useRef(false);
  const handleCloseRef = useRef<() => void>();
  const { showErrorSnackbar } = useSnackbar();
  const room = useMemo(() => new Room(), []);
  const audioTracks = useTracks([Track.Source.Microphone], { room });
  useEffect(() => {
    openPopupAudioRenderRef.current = openPopupAudioRender;
  }, [openPopupAudioRender]);
  useEffect(() => {
    const handleDisconnected = () => {
      if (isSwitchingCallRef.current) return;
      setOpenPopupAudioRender(false);
    };
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room?.disconnect?.();
    };
  }, [room]);
  const [addAgentToCall] = useAddAgentToCallMutation();
  const [getJoinToken] = useLazyGetJoinTokenQuery();
  const [fetchLeadById] = useLazyGetLeadByIDQuery();
  const loginUserId = useGetUserSelector()?.name;
  const joinCall = useCallback(
    async (agentName: string, callName: string) => {
      try {
        if (room.state === 'connected') await room.disconnect();
        const agentResult = await addAgentToCall({ callName, agentName });
        if (!agentResult.data?.name)
          throw new Error('Failed to add agent to call');
        const tokenResult = await getJoinToken(agentResult.data.name);
        const { sfuUrl, token } = tokenResult?.data ?? {};
        if (!(sfuUrl && token)) throw new Error('Failed to get join token');
        await room.connect(sfuUrl, token);
      } catch (_error) {
        showErrorSnackbar('Failed to connect to call room');
      }
    },
    [room, addAgentToCall, getJoinToken, showErrorSnackbar]
  );
  const handleClose = useCallback(() => {
    setOpenPopupAudioRender(false);
    openPopupAudioRenderRef.current = false;
    room.disconnect();
  }, [room]);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);
  const handleLiveListen = useCallback(
    (
      activeCallId: string,
      agentName: string,
      leadId: string,
      callDuration: string
    ) => {
      if (activeCallId) {
        const hasActiveSession =
          room.state === 'connected' || openPopupAudioRenderRef.current;
        if (hasActiveSession && !isSwitchingCallRef.current) {
          isSwitchingCallRef.current = true;
          if (handleCloseRef.current) handleCloseRef.current();
          const waitForDisconnect = (): Promise<void> => {
            if (room.state !== 'connected') return Promise.resolve();
            return new Promise((resolve) => {
              const handleDisconnected = () => {
                room.off(RoomEvent.Disconnected, handleDisconnected);
                resolve();
              };
              room.on(RoomEvent.Disconnected, handleDisconnected);
            });
          };
          waitForDisconnect().then(() => {
            isSwitchingCallRef.current = false;
            handleLiveListen(activeCallId, agentName, leadId, callDuration);
          });
          return;
        }
        isSwitchingCallRef.current = false;
        joinCall(loginUserId, activeCallId);
        fetchLeadById(leadId.replace('leads/', ''))
          .unwrap()
          .then((leadDetails) => {
            setOpenLeadName(
              `${leadDetails.data.customerFirstName} ${leadDetails.data.customerLastName}`
            );
            setCurrentLeadId(leadDetails.humanId);
          })
          .catch((_error) => {
            showErrorSnackbar('Failed to fetch lead details');
            setOpenLeadName('');
          });
        setCurrentAgentName(agentName);
        setCurrentCallDuration(callDuration);
        setOpenPopupAudioRender(true);
      }
    },
    [loginUserId, joinCall, fetchLeadById, room, showErrorSnackbar]
  );
  return (
    <LiveListenContext.Provider
      value={{
        handleLiveListen,
        isLiveListenActive: openPopupAudioRender,
      }}
    >
      {children}
      {openPopupAudioRender && (
        <RoomContext.Provider value={room}>
          <LiveListenModal
            agentName={currentAgentName}
            customerName={openLeadName}
            leadId={currentLeadId}
            callDuration={currentCallDuration}
            onClose={handleClose}
            audioTracks={audioTracks}
          />
        </RoomContext.Provider>
      )}
    </LiveListenContext.Provider>
  );
};
