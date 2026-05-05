import React, { useImperativeHandle } from 'react';
import useCareosCall, { CallState } from 'presentation/hooks/useCareosCall';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';
import PhoneButton from './PhoneButton';

interface CallButtonProps {
  customerId?: string;
  disabled?: boolean;
  onCallTimerTick?: (val: number) => void;
  onCallEnd?: () => void;
  onCallPickUp?: () => void;
  onCallStart?: () => void;
}
const CallButton = React.forwardRef(
  (
    {
      customerId,
      disabled,
      onCallTimerTick,
      onCallEnd,
      onCallPickUp,
      onCallStart,
    }: CallButtonProps,
    ref: React.ForwardedRef<{ status: CallState }>
  ) => {
    const { showSuccessSnackbar } = useSnackbar();
    const { status, startCall, endCall } = useCareosCall({
      onStatusChange: (callStatus) => {
        if (callStatus === 'ringing') {
          onCallStart?.();
        } else if (callStatus === 'incall') {
          showSuccessSnackbar(getString('text.customerPickUpCall'));
          onCallPickUp?.();
        } else if (callStatus === 'ended') {
          onCallEnd?.();
        }
      },
    });
    useImperativeHandle(ref, () => ({ status }), [status]);
    return (
      <PhoneButton
        customerId={customerId}
        disabled={disabled}
        startCall={startCall}
        endCall={endCall}
        callState={status}
        onCallTimerTick={onCallTimerTick}
      />
    );
  }
);
export default CallButton;
