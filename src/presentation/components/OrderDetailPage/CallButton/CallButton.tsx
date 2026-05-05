import { PhoneOutlineIcon } from '@alphafounders/icons';
import { Box, makeStyles, Radio } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  useGetCustomerPhoneNumberQuery,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import { PhoneResponse } from 'data/slices/customerSlice/types';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { maskPhoneNumber } from 'shared/helper/utilities';

import primaryPhoneToFirst from './helper';

interface CallButtonProps {
  customerId: string;
}

const useStyles = makeStyles(() => ({
  phoneList: {
    padding: 0,
  },
  dropDown: {
    paddingLeft: '5px',
    paddingRight: '5px',
  },
}));

function CallButton({ customerId }: CallButtonProps) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);
  const { data: customerInfo, isSuccess: getCustomerInfoSuccess } =
    useGetCustomerQuery(customerId);

  const { data: phoneList, isSuccess: getPhoneListSuccess } =
    useGetCustomerPhoneNumberQuery(
      { customerName: customerId },
      {
        skip: !customerId,
      }
    );

  const [primaryPhoneIndex, setPrimaryPhoneIndex] = useState(0);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneResponse[]>();
  const [
    updateCustomer,
    {
      isSuccess: isUpdateCustomerSuccess,
      isError: isUpdateCustomerError,
      error: updateCustomerError,
    },
  ] = useUpdateCustomerMutation();

  useEffect(() => {
    if (!phoneList || !getPhoneListSuccess) return;
    setPhoneNumbers(phoneList?.phones);
  }, [phoneList, getPhoneListSuccess]);

  useEffect(() => {
    if (!customerInfo || !getCustomerInfoSuccess || !phoneNumbers) return;
    const findPrimaryPhoneIndex = phoneNumbers?.findIndex(
      (phoneObject: PhoneResponse) =>
        phoneObject?.name === customerInfo?.primaryPhoneId
    );
    setPrimaryPhoneIndex(
      findPrimaryPhoneIndex > -1 ? findPrimaryPhoneIndex : 0
    );
  }, [customerInfo, getCustomerInfoSuccess, phoneList, phoneNumbers]);

  React.useEffect(() => {
    if (isUpdateCustomerError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message:
            updateCustomerError && (updateCustomerError as any)?.data.message,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    if (isUpdateCustomerSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateCustomerSuccess'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateCustomerError, isUpdateCustomerSuccess]);

  const reversedPhoneNumbers = primaryPhoneToFirst(
    phoneNumbers,
    primaryPhoneIndex
  );

  const handleMenuItemClick = (phoneIndex: number) => {
    setSelectedPhoneIndex(phoneIndex);
    setOpen(false);
  };

  const handleChangePrimaryContact = async (phoneIndex: number) => {
    setOpen(false);
    const newPrimaryPhone = reversedPhoneNumbers
      ? reversedPhoneNumbers[phoneIndex].name
      : undefined;
    if (!newPrimaryPhone) return;

    await updateCustomer({
      customerId,
      payload: {
        primaryPhoneId: newPrimaryPhone,
      },
    });

    setSelectedPhoneIndex(0);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const startUpCall = (phoneIndex: number) => {
    // NOTE: Integrated the call feature later
    console.log('Call feature', phoneIndex);
  };

  const selectedPhone =
    reversedPhoneNumbers && reversedPhoneNumbers[selectedPhoneIndex]?.phone;

  if (reversedPhoneNumbers.length <= 0) {
    return <Box data-testid="no-phone-numbers" />;
  }

  return (
    <Box mr={2}>
      <ButtonGroup
        data-testid="call-button"
        variant="outlined"
        color="primary"
        ref={anchorRef}
      >
        <Button
          data-testid="start-call-button"
          onClick={() => {
            startUpCall(selectedPhoneIndex);
          }}
        >
          <Box display="flex" mr={1}>
            <PhoneOutlineIcon />
          </Box>
          {getString('text.call')}
          <Box ml={2}>{selectedPhone && maskPhoneNumber(selectedPhone)}</Box>
        </Button>
        <Button
          color="primary"
          size="large"
          className={classes.dropDown}
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
        className="z-10"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            // eslint-disable-next-line react/forbid-component-props
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper variant="outlined">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {reversedPhoneNumbers.map(
                    ({ phone }: PhoneResponse, phoneIndex: number) => (
                      <MenuItem
                        key={phone}
                        selected={phoneIndex === selectedPhoneIndex}
                        onClick={() => handleMenuItemClick(phoneIndex)}
                        className={classes.phoneList}
                      >
                        <Radio
                          checked={phoneIndex === 0}
                          onClick={() => handleChangePrimaryContact(phoneIndex)}
                          data-testid="primary-radio"
                        />
                        <span className="pr-3">{maskPhoneNumber(phone)}</span>
                      </MenuItem>
                    )
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}

export default CallButton;
