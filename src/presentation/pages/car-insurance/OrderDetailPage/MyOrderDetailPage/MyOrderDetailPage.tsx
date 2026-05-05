import { CalendarIcon, EnvelopeIcon } from '@alphafounders/icons';
import { Button as ModalBtn } from '@alphafounders/ui';
import { Badge, Box, Grid } from '@material-ui/core';
import AddSharpIcon from '@material-ui/icons/AddSharp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import MyOrderCallSummarySection from 'presentation/components/CallSummarySection/CallSummarySection';
import Controls from 'presentation/components/controls/Control';
import MyOrderCustomerInfo from 'presentation/components/CustomerInfo';
import DialogButton from 'presentation/components/LeadDetails/CommonButton';
import MarkImportantButton from 'presentation/components/LeadDetails/MarkImportantButton';
import Loader from 'presentation/components/Loader';
import CancelOrder from 'presentation/components/CancelOrder';
import CommentModal from 'presentation/components/modal/CommentModal';
import CommonModal from 'presentation/components/modal/CommonModal';
import MessageModal from 'presentation/components/modal/MessageModal/index';
import OrderScheduleModalSlice from 'presentation/components/modal/OrderScheduleModal/OrderScheduleModalSlice';
import CallButtonV2 from 'presentation/components/CallButtonV2';
import NotFound from 'presentation/components/NotFound';
import PoliciesInfo from 'presentation/components/OrderDetailPage/PoliciesInfo';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import MyOrderVehiclePolicySection from 'presentation/components/VehiclePolicySection/VehiclePolicySection';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { getMailReadCount } from 'presentation/redux/actions/leadDetail/email';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { destroyModalSchedule } from 'presentation/redux/actions/leadDetail/scheduleModal';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { OrderQcStatus } from 'shared/constants/orderType';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';

import { GridBoardItem, useDetailPageStyles } from '../index.styles';
import MyOrderPolicyholderInfo from '../PolicyholderInfo';
import MyOrderSaleInfo from '../SaleInfo';
import CallButtonLiveKit from 'presentation/components/CallButtonLiveKit';

const { Button } = Controls;

type OrderDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderLeadId: string;
};

function OrderDetailModal({
  isOpen,
  onClose,
  orderLeadId,
}: OrderDetailModalProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (orderLeadId) {
      dispatch(getMailReadCount({ orderLeadId }));
    }
  }, [dispatch, orderLeadId]);

  return (
    <MessageModal
      className="jacky-modal"
      openDialog={isOpen}
      closeDialog={onClose}
      orderLeadId={orderLeadId}
    />
  );
}

