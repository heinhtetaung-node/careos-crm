import { CalendarIcon, EnvelopeIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { Badge, Box, Grid } from '@material-ui/core';
import AddSharpIcon from '@material-ui/icons/AddSharp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import CallSummarySection from 'presentation/components/CallSummarySection/CallSummarySection';
import CancelOrder from 'presentation/components/CancelOrder';
import Controls from 'presentation/components/controls/Control';
import CustomerInfo from 'presentation/components/CustomerInfo';
import CommonButton from 'presentation/components/LeadDetails/CommonButton';
import MarkImportantButton from 'presentation/components/LeadDetails/MarkImportantButton';
import Loader from 'presentation/components/Loader';
import CommentModal from 'presentation/components/modal/CommentModal';
import CommonModal from 'presentation/components/modal/CommonModal';
import MessageModal from 'presentation/components/modal/MessageModal/index';
import OrderScheduleModalSlice from 'presentation/components/modal/OrderScheduleModal/OrderScheduleModalSlice';
import NotFound from 'presentation/components/NotFound';
import DocumentCompleteButton from 'presentation/components/OrderDetailPage/DocumentCompleteButton';
import PoliciesInfo from 'presentation/components/OrderDetailPage/PoliciesInfo';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import VehiclePolicySection from 'presentation/components/VehiclePolicySection/VehiclePolicySection';
import useOrderComments from 'presentation/hooks/useOrderComments';
import CallButtonV2 from 'presentation/components/CallButtonV2';
import { getMailReadCount } from 'presentation/redux/actions/leadDetail/email';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { destroyModalSchedule } from 'presentation/redux/actions/leadDetail/scheduleModal';
import {
  getCallParticipants,
  subscribeLeadUpdates,
} from 'presentation/redux/actions/leads/detail';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { OrderDocumentStatus, OrderQcStatus } from 'shared/constants/orderType';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';

import { GridBoardItem, useDetailPageStyles } from './index.styles';
import { IField } from './InfoPanel/type';
import PolicyholderInfo from './PolicyholderInfo';
import SaleInfo from './SaleInfo';
import { PRODUCTS } from 'config/TypeFilter';
import { BeneficiarySection } from 'presentation/pages/health-insurance/leads/leadDetailsPage/common/component/Beneficiary';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { HealthLead } from 'shared/types/lead';
import PolicyHolderInformation from 'presentation/pages/health-insurance/leads/leadDetailsPage/common/component/PolicyHolderInformation';
import { checkProductIsHealth } from 'shared/constants/productOptions';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';
import CallButtonLiveKit from 'presentation/components/CallButtonLiveKit';

interface IOrderPageProps {
  destroyModalSchedule: () => void;
  hasError: boolean;
  success: boolean;
  isFetching: boolean;
}

export function OrderPage({
  destroyModalSchedule: handleDestroyModalSchedule,
  hasError,
  success,
  isFetching,
}: Readonly<IOrderPageProps>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const classes = useDetailPageStyles();
  const { orderId } = useParams();
  const { data: user } = useGetAuthenticateQuery();

  const [openModal, setOpenModal] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [isOpenScheduleModal, setIsOpenScheduleModal] =
    useState<boolean>(false);
  const [isAllMessageRead, setIsAllMessageRead] = useState<boolean>(true);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [openModalPhone, setOpenModalPhone] = useState(false);
  const [openModalReport, setOpenModalReport] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { unReadMailsCount } = useAppSelector((state) => ({
    unReadMailsCount: state.leadsDetailReducer.emailReducer.data.unReadMails,
  }));

  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const isHealth = checkProductIsHealth(orderDetail?.product);

  const [previousOrderStatus, setPreviousOrderStatus] = useState<string>();

  useEffect(() => {
    if (!previousOrderStatus) {
      setPreviousOrderStatus(orderDetail?.documentStatus);
    } else if (
      previousOrderStatus !== orderDetail?.documentStatus &&
      orderDetail?.documentStatus === 'DOCUMENT_STATUS_COMPLETE' &&
      isHealth
    ) {
      window.location.reload();
    }
  }, [orderDetail?.documentStatus]);

  const lead = useGetLeadSelector() as unknown as HealthLead;
  // Lead resource name (e.g. leads/xxx)
  const leadName: string | undefined = useMemo(
    () => orderDetail?.lead,
    [orderDetail]
  );

  const docsComplete =
    orderDetail && orderDetail.documentStatus === OrderDocumentStatus.COMPLETE;
  const docsFailed =
    orderDetail && orderDetail.documentStatus === OrderDocumentStatus.FAILED;
  const isRejected = orderDetail?.qcStatus === OrderQcStatus.REJECTED;
  const isSaleAgent = user?.role === UserRoleID.SalesAgent;
  const flags = useFlags([
    FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP,
    FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE,
  ]);
  const isRestrictSalesAgentAddPhone =
    flags[
      FeatureFlags
        .BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP
    ]?.enabled ?? false;

  const isCrmWideEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]
      ?.enabled ?? false;

  const hasCancelAccess = [
    UserRoleID.Admin,
    UserRoleID.SuperAdmin,
    UserRoleID.Manager,
    UserRoleID.Supervisor,
    UserRoleID.BackOffice,
    UserRoleID.CiAgent,
    UserRoleID.CiSuperVisor,
  ].includes(user?.role as UserRoleID);
  const isDocsAgent = user?.role === UserRoleID.DocumentsCollection;
  const isInboundAgent = user?.role === UserRoleID.InboundAgent;
  const isAccountingAgent = user?.role === UserRoleID.Accounting;
  const isCiAgent = user?.role === UserRoleID.CiAgent;
  const isCiSupervisor = user?.role === UserRoleID.CiSuperVisor;
  const isReadOnly =
    (isInboundAgent || isAccountingAgent || (isHealth && isSaleAgent)) ?? false;
  const isFullReadOnly = (isCiAgent || isCiSupervisor) ?? false;
  const isAdminRole =
    user?.role === UserRoleID.Admin || user?.role === UserRoleID.SuperAdmin;
  const isBackOffice = user?.role === UserRoleID.BackOffice;

  const unReadMails = unReadMailsCount;

  const [addAndGetComment] = useOrderComments();

  const openPhoneHandle = () => {
    setOpenModalPhone(true);
  };

  const openModalReportHandle = () => {
    setOpenModalReport(true);
  };

  const openMessageModalHandle = () => setShowMessageModal(true);

  const handleCloseScheduleModal = () => {
    handleDestroyModalSchedule();
    setIsOpenScheduleModal(false);
  };

  const onCommentModalClose = () => setShowCommentModal(false);

  const onCommentModalSubmit = (comment: string) => {
    addAndGetComment({ text: comment, orderId }, orderId);
    onCommentModalClose();
  };

  useEffect(() => {
    if (!Number.isNaN(unReadMails)) {
      setIsAllMessageRead(unReadMails === 0);
    }
  }, [unReadMails]);

  useEffect(() => {
    if (orderId) {
      dispatch({
        type: OrderActionTypes.GET_DETAIL,
        payload: {
          orderName: `orders/${orderId}`,
          isFetchCarDetails: false,
        },
      });
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (leadName) {
      const leadId = getLeadIdFromLeadName(leadName);
      dispatch(
        subscribeLeadUpdates({
          leadName: leadId,
        })
      );

      dispatch(getLead({ leadId }));
      dispatch(
        getCallParticipants({
          pageSize: 1,
          filter: `destination.lead.lead="${leadName}"`,
        })
      );
      dispatch(getMailReadCount({ orderLeadId: leadId }));
    }
  }, [dispatch, orderId, leadName]);

  const orderIsCancelled = orderDetail?.isCancelled;

  if (isFetching) {
    return <Loader />;
  }

  if (hasError) {
    return <NotFound />;
  }

  const showFullPaymentStatus = (value: string) =>
    orderIsCancelled ? getString(`tableListing.${value}`) : value;

  const salesInfoPaymentField: IField = {
    title: 'paymentStatus',
    value: showFullPaymentStatus(
      orderDetail?.isFullyPaid ? 'fullyPaid' : 'notFullyPaid'
    ),
    type: orderIsCancelled ? 'text' : 'select',
    name: 'isFullyPaid',
    testId: 'sales-payment-status',
    disabled: orderIsCancelled,
  };

  const showFixQCButton = isRejected && (isSaleAgent || isAdminRole);
  const showDocumentButtons =
    isDocsAgent || isAdminRole || (isHealth && isBackOffice);
  const showCancelButton = hasCancelAccess;
  if (!leadName) {
    return null;
  }
  return (
    <>
      <Helmet title="Order Page" />
      {success && (
        <>
          <Grid
            item
            xs={12}
            md={12}
            data-testid="order-detail-page"
            className={classes.leadDetailPage}
          >
            <Grid container direction="row">
              <Grid
                item
                container
                lg={7}
                md={7}
                direction="row"
                justifyContent="flex-start"
              >
                <div className="flex flex-wrap px-3 gap-[5px] whitespace-nowrap h-fit">
                  <Controls.Button
                    data-testid="schedule-modal"
                    text={getString('text.appointmentBtn')}
                    color="primary"
                    variant="outlined"
                    icon={<CalendarIcon fontSize="small" />}
                    onClick={() => setIsOpenScheduleModal(true)}
                  />
                  <MarkImportantButton />
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={isAllMessageRead}
                  >
                    <Button
                      variant="secondary"
                      text={
                        <>
                          <AddSharpIcon />
                          {getString('text.message')}
                        </>
                      }
                      onClick={openMessageModalHandle}
                      icon={<EnvelopeIcon className="envelope-icon" />}
                      className="px-1 h-10 normal-case mr-1 border-[1px] border-[#b0c6e3]"
                      disabled={false}
                    />
                  </Badge>
                  {isCrmWideEnableCallButtonLiveKit ? (
                    <div className="mr-1">
                      <CallButtonLiveKit
                        customerId={orderDetail?.customer?.name}
                      />
                    </div>
                  ) : (
                    <CallButtonV2
                      customerId={orderDetail?.customer?.name}
                      onCallEnd={() => setShowCommentModal(true)}
                    />
                  )}
                  {showDocumentButtons && (
                    <>
                      <DocumentCompleteButton
                        orderId={orderId!}
                        isDisabled={orderIsCancelled}
                      />
                      <CommonButton
                        data-testid="update--doc-status-failed"
                        type="update--order--doc-status"
                        color="danger"
                        isDisabled={
                          docsComplete || docsFailed || orderIsCancelled
                        }
                        onClick={openModalReportHandle}
                        docStatus={OrderDocumentStatus.FAILED}
                        open={openModalReport}
                        close={() => setOpenModalReport(false)}
                        handleCloseModal={() => setOpenModalReport(false)}
                        title=""
                        modalClass="order-update-modal"
                        hasGreyBg
                      >
                        {getString('text.reportProblem')}
                      </CommonButton>
                    </>
                  )}
                  {showFixQCButton && (
                    <Controls.Button
                      data-testid="fix-qc-issues-btn"
                      color="primary"
                      className="shared-button__matbutton"
                      isDisabled={orderIsCancelled}
                      onClick={() =>
                        navigate(
                          `${isHealth ? '/health' : ''}/orders/qc/${orderId}`
                        )
                      }
                    >
                      {getString('qc.fixQcIssues')}
                    </Controls.Button>
                  )}
                  {showCancelButton && (
                    <Box mr={2}>
                      <CancelOrder
                        orderId={orderId!}
                        isCancelled={orderIsCancelled}
                        paymentStatus={
                          orderDetail?.isFullyPaid
                            ? 'fullyPaid'
                            : 'notFullyPaid'
                        }
                      />
                    </Box>
                  )}
                </div>
              </Grid>
              <Grid
                item
                container
                lg={5}
                md={5}
                direction="row"
                justifyContent="flex-end"
              >
                <Grid item>
                  <CallSummarySection id={`orders/${orderId}`} />
                </Grid>
                <Grid item>
                  <Box display="flex">
                    <CommonButton
                      data-testid="add-phone-modal"
                      type="phone--order"
                      variant="outlined"
                      color="primary"
                      onClick={openPhoneHandle}
                      open={openModalPhone}
                      close={() => setOpenModalPhone(false)}
                      handleCloseModal={() => setOpenModalPhone(false)}
                      title={getString('text.addPhoneTitle')}
                      modalClass="phone-modal"
                      customerId={orderDetail?.customer?.name || ''}
                      isDisabled={isRestrictSalesAgentAddPhone && isSaleAgent}
                    >
                      <AddSharpIcon fontSize="small" />
                      {getString('text.phone')}
                    </CommonButton>

                    <CommonButton
                      type="email--order"
                      variant="outlined"
                      color="primary"
                      onClick={() => setOpenModal(true)}
                      open={openModal}
                      close={() => setOpenModal(false)}
                      handleCloseModal={() => setOpenModal(false)}
                      title={getString('text.addNewEmailAddress')}
                      modalClass="email-modal"
                      customerId={orderDetail?.customer?.name || ''}
                      isDisabled={isFullReadOnly}
                    >
                      <AddSharpIcon fontSize="small" />
                      {getString('text.email')}
                    </CommonButton>

                    <CommonButton
                      type="address"
                      variant="outlined"
                      color="primary"
                      modalSize="md"
                      onClick={() => setOpenAddress(true)}
                      open={openAddress}
                      close={() => setOpenAddress(false)}
                      handleCloseModal={() => setOpenAddress(false)}
                      title={getString('text.addNewAddress')}
                      modalClass="address-modal"
                      isModalReadOnly={isFullReadOnly || orderIsCancelled}
                    >
                      <KeyboardArrowDownIcon className="address-icon" />
                      {getString('text.address')}
                    </CommonButton>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              className="lead-detail-page__boards"
            >
              <Grid
                item
                xs={12}
                container
                md={12}
                lg={12}
                xl={8}
                direction="row"
              >
                <GridBoardItem
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  className="lead-detail-page__boards__item"
                >
                  <Box sx={{ pb: 2, width: '100%' }}>
                    <CustomerInfo
                      isSupervisorOrSalesAgent={[
                        UserRoleID.Supervisor,
                        UserRoleID.SalesAgent,
                      ].includes(user?.role as UserRoleID)}
                      readOnly={
                        isReadOnly || isFullReadOnly || orderIsCancelled
                      }
                      isHealthOrder={
                        orderDetail?.product ===
                        PRODUCTS.HEALTH_PRODUCT_INSURANCE
                      }
                    />
                  </Box>

                  <Box sx={{ pb: 2, width: '100%' }}>
                    {orderDetail?.product ===
                      PRODUCTS.CAR_PRODUCT_INSURANCE && (
                      <PolicyholderInfo
                        readOnly={
                          isReadOnly || isFullReadOnly || orderIsCancelled
                        }
                      />
                    )}
                    {orderDetail?.product ===
                      PRODUCTS.HEALTH_PRODUCT_INSURANCE &&
                      lead?.name && (
                        <PolicyHolderInformation
                          isFieldDisabled={isReadOnly || orderIsCancelled}
                          isHealthOrder
                          isPartiallyDisabled
                          policyHolderType={lead?.data?.policyHolder?.type}
                        />
                      )}
                  </Box>
                </GridBoardItem>

                <GridBoardItem
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  className="lead-detail-page__boards__item"
                >
                  <SaleInfo
                    includeFields={['Shipment Fee']}
                    extraFields={isAdminRole ? [salesInfoPaymentField] : []}
                  />
                </GridBoardItem>

                <GridBoardItem
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  className="lead-detail-page__boards__item"
                >
                  <Box sx={{ pb: 2, width: '100%' }}>
                    {orderDetail?.product ===
                      PRODUCTS.CAR_PRODUCT_INSURANCE && (
                      <VehiclePolicySection
                        readOnly={
                          isReadOnly || isFullReadOnly || orderIsCancelled
                        }
                      />
                    )}
                    {orderDetail?.product ===
                      PRODUCTS.HEALTH_PRODUCT_INSURANCE &&
                      lead?.name && (
                        <BeneficiarySection
                          isHealthOrder
                          isFieldDisabled={isReadOnly || orderIsCancelled}
                        />
                      )}
                  </Box>

                  <Box sx={{ pb: 2, width: '100%' }}>
                    <PoliciesInfo
                      isReadOnly={
                        isAccountingAgent || isFullReadOnly || orderIsCancelled
                      }
                      insuranceCategory={lead?.data?.insurance?.category}
                    />
                  </Box>
                </GridBoardItem>
              </Grid>

              <Grid
                item
                xs={12}
                md={12}
                lg={12}
                xl={4}
                className="lead-detail-page__boards__activity"
              >
                <ActivityOrderSection
                  isDocPanelDisabled={isReadOnly || orderIsCancelled}
                  enablePreviewModalDraggable
                />
              </Grid>
            </Grid>
          </Grid>

          <MessageModal
            className="jacky-modal"
            openDialog={showMessageModal}
            closeDialog={setShowMessageModal}
            orderLeadId={orderDetail?.lead?.split('/')[1] || ''}
          />
          <OrderScheduleModalSlice
            isOpen={isOpenScheduleModal}
            onClose={() => handleCloseScheduleModal()}
          />
          <CommonModal
            title={getString('text.summary')}
            open={showCommentModal}
            handleCloseModal={onCommentModalClose}
            // This is so dumb
            isShowCloseBtn={false}
          >
            <CommentModal onSubmit={onCommentModalSubmit} />
          </CommonModal>
        </>
      )}
    </>
  );
}

const mapStateToProps = (state: any) => ({
  isFetching: state.order.isFetching,
  hasError: !state.order.isFetching && !state.order.success,
  success: state.order.success && Object.keys(state.order.payload).length > 0,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      destroyModalSchedule,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(OrderPage);
