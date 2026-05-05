import { Divider } from '@alphafounders/ui';
import { Typography } from '@material-ui/core';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { withStyles, alpha } from '@material-ui/core/styles';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import clsx from 'clsx';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import TitleRegion from './TitleRegion';

interface CheckBoxProps {
  type?: string;
  hideSelectAll?: boolean;
  title: string;
  tooltipText: string;
  checkboxArr: {
    key: string | number;
    label: string;
    adornment?: React.ReactNode;
  }[];
  checkedArr: string[];
  setCheckedArr: any;
  onChange: () => void;
  gridCol?: number;
  titleLeft?: boolean;
}

const Checkbox = withStyles((theme) => ({
  root: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 2,
    paddingRight: 2,
    color: theme.palette.grey[200],
    '&:hover': {
      backgroundColor: `${alpha('#2196f3', 0.04)} !important`,
    },
    '&.Mui-disabled': {
      color: theme.palette.grey[200],
      '&:hover': {
        backgroundColor: 'unset !important',
      },
    },
  },
}))(MuiCheckbox);

function CommonCheckBox({
  type,
  hideSelectAll,
  title,
  tooltipText,
  checkboxArr,
  checkedArr,
  setCheckedArr,
  onChange,
  gridCol,
  titleLeft,
}: Readonly<CheckBoxProps>) {
  const handleCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (event.target.checked) {
      const isVal = checkedArr.includes(key);
      if (!isVal) {
        setCheckedArr([...checkedArr, key]);
      }
    } else {
      setCheckedArr(checkedArr.filter((checkVal: any) => checkVal !== key));
    }
    onChange();
  };

  const handleSelectAll = () => {
    setCheckedArr(checkboxArr.map((val: any) => val.key));
    onChange();
  };

  const handleClearAll = () => {
    setCheckedArr([]);
    onChange();
  };

  return (
    <div>
      <TitleRegion title={titleLeft ? '' : title} tooltipText={tooltipText} />
      {!hideSelectAll && (
        <div className="flex justify-around cursor-pointer my-[10px]">
          <Typography className="text-primary" onClick={handleSelectAll}>
            {getString('text.selectAll')}
          </Typography>
          <Divider orientation="vertical" />
          <Typography className="text-gray-400" onClick={handleClearAll}>
            {getString('text.clearAll')}
          </Typography>
        </div>
      )}
      <div
        className={clsx('text-grey-400', {
          [`grid text-xs grid-cols-${gridCol}`]: gridCol,
        })}
      >
        {titleLeft && (
          <div className="text-grey-400 pl-4 mt-2">
            <Typography className="text-primary font-bold text-xs mt-0.5">
              {title}
            </Typography>
          </div>
        )}
        {checkboxArr.map((val: any) => (
          <React.Fragment key={val.key}>
            <div
              className={clsx('inline-flex justify-between items-center', {
                'w-full': type === 'insurer',
                'w-1/2': type !== 'insurer' && !gridCol,
              })}
            >
              <div className="flex items-center">
                <Checkbox
                  color="primary"
                  name={val.key}
                  onChange={(e) => handleCheckbox(e, val.key)}
                  disabled={false}
                  checked={checkedArr.includes(val.key)}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  indeterminateIcon={
                    checkedArr.includes(val.key) ? (
                      <IndeterminateCheckBoxIcon fontSize="small" />
                    ) : (
                      <CheckBoxOutlineBlankIcon fontSize="small" />
                    )
                  }
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  inputProps={{ 'aria-label': val.label }}
                />
                {val.logo && (
                  <img className="w-[23px] mr-1" alt="logo" src={val.logo} />
                )}
                <span className="checkboxLabel">{getString(val.label)}</span>
              </div>
              {val.adornment && (
                <div className="whitespace-nowrap">{val.adornment}</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default CommonCheckBox;
