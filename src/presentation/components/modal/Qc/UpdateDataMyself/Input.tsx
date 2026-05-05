import { Box, MenuItem, Select, Typography } from '@material-ui/core';
import React from 'react';

import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonLicensePlate, {
  CommonLicensePlateProps,
} from 'presentation/components/common/CommonLicensePlate/CommonLicensePlate';
import CommonTextField, {
  CommonTextFieldProps,
} from 'presentation/components/common/CommonTextField/CommonTextField';
import Datepicker, {
  IDatepicker,
} from 'presentation/components/common/Datepicker';
import { TextSemibold } from 'presentation/components/common/QcInputContainer/QcInputContainer';
import RadioFieldGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

export interface OptionProps {
  value: string;
  title: string;
}

type InputElement =
  | 'text'
  | 'licensePlate'
  | 'autocomplete'
  | 'datePicker'
  | 'radio';

type InputSchema = {
  text: {
    Component: typeof CommonTextField;
    props: CommonTextFieldProps;
  };
  licensePlate: {
    Component: typeof CommonLicensePlate;
    props: CommonLicensePlateProps;
  };
  autocomplete: {
    Component: typeof Autocomplete;
    props: any;
  };
  datePicker: {
    Component: typeof Datepicker;
    props: IDatepicker;
  };
  radio: {
    Component: typeof RadioFieldGroup;
    props: any;
  };
};

function getComponentAndProps<O extends InputSchema, K extends InputElement>(
  o: O,
  k: K
): O[K] {
  return o[k];
}

const inputSchema: InputSchema = {
  text: {
    Component: CommonTextField,
    props: {} as CommonTextFieldProps,
  },
  licensePlate: {
    Component: CommonLicensePlate,
    props: {} as CommonLicensePlateProps,
  },
  autocomplete: {
    Component: Autocomplete,
    props: {
      getOptionSelected: (option: OptionProps, value: OptionProps) =>
        option.value === value?.value,
      optionTextKey: 'title',
      textFieldProps: {
        placeholder: getString('text.select'),
      },
    },
  },
  datePicker: {
    Component: Datepicker,
    props: {
      isDob: true,
      dateFormat: 'dd/MM/yyyy',
      maskedFormat: ['d', 'm', 'Y'],
    } as IDatepicker,
  },
  radio: {
    Component: RadioFieldGroup,
    props: {
      row: true,
      options: [],
    },
  },
};

type InputProps = Readonly<{
  value: any;
  label: string;
  fieldType: string;
  options: any[];
  disabled?: boolean;
  handleOnChange: (value: any) => void;
  setIsDateInputEmpty: any;
  dataTestId?: string;
}>;

export default function Input(props: Readonly<InputProps>) {
  const {
    label,
    value,
    fieldType,
    options = [],
    handleOnChange,
    setIsDateInputEmpty,
    disabled,
    dataTestId,
  } = props;
  const i18nLabel = getString(label);

  if (fieldType === 'readonly') {
    return <TextSemibold className="input">{i18nLabel}</TextSemibold>;
  }

  if (fieldType === 'readOnlyDob') {
    return (
      <Box marginY="20px">
        <Typography component="span">{getString('qc.dob')}:</Typography>{' '}
        <Box component="span" fontWeight="bold">
          {value ? format(new Date(value), 'dd/MM/yyyy') : '-'}
        </Box>
      </Box>
    );
  }

  if (fieldType === 'text') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'text'
    );
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      value,
      label: i18nLabel,
      placeholder: getString('qc.typeHere'),
      disabled,
      onChange: (e) => {
        handleOnChange(e.target.value);
      },
    };

    return <Component className="input" {...modifiedProps} />;
  }

  if (fieldType === 'autocomplete') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'autocomplete'
    );
    const { textFieldProps } = componentProps;
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      multiple: label === 'qc.color',
      value,
      disabled,
      textFieldProps: {
        ...textFieldProps,
        label: i18nLabel,
        placeholder: getString('qc.select'),
      },
      options,
      onChange: (_e: any, val: any) => {
        handleOnChange(val);
      },
    };

    return <Component className="input" {...modifiedProps} />;
  }

  if (fieldType === 'licensePlate') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'licensePlate'
    );
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      value,
      handleOnChange: (val) => {
        handleOnChange(val);
      },
    };

    return <Component className="input" {...modifiedProps} />;
  }

  if (fieldType === 'radio') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'radio'
    );
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      value,
      options,
      isDisabled: disabled,
      onChange: (_event: React.ChangeEvent<HTMLInputElement>, val: string) => {
        handleOnChange(val);
      },
    };

    return (
      <Box marginTop="8px">
        <Typography gutterBottom>{i18nLabel}</Typography>
        <Component {...modifiedProps} />
      </Box>
    );
  }

  if (fieldType === 'select') {
    const normalizedValue =
      value != null &&
      value !== '' &&
      options.some((o: { value: string }) => o.value === value)
        ? value
        : '';
    const oicCodeMenuProps =
      dataTestId === 'qc-oic-code-select'
        ? {
            getContentAnchorEl: null,
            anchorOrigin: {
              vertical: 'bottom' as const,
              horizontal: 'left' as const,
            },
          }
        : undefined;

    return (
      <Box marginTop="8px">
        <Typography gutterBottom>{i18nLabel}</Typography>
        <Select
          value={normalizedValue}
          onChange={(e) => handleOnChange(String(e.target.value))}
          displayEmpty
          disabled={disabled}
          data-testid={dataTestId}
          style={{ minWidth: 140 }}
          {...(oicCodeMenuProps ? { MenuProps: oicCodeMenuProps } : {})}
        >
          <MenuItem value="" disabled>
            {getString('text.select')}
          </MenuItem>
          {options.map((opt: { value: string; title: string }) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.title}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }
  if (fieldType === 'dobPicker') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'datePicker'
    );
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      dateValue: new Date(value),
      textFieldProps: {
        label: i18nLabel,
        placeholder: getString('text.enterAppointmentDate'),
      },
      isDob: true,
      onChange: (val) => {
        handleOnChange(val);
      },
      setIsDateInputEmpty,
    };

    return <Component {...modifiedProps} />;
  }

  if (fieldType === 'datePicker') {
    const { Component, props: componentProps } = getComponentAndProps(
      inputSchema,
      'datePicker'
    );
    const modifiedProps: typeof componentProps = {
      ...componentProps,
      dateValue: new Date(value),
      textFieldProps: {
        label: getString('qc.policyStartDate'),
        placeholder: getString('text.enterAppointmentDate'),
      },
      isDob: false,
      minDate: new Date(new Date().getFullYear() - 100, 1, 2),
      onChange: (val) => {
        handleOnChange(val);
      },
      setIsDateInputEmpty,
    };

    return <Component {...modifiedProps} />;
  }

  return null;
}
