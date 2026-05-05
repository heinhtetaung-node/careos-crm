import Grid from '@material-ui/core/Grid';
import CloseRounded from '@material-ui/icons/CloseRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import {
  CreateLead,
  useCancelOrderMutation,
  useCancelOrderPoliciesMutation,
  useGetOrderPolicyItemsQuery,
  useLazyGetOrderPolicyItemsQuery,
} from 'data/slices/orderSlice';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import Checkbox from 'presentation/components/common/controls/Checkbox';
import Dialog from 'presentation/components/common/Dialog';
import { cancellationReasons } from 'presentation/pages/car-insurance/OrderDetailPage/helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { showSnackBar } from 'presentation/redux/actions/ui';
import React, { useEffect, useState } from 'react';
import { CancellationReasons } from 'shared/constants/orderType';
import * as CONSTANTS from 'shared/constants';

import CreateNewLead from './CreateNewLead';

import Autocomplete from '../common/Autocomplete';
import CommonButton from '../common/Button/CommonButton';
import {
  getI18InsurerName,
  insuranceType,
} from '../QcDetailPage/hooks/usePackagesInfo';
import { customerRequestOptions } from 'presentation/pages/car-insurance/OrderCancellation/All/helper';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { useDispatch } from 'react-redux';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import { PolicyItem } from './helper';

