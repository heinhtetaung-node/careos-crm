import useSnackbar from 'utils/snackbar';
import { LiveKitCallStatus, useLiveKitCall } from './LivekitRoomProvider';
import { getString } from 'presentation/theme/localization';
import { PhoneOutlineIcon } from '@alphafounders/icons';
import React from 'react';
import Controls from '../controls/Control';
import { PhoneInTalk } from '@material-ui/icons';
import Counter from './Counter';
import { CircularProgress } from '@material-ui/core';

export default function SimpleCallButton({
  agentName,
  leadName,
  phoneIndex,
}: {
  agentName: string;
  leadName: string;
  phoneIndex: number;
}) {
  const {
    ensureMicrophonePermission,
    initiateCall,
    dialPhoneNumber,
    endCall,
    liveKitCallStatus,
    callDuration,
  } = useLiveKitCall();

  const { showErrorSnackbar } = useSnackbar();

  const handleOnStartCall = async () => {
    try {
      const hasMicrophonePermission = await ensureMicrophonePermission();
      if (!hasMicrophonePermission) {
        showErrorSnackbar(getString('text.microphonePermissionDenied'));
        return;
      }
      const callName = await initiateCall(agentName);
      await dialPhoneNumber(callName, leadName, phoneIndex);
    } catch (error) {
      showErrorSnackbar(getString('text.callStartFailed'));
    }
  };

  const renderCallButton = (
    <button
      type="button"
      className="font-[Poppins] bg-white border border-solid border-[#00509880] text-[#005098] rounded-md px-4 py-2 flex items-center gap-2 cursor-pointer hover:border-primary hover:bg-[#eaeaea80] disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-r-gray-300 disabled:cursor-default"
      onClick={handleOnStartCall}
    >
      <PhoneOutlineIcon />
      <span className="text-sm font-bold">Call</span>
    </button>
  );

  const renderEndCallButton = (
    <Controls.Button
      className="py-1"
      variant="contained"
      color="secondary"
      startIcon={<PhoneInTalk />}
      onClick={endCall}
    >
      <div className="leading-[.4rem] flex flex-col gap-3">
        <div>{getString('text.hangUp')}</div>
        <Counter duration={callDuration || 0} />
      </div>
    </Controls.Button>
  );

  return (
    <div className="flex items-center group">
      {
        {
          [LiveKitCallStatus.AgentConnecting]: (
            <CircularProgress size={20} className="loading" />
          ),
          [LiveKitCallStatus.AgentConnected]: renderEndCallButton,
          [LiveKitCallStatus.DialingLead]: renderEndCallButton,
          [LiveKitCallStatus.Ringing]: renderEndCallButton,
          [LiveKitCallStatus.Active]: renderEndCallButton,
          [LiveKitCallStatus.Idle]: renderCallButton,
          [LiveKitCallStatus.Ended]: renderCallButton,
        }[liveKitCallStatus]
      }
    </div>
  );
}
