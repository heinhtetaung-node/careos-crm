import { makeStyles } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { FastField, useFormikContext, Field } from 'formik';
import React from 'react';
import { NumericFormat } from 'react-number-format';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import { packageFields } from 'shared/constants/packageFormFields';
import {
  garageDealerCollection,
  radioCollection,
  selectCollection,
} from 'shared/constants/packageStaticData';
import { IInputProps } from 'shared/interfaces/common/lead/package';

interface IProp {
  input: IInputProps;
  setIsShowTheftAndFireCoverageValue: any;
  setIsShowFloodCoverageValue: any;
}

const useStyles = makeStyles(() => ({
  datePickerIcon: {
    '& .MuiIconButton-root': {
      padding: '0',
    },
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: '7px',
    },
  },
}));

const useStylesDropdown = makeStyles({
  select: {
    '&&': {
      borderTop: '1px solid',
      borderTopRightRadius: '10px',
    },
  },
});

function CustomQuoteControl({
  input,
  setIsShowTheftAndFireCoverageValue,
  setIsShowFloodCoverageValue,
}: IProp) {
  const classes = useStyles();

  const {
    values,
    handleChange,
    handleBlur,
    touched,
    setFieldTouched,
    errors,
    setFieldValue,
  }: any = useFormikContext<any>(); // FIXME

  const displayTheftAndFireCoverageInputHidden = (value: string | number) =>
    value === 'Yes'
      ? setIsShowTheftAndFireCoverageValue(true)
      : setIsShowTheftAndFireCoverageValue(false);

  const displayFloodCoverageInputHidden = (value: string | number) =>
    value === 'Yes'
      ? setIsShowFloodCoverageValue(true)
      : setIsShowFloodCoverageValue(false);

  const toggleEnabled = (value: any) => value.package_type === 'RENEWAL';

  const toogleHiddenValueInput = (
    field: IInputProps,
    value: string | number
  ) => {
    if (field.name === packageFields.fireTheftCoverage.name) {
      displayTheftAndFireCoverageInputHidden(value);
    }
    if (field.name === packageFields.floodCoverage.name) {
      displayFloodCoverageInputHidden(value);
    }
  };

  function NumberControl(field: IInputProps) {
    const { name, placeholder, disable, inputProps } = field;
    return (
      <FastField>
        {() => (
          <NumericFormat
            thousandSeparator={inputProps?.isCurrency ?? true}
            allowLeadingZeros={false}
            onValueChange={(numberValues: any) => {
              setFieldValue(name, numberValues.value);
            }}
            allowNegative={false}
            customInput={Controls.Input}
            name={name}
            value={values[name]}
            placeholder={placeholder || ''}
            onBlur={handleBlur}
            error={touched[name] ? errors[name] : ''}
            disabled={disable || false}
          />
        )}
      </FastField>
    );
  }

  const DoubleNumberControl = (field: IInputProps) =>
    field.childs?.map((childs) => (
      <FastField key={childs.name}>
        {() => (
          <NumericFormat
            thousandSeparator
            allowLeadingZeros={false}
            onValueChange={(v: any) => {
              setFieldValue(childs.name, v.floatValue);
            }}
            allowNegative={false}
            customInput={Controls.Input}
            name={childs.name}
            value={values[childs.name]}
            placeholder={
              childs.placeholder ? getString(`package.${childs.name}`) : ''
            }
            onBlur={handleBlur}
            error={touched[childs.name] ? errors[childs.name] : ''}
            style={{ marginBottom: '10px' }}
          />
        )}
      </FastField>
    ));

  function RadioControl(field: IInputProps) {
    const { name } = field;
    return (
      <FastField name={name}>
        {() => (
          <Controls.ToogleButton
            value={values[name]}
            onChange={(
              event: React.MouseEvent<HTMLElement, MouseEvent>,
              value: string | number
            ) => {
              if (value !== null) {
                setFieldValue(name, value);
                toogleHiddenValueInput(field, value);
              }
            }}
            exclusive
            toogleButtonArray={
              name === packageFields.carRepairType.name
                ? garageDealerCollection()
                : radioCollection()
            }
          />
        )}
      </FastField>
    );
  }

  function TextControl(field: IInputProps) {
    const { name, placeholder, disable } = field;
    return (
      <FastField name={name}>
        {() => (
          <Controls.Input
            name={name}
            value={values[name]}
            onChange={handleChange}
            placeholder={placeholder || ''}
            onBlur={handleBlur}
            error={touched[name] ? errors[name] : ''}
            disabled={name === 'name' ? toggleEnabled(values) : disable}
            dataTestid={name}
          />
        )}
      </FastField>
    );
  }

  function SelectControl(field: IInputProps) {
    const { name, options, disable, type, placeholder } = field;
    const dropdownClasses = useStylesDropdown();

    const localeOptions = options?.map((option: any) => ({
      ...option,
      title: getString(option.title),
    }));

    return (
      <FastField name={name}>
        {() => (
          <Controls.Select
            name={name}
            value={values[name]}
            onChange={handleChange}
            onClose={() => {
              setFieldTouched(name, true);
            }}
            options={localeOptions || selectCollection()}
            disabled={disable || false}
            error={touched[name] != null && errors[name] != null}
            errorType={errors[name]}
            {...(type === 'SelectCustomDropdown' && {
              styledDropdown: dropdownClasses.select,
            })}
            placeholder={placeholder}
          />
        )}
      </FastField>
    );
  }

  function DateTimeControl(field: IInputProps) {
    const { name, placeholder, disable = false } = field;
    const fieldCanSelectPast = ['firstDriverDOB', 'secondDriverDOB'];
    return (
      <Field name={name}>
        {() => (
          <KeyboardDatePicker
            name={name}
            value={values[name]}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            onChange={(date: Date | null) => {
              values[name] = date;
              setFieldTouched(name, true);
            }}
            onClose={() => {
              setFieldTouched(name, true);
            }}
            autoOk
            disablePast={!fieldCanSelectPast.includes(name)}
            // Text Field Props
            inputVariant="outlined"
            error={!!(touched[name] && errors[name])}
            helperText={touched[name] && errors[name] ? errors[name] : ''}
            onBlur={handleBlur}
            className={classes.datePickerIcon}
            placeholder={placeholder}
            InputProps={{
              readOnly: disable,
            }}
          />
        )}
      </Field>
    );
  }

  return (
    <>
      {input.type === 'TextField' ? TextControl(input) : null}
      {input.type === 'NumberInput' ? NumberControl(input) : null}
      {input.type === 'DateTime' ? DateTimeControl(input) : null}
      {input.type === 'Select' ? SelectControl(input) : null}
      {input.type === 'DoubleInput' ? DoubleNumberControl(input) : null}
      {input.type === 'Radio' ? RadioControl(input) : null}
      {input.type === 'SelectCustomDropdown' ? SelectControl(input) : null}
    </>
  );
}

export default CustomQuoteControl;