export default function CancelOrder({
  orderId,
  isCancelled = false,
  paymentStatus: _paymentStatus,
}: Readonly<{
  orderId: string;
  isCancelled?: boolean;
  paymentStatus?: string;
}>) {
  const [openCancellation, setOpenCancellation] = useState(false);
  const [openCreateLead, setOpenCreateLead] = useState(false);
  const [value, setValue] = useState('');
  const [policies, setPolicies] = useState<PolicyItem[] | null>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<PolicyItem[] | null>(
    []
  );
  const [refetchItems] = useLazyGetOrderPolicyItemsQuery();
  const [disabledCancel, setDisabledCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancellationReasons>();
  const [leadHumanId, setLeadHumanId] = useState<string>('');
  const [waiveFees, setWaiveFees] = useState<boolean>(false);
  const [openWaiveFeeConfirm, setOpenWaiveFeeConfirm] = useState(false);
  const [lastPayload, setLastPayload] = useState<CreateLead>();
  const flags = useFlags([
    FeatureFlags.BROK_2382_CANCELLATION_MANAGEMENT_CHANGES_REFUND_REQUEST_20250515_TEMP,
    FeatureFlags.BROK_3044_ENABLE_WAIVE_FEES_20250701,
    FeatureFlags.BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP,
  ]);

  const isDisabledWaiveFees = selectedPolicies?.length !== policies?.length;

  const isEnableOrderCancellationV2 =
    flags[
      FeatureFlags
        .BROK_2382_CANCELLATION_MANAGEMENT_CHANGES_REFUND_REQUEST_20250515_TEMP
    ]?.enabled ?? false;

  const isRefundCalculationMethodRequired =
    flags[
      FeatureFlags
        .BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP
    ]?.enabled ?? false;

  const isWaiveFeesEnabled =
    flags[FeatureFlags.BROK_3044_ENABLE_WAIVE_FEES_20250701]?.enabled ?? false;

  const dispatch = useDispatch();
  const [
    cancelOrder,
    {
      data: orderData,
      isSuccess: cancelOrderSuccess,
      isError: cancelOrderError,
    },
  ] = useCancelOrderMutation();
  const [
    cancelPolicies,
    {
      data: orderPolicyData,
      isSuccess: cancelPolicySuccess,
      isError: cancelPolicyError,
      isLoading: cancellingPolicy,
    },
  ] = useCancelOrderPoliciesMutation();
  const [customerRequestReason, setCustomerRequestReason] =
    useState<CancellationReasons>();
  const [addAndGetComment] = useOrderComments();

  const [buttonProps, setButtonProps] = useState({
    disabled: true,
    color: 'default',
  });

  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data || []
  );

  const { data } = useGetOrderPolicyItemsQuery(orderId);

  const getPoliciesByInsurer = () => {
    const items: PolicyItem[] =
      data?.map((i) => {
        const insurer = insurers.find((j: any) => j.name === i.insurer);
        let motorInsuranceType = insuranceType[i?.motorItemType];
        motorInsuranceType = motorInsuranceType
          ? `${motorInsuranceType}, `
          : '';
        return {
          id: i?.name,
          name: `${motorInsuranceType}${getI18InsurerName(insurer)}`,
          isCancelled: i?.isCancelled,
          policyDate: i?.policyStartDate,
        };
      }) ?? [];
    if (items?.length) {
      setPolicies(items);
    }
  };

  const checkPoliciesDisabled = () =>
    (data?.filter((i) => i.isCancelled).length ?? 0) === data?.length;

  useEffect(() => {
    if (data) {
      getPoliciesByInsurer();
      if (checkPoliciesDisabled()) {
        setDisabledCancel(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, insurers]);

  useEffect(() => {
    const isButtonEnabled =
      value.length > 0 &&
      selectedPolicies &&
      selectedPolicies?.length > 0 &&
      cancelReason !== undefined;

    setButtonProps({
      ...buttonProps,
      disabled: !isButtonEnabled,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedPolicies, cancelReason]);

  useEffect(() => {
    if (isCancelled) {
      setDisabledCancel(isCancelled);
    }
  }, [isCancelled]);

  useEffect(() => {
    if ((cancelOrderSuccess || cancelPolicySuccess) && lastPayload) {
      if (openCancellation) {
        setOpenCancellation(false);
      }
      setOpenCreateLead(false);
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('importFileStatus.complete'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    if (cancelOrderError || cancelPolicyError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errorMessage.newLeadCreation'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cancelOrderSuccess,
    cancelPolicySuccess,
    cancelOrderError,
    cancelPolicyError,
    lastPayload,
  ]);

  useEffect(() => {
    if (orderData?.order?.isCancelled) {
      setDisabledCancel(true);
    }
    if (orderPolicyData) {
      refetchItems(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData, orderPolicyData]);

  const updateSelections = (current: PolicyItem) => {
    const updatedSelections = selectedPolicies?.length
      ? [...selectedPolicies]
      : [];
    if (
      selectedPolicies &&
      selectedPolicies.find((i) => i.name === current.name)
    ) {
      const newSelection = updatedSelections.filter(
        (i) => i.name !== current.name
      );
      setSelectedPolicies(newSelection);
    } else {
      setSelectedPolicies([...updatedSelections, current]);
    }
  };

  const resetCancel = () => {
    setSelectedPolicies([]);
    setValue('');
    setOpenCreateLead(!openCreateLead);
  };

  const handleCancelOrder = async (payload: CreateLead) => {
    // Check if all policies in that order has been selected for cancellation
    if ((policies ?? [])?.length > (selectedPolicies?.length || 0)) {
      if (selectedPolicies?.length) {
        // for cancelling policies, pass the boolean flag 'true' just for the first policy if agent want to create new lead.
        const [policyId, ...rest] = selectedPolicies.map((policy) => policy.id);
        const cancels = await Promise.all(
          [
            {
              policyId,
              payload,
            },
            ...rest.map((id: string) => ({ policyId: id })),
          ].map((p) => cancelPolicies(p).unwrap())
        );
        setLeadHumanId(cancels?.[0]?.leadHumanId ?? '');
      }
    } else {
      // Cancel the whole order
      const { leadHumanId: id } = await cancelOrder({
        orderId: `orders/${orderId}`,
        payload: {
          ...payload,
          waive_fees: !isDisabledWaiveFees ? waiveFees : undefined,
        },
      }).unwrap();
      setLeadHumanId(id);
    }
    // POST user's comment for the cancellation
    const cancelReasonText =
      cancellationReasons().find(
        (cancelItem) => cancelItem.value === cancelReason
      )?.title ?? '';
    const commentPayload = {
      text: `${value.trim()} - ${cancelReasonText}`,
      orderId,
    };
    addAndGetComment(commentPayload, orderId);
    setLastPayload(payload);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerRequestReason?.toString() === 'CUSTOMER_REQUEST_REFUND') {
      handleCancelOrder({
        reason: cancelReason,
        createLead: false,
        changeOrder: false,
        customerRequest: 'CUSTOMER_REQUEST_REFUND',
      });
      return;
    }
    // Delay comment post until cancelled api is called
    setOpenCancellation(false);
    setOpenCreateLead(true);
  };

  const renderForm = () => (
    <form id="cancel-order" data-testid="cancel-order-form" onSubmit={onSubmit}>
      <Grid container>
        <Grid item xs={12}>
          <div className="flex flex-col">
            <div className="flex p-2.5 mb-2.5">
              <WarningRoundedIcon className="fill-secondary" />
              <span className="font-bold pl-1">
                {getString('order.cancel.warning')}
              </span>
            </div>
            <span className="p-2.5">
              {getString('order.cancel.selectPolicies')}
            </span>
          </div>
          <div className="mb-2.5">
            {policies?.map((i) => (
              <div
                key={i.id}
                className="p-2.5"
                data-testid="order-policy-checkbox"
              >
                <Checkbox
                  name={i.name}
                  handleUpdate={() => updateSelections(i)}
                  checked={selectedPolicies?.includes(i)}
                  isDisabled={i.isCancelled}
                />
              </div>
            ))}
          </div>
          <div className="mb-2.5">
            {isWaiveFeesEnabled && !isRefundCalculationMethodRequired && (
              <Checkbox
                name={getString(
                  'cancellation.waiveCancellationAndProcessingFee'
                )}
                isDisabled={isDisabledWaiveFees}
                handleUpdate={(val) => {
                  setWaiveFees(true);
                  if (val) {
                    setOpenWaiveFeeConfirm(true);
                  }
                }}
                checked={waiveFees}
              />
            )}
          </div>
        </Grid>
        <Grid item xs={12} className="mt-5">
          <Autocomplete
            options={cancellationReasons() as any}
            onChange={(_e, selection: any) => setCancelReason(selection?.value)}
            disableClearable
            optionTextKey="title"
            groupBy={(option: { group: string }) => option.group}
            textFieldProps={{
              label: getString('order.cancel.rejectReason'),
              required: true,
            }}
          />
        </Grid>
        {isEnableOrderCancellationV2 && (
          <Grid item xs={12} className="mt-5">
            <Autocomplete
              options={customerRequestOptions as any}
              onChange={(_e, selection: any) =>
                setCustomerRequestReason(selection?.value)
              }
              disableClearable
              optionTextKey="title"
              groupBy={(option: { group: string }) => option.group}
              textFieldProps={{
                label: getString('order.cancel.customerRequest'),
                required: true,
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} className="mt-5">
          <CommonTextField
            label={getString('qc.comment')}
            value={value}
            fullWidth
            required
            multiline
            placeholder={getString('qc.typeHere')}
            minRows={4}
            onChange={(e) => setValue(e.target.value)}
          />
        </Grid>
      </Grid>
    </form>
  );

  return (
    <>
      <Dialog
        open={openCancellation}
        color="warning"
        content={renderForm()}
        handleToggle={() => setOpenCancellation(!openCancellation)}
        data-testid="cancel-order"
        showButton
        formId="cancel-order"
        title={getString('text.cancelButton')}
        buttonProps={{ ...buttonProps }}
        buttonText={getString('text.next')}
      />
      {policies && policies?.length > 0 && (
        <CreateNewLead
          orderId={orderId}
          open={openCreateLead}
          handleModalToggle={resetCancel}
          policies={policies as PolicyItem[]}
          selectedPolicies={selectedPolicies ?? []}
          cancelReason={cancelReason}
          handleCancelOrder={handleCancelOrder}
          leadHumanId={leadHumanId}
          cancellingPolicy={cancellingPolicy}
          showLeadId={leadHumanId !== ''}
          setShowLeadId={setLeadHumanId}
          isEnableOrderCancellationV2={isEnableOrderCancellationV2}
        />
      )}
      <Dialog
        open={openWaiveFeeConfirm}
        maxWidth="sm"
        color="warning"
        content={getString(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )}
        handleToggle={() => {
          setWaiveFees(false);
          setOpenWaiveFeeConfirm(false);
        }}
        showButton
        buttonText={getString('text.confirmButton')}
        buttonProps={{
          onClick: () => {
            setOpenWaiveFeeConfirm(false);
          },
        }}
        showCancelButton
        cancelButtonClick={() => {
          setWaiveFees(false);
          setOpenWaiveFeeConfirm(false);
        }}
        title={getString('cancellation.waiveCancellationAndProcessingFee')}
      />
      <CommonButton
        data-testid="cancel-button"
        variant="outlined"
        color="default"
        startIcon={<CloseRounded />}
        onClick={() => setOpenCancellation(!openCancellation)}
        disabled={disabledCancel}
      >
        {getString('text.cancelButton')}
      </CommonButton>
    </>
  );
}
