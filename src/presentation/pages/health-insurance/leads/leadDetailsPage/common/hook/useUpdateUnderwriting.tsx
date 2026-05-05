import {
  useLazyGetOrderByLeadIdQuery,
  useLazyGetOrderPolicyItemsQuery,
  useUpdateOrderItemByIdMutation,
} from 'data/slices/orderSlice';
import { HEALTH_INSURER_ROWS } from '../../config';
import { useEffect, useState } from 'react';
import useSnackbar from 'utils/snackbar';
import { getString } from 'presentation/theme/localization';

export const useUpdateUnderwritingStatus = (lead: any) => {
  const [status, setStatus] = useState('');
  const [isOrder, setIsOrder] = useState(true);

  const [getOrder, { isError: orderFailed, isLoading: isGettingOrder }] =
    useLazyGetOrderByLeadIdQuery();

  const [
    getOrderItem,
    { isError: orderItemFailed, isLoading: isGettingOrderItem },
  ] = useLazyGetOrderPolicyItemsQuery();
  const [
    updateOrderItem,
    {
      isSuccess,
      isLoading,
      isError: orderItemUpdateFailed,
      isLoading: isUpdatingOrderItem,
      error,
    },
  ] = useUpdateOrderItemByIdMutation();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const getOrderDetails = async () => {
    const response: any = await getOrder({ leadId: lead.humanId });
    if (!response.data?.orders.length) {
      setIsOrder(false);
      return null;
    }

    const orderId = response.data?.orders?.[0].name as string;

    const orderItemsResponse: any = await getOrderItem(orderId.split('/')[1]);

    if (!orderItemsResponse?.data?.length) return null;
    const orderItem = orderItemsResponse.data[0];

    return orderItem;
  };

  const updateStatus = async (status: string) => {
    const orderItem: any = await getOrderDetails();
    if (!orderItem) {
      showErrorSnackbar('no orders yet!!');
      return;
    }
    await updateOrderItem({
      itemId: orderItem.name,
      payload: {
        [HEALTH_INSURER_ROWS.UNDERWRITING_STATUS]: status,
      },
    });
  };

  const getStatus = async () => {
    const details = await getOrderDetails();

    setStatus(
      details?.underwritingStatus !== ''
        ? details?.underwritingStatus
        : 'ITEM_UNDERWRITING_STATUS_PENDING_VALIDATION'
    );
  };

  useEffect(() => {
    getStatus();
  }, [isSuccess, orderFailed, orderItemFailed, orderItemUpdateFailed]);

  useEffect(() => {
    if (orderItemFailed) {
      showErrorSnackbar('Failed to get order items');
      return;
    }
    if (orderFailed) {
      showErrorSnackbar('Failed to get order');
      return;
    }
    if (orderItemUpdateFailed) {
      showErrorSnackbar(
        getString('text.updateOrderFailed', {
          message: (error as any).data.message ?? 'underwriting update failed',
        })
      );
      return;
    }
    if (isSuccess) {
      showSuccessSnackbar(getString('underwriting status updated'));
    }
  }, [isSuccess, isLoading, orderItemUpdateFailed, orderFailed]);

  return {
    getStatus,
    updateStatus,
    status,
    isLoading: isGettingOrder || isGettingOrderItem || isUpdatingOrderItem,
    isSuccess,
    isOrder,
    isError: orderFailed || orderItemFailed || orderItemUpdateFailed,
  };
};
