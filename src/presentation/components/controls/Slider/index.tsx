import {
  FormControl,
  InputAdornment,
  Popover,
  Slider as MuiSlider,
  Typography,
} from '@material-ui/core';
import React, { useState, useMemo, useEffect } from 'react';

import { InputSliderIcon } from 'presentation/components/icons';

import SliderHelper, { clearSliderValue$ } from './Slider.helper';

import { getString } from '../../../theme/localization';
import Controls from '../Control';

import './Slider.scss';

interface IProps {
  name: string;
  min: number;
  max: number;
  value: number[];
  label?: string;
  onChange: any;
  step: number;
  marks: boolean;
  isPlaceHolder?: boolean;
  fixedLabel?: boolean;
}
const sliderHelper = new SliderHelper();
const Slider: React.FC<IProps> = ({
  name,
  min,
  max,
  value = [min, max],
  label,
  onChange,
  step,
  marks = true,
  isPlaceHolder = true,
  fixedLabel = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const formatRangeSlider = (num: any) => {
    if (num[0] === min && num[1] === min) {
      return '';
    }
    const numParts = num.toString().split('.');
    numParts[0] = numParts[0].replace(',', '-');
    return numParts.join('.');
  };

  const [sliderValue, setSliderValue] = useState<number[]>(value || [min, min]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isError, setIsError] = useState<{ error: boolean; message?: string }>({
    error: false,
  });
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSlideChange = (e: any, val: number | number[]) => {
    setSliderValue(val as number[]);
  };

  const handleChange = () => {
    onChange(name, sliderValue);
    setInputValue(formatRangeSlider(sliderValue));
    setIsError({ error: false });
    handleClose();
  };
  useEffect(() => {
    const sliderSubscription = clearSliderValue$.subscribe((res) => {
      if (res) {
        setInputValue('');
        setIsError({ error: false });
      }
    });
    return () => sliderSubscription.unsubscribe();
  }, []);

  const updateSlideValue = (values: [number, number]) => {
    if (values.length === 2) {
      if (values[1] > values[0]) {
        onChange(name, values);
      } else {
        onChange(name, [min, min]);
      }
      setSliderValue(values);
    } else if (values.length === 1) {
      setIsError({
        error: true,
        message: `${getString('text.requiredMinMax', {
          label,
        })} `,
      });
      onChange(name, [0, 0]);
      setSliderValue([values[0], 0]);
    }
  };

  useEffect(() => {
    if (inputValue) {
      const newSliderValue = sliderHelper.formatStringToArray(inputValue);
      updateSlideValue(newSliderValue as [number, number]);
    }
  }, [inputValue]);

  const changeInputHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatString = sliderHelper.formatToString(event.target.value, max);
    if (!event.target.value) {
      setIsError({ error: false });
    }
    const split = formatString.split('-');
    if (split?.length === 2) {
      if (Number(split[1]) <= Number(split[0])) {
        setIsError({
          error: true,
          message: `${getString('text.inputSumInsuredError', {
            label,
          })} `,
        });
      } else {
        setIsError({ error: false });
      }
    }
    if (name === 'carAge') {
      // INFO: Case for Package Search
      if (Number(split[0]) === 0 || Number(split[1]) === 0) {
        setIsError({
          error: true,
          message: getString('package.carAgeMinMessage'),
        });
      }
    }
    setInputValue(formatString);
  };

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeInputHandle(event);
  };

  const handleKeyDown = (
    event: KeyboardEvent & Partial<React.ChangeEvent<HTMLInputElement>>
  ) => {
    sliderHelper.handleKeyDown(event, inputValue);
  };

  return (
    <div tabIndex={-1} style={{ width: '100%' }}>
      <FormControl variant="outlined">
        <Controls.Input
          generic
          label={label}
          value={inputValue}
          fixedLabel={fixedLabel}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <InputSliderIcon
                  onClick={handleClick}
                  fill="rgba(0, 0, 0, 0.87)"
                  style={{ cursor: 'pointer' }}
                />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          onChange={handleChangeInput}
          onKeyDown={handleKeyDown}
          placeholder={`${getString('text.minimum')} - ${getString(
            'text.maximum'
          )}`}
          className="shared-range-slider"
        />
        {isError.error ? (
          <Typography variant="caption" color="error">
            {isError.message}
          </Typography>
        ) : null}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          className="shared-slider"
        >
          <div
            style={{
              display: 'block',
            }}
            className={`user-count-slider${
              !isPlaceHolder ? ' sum-insured-count-slider' : ''
            }`}
          >
            <MuiSlider
              name={name}
              value={sliderValue}
              onChange={onSlideChange}
              valueLabelDisplay="on"
              min={min}
              max={max}
              step={step}
              marks={marks}
              valueLabelFormat={formatRangeSlider}
            />
            <Controls.Button
              size="small"
              text={getString('text.apply')}
              color="primary"
              onClick={handleChange}
            />
          </div>
        </Popover>
      </FormControl>
    </div>
  );
};

export default React.memo(Slider);
