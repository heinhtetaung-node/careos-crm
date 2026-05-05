/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IconButton as MuiIconButton,
  withStyles,
  IconButtonProps,
  Theme,
  WithStyles,
} from '@material-ui/core';
import React, { PropsWithChildren } from 'react';

interface ISquareButtonProps extends IconButtonProps {
  backgroundColor?: string;
  iconColor?: string;
  readOnly?: boolean;
  children: JSX.Element;
}

type ISquareButtonKeys = keyof ISquareButtonProps;
type Styles = ReturnType<typeof themeFunc>;

interface ButtonStyles extends WithStyles<Styles> {
  backgroundColor?: string;
  iconColor?: string;
  readOnly?: boolean;
}

const styledBy =
  (property: ISquareButtonKeys, defaultStyle: string) =>
  (props: ISquareButtonProps) => {
    if (
      (property === 'backgroundColor' || property === 'iconColor') &&
      props[property]
    )
      return props[property];
    return defaultStyle;
  };

const themeFunc = (theme: Theme) => ({
  root: {
    width: `${theme.spacing(6)}px`,
    height: `${theme.spacing(6)}px`,
    backgroundColor: styledBy(
      'backgroundColor' as ISquareButtonKeys,
      theme.palette.grey[100]
    ),
    borderRadius: '6px',
    '&:hover': {
      backgroundColor: styledBy(
        'backgroundColor' as ISquareButtonKeys,
        theme.palette.grey[100]
      ),
    },
    '& .MuiSvgIcon-root': {
      fill: styledBy('iconColor' as ISquareButtonKeys, theme.palette.grey[400]),
    },
    '& .MuiSvgIcon-fontSizeSmall': {
      fontSize: '0.875rem',
    },
    '&.readOnly': {
      '&.Mui-disabled': {
        backgroundColor: styledBy(
          'backgroundColor' as ISquareButtonKeys,
          theme.palette.grey[100]
        ),
      },
    },
  },
});

const SquareButton = withStyles(themeFunc)(({
  classes,
  backgroundColor,
  iconColor,
  readOnly,
  ...others
}: ButtonStyles) => {
  let otherProps = { ...others };
  if (readOnly) {
    otherProps = {
      ...others,
      disabled: true,
    };
  }
  return (
    <MuiIconButton
      className={readOnly ? `${classes.root} readOnly` : classes.root}
      {...otherProps}
    />
  );
});

function SquareIconButton({
  children,
  ...restProps
}: PropsWithChildren<ISquareButtonProps>) {
  return <SquareButton {...restProps}>{children}</SquareButton>;
}

export default SquareIconButton;
