import { withStyles, alpha } from '@material-ui/core/styles';
import MuiTextField from '@material-ui/core/TextField';
import React, { useState, useEffect } from 'react';

import { getString } from 'presentation/theme/localization';
import { EditButton } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/index.style';

import InputContainer from '../InputContainer';
import { PenOutlineIcon } from '@alphafounders/icons';

export interface DetailViewTextFieldProps {
  name: string;
  title: string;
  dataTestId?: string;
  error?: string;
  textFieldError?: boolean;
  value?: any;
  placeholder?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  showAsterisk?: boolean;
  input?: any;
  hidden?: boolean;
  handleInputChange?: (payload: any) => void;
  handleUpdate?: (payload: any) => void;
  setFormikValue?: (payload: any) => void;
  validationFn?: (value: string) => string;
  showPenIcon?: boolean;
}

export const TextField = withStyles((theme) => ({
  root: {
    '& .MuiInputBase-multiline': {
      padding: 0,
    },
    '& .MuiInputBase-input': {
      height: '18px',
      padding: 10,
      lineHeight: '20px',
      caretColor: theme.palette.warning.main,
      borderBottom: '2px solid transparent',
      '&::placeholder': {
        color: theme.palette.text.secondary,
      },
    },
    '& .Mui-focused': {
      background: `linear-gradient(0deg, ${alpha(
        theme.palette.grey[100],
        0.25
      )}, ${alpha(theme.palette.grey[100], 0.25)}), ${
        theme.palette.common.white
      }`,
      '& .textfield-input': {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      },
    },
    '& .Mui-disabled': {
      color: theme.palette.text.primary,
      '&.purchases': {
        color: '#9ca3af',
      },
    },
  },
}))(MuiTextField);

export function normalizedText(raw: string) {
  return String(raw)
    .replace(/(^\s*)|(\s*$)/gi, '')
    .replace(/[ ]{2,}/gi, ' ')
    .replace(/\n +/, '\n');
}

function DetailViewTextField({
  name,
  title,
  dataTestId,
  placeholder,
  error,
  textFieldError = true,
  value,
  isReadOnly = false,
  input = 'input',
  handleUpdate,
  handleInputChange,
  isDisabled = false,
  showAsterisk = false,
  hidden = false,
  setFormikValue,
  validationFn = () => '',
  showPenIcon = false,
}: DetailViewTextFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState('');
  const [lastValue, setLastValue] = useState(value);
  const [validationError, setValidationError] = useState('');

  const isValueChanged = currentValue && currentValue !== lastValue;
  const isError = Boolean(validationError);

  useEffect(() => {
    setCurrentValue(value);
    setFormikValue?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSave = () => {
    if (isValueChanged && handleUpdate && !isError) {
      const payload = {
        [name]: normalizedText(currentValue),
      };
      setLastValue(currentValue);
      handleUpdate(payload);
    }
  };

  const handleChange = (event: any) => {
    setFormikValue?.(event.target.value);
    handleInputChange?.(event.target.value);
    setCurrentValue(event.target.value);
    setValidationError(validationFn(event.target.value));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setCurrentValue(lastValue ?? '');
      setFormikValue?.(value);
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 300);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      inputRef?.current?.blur();
    }
  };

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
      isDisabled={isDisabled}
      showAsterisk={showAsterisk}
      hidden={hidden}
      showPenIcon={showPenIcon}
    >
      <TextField
        disabled={isReadOnly || isDisabled}
        name={name}
        value={currentValue ?? ''}
        inputRef={inputRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        fullWidth
        multiline
        error={textFieldError ? Boolean(error) : Boolean(validationError)}
        helperText={textFieldError ? error : validationError}
        InputProps={{
          inputComponent: input,
          disableUnderline: true,
          inputProps: {
            'data-testid': `${dataTestId}-input`,
            className: `textfield-input ${
              isDisabled ? 'purchases' : undefined
            }`,
            placeholder: placeholder ? getString(placeholder) : '',
          },
        }}
      />
      {showPenIcon && (
        <EditButton
          disabled={isDisabled}
          onClick={() => inputRef.current?.focus()}
          data-testid="edit-button"
        >
          <PenOutlineIcon fontSize="small" className="cursor-pointer mr-2" />
        </EditButton>
      )}
    </InputContainer>
  );
}

export default DetailViewTextField;
