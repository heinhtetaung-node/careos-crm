import { Switch as MuiSwitch, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

interface Props {
  className?: string;
  defaultChecked?: boolean;
  value?: boolean;
  checked?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const useStyles = makeStyles((theme) => ({
  primary: {
    padding: 8,
    width: 64,
    height: 42,
    '& .MuiSwitch-track': {
      borderRadius: 28 / 2,
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 24,
        height: 24,
        fontSize: 12,
        color: theme.palette.common.white,
      },
      '&:before': {
        content: "'on'",
        top: 24,
        left: 10,
      },
      '&:after': {
        content: "'off'",
        top: 24,
        right: 10,
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 20,
      height: 20,
      margin: 2,
    },
    '& .MuiSwitch-colorSecondary.Mui-checked': {
      color: theme.palette.primary.main,
      transform: 'translateX(22px)',
    },
    '& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default function Switch({ className = '', ...props }: Props) {
  const classes = useStyles();
  return (
    <MuiSwitch
      className={clsx({
        [classes.primary]: true,
        [className]: true,
      })}
      {...props}
    />
  );
}
