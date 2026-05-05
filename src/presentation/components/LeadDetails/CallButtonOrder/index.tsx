/* eslint-disable react/forbid-component-props */
import { PhoneOutlineIcon } from '@alphafounders/icons';
import { Box, Chip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import React, { useState, useRef } from 'react';

import { getString } from 'presentation/theme/localization';
import { maskPhoneNumber } from 'shared/helper/utilities';

interface IPhoneNumberProps {
  phone: string;
  phoneIndex: number;
  status: string;
}

const reversedPhoneNumbers = [
  {
    phone: '+66889999999',
    status: 'unverified',
    phoneIndex: 1,
  },
  {
    phone: '+66879740465',
    status: 'unverified',
    phoneIndex: 0,
  },
];

function CallButton() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup variant="outlined" color="primary" ref={anchorRef}>
        <Button>
          <Box display="flex" mr={1}>
            <PhoneOutlineIcon fontSize="small" />
          </Box>
          {getString('text.call')}
          <Box ml={2}>
            {maskPhoneNumber(reversedPhoneNumbers[selectedIndex].phone)}
          </Box>
        </Button>
        <Button
          color="primary"
          size="large"
          style={{ paddingLeft: '5px', paddingRight: '5px' }}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        style={{ zIndex: 1 }}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper variant="outlined">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {reversedPhoneNumbers.map(
                    ({ phone, status }: IPhoneNumberProps, index: number) => (
                      <MenuItem
                        key={phone}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {maskPhoneNumber(phone)}
                        <Box ml={3}>
                          <Chip
                            size="small"
                            label={getString(`text.${status}`)}
                            color="primary"
                          />
                        </Box>
                      </MenuItem>
                    )
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default CallButton;
