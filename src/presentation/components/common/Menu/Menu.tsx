import { Menu as MuiMenu, MenuProps as MuiMenuProps } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { alpha, withStyles } from '@material-ui/core/styles';
import React, {
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  useRef,
  useState,
} from 'react';

import MenuItem, { MenuOptionProps } from './MenuItem';

const MatMenu = withStyles((theme) => ({
  paper: {
    border: `1px solid ${theme.palette.primary.main} !important`,
    boxShadow: `0px 7px 15px ${alpha('#2a31cb', 0.1)} !important`,
    borderRadius: '4px !important',
    '& .MuiList-padding': {
      paddingTop: '8px',
      paddingBottom: '8px',
    },
    '& .MuiMenu-list li:first-child::after': {
      height: '0 !important',
    },
    '& .MuiMenuItem-root': {
      minHeight: '48px',
    },
  },
}))(MuiMenu);

interface RenderProps {
  handleMenu: MouseEventHandler<HTMLElement>;
  anchorRef: MutableRefObject<HTMLDivElement | null>;
}

interface MenuProps extends Omit<MuiMenuProps, 'children' | 'open'> {
  options: MenuOptionProps[];
  initialOption?: number;
  handleMenuSelect?: any;
  type: 'default' | 'checkbox' | 'label' | 'icon';
  children?: (props: RenderProps) => ReactNode;
  btnText?: string;
  menuTestid?: string;
}

function Menu({
  options = [],
  handleMenuSelect = () => null,
  initialOption = 0,
  type,
  children,
  btnText = 'Click to open menu',
  menuTestid,
  ...rest
}: MenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialOption);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const anchorElement = anchorRef.current || anchorEl;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (id: number) => {
    setSelectedIndex(id);
    handleMenuSelect(id);
    handleClose();
  };

  return (
    <>
      {!children ? (
        <Button
          aria-controls="menu-component"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {btnText}
        </Button>
      ) : (
        children({
          handleMenu: handleClick,
          anchorRef,
        })
      )}

      <MatMenu
        id="menu-component"
        data-testid={menuTestid === '' ? 'menu-component' : menuTestid}
        anchorEl={anchorElement}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        getContentAnchorEl={null}
        {...rest}
      >
        {options?.map((option: MenuOptionProps, index: number) => (
          <MenuItem
            // Use index to set current selected menu item
            id={index}
            key={option.text}
            type={type}
            option={option}
            selected={index === selectedIndex}
            handleMenuItemClick={handleMenuItemClick}
          />
        ))}
      </MatMenu>
    </>
  );
}

export default Menu;
