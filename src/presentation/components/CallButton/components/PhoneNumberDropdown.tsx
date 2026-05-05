import React from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { PhoneNumber } from 'shared/types/customer';
import PhoneNumberItem from './PhoneNumberItem';

interface PhoneNumberDropdownProps {
  phoneNumbers: PhoneNumber[];
  selectedPhoneIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPhoneSelect: (phone: string, phoneIndex: number) => void;
  onPhoneDelete?: (phone: string, phoneIndex: number) => void;
}

export default function PhoneNumberDropdown({
  phoneNumbers,
  selectedPhoneIndex,
  isOpen,
  onClose,
  onPhoneSelect,
  onPhoneDelete,
}: PhoneNumberDropdownProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div className="absolute top-full left-0 mt-1 bg-white border border-solid border-[#00509880] rounded-md shadow-lg z-10 min-w-[200px]">
        <div className="py-1">
          {phoneNumbers.map((item, index) => (
            <PhoneNumberItem
              key={`${item.phone}-${index}`}
              phone={item.phone}
              status={item.status}
              phoneIndex={index}
              isSelected={index === selectedPhoneIndex}
              onSelect={onPhoneSelect}
              onDelete={onPhoneDelete}
            />
          ))}
        </div>
      </div>
    </ClickAwayListener>
  );
}
