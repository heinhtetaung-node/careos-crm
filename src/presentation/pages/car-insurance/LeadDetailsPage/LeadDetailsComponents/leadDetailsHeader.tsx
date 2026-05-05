import { CalendarIcon, EnvelopeIcon, UpdateIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { Badge, Grid } from '@material-ui/core';
import AddSharpIcon from '@material-ui/icons/AddSharp';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { UserRoles } from 'config/constant';
import FeatureFlags from 'config/flagsmithConfig';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useFlags } from 'flagsmith/react';
import CallButtonV2 from 'presentation/components/CallButtonV2';
import CallSummarySection from 'presentation/components/CallSummarySection/CallSummarySection';
import CommonButton from 'presentation/components/LeadDetails/CommonButton';
import MarkImportantButton from 'presentation/components/LeadDetails/MarkImportantButton';
import CommonModal from 'presentation/components/modal/CommonModal';
import SummaryCallModal from 'presentation/components/modal/SummaryCallModal';
import { CallState } from 'presentation/hooks/useCareosCall';
import { getMailReadCount } from 'presentation/redux/actions/leadDetail/email';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { hideModal, showAddressModal } from 'presentation/redux/actions/ui';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';

import { PRODUCTS } from 'config/TypeFilter';
import { useGetTransactionByLeadIdQuery } from 'data/slices/transactionSlice';
import CallButtonLiveKit from 'presentation/components/CallButtonLiveKit';
import ApproveCreditTermButton from '../ApproveCreditTermButton';
import PurchaseButton from '../Purchase';

interface LeadDetailHeaderProps {
  readonly id: string;
  readonly classes: any;
  readonly customerId?: string;
  readonly summaryModalType: any;
  readonly isPageDisabled: boolean;
  readonly isEmailNotiInvisible: boolean;
  readonly isAddressNotiInvisible: boolean;
  readonly isShowCloseSummaryModal: boolean;
  readonly isPartiallyDisabled?: boolean;
  readonly onCallStart?: () => void;
  messageModalHandler: () => void;
  handleOpenSummaryModal: (state: string) => void;
  setOpenScheduleModalOnPage: () => void;
}

