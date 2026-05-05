import Box from '@material-ui/core/Box';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetOrderPolicyQuery } from 'data/slices/orderPolicySlice';
import ActivityOrderSection from 'presentation/components/ActivityOrderSection';
import CustomerInfo from 'presentation/components/common/InfoPanel/CustomerInfo';
import ApprovalInsurance from 'presentation/components/common/InfoPanel/Insurance';
import ApprovalPolicyHolder from 'presentation/components/common/InfoPanel/PolicyHolder';
import ApprovalShippingInfo from 'presentation/components/common/InfoPanel/ShippingInfo';
import ApprovalVehicle from 'presentation/components/common/InfoPanel/Vehicle';
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
import { ItemApprovalStatus } from 'shared/constants/orderType';

import { IField } from '../InfoPanel/type';
import ApprovalSaleInfo from '../SaleInfo';

function ApprovalOrderDetailPage() {
  const { orderId, policyId } = useParams();
  const [fieldsErrors, setFieldsErrors] = useState();

  const dispatch = useDispatch();
  const [showCommentModal, setShowCommentModal] = React.useState(false);

  const [addAndGetComment] = useOrderComments();

  const onCommentModalClose = () => setShowCommentModal(false);
  const [shouldDisableDocuments, setShouldDisableDocuments] =
    React.useState(false);
  const onCommentModalSubmit = (comment: string) => {
    addAndGetComment({ text: comment, orderId }, orderId);
    onCommentModalClose();
  };

  const {
    data: orderPolicy,
    isSuccess: isPolicySuccess,
    isLoading: isPolicyFetching,
    isError: isPolicyError,
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
  const { data: user } = useGetAuthenticateQuery();

  const policyShipmentData = useGetShipmentData({
    orderId: orderId!,
    policyId: orderPolicy?.policy?.name ?? '',
  });

  const isInboundAgent = user?.role === UserRoleID.InboundAgent;
  const isSalesAgent = user?.role === UserRoleID.SalesAgent;
  const isBackoffice = (user?.role as UserRoleID) === UserRoleID.BackOffice;

  useEffect(() => {
    if (isPolicySuccess && orderPolicy) {
      dispatch({
        type: OrderActionTypes.GET_DETAIL_SUCCESS,
        payload: orderPolicy?.order,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isPolicySuccess]);

  if (isPolicyFetching) {
    return <Loader />;
  }

  if (isPolicyError || !orderPolicy) {
    return <NotFound />;
  }

  const extraFields: IField = {
    title: 'Package Type',
    value: orderPolicy.packageType,
    type: 'text',
  };

  const approvalDocumentDisabled =
    orderPolicy?.policy?.approvalStatus ===
      ItemApprovalStatus.POLICY_UPLOADED || shouldDisableDocuments;
  const isPolicyUploaded =
    orderPolicy?.policy?.approvalStatus === ItemApprovalStatus.POLICY_UPLOADED;

  const isOrderCancelled = orderPolicy?.order?.isCancelled ?? false;

  const isDocPanelDisabled =
    isOrderCancelled ||
    isInboundAgent ||
    isSalesAgent ||
    shouldDisableDocuments ||
    (isPolicyUploaded && !isBackoffice);

  return (
    <>
      <Helmet title="Approval Order Page" />
      <Grid container data-testid="approval-detail-order">
        {isPolicySuccess ? (
          <LayoutOrderDetailPage>
            <PolicyPageHeader
              orderId={orderId!}
              showPolicyButtons={!isInboundAgent && !isSalesAgent}
              policy={orderPolicy}
              fieldsErrors={fieldsErrors}
              showCovernoteButton
              showPolicyholderName
              setShowCommentModal={setShowCommentModal}
              disableDocumentSection={() => {
                setShouldDisableDocuments(true);
              }}
              isApprovalAgent={user?.role === UserRoleID.ProblemCase}
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
                    <CustomerInfo
                      isEditable={(!isInboundAgent && !isSalesAgent) ?? true}
                      customerInfo={orderPolicy?.customerInfo}
                      textFieldError={false}
                    />
                  </Box>
                  <Box sx={{ pb: 2, width: '100%' }}>
                    <ApprovalPolicyHolder
                      isEditable={
                        (!isInboundAgent &&
                          !isSalesAgent &&
                          !isOrderCancelled) ??
                        true
                      }
                      policyHolder={orderPolicy?.order?.data?.policyHolder}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} data-testid="insurance-section">
                  <div className="w-100 pb-2">
                    <ApprovalSaleInfo
                      extraFields={[extraFields]}
                      includeFields={['Order Type']}
                    />
                  </div>
                  <ApprovalInsurance
                    policy={orderPolicy?.policy}
                    insurancePackage={orderPolicy?.motorPackage}
                    orderId={orderId}
                    policyId={policyId}
                    editableFields={
                      !isOrderCancelled
                        ? ['policyNumber', 'applicationNumber']
                        : []
                    }
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
                    <ApprovalVehicle />
                  </Box>
                  <Box sx={{ pb: 2, width: '100%' }}>
                    <ApprovalShippingInfo
                      shippingInfoData={orderPolicy}
                      orderId={orderId}
                      policyId={policyId}
                      isEditable={
                        (!isInboundAgent &&
                          !isSalesAgent &&
                          !approvalDocumentDisabled &&
                          !isOrderCancelled) ??
                        true
                      }
                      policyShipmentData={policyShipmentData}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Grid item container md={4} xs={12}>
                <Grid item xs={12}>
                  <ActivityOrderSection
                    isDocPanelDisabled={isDocPanelDisabled}
                    isEnabledForReplaceDoc={
                      isDocPanelDisabled && !isOrderCancelled
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </LayoutOrderDetailPage>
        ) : null}
      </Grid>
      <CommonModal
        title={getString('text.summary')}
        open={showCommentModal}
        handleCloseModal={onCommentModalClose}
        isShowCloseBtn={false}
      >
        <CommentModal onSubmit={onCommentModalSubmit} />
      </CommonModal>
    </>
  );
}

export default ApprovalOrderDetailPage;
