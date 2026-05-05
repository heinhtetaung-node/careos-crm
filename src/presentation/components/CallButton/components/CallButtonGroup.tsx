import { PhoneOutlineIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import { PhoneInTalk } from '@material-ui/icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Counter from 'presentation/components/CallButtonLiveKit/Counter';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import React from 'react';
import { maskPhoneNumber } from 'shared/helper/utilities';

export enum CallButtonState {
  ReadyToCall = 'readyToCall',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Ringing = 'ringing',
  InCall = 'inCall',
}

interface CallButtonGroupProps {
  phoneNumberToCall?: string | null;
  buttonState: CallButtonState;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleDropdown: () => void;
  callDuration?: number;
}

export default function CallButtonGroup({
  phoneNumberToCall,
  buttonState,
  onStartCall,
  onEndCall,
  onToggleDropdown,
  callDuration,
}: CallButtonGroupProps) {
  const isConnecting = buttonState === CallButtonState.Connecting;

  if (
    buttonState === CallButtonState.ReadyToCall ||
    buttonState === CallButtonState.Connecting
  ) {
    const hasPhoneNumber = !!phoneNumberToCall;
    return (
      <div className="flex items-center group">
        <button
          type="button"
          className="font-[Poppins] bg-white border border-solid border-[#00509880] text-[#005098] rounded-l-md px-4 py-2 flex items-center gap-2 cursor-pointer hover:border-primary hover:bg-[#eaeaea80] group-hover:border-r-primary disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-r-gray-300 disabled:group-hover:border-r-gray-300 disabled:cursor-default"
          onClick={onStartCall}
          disabled={isConnecting || !hasPhoneNumber}
        >
          {isConnecting ? (
            <CircularProgress size={24} className="loading" />
          ) : (
            <PhoneOutlineIcon />
          )}

          {hasPhoneNumber ? (
            <>
              <span className="text-sm font-bold">Call</span>
              <span className="text-sm font-bold">
                {maskPhoneNumber(phoneNumberToCall)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">
              {getString('text.pleaseSelect')}
            </span>
          )}
        </button>

        <button
          type="button"
          className="bg-white border border-solid border-[#00509880] border-l-0 text-[#005098] rounded-r-md px-2 py-2 flex items-center cursor-pointer hover:border-primary hover:bg-[#eaeaea80] disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-default"
          onClick={onToggleDropdown}
          disabled={isConnecting}
        >
          <ArrowDropDownIcon />
        </button>
      </div>
    );
  }
  if (
    buttonState === CallButtonState.Connected ||
    buttonState === CallButtonState.Ringing ||
    buttonState === CallButtonState.InCall ||
    buttonState === CallButtonState.Reconnecting
  ) {
    return (
      <Controls.Button
        className="py-1"
        variant="contained"
        color="secondary"
        startIcon={<PhoneInTalk />}
        onClick={onEndCall}
      >
        <div className="leading-[.4rem] flex flex-col gap-3">
          <div>{getString('text.hangUp')}</div>
          <Counter duration={callDuration || 0} />
        </div>
      </Controls.Button>
    );
  }
}