function LeadDetailsHeader({
  id,
  classes,
  customerId,
  isPageDisabled,
  summaryModalType,
  isEmailNotiInvisible,
  isAddressNotiInvisible,
  isShowCloseSummaryModal,
  messageModalHandler,
  handleOpenSummaryModal,
  setOpenScheduleModalOnPage,
  isPartiallyDisabled = false,
  onCallStart,
}: LeadDetailHeaderProps) {
  const callRef = useRef<{ status: CallState }>(null);
  const uiState = useAppSelector((state) => state.uiInitReducer);
  const currentUser = useGetUserSelector();

  const lead = useGetLeadSelector();
  const { errors, setFieldTouch } = useLeadDetailError();

  const flags = useFlags([
    FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP,
    FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION,
    FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE,
  ]);
  const isRestrictSalesAgentAddPhone =
    flags[
      FeatureFlags
        .BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP
    ]?.enabled ?? false;

  const isEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]
      ?.enabled ?? false;

  const isCrmWideEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]
      ?.enabled ?? false;

  const isSalesAgent = currentUser?.role === UserRoles.SALE_ROLE;

  const [isAllMessageRead, setIsAllMessageRead] = useState(true);
  const [openModalPhone, setOpenModalPhone] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [openAddress, setOpenAddress] = useState(false);

  const handleCallEnd = useCallback(() => {
    handleOpenSummaryModal(summaryModalType.HANG_UP);
  }, []);

  const { modalConfig, unReadMailsCount, globalProduct } = useAppSelector(
    (state) => ({
      unReadMailsCount: state.leadsDetailReducer.emailReducer.data.unReadMails,
      modalConfig: state.uiInitReducer.modal,
      globalProduct:
        state.typeSelectorReducer.globalProductSelectorReducer.data,
    })
  );

  const { canCall, canEdit, canApproveCreditTerm } = getUserRoleAccessLead(
    currentUser.role as UserRoles,
    globalProduct
  );
  const dispatch = useAppDispatch();

  const unReadMails = unReadMailsCount;

  useEffect(() => {
    dispatch(getMailReadCount());
  }, [dispatch]);

  useEffect(() => {
    if (uiState?.showAddressModal?.isOpen) {
      setOpenAddress(true);
      dispatch(
        showAddressModal({
          isOpen: false,
        })
      );
    }
  }, [uiState]);

  useEffect(() => {
    if (!Number.isNaN(unReadMails)) {
      setIsAllMessageRead(unReadMails === 0);
    }
  }, [unReadMails]);

  const openPhoneHandle = () => {
    setOpenModalPhone(true);
  };

  const handleLeadSummaryModal = () => {
    dispatch(hideModal(CONSTANTS.ModalConfig.leadSummaryCallModal));
  };

  const disableBasedOnProduct = useMemo(
    () =>
      globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE
        ? isPartiallyDisabled
        : isPageDisabled,
    [isPageDisabled, isPartiallyDisabled, globalProduct]
  );
  const isHealthPage = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const isOpenSummaryCallModal = modalConfig
    ? modalConfig[CONSTANTS.ModalConfig.leadSummaryCallModal]
    : false;

  const { data: transactions } = useGetTransactionByLeadIdQuery({
    leadId: lead.name,
  });

  const hasCreatedPayment =
    transactions && transactions?.transactions?.length > 0;

  const isApprovedCreditTerm = !!lead.annotations?.credit_term_approved_at;

  return (
    <Grid
      className={`${classes.grid} lead-detail-page__header`}
      container
      direction="row"
      data-testid="lead-detail-header"
    >
      <Grid
        className={`${classes.grid} pl-10 z-[1]`}
        item
        container
        lg={7}
        md={8}
        direction="row"
        justifyContent="flex-start"
      >
        <Grid
          className={`${classes.grid} lead-detail-page__header__call-action-btn`}
        >
          <MarkImportantButton isDisabled={isPageDisabled || !canEdit} />
          <Button
            text={getString('text.appointmentBtn')}
            variant="secondary"
            className="px-1 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3]"
            icon={<CalendarIcon className="calendar-icon mr-1" />}
            onClick={setOpenScheduleModalOnPage}
            disabled={isPageDisabled || !canEdit}
          />
          <Badge color="error" variant="dot" invisible={isAllMessageRead}>
            <Button
              variant="secondary"
              text={
                <>
                  <AddSharpIcon />
                  {getString('text.message')}
                </>
              }
              onClick={messageModalHandler}
              icon={<EnvelopeIcon className="envelope-icon" />}
              className="px-1 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3]"
              disabled={disableBasedOnProduct || !canEdit}
            />
          </Badge>
          {(isEnableCallButtonLiveKit && !isHealthPage) ||
          isCrmWideEnableCallButtonLiveKit ? (
            <div className="mr-1">
              <CallButtonLiveKit
                customerId={customerId ?? ''}
                onCallStart={onCallStart}
                onCallEnd={handleCallEnd}
              />
            </div>
          ) : (
            <CallButtonV2
              customerId={customerId}
              disabled={!canCall}
              ref={callRef}
              onCallStart={onCallStart}
              onCallEnd={handleCallEnd}
            />
          )}
          <Button
            variant="secondary"
            text={getString('Phone book')}
            onClick={() => window.open(`/insurer-phonebook`, '_blank')?.focus()}
            className="px-1 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3]"
            disabled={isPageDisabled || !canEdit}
          />
          <CommonModal
            title={getString('text.summary')}
            open={isOpenSummaryCallModal}
            handleCloseModal={handleLeadSummaryModal}
            isShowCloseBtn={isShowCloseSummaryModal}
            maxWidth="xl"
            titleCenter
          >
            <SummaryCallModal
              enableAppointmentSelection={!isShowCloseSummaryModal}
            />
          </CommonModal>
          {callRef.current?.status !== 'incall' && (
            <Button
              text={getString('text.changeStatus')}
              className="px-2 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3]"
              variant="secondary"
              icon={<UpdateIcon />}
              onClick={() => {
                handleOpenSummaryModal(summaryModalType.CHANGE_STATUS);
              }}
              disabled={isPageDisabled || !canEdit}
            />
          )}

          <PurchaseButton
            lead={lead}
            disabled={
              isPageDisabled ||
              callRef.current?.status === 'incall' ||
              !canEdit ||
              (lead?.data?.checkout?.paymentMethod === 'CREDIT_TERM' &&
                !isApprovedCreditTerm)
            }
          />

          {lead?.data?.checkout?.paymentMethod === 'CREDIT_TERM' && (
            <ApproveCreditTermButton
              disabled={
                lead?.data?.policyHolderType !== 'company' ||
                !canApproveCreditTerm ||
                !hasCreatedPayment ||
                lead?.status === 'LEAD_STATUS_PURCHASED'
              }
            />
          )}
        </Grid>
      </Grid>
      <Grid
        item
        container
        lg={5}
        md={4}
        direction="row"
        justifyContent="flex-end"
        className={` ${classes.grid} lead-detail-page__header__summary-buttons`}
      >
        <Grid item className={`${classes.grid} detail-header__summary`}>
          <CallSummarySection id={`leads/${id}`} />
        </Grid>
        <Grid item className={`${classes.grid} detail-header__buttons`}>
          <CommonButton
            type="phone"
            variant="outlined"
            color="primary"
            onClick={openPhoneHandle}
            open={openModalPhone}
            close={() => setOpenModalPhone(false)}
            handleCloseModal={() => {
              setOpenModalPhone(false);
            }}
            customerId={customerId}
            title={getString('text.addPhoneTitle')}
            modalClass="phone-modal"
            isDisabled={
              disableBasedOnProduct ||
              !canEdit ||
              (isRestrictSalesAgentAddPhone && isSalesAgent)
            }
          >
            <AddSharpIcon />
            {getString('text.phone')}
          </CommonButton>

          <Badge color="error" variant="dot" invisible={isEmailNotiInvisible}>
            <CommonButton
              type="email"
              variant="outlined"
              color={errors.customerEmail ? 'danger' : 'primary'}
              onClick={() => {
                setFieldTouch('customerEmail');
                setOpenModal(true);
              }}
              open={openModal}
              close={() => setOpenModal(false)}
              handleCloseModal={() => {
                setOpenModal(false);
              }}
              title={getString('text.addNewEmailAddress')}
              modalClass="email-modal"
              customerId={customerId}
              isDisabled={disableBasedOnProduct || !canEdit}
            >
              <AddSharpIcon />
              {getString('text.email')}
            </CommonButton>
          </Badge>
          <Badge variant="dot" color="error" invisible={isAddressNotiInvisible}>
            <CommonButton
              type="address"
              variant="outlined"
              color={errors.address ? 'danger' : 'primary'}
              onClick={() => {
                setFieldTouch('address');
                setOpenAddress(true);
              }}
              open={openAddress}
              titleCenter
              close={() => {
                dispatch(getLead());
                setOpenAddress(false);
              }}
              modalSize="md"
              handleCloseModal={() => {
                setOpenAddress(false);
              }}
              title={getString('text.addNewAddress')}
              modalClass="address-modal test-modal"
              leadId={id}
              isDisabled={disableBasedOnProduct || !canEdit}
            >
              <AddSharpIcon />
              {getString('text.address')}
            </CommonButton>
          </Badge>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default LeadDetailsHeader;
