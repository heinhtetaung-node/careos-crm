import { Grid, makeStyles, Typography } from '@material-ui/core';
import _get from 'lodash/get';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { OrderPolicy } from 'data/slices/orderPolicySlice/interface';
import CallButtonV2 from 'presentation/components/CallButtonV2';
import useRequiredPolicyDocs from 'presentation/hooks/useRequiredPolicyDocs';
import ApprovalStatusButtons from 'presentation/pages/car-insurance/OrderDetailPage/ApprovalOrderDetailPage/ApprovalStatusButtons';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import {
  ItemApprovalStatus,
  ItemSubmissionStatus,
} from 'shared/constants/orderType';

import CovernoteDownload from '../OrderDetailPage/CovernoteDownload';
import CallButtonLiveKit from '../CallButtonLiveKit';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

const useStyles = makeStyles((theme) => ({
  orderDetailHeader: {
    marginBottom: `${theme.spacing(2)}px`,
  },
}));

interface Props {
  orderId: string;
  policy: OrderPolicy;
  setShowCommentModal: (payload: boolean) => void;
  fieldsErrors?: Record<string, any>;
  showCovernoteButton?: boolean;
  showPolicyButtons?: boolean;
  showPolicyholderName?: boolean;
  disableDocumentSection?: () => void;
  isApprovalAgent?: boolean;
}

export default function PolicyPageHeader({
  orderId,
  policy,
  fieldsErrors,
  setShowCommentModal,
  showCovernoteButton = false,
  showPolicyButtons = false,
  showPolicyholderName = false,
  isApprovalAgent = false,
  disableDocumentSection,
}: Props) {
  const dispatch = useDispatch();

  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );

  const flags = useFlags([
    FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE,
  ]);

  const isCrmWideEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]
      ?.enabled ?? false;

  useEffect(() => {
    if (orderDetail?.lead) {
      dispatch(getLead({ leadId: orderDetail.lead?.split('/')[1] }));
    }
  }, [dispatch, orderDetail]);

  const isRequiredDocUploaded = useRequiredPolicyDocs({
    orderId,
    orderPolicy: policy,
  });
  const classes = useStyles();

  const displayDetails = () => {
    const humanId = _get(policy, 'order.humanId', '');
    const policyHolderName = _get(policy, 'policyHolderName', '');

    if (humanId) {
      return (
        <div className="p-2">
          <Typography className="font-semibold" data-testid="order-id">
            {showPolicyholderName && policyHolderName
              ? `#${humanId}(${policyHolderName})`
              : `#${humanId}`}
          </Typography>
        </div>
      );
    }
    return null;
  };

  return (
    <Grid container direction="row" className={classes.orderDetailHeader}>
      <Grid item container xs={7}>
        {displayDetails()}
        {showCovernoteButton && (
          <div className="mr-2">
            <CovernoteDownload policyId={policy?.policy?.name ?? ''} />
          </div>
        )}
        {isCrmWideEnableCallButtonLiveKit ? (
          <div className="mr-1">
            <CallButtonLiveKit customerId={orderDetail?.customer} />
          </div>
        ) : (
          <CallButtonV2
            customerId={orderDetail?.customer}
            onCallEnd={() => setShowCommentModal(true)}
          />
        )}
      </Grid>
      {showPolicyButtons && (
        <Grid
          item
          container
          className="ml-auto"
          xs={3}
          justifyContent="flex-end"
        >
          <ApprovalStatusButtons
            orderPolicy={policy}
            name={policy?.policy?.name ?? ''}
            isPolicyReady={isRequiredDocUploaded}
            showApprovalStatusButtons
            approvalStatus={
              policy?.policy?.approvalStatus as ItemApprovalStatus
            }
            submissionStatus={
              policy?.policy?.submissionStatus as ItemSubmissionStatus
            }
            fieldsErrors={fieldsErrors}
            disableDocumentSection={disableDocumentSection}
            isApprovalAgent={isApprovalAgent}
          />
        </Grid>
      )}
    </Grid>
  );
}
