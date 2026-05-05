import { Box } from '@material-ui/core';
import clsx from 'clsx';
import { useFormikContext } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { packageFields } from 'shared/constants/packageFormFields';
import { IInputProps } from 'shared/interfaces/common/lead/package';

import { NUMBER_INPUT_STEP } from './customQuote.helper';
import CustomQuoteControl from './customQuoteControl';

interface IProp {
  data: any;
  classes: any;
}

const customStyle = (field: IInputProps) => {
  let cssVariables = {};
  if (field.name === packageFields.sumCoverage.name) {
    cssVariables = { flexWrap: 'wrap' };
  }
  return cssVariables;
};

function CustomQuoteField({ data, classes }: Readonly<IProp>) {
  const [isShowTheftAndFireCoverageValue, setIsShowTheftAndFireCoverageValue] =
    useState(false);
  const [isShowFloodCoverageValue, setIsShowFloodCoverageValue] =
    useState(false);
  const { values, setFieldTouched, setFieldValue } = useFormikContext<any>();

  const prefillFloodAndTheftCoverage = useCallback(() => {
    if (
      values.sum_coverage_max % NUMBER_INPUT_STEP === 0 &&
      values.car_insurance_type === 'Type 1'
    ) {
      setFieldValue(
        packageFields.fireTheftCoverageValue.name,
        values.sum_coverage_max
      );
      setFieldValue(
        packageFields.floodCoverageValue.name,
        values.sum_coverage_max
      );
    }
  }, [values.sum_coverage_max, values.car_insurance_type, setFieldValue]);

  useEffect(() => {
    prefillFloodAndTheftCoverage();
  }, [
    values.sum_coverage_max,
    values.car_insurance_type,
    prefillFloodAndTheftCoverage,
  ]);

  useEffect(() => {
    setFieldTouched(values.fire_theft_coverage_value, true);
    setFieldTouched(values.flood_coverage_value, true);
  }, [
    setFieldTouched,
    values.fire_theft_coverage_value,
    values.flood_coverage_value,
  ]);

  const customColor = (field: IInputProps) => {
    let cssVariables = {};
    switch (field.name) {
      case packageFields.fireTheftCoverage.name:
        cssVariables = { background: 'white' };
        return cssVariables;
      case packageFields.fireTheftCoverageValue.name:
        cssVariables = {
          background: 'white',
          display: `${isShowTheftAndFireCoverageValue ? 'flex' : 'none'}`,
        };
        return cssVariables;
      case packageFields.floodCoverage.name:
        cssVariables = { background: '#e7eef7' };
        return cssVariables;
      case packageFields.floodCoverageValue.name:
        cssVariables = {
          background: '#e7eef7',
          display: `${isShowFloodCoverageValue ? 'flex' : 'none'}`,
        };
        return cssVariables;
      default:
        return cssVariables;
    }
  };
  return (
    <>
      {data.map((field: IInputProps) => (
        <div
          className={clsx('custom-quote-page__field', classes.inputRow)}
          key={field.name}
          style={customColor(field)}
        >
          <Box margin="auto 0" width="50%" display="inline-block">
            <Trans
              className="custom-quote-page__field--title"
              i18nKey={`package.${field.name}`}
              defaults={field.title}
              components={{ asterisk: <span className="text-red-500" /> }}
            />
          </Box>
          <div className="custom-quote-page__field--colon">: </div>
          <div
            className="custom-quote-page__field--input"
            style={customStyle(field)}
          >
            <CustomQuoteControl
              input={field}
              setIsShowTheftAndFireCoverageValue={
                setIsShowTheftAndFireCoverageValue
              }
              setIsShowFloodCoverageValue={setIsShowFloodCoverageValue}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default CustomQuoteField;
