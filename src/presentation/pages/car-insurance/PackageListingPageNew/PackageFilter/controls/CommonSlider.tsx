import { Slider, withStyles, Tooltip } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';

import TitleRegion from './TitleRegion';
import { getString } from 'presentation/theme/localization';
import { formatSatangToBaht } from 'utils/currency';

const formatNumberWithCommas = (value: number): string =>
  value.toLocaleString('en-US');
const CustomSlider = withStyles((theme) => ({
  root: {
    '& .MuiSlider-root': {
      width: '95%',
    },
    '& .MuiSlider-markLabel': {
      padding: '0 20px',
      fontSize: '12px',
      color: theme.palette.grey[800],
      fontFamily: 'Poppins',
    },
    '& .MuiSlider-valueLabel': {
      left: 'calc(-50% - 15px)',
    },
    '& .MuiSlider-valueLabel > span': {
      transform: 'none',
      width: 'auto',
      padding: '5px 10px',
      borderRadius: '10px',
      '& > span': {
        transform: 'none',
      },
    },
  },
}))(Slider);

const CustomTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: '.7rem',
    fontSize: '12px',
  },
}))(Tooltip);

function ValueLabelComponent(
  props: PropsWithChildren<{ open: boolean; value: number }>
) {
  const { children, open, value } = props;

  return (
    <CustomTooltip
      open={open}
      enterTouchDelay={0}
      placement="bottom"
      title={`${formatSatangToBaht(value)} ${getString('text.baht')}`}
      arrow
    >
      {children as ReactElement<any, any>}
    </CustomTooltip>
  );
}

interface CommonSliderProps {
  title: string;
  tooltipText: string;
  minVal: number;
  maxVal: number;
  step: number;
  sliderRange: any;
  setSliderRange: any;
  onChange: () => any;
}

function CommonSlider({
  title,
  tooltipText,
  minVal,
  maxVal,
  step,
  sliderRange,
  setSliderRange,
  onChange,
}: Readonly<CommonSliderProps>) {
  const handleChange = (
    _e: React.ChangeEvent<any>,
    newValue: number | number[]
  ) => {
    setSliderRange(newValue);
  };

  const handleChangeCommitted = (_e: React.ChangeEvent<any>) => {
    onChange();
  };

  const valuetext = (value: number) =>
    `${formatNumberWithCommas(value)} ${getString('text.baht')}`;

  return (
    <>
      <TitleRegion title={title} tooltipText={tooltipText} />
      <div className="mx-[15px] mt-4">
        <CustomSlider
          value={sliderRange}
          min={minVal}
          max={maxVal}
          step={step}
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          // eslint-disable-next-line react/jsx-no-bind
          getAriaValueText={valuetext}
          ValueLabelComponent={ValueLabelComponent}
          marks={[
            {
              value: minVal,
              label: formatSatangToBaht(minVal),
            },
            {
              value: maxVal,
              label: formatSatangToBaht(maxVal),
            },
          ]}
        />
      </div>
    </>
  );
}

export default CommonSlider;
