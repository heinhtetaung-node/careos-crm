import { useConnectionState, useRoomContext } from '@livekit/components-react';
import useBeforeUnload from 'hooks/useBeforeUnload';
import { ConnectionState } from 'livekit-client';
import { setHasShowedSummary } from 'presentation/redux/actions/leads/detail';
import { showModal } from 'presentation/redux/actions/ui';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as CONSTANTS from 'shared/constants';
import useSnackbar from 'utils/snackbar';
import CallButton from '../CallButton';
import { CallButtonState } from '../CallButton/components/CallButtonGroup';
import usePhoneNumbers from '../CallButton/hooks/usePhoneNumbers';
import useAddPhone from '../modal/LeadDetailsModal/PhoneModal/useAddPhone';
import DeletePhoneModal, { PhoneToDelete } from './DeletePhoneModal';
import { LiveKitCallStatus, useLiveKitCall } from './LivekitRoomProvider';

export default function CallButtonLiveKit({
  customerId,
  onCallStart,
  onCallEnd,
}: {
  customerId: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}) {
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();
  const { phoneNumbers, primaryPhoneIndex } = usePhoneNumbers();
  const lead = useGetLeadSelector();
  const currentUser = useGetUserSelector();

  const {
    setPrimaryPhoneIndex,
    setPrimaryPhoneForCustomer,
    removePhoneFromLead,
    status,
  } = useAddPhone();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneToDelete | null>(
    null
  );

  const { isLoading: isRemovingPhone } = status;
  const room = useRoomContext();
  const connectionState = useConnectionState(room);

  useBeforeUnload(connectionState !== ConnectionState.Disconnected);

  const [buttonState, setButtonState] = useState<CallButtonState>(
    CallButtonState.ReadyToCall
  );
  const dispatch = useDispatch();

  const {
    ensureMicrophonePermission,
    initiateCall,
    dialPhoneNumber,
    endCall: originalEndCall,
    liveKitCallStatus,
    callDuration,
    hasCallStarted,
  } = useLiveKitCall();

  // Wrap endCall to set hasShowedSummary to true
  const handleEndCall = useCallback(async () => {
    setTimeout(() => {
      dispatch(setHasShowedSummary(true));
    }, 1000);
    await originalEndCall();
  }, [originalEndCall, dispatch]);

  const handleDeleteClick = useCallback((phone: string, phoneIndex: number) => {
    setPhoneToDelete({ phone, phoneIndex });
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!phoneToDelete) return;

    removePhoneFromLead(phoneToDelete.phone, () => {
      showSuccessSnackbar(getString('text.phoneRemoveSuccess'));
      setIsDeleteModalOpen(false);
      setPhoneToDelete(null);
    });
  }, [phoneToDelete, removePhoneFromLead, showSuccessSnackbar]);

  const handleCloseModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setPhoneToDelete(null);
  }, []);

  const handlePhoneSelect = useCallback(
    (phone: string, phoneIndex: number) => {
      setPrimaryPhoneForCustomer(encodeURIComponent(phone), customerId);
      setPrimaryPhoneIndex(phoneIndex);
    },
    [customerId, setPrimaryPhoneForCustomer, setPrimaryPhoneIndex]
  );

  const callState = useAppSelector(
    (state) => state.leadsDetailReducer?.callReducer?.data
  );
  const hasShowedSummary = callState?.hasShowedSummary ?? false;

  const handleStartCall = async (_phone: string, phoneIndex: number) => {
    try {
      // Step 1: Set hasShowedSummary to false if it's true
      if (hasShowedSummary) {
        setTimeout(() => {
          dispatch(setHasShowedSummary(false));
        }, 1000);
      }

      const hasMicrophonePermission = await ensureMicrophonePermission();

      if (!hasMicrophonePermission) {
        showErrorSnackbar(getString('text.microphonePermissionDenied'));
        return;
      }

      const callName = await initiateCall(currentUser.name);

      await dialPhoneNumber(callName, lead.name, phoneIndex);
      onCallStart?.();
    } catch (error: any) {
      showErrorSnackbar(getString('text.callStartFailed'));
      setButtonState(CallButtonState.ReadyToCall);
    }
  };

  useEffect(() => {
    if (connectionState === ConnectionState.Reconnecting) {
      setButtonState(CallButtonState.Reconnecting);
      return;
    }

    switch (liveKitCallStatus) {
      case LiveKitCallStatus.AgentConnecting:
        setButtonState(CallButtonState.Connecting);
        break;
      case LiveKitCallStatus.AgentConnected:
        setButtonState(CallButtonState.Connected);
        break;
      case LiveKitCallStatus.DialingLead:
      case LiveKitCallStatus.Ringing:
        setButtonState(CallButtonState.Ringing);
        break;
      case LiveKitCallStatus.Active:
        setButtonState(CallButtonState.InCall);
        break;
      case LiveKitCallStatus.Ended:
        setButtonState(CallButtonState.ReadyToCall);
        // Only show summary modal if call actually started (reached dialing stage)
        if (hasCallStarted && !hasShowedSummary) {
          if (onCallEnd) {
            onCallEnd();
          } else {
            dispatch(showModal(CONSTANTS.ModalConfig.leadSummaryCallModal));
          }
        }
        break;
      default:
        break;
    }
  }, [
    liveKitCallStatus,
    connectionState,
    hasCallStarted,
    hasShowedSummary,
    dispatch,
    onCallEnd,
  ]);

  return (
    <>
      <CallButton
        phoneNumbers={phoneNumbers}
        primaryPhoneIndex={primaryPhoneIndex}
        buttonState={buttonState}
        callDuration={callDuration}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        onPhoneSelect={handlePhoneSelect}
        onPhoneDelete={handleDeleteClick}
      />

      <DeletePhoneModal
        isOpen={isDeleteModalOpen}
        phoneToDelete={phoneToDelete}
        isRemovingPhone={isRemovingPhone}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
