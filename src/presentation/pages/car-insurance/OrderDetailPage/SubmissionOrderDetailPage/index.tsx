import { makeStyles, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import LaunchIcon from '@material-ui/icons/Launch';
import _last from 'lodash/last';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetIntegrationResultQuery } from 'data/slices/insurerIntegrationSlice';
import { SubmissionStatusValue } from 'data/slices/insurerIntegrationSlice/types';
import { useGetOrderPolicyQuery } from 'data/slices/orderPolicySlice';
import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import Chip from 'presentation/components/common/Chip';
import CustomerInfo from 'presentation/components/common/InfoPanel/CustomerInfo';
import Insurance from 'presentation/components/common/InfoPanel/Insurance';
import PolicyHolderAddress from 'presentation/components/common/InfoPanel/PolicyAddress';
import PolicyHolder from 'presentation/components/common/InfoPanel/PolicyHolder';
import ShippingInfo from 'presentation/components/common/InfoPanel/ShippingInfo';
import Vehicle from 'presentation/components/common/InfoPanel/Vehicle';
import LayoutOrderDetailPage from 'presentation/components/common/Layout/OrderDetailPage';
import { Grid } from 'presentation/components/common/Layout/OrderDetailPage/index.styles';
import Loader from 'presentation/components/Loader';
import NotFound from 'presentation/components/NotFound';
import CopyButton from 'presentation/components/OrderDetailPage/CopyButton';
import CovernoteDownload from 'presentation/components/OrderDetailPage/CovernoteDownload';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import useGetShipmentData from 'presentation/hooks/useGetShipmentData';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { getString } from 'presentation/theme/localization';
import { ItemSubmissionStatus } from 'shared/constants/orderType';

import SubmissionStatusButtons from './SubmissionStatusButtons';

import { IField } from '../InfoPanel/type';
import SaleInfo from '../SaleInfo';

const useStyles = makeStyles((theme) => ({
  orderDetailHeader: {
    marginBottom: `${theme.spacing(2)}px`,
    justifyContent: 'space-between',
  },
}));

