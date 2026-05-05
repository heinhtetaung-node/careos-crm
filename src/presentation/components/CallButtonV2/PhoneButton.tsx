import { PhoneOutlineIcon, TrashIcon } from '@alphafounders/icons';
import { Box, Chip, CircularProgress, Radio } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { ArrowDropDown, PhoneInTalk } from '@material-ui/icons';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Controls from 'presentation/components/controls/Control';
import useAddPhone from 'presentation/components/modal/LeadDetailsModal/PhoneModal/useAddPhone';
import DeletePhoneButton from 'presentation/pages/car-insurance/CustomerDetailsPage/CustomerSections/DeletePhoneButton';
import { CallState } from 'presentation/hooks/useCareosCall';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { maskPhoneNumber } from 'shared/helper/utilities';
import {
  shouldDisableCallButton,
  shouldShowCallButton,
  shouldShowHangupButton,
} from './helper';
import CallTimer from './Timer';
import { UserRoleID } from '../ProtectedRouteHelper';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import useSnackbar from 'utils/snackbar';
import {
  useGetCustomerPhoneNumberQuery,
  useCreatePhoneNumberMutation,
} from 'data/slices/customerSlice';

interface PhoneButtonProps {
  customerId?: string;
  startCall: (lead: string, phoneIndex: number) => void;
  endCall: () => void;
  disabled?: boolean;
  callState?: CallState;
  onCallTimerTick?: (val: number) => void;
}
interface PhoneProps {
  phone: string;
  name: string;
}
function PhoneButton({
  customerId,
  disabled,
  startCall,
  endCall,
  onCallTimerTick,
  callState = 'idle',
}: PhoneButtonProps) {
  const { showErrorSnackbar } = useSnackbar();
  const anchorRef = useRef<HTMLDivElement>(null);
  const { data: user } = useGetAuthenticateQuery();
  const { data: customerPhoneList } = useGetCustomerPhoneNumberQuery(
    {
      customerName: customerId ?? '',
    },
    {
      skip: !customerId,
    }
  );
  const [createPhone, { data: createdPhone }] = useCreatePhoneNumberMutation();
  const [open, setOpen] = useState(false);
  const [isModal, setModal] = useState<{
    show: boolean;
    phone: PhoneProps | null;
  }>({ show: false, phone: null });
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);
  const lead = useGetLeadSelector();
  const { setPrimaryPhoneIndex, setPrimaryPhoneForCustomer } = useAddPhone();
  const { customerPhoneNumber, primaryPhoneIndex } = useMemo(
    () => ({
      customerPhoneNumber: lead.data?.customerPhoneNumber,
      primaryPhoneIndex: lead.data?.primaryPhoneIndex,
    }),
    [lead?.data]
  );
  const orderedPhoneNumbers = useMemo(() => {
    const newPhoneNumberList =
      customerPhoneNumber
        ?.map((number, index) => ({
          ...number,
          phoneIndex: index,
        }))
        .slice(0)
        .reverse() ?? [];
    return [
      ...newPhoneNumberList.filter((x) => x.phoneIndex === primaryPhoneIndex),
      ...newPhoneNumberList.filter((x) => x.phoneIndex !== primaryPhoneIndex),
    ];
  }, [lead.data, customerPhoneNumber, primaryPhoneIndex]);
  useEffect(() => {
    setSelectedPhoneIndex(primaryPhoneIndex);
  }, [primaryPhoneIndex]);
  const handleMenuItemClick = (phoneIndex: number) => {
    setSelectedPhoneIndex(phoneIndex);
    setOpen(false);
  };
  useEffect(() => {
    if (createdPhone && customerId) {
      const phoneNumber = createdPhone?.phone?.replace('+', '') || '';
      setPrimaryPhoneForCustomer(phoneNumber, customerId);
    }
  }, [createdPhone]);
  const handleChangePrimaryContact = (phoneIndex: number) => {
    handleMenuItemClick(phoneIndex);
    const selectedPhoneNumber = customerPhoneNumber?.[phoneIndex]?.phone;
    const customerExistingPhone = (customerPhoneList?.phones || []).find(
      (phone) => phone.phone === selectedPhoneNumber
    );
    if (!customerExistingPhone) {
      createPhone({
        phone: selectedPhoneNumber,
        customerName: customerId ?? '',
      });
      setPrimaryPhoneIndex(phoneIndex);
      return;
    }
    if (customerId) {
      const phoneNumber =
        customerPhoneNumber?.[phoneIndex]?.phone?.replace('+', '') || '';
      setPrimaryPhoneForCustomer(phoneNumber, customerId);
    }
    setPrimaryPhoneIndex(phoneIndex);
  };
  const handleMenuToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleDeletePhoneModal = (phone?: PhoneProps) => {
    if (
      ![UserRoleID.Admin, UserRoleID.SuperAdmin].includes(
        user?.role as UserRoleID
      )
    ) {
      showErrorSnackbar(getString('text.onlyAdminCanDeletePhone'));
      return;
    }
    setModal((prevOpen) => ({
      phone: phone ?? null,
      show: !prevOpen.show,
    }));
  };
  return (
    <>
      {shouldShowCallButton(callState) && (
        <Box mr={1}>
          <ButtonGroup
            data-testid="call-button"
            variant="outlined"
            color="primary"
            ref={anchorRef}
            disabled={shouldDisableCallButton(callState)}
          >
            <Button
              data-testid="start-call-button"
              onClick={() => {
                startCall(lead.name, selectedPhoneIndex);
              }}
              disabled={disabled}
            >
              <Box display="flex" mr={1}>
                <PhoneOutlineIcon />
              </Box>
              {getString('text.call')}
              <Box ml={2} className="min-w-[5rem]">
                {maskPhoneNumber(
                  customerPhoneNumber?.[selectedPhoneIndex]?.phone
                )}
              </Box>
              {callState === 'connecting' && (
                <CircularProgress size={20} className="loading" />
              )}
            </Button>
            <Button
              color="primary"
              size="large"
              className="px-1.5"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select"
              aria-haspopup="menu"
              onClick={handleMenuToggle}
              disabled={disabled}
              data-testid="phone-menu-btn"
            >
              <ArrowDropDown />
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
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                  <Paper variant="outlined">
                    <MenuList id="split-button-menu">
                      {orderedPhoneNumbers.map(
                        ({ phone, status, phoneIndex }) => (
                          <MenuItem
                            key={phone}
                            selected={phoneIndex === selectedPhoneIndex}
                            className="p-0"
                          >
                            <Radio
                              checked={phoneIndex === primaryPhoneIndex}
                              onClick={() =>
                                handleChangePrimaryContact(phoneIndex)
                              }
                            />
                            {maskPhoneNumber(phone)}
                            <Box ml={3}>
                              <Chip
                                size="small"
                                label={getString(`text.${status}`)}
                                color="primary"
                              />
                              <Chip
                                onClick={() =>
                                  handleDeletePhoneModal({
                                    phone,
                                    name: '',
                                  })
                                }
                                size="small"
                                label={
                                  <TrashIcon
                                    data-testid="phone-remove-icon"
                                    color="red"
                                    className="mt-2"
                                    fontSize="small"
                                  />
                                }
                                className="bg-white mx-2 !py-3 cursor-pointer"
                              />
                            </Box>
                          </MenuItem>
                        )
                      )}
                    </MenuList>
                  </Paper>
                </ClickAwayListener>
              </Grow>
            )}
          </Popper>
        </Box>
      )}
      {shouldShowHangupButton(callState) && (
        <Controls.Button
          className="py-1"
          variant="contained"
          color="secondary"
          startIcon={<PhoneInTalk />}
          onClick={() => endCall()}
        >
          <div className="leading-[.4rem] flex flex-col gap-3">
            <div>{getString('text.hangUp')}</div>
            {callState === 'incall' && (
              <CallTimer onTimeTick={onCallTimerTick} />
            )}
          </div>
        </Controls.Button>
      )}
      {isModal.show && isModal.phone && (
        <DeletePhoneButton
          phoneData={isModal.phone}
          handleDeleteModal={handleDeletePhoneModal}
          isDeleteModal={isModal.show}
          onSuccess={handleDeletePhoneModal}
        />
      )}
    </>
  );
}
export default PhoneButton;
