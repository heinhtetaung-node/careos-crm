import { Select, MenuItem } from '@material-ui/core';
import React from 'react';

import TitleRegion from './TitleRegion';

interface SelectRegionProps {
  value: string | number | undefined;
  onChange: (arg: any) => void;
  title: string;
  tooltipHelperText: string | number;
  options?: { key: string; label: string }[];
  disabled?: boolean;
  ['data-testid']?: string;
  backgroundColor?: string;
}

function SelectRegion({
  value,
  onChange,
  title,
  tooltipHelperText,
  options,
  disabled = false,
  backgroundColor = '',
  ...rest
}: Readonly<SelectRegionProps>) {
  const handleChange = (event: any) => {
    const val = event.target.value;
    onChange(val);
  };

  return (
    <div data-testid={rest['data-testid']}>
      <TitleRegion title={title} tooltipText={tooltipHelperText} />
      <div className="w-full inline-grid">
        <Select
          value={value}
          onChange={handleChange}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor,
          }}
          disabled={disabled}
        >
          {options?.length
            ? options.map((option: any) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))
            : null}
        </Select>
      </div>
    </div>
  );
}

export default SelectRegion;
