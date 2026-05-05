import Box, { BoxProps } from '@material-ui/core/Box';
import {
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

interface IconWrapperProps
  extends WithStyles<ReturnType<typeof IconWrapperStyles>>,
    BoxProps {
  showBackground?: boolean;
  disabled?: boolean;
}

const TableCellContentStyles = () =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'start',
      flexDirection: 'column',
      '& span:nth-child(2)': {
        fontSize: '0.6875rem',
      },
    },
  });

const IconWrapperStyles = (theme: Theme) =>
  createStyles({
    root: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '100%',
      '& .MuiIcon-root': {
        fontSize: '1rem',
      },
    },
    background: {
      backgroundColor: theme.palette.primary.main,
    },
    disabled: {
      '&:hover': {
        cursor: 'default',
      },
      backgroundColor: theme.palette.grey[200],
    },
  });

export const IconWrapper = withStyles(IconWrapperStyles)((
  props: IconWrapperProps
) => {
  const { classes, showBackground, disabled, ...rest } = props;
  return (
    <Box
      className={clsx(
        'icon-wrapper',
        classes.root,
        showBackground && classes.background,
        disabled && classes.disabled,
        showBackground && !disabled && 'highlight'
      )}
      {...rest}
    />
  );
});

export const TableCellContent = withStyles(TableCellContentStyles)(Box);
