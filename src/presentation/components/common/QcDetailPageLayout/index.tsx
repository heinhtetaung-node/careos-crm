import { StarIcon, EnvelopeIcon, ArrowLeftIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { Box, Grid, Divider, Typography, Badge } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddSharpIcon from '@material-ui/icons/AddSharp';
import { useLocalStorageState } from 'ahooks';
import _get from 'lodash/get';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import {
  addQcOrderDetail,
  QC_QUESTIONS_KEY,
  qcDetailInit,
} from 'data/slices/qcSlice/reducer';
import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import CallButtonV2 from 'presentation/components/CallButtonV2';
import IconButton from 'presentation/components/common/Button/IconButton';
import Loader from 'presentation/components/Loader';
import MessageModal from 'presentation/components/modal/MessageModal/index';
import NotFound from 'presentation/components/NotFound';
import Header from 'presentation/components/OrderDetailPage/Header';
import { formatSavedAnswers } from 'presentation/components/QcDetailPage/helpers/question';
import { getMailReadCount } from 'presentation/redux/actions/leadDetail/email';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { getCallParticipants } from 'presentation/redux/actions/leads/detail';
import { getDetailSuccess } from 'presentation/redux/actions/order';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import QcCalls from 'presentation/components/QcDetailPage/QcCalls';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import CallButtonLiveKit from 'presentation/components/CallButtonLiveKit';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

const useStyles = makeStyles((theme) => ({
  qcTabs: {
    flex: 1.5,
    '& div.tabs-wrapper .MuiAppBar-positionSticky': {
      top: '146px !important',
    },
    zIndex: 0,
  },
  qcTopBarInfo: {
    width: '260px',
    display: 'flex',
  },
  documents: {
    flex: 1,
    padding: '0 20px 0 40px',
  },
  statusButton: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flex: 1,
    paddingRight: '10px',
    '& button:first-child': {
      marginRight: '10px',
    },
  },
  callButton: {
    paddingRight: '0px',
    marginRight: '0px',
    '& button:first-child': {
      marginRight: '0px',
    },
  },
  divider: {
    backgroundColor: theme.palette.grey[200],
  },
  qcTopBarInfoConent: {
    display: 'flex',
    flex: 1.23,
    '@media (min-width: 1900px)': {
      flex: 1.29,
    },
    '@media (min-width: 2300px)': {
      flex: 1.33,
    },
  },
  qcAudioPlayer: {
    flexGrow: 1,
  },
}));

interface QcDetailPageLayoutProps {
  children: React.ReactNode;
  productType: string;
  showBackButton?: boolean;
  hideHeaderIcon?: boolean;
  additionalStatusButtons?: React.ReactNode;
  qcContextProvider?: React.ComponentType<{ children: React.ReactNode }>;
}

