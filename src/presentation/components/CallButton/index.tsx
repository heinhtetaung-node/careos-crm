import React, { useState } from 'react';
import { PhoneNumber } from 'shared/types/customer';
import CallButtonGroup, { CallButtonState } from './components/CallButtonGroup';
import PhoneNumberDropdown from './components/PhoneNumberDropdown';

interface CallButtonProps {
  phoneNumbers: PhoneNumber[];
  primaryPhoneIndex: number;
  buttonState: CallButtonState;
  onStartCall: (phone: string, phoneIndex: number) => void;
  onEndCall: () => void;
  onPhoneSelect?: (phone: string, phoneIndex: number) => void;
  onPhoneDelete?: (phone: string, phoneIndex: number) => void;
  callDuration?: number;
}

export default function CallButton({
  phoneNumbers,
  primaryPhoneIndex,
  buttonState,
  onStartCall,
  onEndCall,
  onPhoneSelect,
  onPhoneDelete,
  callDuration,
}: CallButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if primaryPhoneIndex is valid (within bounds)
  const isValidIndex =
    primaryPhoneIndex >= 0 && primaryPhoneIndex < phoneNumbers.length;
  const selectedPhone = isValidIndex ? phoneNumbers[primaryPhoneIndex] : null;
  const phoneNumberToCall = selectedPhone?.phone ?? null;

  return (
    <div className="relative">
      <CallButtonGroup
        phoneNumberToCall={phoneNumberToCall}
        buttonState={buttonState}
        onStartCall={() => {
          if (selectedPhone) {
            onStartCall(selectedPhone.phone, primaryPhoneIndex);
          }
        }}
        onEndCall={onEndCall}
        onToggleDropdown={() => setIsDropdownOpen((prevOpen) => !prevOpen)}
        callDuration={callDuration}
      />

      <PhoneNumberDropdown
        isOpen={isDropdownOpen}
        phoneNumbers={phoneNumbers}
        selectedPhoneIndex={isValidIndex ? primaryPhoneIndex : -1}
        onClose={() => setIsDropdownOpen(false)}
        onPhoneSelect={(phone, phoneIndex) => {
          onPhoneSelect?.(phone, phoneIndex);
          setIsDropdownOpen(false);
        }}
        onPhoneDelete={(phone, phoneIndex) => {
          onPhoneDelete?.(phone, phoneIndex);
          setIsDropdownOpen(false);
        }}
      />
    </div>
  );
}
