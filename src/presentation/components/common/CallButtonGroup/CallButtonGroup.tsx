import { PhoneOutlineIcon } from '@alphafounders/icons';
import { ButtonGroup as MuiButtonGroup } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpandMore from '@material-ui/icons/ExpandMore';
import PhoneDisabledIcon from '@material-ui/icons/PhoneDisabled';
import PhoneForwardedIcon from '@material-ui/icons/PhoneForwarded';
import clsx from 'clsx';
import React, { useState, useRef } from 'react';

import { maskPhoneNumber } from 'shared/helper/utilities';

import CommonButton from '../Button/CommonButton';
import Menu from '../Menu';
import { MenuOptionProps } from '../Menu/MenuItem';

interface CallButtonGroupProps {
  phoneNumbers: PhoneNumberProps[];
  disabled?: boolean;
}

interface PhoneNumberProps {
  phone: string;
  phoneIndex: number;
  status: string;
}

const ButtonGroupStyled = withStyles(() => ({
  root: {
    '& .MuiButton-outlined': {
      padding: '8px 10px',
    },
  },
}))(MuiButtonGroup);

const useCallActionBtnStyles = makeStyles({
  root: {
    marginRight: '0.625rem',
    '& .MuiButton-startIcon': {
      '& .MuiSvgIcon-root.MuiSvgIcon-fontSizeSmall': {
        fontSize: '1.25rem',
      },
      marginRight: '0.625rem',
    },
  },
  iconSizeSmall: {
    fontSize: '1.25rem',
  },
  label: {
    '& .MuiCircularProgress-root.MuiCircularProgress-indeterminate': {
      marginRight: '.5rem',
    },
  },
});

const PhoneCallTimer = withStyles((theme: Theme) => ({
  root: {
    display: 'inline-block',
    marginLeft: '0.625rem',
    color: theme.palette.success.main,
    fontSize: '0.6875rem',
  },
}))(Typography);

const PhoneButtonLabel = withStyles({
  root: { fontWeight: 600, fontSize: '14px' },
})(Typography);

export default function CallButtonGroup(props: CallButtonGroupProps) {
  const actionBtnClasses = useCallActionBtnStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [call, setStartUpCall] = useState(false);
  const [connected, setConnected] = useState(false);
  // Remove this mutable ref when actual call integration added.
  const timeoutId = useRef<any>();

  // derived options from array of phone number
  const options = props.phoneNumbers.map<MenuOptionProps>((phone) => ({
    text: phone.phone,
    label: 'verified',
    labelColor: 'success',
  }));

  const startCallUp = () => {
    // Remove startCallUp function body should remove when actual call integration is added.
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setConnected(false);
    setStartUpCall(true);
    timeoutId.current = setTimeout(() => {
      setConnected(true);
    }, 3000);
  };

  const hungUpCall = () => {
    // Remove hungUpCall function body should remove when actual call integration is added.
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setStartUpCall(false);
    setConnected(false);
  };

  const transferCall = () => {
    console.log('transfer call');
  };

  return (() => {
    if (!call) {
      return (
        <Menu
          initialOption={selectedIndex}
          handleMenuSelect={setSelectedIndex}
          type="label"
          options={options}
        >
          {({ handleMenu, anchorRef }) => (
            <ButtonGroupStyled ref={anchorRef} disabled={!!props.disabled}>
              <CommonButton
                onClick={() => {
                  startCallUp();
                }}
                startIcon={<PhoneOutlineIcon fontSize="small" />}
                variant="outlined"
                color="default"
              >
                <PhoneButtonLabel>
                  {maskPhoneNumber(options[selectedIndex].text)}
                </PhoneButtonLabel>
              </CommonButton>
              <CommonButton
                onClick={handleMenu}
                variant="outlined"
                color="default"
              >
                <ExpandMore />
              </CommonButton>
            </ButtonGroupStyled>
          )}
        </Menu>
      );
    }
    return (
      <>
        {!connected ? (
          <CommonButton
            className={clsx(actionBtnClasses.root, actionBtnClasses.label)}
            variant="text"
            color="default"
            size="large"
            data-testid="connecting-btn"
            disabled
          >
            <CircularProgress color="inherit" size={16} />
            <PhoneButtonLabel>
              {maskPhoneNumber(options[selectedIndex].text)}
            </PhoneButtonLabel>
          </CommonButton>
        ) : (
          <CommonButton
            className={clsx(
              actionBtnClasses.root,
              actionBtnClasses.iconSizeSmall
            )}
            startIcon={<PhoneForwardedIcon fontSize="small" />}
            size="large"
            onClick={transferCall}
            variant="outlined"
            color="default"
          >
            <PhoneButtonLabel>Transfer</PhoneButtonLabel>
          </CommonButton>
        )}
        <CommonButton
          size="large"
          variant="contained"
          data-testid="hung-up-btn"
          color="danger"
          onClick={hungUpCall}
        >
          <PhoneDisabledIcon fontSize="small" />
        </CommonButton>
        {connected && (
          <PhoneCallTimer data-testid="call-timer">2:30</PhoneCallTimer>
        )}
      </>
    );
  })();
}
