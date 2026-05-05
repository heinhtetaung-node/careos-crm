import {
  useGetCancellationDataQuery,
  useLazyGetAccountingQuery,
} from 'data/slices/accountingSlice';
import {
  useGetNewLeadPaymentDetailsWithOrderItemIdQuery,
  useGetPaymentRefundQuery,
} from 'data/slices/leadSlice';
import { useGetOrderByLeadIdQuery } from 'data/slices/orderSlice';
import { getString } from 'presentation/theme/localization';
import { useEffect, useState } from 'react';
import { numberToMoney, satangToBaht } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

function useCancellationPaymentDetails(
  leadHumanId: string,
  orderItemId: string,
  fetchRefund: boolean,
  isSuccess: boolean,
  isError: boolean,
  error: any,
  setOpenClosePopup: (open: boolean) => void
) {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [leadIdFromOrder, setLeadIdFromOrder] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<Record<string, any>>({
    usedCreditShell: '0',
    availableCreditShell: '0',
  });
  const [paidCharges, setPaidCharges] = useState<any[]>([]);

  const [accountingData, setAccountingData] = useState<any>(null);

  const [getAccountingDetail] = useLazyGetAccountingQuery();

  const { data: refundData } = useGetPaymentRefundQuery(orderItemId, {
    skip: !fetchRefund || !orderItemId,
  });

  const { data: cancellationData } = useGetCancellationDataQuery(
    { orderItemId },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: orderData } = useGetOrderByLeadIdQuery(
    {
      leadId: leadHumanId ?? '',
    },
    {
      skip: !leadHumanId,
    }
  );

  const {
    data: newPaymentDetails,
    refetch,
    isUninitialized,
  } = useGetNewLeadPaymentDetailsWithOrderItemIdQuery(
    { leadIdFromOrder, orderItemId },
    {
      skip: !leadIdFromOrder,
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    cancellationFee,
    excludedProcessingFee,
    excludedDiscount,
    voucherValue,
  } = [...(cancellationData?.cancellationDetails ?? [])].sort(
    (a: any, b: any) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  )?.[0] ?? {
    cancellationFee: 0,
    excludedProcessingFee: 0,
    excludedDiscount: 0,
  };

  useEffect(() => {
    if (orderData?.orders?.length) {
      setLeadIdFromOrder(orderData?.orders?.[0]?.lead?.replace('leads/', ''));
    }
  }, [orderData]);

  useEffect(() => {
    if (!isSuccess) return;
    const closePopup = () => setOpenClosePopup(false);
    if (isUninitialized) {
      closePopup();
    } else {
      refetch().then(closePopup);
    }
    showSuccessSnackbar(
      getString('cancellation.popup.updateStatusSuccessfully')
    );
  }, [isSuccess, isUninitialized]);

  useEffect(() => {
    if (isError) {
      const message = error?.data?.message;
      if (message) {
        showErrorSnackbar(
          message.includes('refund_already_exists')
            ? getString('errors.refund_already_exists')
            : message
        );
      } else {
        showErrorSnackbar(getString('cancellation.popup.updateStatusFailed'));
      }
    }
  }, [isError]);

  useEffect(() => {
    if (newPaymentDetails) {
      setStatusData((prevState: any) => ({
        ...prevState,
        usedCreditShell:
          parseFloat(newPaymentDetails?.totalCreditUsed?.amount ?? '0') > 0
            ? numberToMoney(
                satangToBaht(
                  newPaymentDetails?.totalCreditUsed?.amount as string
                )
              )
            : '0',
        availableCreditShell:
          parseFloat(newPaymentDetails?.totalCreditAvailable?.amount ?? '0') > 0
            ? numberToMoney(
                satangToBaht(
                  newPaymentDetails?.totalCreditAvailable?.amount as string
                )
              )
            : '0',
      }));

      if (newPaymentDetails?.paidCharges?.length > 0) {
        setPaidCharges(newPaymentDetails?.paidCharges);
      }
    }
  }, [newPaymentDetails, setStatusData]);

  useEffect(() => {
    if (orderItemId) {
      getAccountingDetail({ orderItemId })
        .unwrap()
        .then((res) => setAccountingData(res));
    }
  }, [orderItemId]);

  return {
    newPaymentDetails,
    leadIdFromOrder,
    usedCreditShell: statusData.usedCreditShell,
    availableCreditShell: statusData.availableCreditShell,
    refundData,
    paidCharges,
    accountingData,
    cancellationData,
    totalCancellationFee: satangToBaht(cancellationFee),
    processingFee: satangToBaht(excludedProcessingFee),
    discountProRate: satangToBaht(excludedDiscount),
    voucherValue: satangToBaht(voucherValue),
  };
}

export default useCancellationPaymentDetails;