const QcDetailPageLayout: React.FC<QcDetailPageLayoutProps> = ({
  children,
  productType,
  showBackButton = false,
  hideHeaderIcon = false,
  additionalStatusButtons,
  qcContextProvider: QcContextProvider,
}) => {
  const { orderId } = useParams();
  const reduxDispatch = useAppDispatch();
  const navigate = useNavigate();
  const [qcState, setQcState] = useState<any>();
  const [isAllMessageRead, setIsAllMessageRead] = useState<boolean>(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { unReadMailsCount } = useAppSelector((state) => ({
    unReadMailsCount: state.leadsDetailReducer.emailReducer.data.unReadMails,
  }));

  const [answerFromStorage = {}] = useLocalStorageState<Record<string, any>>(
    QC_QUESTIONS_KEY,
    {
      defaultValue: {},
    }
  );

  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );

  const user = useGetUserSelector();
  const orderDetailPath =
    user?.role === UserRoleID.SalesAgent
      ? window.location.pathname?.replace('/qc', '/my-orders')
      : window.location.pathname?.replace('/qc', '');

  const orderLeadId = orderDetail?.order?.lead?.split('/')?.[1] ?? '';
  const isOrderCancelled = orderDetail?.order?.isCancelled ?? false;

  useEffect(() => {
    if (orderLeadId) {
      reduxDispatch(getLead({ leadId: orderLeadId }));
    }
  }, [reduxDispatch, orderLeadId]);

  const qcSliceState = useGetQcDetail();

  const { data, isSuccess, isLoading, isError } = useGetOrderItemsQuery(
    {
      orderId: orderId!,
    },
    {
      skip: !orderId,
    }
  );

  const flags = useFlags([
    FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE,
  ]);

  const isCrmWideEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]
      ?.enabled ?? false;

  const unReadMails = unReadMailsCount;

  useEffect(() => {
    reduxDispatch(
      qcDetailInit({
        answers: formatSavedAnswers(answerFromStorage[orderId!]),
        orderDetail: {
          product: productType,
        },
      })
    );
  }, [reduxDispatch, orderId, answerFromStorage, productType]);

  useEffect(() => {
    setQcState(qcSliceState);
  }, [qcSliceState]);

  useEffect(() => {
    if (isSuccess && data) {
      reduxDispatch(addQcOrderDetail(data));
      reduxDispatch(getDetailSuccess({ ...data, name: `orders/${orderId}` }));
    }
  }, [data, isSuccess, reduxDispatch, orderId]);

  const leadName: string | undefined = React.useMemo(
    () => orderDetail?.order?.lead,
    [orderDetail]
  );

  useEffect(() => {
    if (leadName) {
      reduxDispatch(
        getCallParticipants({
          pageSize: 1,
          filter: `destination.lead.lead="${leadName}"`,
        })
      );
    }
    if (orderLeadId) {
      reduxDispatch(getMailReadCount({ orderLeadId }));
    }
  }, [reduxDispatch, orderId, leadName, orderLeadId]);

  useEffect(() => {
    if (!Number.isNaN(unReadMails)) {
      setIsAllMessageRead(unReadMails === 0);
    }
  }, [unReadMails]);

  const openMessageModalHandle = () => setShowMessageModal(true);

  const classes = useStyles();

  if (isError) {
    return <NotFound />;
  }

  if (isLoading || !qcState || Object.keys(qcState?.orderDetail)?.length <= 0) {
    return <Loader />;
  }

  const orderHumandId = `#${data?.order?.humanId}`;
  const earliestDeadline = _get(data, 'earliestDeadline', 0);
  const deadline = `(${earliestDeadline} days)`;

  const content = (
    <Box
      data-testid="qc-detail-page"
      sx={{
        flexBasis: '100%',
      }}
    >
      <Helmet title="QC page" />
      {isSuccess && (
        <>
          {/* Sticky header */}
          <Header hideIcon={hideHeaderIcon}>
            <Grid container>
              <Grid item container xs={12}>
                <Grid item className={classes.qcTopBarInfoConent} xs={7}>
                  <div className={`${classes.qcTopBarInfo} flex flex-col p-2`}>
                    {showBackButton && (
                      <button
                        className="-mt-2 cursor-pointer px-2 flex items-center bg-white border-none"
                        type="button"
                        onClick={() => navigate(orderDetailPath)}
                      >
                        <ArrowLeftIcon />
                        <span className="ml-2">{getString('text.back')}</span>
                      </button>
                    )}
                    <div className="flex mt-3">
                      <IconButton
                        icon={<StarIcon />}
                        isDisabled
                        iconSize="l"
                        data-testid="order-star-btn"
                        extraClass="-mt-2"
                      />
                      <div className="flex flex-col gap-[10px] min-w-[139px]">
                        <div className="flex justify-between gap-2">
                          <Typography className="font-semibold">
                            {orderHumandId}
                          </Typography>
                          {/* Check if deadline passed */}
                          <Typography
                            color={earliestDeadline < 0 ? 'error' : 'inherit'}
                          >
                            {deadline}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={classes.qcAudioPlayer}>
                    <QcCalls orderDetail={data.order} />
                  </div>
                </Grid>
                <Grid item className={classes.statusButton}>
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
                  <div className={classes.callButton}>
                    {isCrmWideEnableCallButtonLiveKit ? (
                      <div className="mr-1">
                        <CallButtonLiveKit
                          customerId={orderDetail?.customer?.customer?.name}
                        />
                      </div>
                    ) : (
                      <CallButtonV2
                        customerId={orderDetail?.customer?.customer?.name}
                      />
                    )}
                  </div>
                  {additionalStatusButtons}
                </Grid>
              </Grid>
            </Grid>
          </Header>
          {/* Sticky header */}
          {/* Content */}
          <Grid container data-testid="qc-detail-content">
            <Grid item container xs={12}>
              <Grid item className={classes.qcTabs}>
                {children}
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                className={classes.divider}
              />
              <Grid item className={classes.documents}>
                <div className="fixed w-[39%]">
                  <ActivityOrderSection
                    enablePreviewModalDraggable
                    isDocPanelDisabled={isOrderCancelled}
                  />
                </div>
              </Grid>
            </Grid>
            {/* Content */}
          </Grid>
          <MessageModal
            className="jacky-modal"
            openDialog={showMessageModal}
            closeDialog={setShowMessageModal}
            orderLeadId={orderDetail?.order?.lead?.split('/')?.[1]}
          />
        </>
      )}
    </Box>
  );

  if (QcContextProvider) {
    return <QcContextProvider>{content}</QcContextProvider>;
  }

  return content;
};

export default QcDetailPageLayout;
