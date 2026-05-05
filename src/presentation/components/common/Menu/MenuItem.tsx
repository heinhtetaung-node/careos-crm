import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import MuiMenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
import { alpha, withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

import Chip from '../Chip';

export const useStyles = makeStyles((theme) => ({
  root: {
    '&.Mui-disabled': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  },
  iconText: {
    marginLeft: 10,
  },
  checkboxMenu: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

export interface MenuOptionProps {
  text: string;
  label?: string;
  icon?: ReactNode;
  labelColor?: any;
  isDisabled?: boolean;
}

export interface CustomMenuItemProps extends Omit<MenuItemProps, 'id'> {
  id: number;
  option: MenuOptionProps;
  type: 'default' | 'checkbox' | 'label' | 'icon';
  handleMenuItemClick: (payload: any) => void;
  selected?: boolean;
}

export const CustomMenuItem = withStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[200], 0.33),
    },
    '& .MuiIconButton-root': {
      '&:hover': {
        backgroundColor: 'unset',
      },
    },
    '& .MuiTypography-root': {
      lineHeight: '24px',
    },
    '& .MuiCheckbox-root': {
      padding: '8px',
      color: theme.palette.grey[200],
    },
    '& .Mui-checked': {
      color: theme.palette.primary.main,
    },
  },
  selected: {
    color: theme.palette.primary.main,
    backgroundColor: `${theme.palette.common.white} !important`,
    '&:hover': {
      backgroundColor: `${alpha(theme.palette.grey[200], 0.33)} !important`,
    },
  },
}))(MuiMenuItem);

export function renderMenuItem(
  option: MenuOptionProps,
  type: string,
  classes: ReturnType<typeof useStyles>,
  selected?: boolean
): ReactNode {
  switch (type) {
    case 'checkbox':
      return (
        <>
          <Checkbox color="primary" size="small" checked={selected} />
          <Typography>{option.text}</Typography>
        </>
      );
    case 'label':
      return (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{option.text}</Typography>
          <Box sx={{ flexGrow: 1, minWidth: '10px' }} />
          <Chip text={option.label as string} color={option.labelColor} />
        </Box>
      );
    case 'icon':
      return (
        <>
          {option.icon}
          <Typography className={classes.iconText}>{option.text}</Typography>
        </>
      );
    default:
      return <Typography>{option.text}</Typography>;
  }
}

const MenuItem = React.forwardRef<HTMLLIElement, CustomMenuItemProps>(
  ({ id, option, type, handleMenuItemClick, selected }, ref) => {
    const classes = useStyles();

    return (
      <CustomMenuItem
        ref={ref}
        data-testid={`menu-item-${id}`}
        disabled={option.isDisabled}
        selected={selected}
        onClick={() => handleMenuItemClick(id)}
        className={clsx(
          classes.root,
          type === 'checkbox' && classes.checkboxMenu
        )}
      >
        {renderMenuItem(option, type, classes, selected)}
      </CustomMenuItem>
    );
  }
);

export default MenuItem;
