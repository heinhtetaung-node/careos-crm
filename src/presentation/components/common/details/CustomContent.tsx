import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { getString } from 'presentation/theme/localization';
import { isValid, format } from 'utils/datetime';

import { LogTypes } from './CommentSection';

interface CustomContentProps {
  name: any;
  time: string;
  content: string;
  logType?: string;
  fieldName?: string;
  newValue?: string;
  prevValue?: string;
}

function CustomContent({
  name,
  content,
  time,
  logType,
  ...rest
}: Readonly<CustomContentProps>) {
  const useStyles = makeStyles((theme) => ({
    title: {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
    content: {
      backgroundColor: theme.palette.info.light,
      padding: theme.spacing(1),
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    time: {
      paddingTop: theme.spacing(1),
    },
  }));
  const classes = useStyles();

  const timeFormated = isValid(new Date(time))
    ? `${format(new Date(time), 'dd/MM/yyyy (hh:mm:ss a)')}`
    : '';

  const buildTitle = () => {
    if (logType === LogTypes.ACTIVITY) {
      const { fieldName } = rest;
      return getString('text.updatedLog', {
        user: name || getString('text.systemUser'),
        field: fieldName,
      });
    }
    if (logType === LogTypes.SCRIPT) {
      return getString('text.addedScript', {
        name: name || getString('text.systemUser'),
      });
    }
    return getString('text.leftComment', {
      name: name || getString('text.systemUser'),
    });
  };

  const buildContent = () => {
    if (logType === LogTypes.ACTIVITY) {
      const { prevValue, newValue } = rest;
      return `${prevValue || 'N/A'} → ${newValue || 'N/A'}`;
    }
    return content;
  };

  return (
    <>
      <Typography className={classes.title} variant="body1">
        {buildTitle()}
      </Typography>
      <Typography className={classes.content} variant="body1">
        {buildContent()}
      </Typography>
      <Typography
        className={classes.time}
        variant="body2"
        color="textSecondary"
        align="right"
      >
        {timeFormated}
      </Typography>
    </>
  );
}

export default CustomContent;
