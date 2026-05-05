import { withStyles } from '@material-ui/core/styles';
import MuiTypography from '@material-ui/core/Typography';
import React from 'react';

import Datepicker, {
  IDatepicker,
} from 'presentation/components/common/Datepicker';
import { getDOBError } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';

import PolicyHolderHelper from '../../InfoPanel/PolicyHolder/PolicyHolder.helper';
import InputContainer from '../InputContainer';

export interface DetailViewDatepickerProps {
  name: string;
  title: string;
  value?: string;
  error?: string;
  isReadOnly?: boolean;
  datepickerProps?: Omit<IDatepicker, 'onChange'>;
  handleUpdate?: (payload: any) => void;
  placeholder?: string;
  isDisabled?: boolean;
  dataTestId?: string;
  isDob?: boolean;
  showAsterisk?: boolean;
  setFormikValue?: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setFormikError?: (field: string, message: string | undefined) => void;
  formikSubmit?: () => void;
}

const Typography = withStyles((theme) => ({
  root: {
    padding: 10,
    color: theme.palette.text.primary,
  },
}))(MuiTypography);

function DetailViewDatepicker({
  name,
  value,
  title,
  error,
  isReadOnly = false,
  datepickerProps,
  handleUpdate,
  placeholder = '',
  isDisabled = false,
  dataTestId,
  isDob = false,
  showAsterisk,
  setFormikValue,
  setFormikError,
  formikSubmit,
}: Readonly<DetailViewDatepickerProps>) {
  const handleDateUpdate = (date: Date | undefined) => {
    if (handleUpdate && !setFormikValue)
      handleUpdate({
        [name]: date,
      });
    if (!setFormikValue) return;
    if (!formikSubmit) return;
    if (name === 'dateOfBirth') {
      const err = getDOBError(date as unknown as string);
      if (!err) {
        if (setFormikError) {
          setFormikError(name, '');
        }
        setFormikValue(name, date, true);
        setFormikValue('age', PolicyHolderHelper.getAge(date), true);
        formikSubmit();
      } else {
        if (setFormikError) {
          setFormikError(name, err);
        }
        setFormikValue(name, date, false);
      }
    }
    if (name !== 'dateOfBirth') {
      setFormikValue(name, date, true);
      formikSubmit();
    }
  };

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={`${dataTestId}-datefield`}
      isReadOnly={isReadOnly}
      showAsterisk={showAsterisk}
      isDisabled={isDisabled}
    >
      {isReadOnly ? (
        <Typography data-testid={`${dataTestId}-datefield-readonly`}>
          {value}
        </Typography>
      ) : (
        <Datepicker
          textFieldProps={{
            variant: 'filled',
            placeholder,
            disabled: isDisabled,
            dataTestId,
          }}
          dateValue={value}
          onChange={handleDateUpdate}
          disabled={isDisabled}
          isDob={isDob}
          {...datepickerProps}
        />
      )}
    </InputContainer>
  );
}

export default DetailViewDatepicker;
