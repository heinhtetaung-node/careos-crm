import { Input, Button } from '@alphafounders/ui';
import { AddCircleIcon, TrashBinIcon } from '@alphafounders/icons';
import React from 'react';

import NumberInput from '../NumberInput';
import { OptionProps } from '../Select';

export const MAX_ALLOWED_INPUT_FIELDS = 4; // default limit of inputs
export const initialValues = { id: '', key: 0, value: '' };

export interface MultiInputFieldWithTypeProps {
  label: string;
  name: string;
  fixedLabel?: boolean;
  options: OptionProps[];
  //   Input Props
  style?: string;
  className?: string;
  dataTestid?: string;
  adornment?: unknown;
  generic?: boolean;
  limit?: number;
  value: Array<typeof initialValues> | [];
  onChange: any;
}

interface InputActionButtonsProps {
  index: number;
  inputs: (typeof initialValues)[];
  shouldShowAddBtn: boolean;
  handleAddInputs: () => void;
  handleRemoveInputs: (index: number) => void;
}

export function InputActionButtons({
  index,
  inputs,
  shouldShowAddBtn,
  handleAddInputs,
  handleRemoveInputs,
}: InputActionButtonsProps) {
  return (
    <div className="flex mt-2 ml-2 p-2 min-w-[80px]">
      {shouldShowAddBtn && (
        <Button
          dataTestId="add-input-btn"
          className="bg-transparent"
          text={<AddCircleIcon className="text-primary" />}
          onClick={handleAddInputs}
        />
      )}
      {inputs.length > 1 && (
        <Button
          dataTestId="remove-input-btn"
          className="bg-transparent"
          text={<TrashBinIcon className="fill-red-500" />}
          onClick={() => handleRemoveInputs(index)}
        />
      )}
    </div>
  );
}

// NOTE: currently it only supports number and text
export function InputAsPerType({ type, ...props }: any) {
  if (type === 'number') {
    return <NumberInput {...props} />;
  }
  return <Input {...props} />;
}