export default function OrderPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const classes = useDetailPageStyles();
  const { orderId } = useParams();

  const [openModal, setOpenModal] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [openModalPhone, setOpenModalPhone] = useState(false);
  const [isOpenScheduleModal, setIsOpenScheduleModal] =
    useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isAllMessageRead, setIsAllMessageRead] = useState<boolean>(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { unReadMailsCount } = useAppSelector((state) => ({
    unReadMailsCount: state.leadsDetailReducer.emailReducer.data.unReadMails,
  }));
  const isOrderLoading = useAppSelector((state) => state.order.isFetching);

  const success = useAppSelector(
    (state) =>
      state.order.success && Object.keys(state.order.payload).length > 0
  );
  const hasError = useAppSelector(
    (state) => !state.order.isFetching && !state.order.success
  );
  const order = useAppSelector((state) => state.order?.payload);

  const orderLeadId = order?.lead?.split('/')[1] || '';

  useEffect(() => {
    if (orderLeadId) {
      dispatch(getLead({ leadId: orderLeadId }));
    }
  }, [dispatch, orderLeadId]);

  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();

  const [addAndGetComment] = useOrderComments();

  const isLoading = isOrderLoading || isUserLoading;
  const isReadOnly = user?.role === UserRoleID.SalesAgent;
  const isSaleAgent = isReadOnly;
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

  const unReadMails = unReadMailsCount;
  const openMessageModalHandle = () => setShowMessageModal(true);
  const closeMessageModalHandle = () => setShowMessageModal(false);

  const closeScheduleModal = () => {
    dispatch(destroyModalSchedule());
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

  if (isLoading) {
    return <Loader />;
  }

  if (hasError) {
    return <NotFound />;
  }

  const isRejected = order?.qcStatus === OrderQcStatus.REJECTED;
  const showCancelButton = [
    UserRoleID.Admin,
    UserRoleID.SuperAdmin,
    UserRoleID.Manager,
    UserRoleID.Supervisor,
    UserRoleID.BackOffice,
    UserRoleID.CiAgent,
    UserRoleID.CiSuperVisor,
  ].includes(user?.role as UserRoleID);

  return (
    <>
      <Helmet title="My Order Page" />
      {success && (
        <>
          <Grid item xs={12} md={12}>
            <div
              className={classes.leadDetailPage}
              data-testid="my-order-detail-page"
            >
              <Grid
                container
                direction="row"
                className="lead-detail-page__header"
              >
                <Grid
                  item
                  container
                  lg={7}
                  md={7}
                  direction="row"
                  justifyContent="flex-start"
                >
                  <Box display="flex" px={3} whiteSpace="nowrap">
                    <Button
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
                      <ModalBtn
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
                        <CallButtonLiveKit customerId={order?.customer?.name} />
                      </div>
                    ) : (
                      <CallButtonV2
                        customerId={order?.customer?.name}
                        onCallEnd={() => setShowCommentModal(true)}
                      />
                    )}
                    {isRejected && isSaleAgent && (
                      <Controls.Button
                        data-testid="fix-qc-issues-btn"
                        color="primary"
                        className="shared-button__matbutton"
                        onClick={() => navigate(`/orders/qc/${orderId}`)}
                      >
                        {getString('qc.fixQcIssues')}
                      </Controls.Button>
                    )}
                    {showCancelButton && (
                      <Box mr={2}>
                        <CancelOrder
                          orderId={orderId!}
                          isCancelled={order?.isCancelled}
                          paymentStatus={
                            order?.isFullyPaid ? 'fullyPaid' : 'notFullyPaid'
                          }
                        />
                      </Box>
                    )}
                  </Box>
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
                    <MyOrderCallSummarySection id={`orders/${orderId}`} />
                  </Grid>
                  <Grid item>
                    <Box display="flex">
                      <DialogButton
                        data-testid="add-phone-modal"
                        type="phone--order"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setOpenModalPhone(true);
                        }}
                        open={openModalPhone}
                        close={() => setOpenModalPhone(false)}
                        handleCloseModal={() => setOpenModalPhone(false)}
                        title={getString('text.addPhoneTitle')}
                        modalClass="phone-modal"
                        customerId={order?.customer?.name || ''}
                        isDisabled={isRestrictSalesAgentAddPhone && isSaleAgent}
                      >
                        <AddSharpIcon fontSize="small" />
                        {getString('text.phone')}
                      </DialogButton>

                      <DialogButton
                        type="email--order"
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenModal(true)}
                        open={openModal}
                        close={() => setOpenModal(false)}
                        handleCloseModal={() => setOpenModal(false)}
                        title={getString('text.addNewEmailAddress')}
                        modalClass="email-modal"
                        customerId={order?.customer?.name || ''}
                      >
                        <AddSharpIcon fontSize="small" />
                        {getString('text.email')}
                      </DialogButton>

                      <DialogButton
                        type="address"
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenAddress(true)}
                        open={openAddress}
                        close={() => setOpenAddress(false)}
                        handleCloseModal={() => setOpenAddress(false)}
                        title={getString('text.addNewAddress')}
                        modalClass="address-modal"
                      >
                        <KeyboardArrowDownIcon className="address-icon" />
                        {getString('text.address')}
                      </DialogButton>
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
                    <div className="pb-2 w-100">
                      <MyOrderCustomerInfo readOnly={isReadOnly} />
                    </div>

                    <div className="pb-2 w-100">
                      <MyOrderPolicyholderInfo readOnly={isReadOnly} />
                    </div>
                  </GridBoardItem>

                  <GridBoardItem
                    item
                    xs={12}
                    md={4}
                    lg={4}
                    className="lead-detail-page__boards__item"
                  >
                    <MyOrderSaleInfo includeFields={['Shipment Fee']} />
                  </GridBoardItem>

                  <GridBoardItem
                    item
                    xs={12}
                    md={4}
                    lg={4}
                    className="lead-detail-page__boards__item"
                  >
                    <div className="pb-2 w-100">
                      <MyOrderVehiclePolicySection readOnly={isReadOnly} />
                    </div>

                    <div className="pb-2 w-100">
                      <PoliciesInfo isReadOnly={isReadOnly} covernoteDownload />
                    </div>
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
                  <ActivityOrderSection isDocPanelDisabled={isReadOnly} />
                </Grid>
              </Grid>
            </div>
          </Grid>
          <OrderScheduleModalSlice
            isOpen={isOpenScheduleModal}
            onClose={closeScheduleModal}
          />
          <CommonModal
            title={getString('text.summary')}
            open={showCommentModal}
            handleCloseModal={onCommentModalClose}
            isShowCloseBtn={false}
          >
            <CommentModal onSubmit={onCommentModalSubmit} />
          </CommonModal>
        </>
      )}
      <OrderDetailModal
        orderLeadId={orderLeadId}
        isOpen={showMessageModal}
        onClose={closeMessageModalHandle}
      />
    </>
  );
}
