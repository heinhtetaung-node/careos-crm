import { PenOutlineIcon } from '@alphafounders/icons';
import React, { useEffect, useState } from 'react';

import PackageTypeBadge from 'presentation/components/common/PackageTypeBadge';
import { OpenIcon } from 'presentation/components/icons';

import { isCharContain } from './helper';
import { Colon, EditButton, FieldInput, FieldItem } from './index.style';

export interface IInputTextPayload {
  name: string;
  value: string;
}

interface IRenderInputTextItem {
  valueText: string;
  isEditable?: boolean;
  disabled?: boolean;
  name?: string;
  handleOnEnter?: (payload: IInputTextPayload) => void;
  handleOnBlur?: (payload: IInputTextPayload) => void;
  className?: string;
  callBackEdit?: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShowHighlight?: (status: boolean) => void;
  isError?: boolean;
  error?: string;
  testId?: string;
  showEditArrow?: boolean;
  handleClickEditArrow?: () => void;
  packageTypeLabel?: string | null;
}

function RenderInputTextItem({
  valueText,
  isEditable = false,
  disabled = false,
  name = '',
  handleOnEnter = () => null,
  handleOnBlur = () => null,
  className = '',
  callBackEdit = () => null,
  onChange = () => null,
  setShowHighlight = () => null,
  isError = false,
  error = '',
  testId = '',
  showEditArrow = false,
  handleClickEditArrow = () => null,
  packageTypeLabel,
}: Readonly<IRenderInputTextItem>) {
  const [isEditText, setIsEditText] = useState(false);
  const [valueItem, setValueItem] = useState('');

  const makeTextEditable = () => {
    if (!isError) {
      setIsEditText(!isEditText);
      callBackEdit();
    }
  };

  const handleChangeValueItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValueItem(value);
    onChange(e);
  };

  useEffect(() => {
    if (!isCharContain(valueItem)) {
      setShowHighlight(true);
      return;
    }
    setShowHighlight(false);
  }, [valueItem, setShowHighlight]);

  useEffect(() => {
    if (valueText) {
      setValueItem(String(valueText).trim());
    }
  }, [valueText]);

  const onEnter = (ev: any) => {
    if (!isCharContain(valueItem)) return;
    if (ev.key === 'Enter') {
      ev.preventDefault();
      setValueItem((val) => String(val).trim());
      handleOnEnter({
        name,
        value: String(valueItem).trim(),
      });
      if (!isError) {
        setIsEditText(false);
      }
    }
  };

  const onBlur = () => {
    if (!isEditable || !isCharContain(valueItem)) {
      return;
    }
    setValueItem((val) => String(val).trim());
    handleOnBlur({
      name,
      value: String(valueItem).trim(),
    });
    setIsEditText(false);
  };

  const onClick = () => {
    if (!isEditable) return;
    setIsEditText(true);
  };

  return (
    <FieldItem data-testid="text-input-field">
      <Colon>: </Colon>
      <FieldInput
        name={name}
        value={valueItem}
        onChange={handleChangeValueItem}
        onKeyPress={onEnter}
        onBlur={onBlur}
        onClick={onClick}
        className={className}
        error={isError}
        helperText={error}
        InputProps={{
          readOnly: disabled || !isEditText,
          disableUnderline: true,
          disabled,
        }}
        data-testid={testId}
      />
      <PackageTypeBadge label={packageTypeLabel} />
      {isEditable && !showEditArrow && (
        <EditButton
          onClick={makeTextEditable}
          data-testid="text-input-field-edit"
        >
          <PenOutlineIcon fontSize="small" />
        </EditButton>
      )}
      {showEditArrow && (
        <OpenIcon
          className="cursor-pointer"
          fontSize="small"
          onClick={handleClickEditArrow}
        />
      )}
    </FieldItem>
  );
}

export default RenderInputTextItem;
