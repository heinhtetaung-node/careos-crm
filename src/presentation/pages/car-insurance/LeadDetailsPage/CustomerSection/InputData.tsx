import { PenOutlineIcon } from '@alphafounders/icons';
import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import {
  Colon,
  EditButton,
  FieldInput,
  FieldItem,
} from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/index.style';
import { getString } from 'presentation/theme/localization';

import { onKeyPress } from './helper';

const useStyles = makeStyles((theme) => ({
  edit: {
    paddingTop: '3px !important',
    border: theme.outline.primary.border1,
    borderRadius: '6px',
    boxSizing: 'border-box',
    padding: '3px 8px',
    height: '26px',
    minWidth: '55px',
    marginLeft: '5px',
    '&:hover': {
      transition: '0.2s',
      border: theme.outline.sencondary.border1,
      boxShadow: '0 7px 15px 0 rgb(42 49 203 / 10%)',
    },
  },
}));

export interface IInputTextPayload {
  name: string;
  value: string;
}

interface IRenderInputTextItem {
  valueText: string;
  isEditable?: boolean;
  name?: string;
  isNumeric?: boolean;
  className?: string;
  isError?: boolean;
  isDisabled?: boolean;
  error?: string;
  maxLength?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnBlur: (value: string, path: string) => void;
  handleOnEnter: (value: string, path: string) => void;
  callBackEdit?: () => void;
  callBackHasError?: () => void;
  callBackErrorMessage?: () => void;
}

function InputData({
  valueText,
  isEditable = false,
  name = '',
  className = '',
  isError = false,
  error = '',
  maxLength = Infinity,
  isNumeric = false,
  isDisabled = false,
  handleOnBlur,
  handleOnEnter,
  onChange = () => null,
  callBackEdit = () => null,
  callBackHasError = () => null,
  callBackErrorMessage = () => null,
}: IRenderInputTextItem) {
  const classes = useStyles();
  const [isEditText, setIsEditText] = useState(false);
  const [valueItem, setValueItem] = useState<Record<string, string>>({});
  const [hasError, setHasError] = useState(isError);
  const [errorMessage, setErrorMessage] = useState(error);
  const makeTextEditable = () => {
    setIsEditText(!isEditText);
    callBackEdit();
  };

  useEffect(() => {
    setValueItem({
      [name]: valueText,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueText]);

  const handleChangeValueItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    let _isError = false;
    let _errorMessage = '';
    setValueItem({
      [e.target.name]: newValue,
    });

    const ValidateFields = [
      'customerFirstName',
      'customerLastName',
      'policyHolderFirstName',
      'policyHolderLastName',
    ];
    const freeTextFields = [
      'companyName',
      'customerPolicyAddress/0/companyName',
    ];

    // @TODO: Refactor this custom validation, use Yup schema assign rule to each field instead
    if (ValidateFields.includes(name)) {
      // Allow English, Thai characters and spaces
      if (!newValue.match(/^[A-Za-z\u0E00-\u0E7F ]+$/g)) {
        _isError = true;
        _errorMessage = getString('errors.invalidData');
      }
      if (newValue.length > maxLength) {
        _isError = true;
        _errorMessage = getString('errors.exceedCharacters', { maxLength });
      }
    } else if (!freeTextFields.includes(name)) {
      if (!newValue.match(/^[0-9A-Za-z\u0E00-\u0E7F-]+$/g)) {
        _isError = true;
        _errorMessage =
          name === 'policyHolderNationalId'
            ? getString('errors.invalidID')
            : getString('errors.invalidData');
      }
    }

    setHasError(_isError);
    setErrorMessage(_errorMessage);
    callBackHasError();
    callBackErrorMessage();
    onChange(e);
  };

  const onBlur = () => {
    if (!isEditText || hasError) return;
    handleOnBlur(valueItem?.[name], `/${name}`);
    setIsEditText(false);
  };

  const onEnter = (ev: any) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (!hasError) {
        handleOnEnter(valueItem?.[name], `/${name}`);
        setIsEditText(false);
      } else {
        setHasError(true);
      }
    }
  };

  const handleOnKeyPress = (event: React.KeyboardEvent) => {
    onEnter(event);
    return onKeyPress(event, isNumeric);
  };

  return (
    <FieldItem>
      <Colon>: </Colon>
      <FieldInput
        name={name}
        value={valueItem[name]}
        onChange={handleChangeValueItem}
        className={className}
        error={hasError}
        helperText={errorMessage}
        inputProps={{
          readOnly: !isEditText,
          className: isEditText ? classes.edit : '',
        }}
        onKeyPress={handleOnKeyPress}
        onBlur={onBlur}
        data-testid={`text-input-${name}`}
      />
      {isEditable && (
        <EditButton
          disabled={isDisabled}
          onClick={makeTextEditable}
          data-testid="edit-button"
        >
          <PenOutlineIcon fontSize="small" />
        </EditButton>
      )}
    </FieldItem>
  );
}

export default InputData;
