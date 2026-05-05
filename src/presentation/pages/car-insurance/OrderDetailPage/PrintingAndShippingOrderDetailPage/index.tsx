import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetOrderPolicyQuery } from 'data/slices/orderPolicySlice';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import CustomerInfo from 'presentation/components/common/InfoPanel/CustomerInfo';
import Insurance from 'presentation/components/common/InfoPanel/Insurance';
import PolicyHolder from 'presentation/components/common/InfoPanel/PolicyHolder';
import ShippingInfo from 'presentation/components/common/InfoPanel/ShippingInfo';
import Vehicle from 'presentation/components/common/InfoPanel/Vehicle';
import LayoutOrderDetailPage from 'presentation/components/common/Layout/OrderDetailPage';
import { Grid } from 'presentation/components/common/Layout/OrderDetailPage/index.styles';
import Loader from 'presentation/components/Loader';
import CommentModal from 'presentation/components/modal/CommentModal';
import CommonModal from 'presentation/components/modal/CommonModal';
import NotFound from 'presentation/components/NotFound';
import PolicyPageHeader from 'presentation/components/PolicyPageHeader';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import useGetShipmentData from 'presentation/hooks/useGetShipmentData';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { getString } from 'presentation/theme/localization';
import { AdminRoles } from 'shared/constants/orderType';

function PrintingAndShippingOrderDetailPage() {
  const { orderId, policyId } = useParams();
  const dispatch = useDispatch();
  const { data: user } = useGetAuthenticateQuery();

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

  const policyShipmentData = useGetShipmentData({
    orderId: orderId!,
    policyId: orderPolicy?.policy?.name ?? '',
  });
  const isInboundAgent = user?.role === UserRoleID.InboundAgent;
  const isShipmentOrAdmin = [...AdminRoles, UserRoleID.Shipment].includes(
    user?.role as UserRoleID
  );
  const isOrderCancelled = orderPolicy?.policy?.isCancelled ?? false;
  const isReadOnly = (isInboundAgent || isOrderCancelled) ?? false;
  const [fieldsErrors, setFieldsErrors] = useState();

  const [showCommentModal, setShowCommentModal] = useState(false);

  const [addAndGetComment] = useOrderComments();

  const onCommentModalClose = () => setShowCommentModal(false);

  const onCommentModalSubmit = (comment: string) => {
    addAndGetComment({ text: comment, orderId }, orderId);
    onCommentModalClose();
  };

  useEffect(() => {
    if (isSuccess && orderPolicy) {
      dispatch({
        type: OrderActionTypes.GET_DETAIL_SUCCESS,
        payload: orderPolicy?.order,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isSuccess]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !orderPolicy) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet title="Printing And Shipping Order Page" />
      <Grid item xs={12} md={12} data-testid="printing-and-shipping-order">
        {isSuccess ? (
          <LayoutOrderDetailPage>
            <PolicyPageHeader
              orderId={orderId!}
              showPolicyButtons={isShipmentOrAdmin}
              policy={orderPolicy}
              fieldsErrors={fieldsErrors}
              setShowCommentModal={setShowCommentModal}
            />
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
                    <CustomerInfo customerInfo={orderPolicy?.customerInfo} />
                  </Box>
                  <Box sx={{ pb: 2, width: '100%' }}>
                    <PolicyHolder
                      policyHolder={orderPolicy?.order?.data?.policyHolder}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} data-testid="insurance-section">
                  <Insurance
                    policy={orderPolicy?.policy}
                    insurancePackage={orderPolicy?.motorPackage}
                    orderId={orderId}
                    policyId={policyId}
                    editableFields={['policyNumber']}
                    hiddenFields={['applicationNumber']}
                    setFieldsErrors={setFieldsErrors}
                  />
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
                      orderId={orderId}
                      policyId={policyId}
                      isEditable={!isReadOnly}
                      policyShipmentData={policyShipmentData}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Grid item container md={4} xs={12}>
                <Grid item xs={12}>
                  <ActivityOrderSection isDocPanelDisabled={isReadOnly} />
                </Grid>
              </Grid>
            </Grid>
            <CommonModal
              title={getString('text.summary')}
              open={showCommentModal}
              handleCloseModal={onCommentModalClose}
              isShowCloseBtn={false}
            >
              <CommentModal onSubmit={onCommentModalSubmit} />
            </CommonModal>
          </LayoutOrderDetailPage>
        ) : null}
      </Grid>
    </>
  );
}

export default PrintingAndShippingOrderDetailPage;
