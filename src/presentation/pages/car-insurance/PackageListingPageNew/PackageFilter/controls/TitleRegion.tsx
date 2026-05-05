import { Typography, Tooltip, withStyles } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/HelpOutline';
import React from 'react';

const CustomTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#005098',
    color: 'white',
    padding: '10px 30px',
    borderRadius: '10px',
    whiteSpace: 'pre-wrap',
  },
}))(Tooltip);

function TitleRegion({ title, tooltipText }: any) {
  return (
    <Typography className="text-grey-800 font-[700] flex items-center mb-[10px]">
      {title}
      {tooltipText?.length ? (
        <CustomTooltip title={tooltipText}>
          <HelpIcon className="text-primary ml-[10px]" />
        </CustomTooltip>
      ) : null}
    </Typography>
  );
}

export default TitleRegion;
