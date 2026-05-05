import { PenOutlineIcon } from '@alphafounders/icons';
import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { isValidLicense } from 'presentation/components/VehiclePolicySection/helper';
import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';

import { isCharContain } from './helper';
import {
  LeftLicensePlateInput,
  RightLicensePlateInput,
  LicenseFieldItem,
  UnitLicensePlate,
  EditButton,
} from './index.style';

function RenderInputLicensePlate({
  licenseNo,
  name = '',
  handleOnEnter = () => null,
  handleOnBlur = () => null,
  setShowHighlight = () => null,
  registeredProvince = undefined,
  isEditable,
  disabled,
}: any) {
  const [isEditText, setIsEditText] = useState(false);
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [abbr, setAbbr] = React.useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (registeredProvince) {
      const province = provinceAbbreviationCollection().find(
        (p) => p.oic === registeredProvince
      );
      setAbbr(province?.abbreviation || '');
    }
  }, [registeredProvince]);

  useEffect(() => {
    if (licenseNo) {
      const licenseStr = licenseNo?.split(' ')[0] || '';
      setLeftInput(licenseStr.split('-')[0] || '');
      setRightInput(licenseStr.split('-')[1] || '');
    }
  }, [licenseNo]);

  useEffect(() => {
    if (
      !disabled &&
      (!isCharContain(rightInput) || !isCharContain(leftInput))
    ) {
      setShowHighlight(true);
      return;
    }
    setShowHighlight(false);
  }, [rightInput, leftInput, setShowHighlight, disabled]);

  const makeTextEditable = () => {
    setIsEditText(!isEditText);
  };

  useEffect(() => {
    if (!isEditable) {
      setIsEditText(false);
    }
  }, [isEditable]);

  const handleChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: string
  ) => {
    const { value } = e.target;
    setError(false);
    if (type === 'left') {
      setLeftInput(value);
    } else {
      setRightInput(value);
    }
  };

  const onEnter = (ev: any) => {
    if (!isCharContain(rightInput) || !isCharContain(leftInput)) {
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (
        leftInput.length &&
        rightInput.length &&
        isValidLicense(`${leftInput}-${rightInput} ${abbr}`)
      ) {
        handleOnEnter({
          name,
          value: `${leftInput}-${rightInput} ${abbr}`,
        });
        setIsEditText(false);
      } else {
        setError(true);
      }
    }
  };

  const onBlur = () => {
    if (!isCharContain(rightInput) || !isCharContain(leftInput)) {
      return;
    }
    if (isEditText) {
      if (
        leftInput.length &&
        rightInput.length &&
        isValidLicense(`${leftInput}-${rightInput} ${abbr}`)
      ) {
        handleOnBlur({
          name,
          value: `${leftInput}-${rightInput} ${abbr}`,
        });
        setIsEditText(false);
      } else {
        setError(true);
      }
    }
  };

  const handleClick = () => {
    if (!isEditable) return;
    setIsEditText(true);
  };

  return (
    <LicenseFieldItem data-testid="license-input">
      <span>: </span>
      <span>
        <LeftLicensePlateInput
          readOnly={!isEditText}
          onChange={(event) => {
            handleChangeInput(event, 'left');
          }}
          value={leftInput}
          onKeyPress={onEnter}
          onBlur={onBlur}
          onClick={handleClick}
          data-testid="license-input-left"
        />
        <span> - </span>
        <RightLicensePlateInput
          readOnly={!isEditText}
          onChange={(event) => {
            handleChangeInput(event, 'right');
          }}
          value={rightInput}
          onKeyPress={onEnter}
          onBlur={onBlur}
          onClick={handleClick}
          data-testid="license-input-right"
        />
        {error ? (
          <Typography variant="caption" color="error">
            {!leftInput.length || !rightInput.length
              ? 'Please enter a value for license plate'
              : 'Please enter a valid value'}
          </Typography>
        ) : null}
      </span>
      <UnitLicensePlate>{abbr}</UnitLicensePlate>
      {isEditable && (
        <EditButton className="absolute right-0" onClick={makeTextEditable}>
          <PenOutlineIcon fontSize="small" data-testid="license-edit" />
        </EditButton>
      )}
    </LicenseFieldItem>
  );
}

export default RenderInputLicensePlate;