function SubmissionOrderDetailPage() {
  const { orderId, policyId } = useParams();
  const { data: user } = useGetAuthenticateQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  const { data } = useGetOrderItemsQuery(
    { orderId: orderId! },
    { skip: !orderId }
  );
  const [lastSubmissionApiStatus, setLastSubmissionApiStatus] = useState<{
    color: string;
    text: string;
  }>();

  const {
    data: orderPolicy,
    isSuccess,
    isLoading,
    isError,
  } = useGetOrderPolicyQuery(
    {
      orderId,
      policyId,
      hasShippingSection: true,
    },
    {
      skip: !orderId && !policyId,
    }
  );

  const policyName = orderPolicy?.policy?.name;

  const { data: getSubmissionStatus, isLoading: isGettingSubmission } =
    useGetIntegrationResultQuery(
      { policy: policyName! },
      { skip: !policyName }
    );

  const policyShipmentData = useGetShipmentData({
    orderId: orderId!,
    policyId: policyName ?? '',
  });

  const [isPending, setIsPending] = useState(false);

  const approvalButtonEnable =
    orderPolicy?.policy?.submissionStatus === ItemSubmissionStatus.SUBMITTED;
  const showApprovalButton = [
    UserRoleID.Submission,
    UserRoleID.QualityControl,
    UserRoleID.Admin,
    UserRoleID.SuperAdmin,
  ].includes(user?.role as UserRoleID);

  useEffect(() => {
    if (isGettingSubmission) return;

    const { submissions: apiSubmissionStatus } = getSubmissionStatus ?? {};
    if (apiSubmissionStatus?.length) {
      const latestApiStatus = _last(apiSubmissionStatus)?.status ?? '';
      const isLastApiFailed =
        latestApiStatus === SubmissionStatusValue.FAILED &&
        (latestApiStatus as string) !== SubmissionStatusValue.PENDING;

      setIsPending(
        latestApiStatus !== SubmissionStatusValue.SUCCESS && !isLastApiFailed
      );
      setLastSubmissionApiStatus({
        color: isLastApiFailed ? 'danger' : 'success',
        text: isLastApiFailed
          ? getString('text.autoSubmissionFailed')
          : getString('text.autoSubmissionSuccess'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSubmissionStatus, isGettingSubmission]);

  useEffect(() => {
    if (isSuccess && orderPolicy) {
      dispatch({
        type: OrderActionTypes.GET_DETAIL_SUCCESS,
        payload: orderPolicy?.order,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isSuccess]);

  useEffect(() => {
    if (data?.order.lead) {
      dispatch(getLead({ leadId: data?.order.lead.split('/')[1] }));
    }
  }, [data?.order.lead, dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !orderPolicy) {
    return <NotFound />;
  }

  // for sales info panel
  const extraFields: IField = {
    title: 'Package Type',
    value: orderPolicy.packageType,
    type: 'text',
  };

  return (
    <>
      <Helmet title="Submission Order Page" />
      <Grid container>
        <Grid item xs={12} md={12} data-testid="submission-order">
          {isSuccess ? (
            <LayoutOrderDetailPage>
              <Grid
                container
                direction="row"
                className={classes.orderDetailHeader}
              >
                <Grid item container xs={7}>
                  <div className="p-2">
                    <Typography
                      className="font-semibold"
                      data-testid="order-id"
                    >
                      {orderPolicy?.order?.humanId
                        ? `#${orderPolicy.order.humanId}(${orderPolicy.policyHolderName})`
                        : null}
                    </Typography>
                  </div>
                  <CovernoteDownload policyId={policyName ?? ''} />
                  <CopyButton orderPolicy={orderPolicy} orderData={data} />
                  <CopyButton
                    orderPolicy={orderPolicy}
                    orderData={data}
                    showEmailModal
                    variant="secondary"
                  />
                </Grid>
                <Grid item>
                  <SubmissionStatusButtons
                    policy={orderPolicy?.policy}
                    orderId={orderId!}
                  />
                  {showApprovalButton && (
                    <CommonButton
                      variant="contained"
                      color="default"
                      className="ml-2"
                      disabled={!approvalButtonEnable}
                      startIcon={<LaunchIcon />}
                      onClick={() =>
                        navigate('../approval', { relative: 'path' })
                      }
                      data-testid="btn-approval"
                    >
                      {getString('menu.order.approval')}
                    </CommonButton>
                  )}
                  {!isPending && lastSubmissionApiStatus && (
                    <Chip
                      color={lastSubmissionApiStatus?.color as any}
                      text={lastSubmissionApiStatus?.text}
                      className="ml-2"
                    />
                  )}
                </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                spacing={2}
                justifyContent="space-between"
              >
                <Grid
                  item
                  container
                  md={8}
                  xs={12}
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Grid
                    item
                    container
                    xs={12}
                    md={4}
                    data-testid="customer-info-section"
                  >
                    <Box sx={{ pb: 2, width: '100%' }}>
                      <CustomerInfo
                        customerInfo={orderPolicy?.customerInfo}
                        showPhoneAndEmail
                      />
                    </Box>
                    <Box sx={{ pb: 2, width: '100%' }}>
                      <PolicyHolder
                        policyHolder={orderPolicy?.order?.data?.policyHolder}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} data-testid="insurance-section">
                    <div className="w-100 pb-2">
                      <SaleInfo
                        extraFields={[extraFields]}
                        includeFields={['Order Type']}
                      />
                    </div>
                    <Box sx={{ pb: 2, width: '100%' }}>
                      <Insurance
                        policy={orderPolicy?.policy}
                        insurancePackage={orderPolicy?.motorPackage}
                        editableFields={['applicationNumber']}
                        orderId={orderId}
                        policyId={policyId}
                      />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <PolicyHolderAddress
                        address={data?.policyHolderAddress}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    item
                    container
                    xs={12}
                    md={4}
                    data-testid="shipping-info-section"
                  >
                    <Box sx={{ pb: 2, width: '100%' }}>
                      <Vehicle />
                    </Box>
                    <Box sx={{ pb: 2, width: '100%' }}>
                      <ShippingInfo
                        shippingInfoData={orderPolicy}
                        policyShipmentData={policyShipmentData}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Grid item container md={4} xs={12}>
                  <Grid item xs={12}>
                    <ActivityOrderSection
                      isDocPanelDisabled
                      enablePreviewModalDraggable
                    />
                  </Grid>
                </Grid>
              </Grid>
            </LayoutOrderDetailPage>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}

export default SubmissionOrderDetailPage;
