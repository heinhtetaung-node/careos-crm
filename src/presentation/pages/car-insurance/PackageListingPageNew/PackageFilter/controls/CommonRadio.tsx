import { Radio } from '@alphafounders/ui';
import clsx from 'clsx';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import TitleRegion from './TitleRegion';

interface CheckBoxProps {
  title: string;
  tooltipText: string;
  selectedValue: string;
  options: {
    key: string | number;
    label: string;
    adornment?: React.ReactNode;
  }[];
  setValue: any;
  onChange: () => void;
}

function CommonRadio({
  title,
  tooltipText,
  selectedValue,
  options,
  setValue,
  onChange,
}: CheckBoxProps) {
  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange();
  };

  return (
    <>
      <TitleRegion title={title} tooltipText={tooltipText} />
      <div className="text-grey-400 pl-4">
        {options.map((val: any) => (
          <React.Fragment key={val.key}>
            <div
              className={clsx('inline-flex justify-between items-center w-1/2')}
            >
              <div className="flex items-center">
                <Radio
                  label={getString(val.label)}
                  name={val.title}
                  onChange={(e: any) => handleCheckbox(e)}
                  disabled={false}
                  value={val.value}
                  selected={selectedValue === val.value}
                />
              </div>
              {val.adornment && (
                <div className="whitespace-nowrap">{val.adornment}</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export default CommonRadio;
