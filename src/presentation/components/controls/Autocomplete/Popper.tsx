import React from 'react';

const Poppers: React.FC<any> = (props: any) => {
  const { anchorEl, ...rest } = props;
  const bound = anchorEl.getBoundingClientRect();
  return (
    <div
      {...rest}
      className="MuiAutocomplete-options"
      data-testid="common-my-complete__poppers"
      style={{ width: bound.width }}
    />
  );
};

export default Poppers;
