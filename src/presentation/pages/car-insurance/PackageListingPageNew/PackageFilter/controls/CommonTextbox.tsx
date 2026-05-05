import React from 'react';

import TitleRegion from './TitleRegion';
import Controls from 'presentation/components/controls/Control';

interface SelectRegionProps {
  value: string | undefined;
  onChange: (arg: any) => void;
  title: string;
  tooltipHelperText: string | number;
  ['data-testid']?: string;
  disabled?: boolean;
}

function CommonTextBox({
  value,
  onChange,
  title,
  tooltipHelperText,
  ...rest
}: SelectRegionProps) {
  const handleChange = (event: any) => {
    const val = event.target.value;
    onChange(val);
  };

  return (
    <div data-testid={rest['data-testid']}>
      <TitleRegion title={title} tooltipText={tooltipHelperText} />
      <div className="w-full inline-grid">
        <Controls.Input value={value} onChange={handleChange} {...rest} />
      </div>
    </div>
  );
}

export default CommonTextBox;
