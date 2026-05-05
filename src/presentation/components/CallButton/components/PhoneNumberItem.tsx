import { TrashIcon } from '@alphafounders/icons';
import React from 'react';
import { maskPhoneNumber } from 'shared/helper/utilities';
import { PhoneNumber } from 'shared/types/customer';

interface PhoneNumberItemProps {
  phone: string;
  status: PhoneNumber['status'];
  phoneIndex: number;
  isSelected: boolean;
  onSelect: (phone: string, phoneIndex: number) => void;
  onDelete?: (phone: string, phoneIndex: number) => void;
}

export default function PhoneNumberItem({
  phone,
  status,
  phoneIndex,
  isSelected,
  onSelect,
  onDelete,
}: PhoneNumberItemProps) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.(phone, phoneIndex);
  };

  return (
    <label
      className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-[#005098] hover:bg-[#eaeaea80] cursor-pointer"
      htmlFor={`phone-${phoneIndex}`}
    >
      <div className="flex items-center gap-2 w-full cursor-pointer">
        <input
          id={`phone-${phoneIndex}`}
          type="radio"
          name="phone"
          className="accent-primary"
          checked={isSelected}
          onChange={() => onSelect(phone, phoneIndex)}
        />
        <span className="font-bold">{maskPhoneNumber(phone)}</span>
        <span className="text-xs rounded-full px-2 py-0.5 bg-primary text-white">
          {status}
        </span>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="bg-gray-100 rounded-lg flex justify-center items-center px-2 py-1 cursor-pointer text-red-500 hover:text-red-700 hover:bg-white border-none"
        >
          <TrashIcon color="red" className="text-inherit" fontSize="small" />
        </button>
      )}
    </label>
  );
}
