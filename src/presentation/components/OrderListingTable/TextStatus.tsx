import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { MouseEventHandler } from 'react';

import { getStatusValue } from './helper';

export interface ITextStatus {
  label: string;
  status: string;
  isDownloadable?: boolean;
  type?: 'text' | 'circle';
  handleClick?: () => MouseEventHandler<HTMLSpanElement>;
  fontBold?: boolean;
  tableType?: string;
}

const useStyles = makeStyles({
  circleStatus: (props: { color: string }) => ({
    color: props.color,
    '&:before': {
      content: '""',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: `2px solid ${props.color}`,
      display: 'inline-block',
      margin: '-1px 8px',
    },
  }),
  textColor: (props: { color: string }) => ({
    color: props.color,
    fontWeight: 400,
  }),
  textDownload: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
});

function TextStatus({
  status,
  label,
  type,
  isDownloadable,
  handleClick,
  fontBold,
  tableType,
}: ITextStatus) {
  const theme = useTheme();
  const { palette } = theme;

  const statusColors = {
    success: palette.success.main,
    warning: palette.warning.main,
    danger: palette.error.main,
    normal: palette.text.secondary,
    cancelled: palette.grey[400],
    text: palette.grey[800],
  };
  const statusValue = getStatusValue(status, tableType);
  const props = {
    color: statusColors[statusValue as keyof typeof statusColors],
  };
  const classes = useStyles(props);
  const isCircle = type === 'circle';

  return (
    <span
      role="presentation"
      onClick={isDownloadable ? handleClick : undefined}
      className={clsx({
        [classes.circleStatus]: isCircle,
        [classes.textColor]: !isCircle,
        [classes.textDownload]: statusValue === 'danger' && isDownloadable,
        capitalize: true,
        'font-bold': fontBold,
      })}
    >
      {label}
    </span>
  );
}

export default TextStatus;
