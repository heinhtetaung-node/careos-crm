import { useEffect } from 'react';
import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';

import {
  useGetSelections,
  clearSelected,
} from 'data/slices/orderPolicySlice/selectionsSlice';
import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { orderSlice, SearchOrderPayload } from 'data/slices/orderSlice';
import {
  ShipmentMethodPayload,
  ShipmentOrderPoliciesType,
  updateOrderPolicies,
  useCreateShipmentMutation,
} from 'data/slices/shipmentSlice';
import { getErrorMsg } from 'presentation/components/Shipment/helper';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { ShipmentMethods } from 'shared/constants/orderType';

interface UseCreateShipmentParams {
  handleError: (payload: string) => void;
  orders?: Record<string, any>[];
  originalArgs?: SearchOrderPayload;
  shipmentMethod: ShipmentMethods;
  shipmentProvider: string;
}

export function useCreateShipment({
  handleError,
  orders,
  originalArgs,
  shipmentMethod,
  shipmentProvider,
}: UseCreateShipmentParams) {
  const dispatch = useAppDispatch();
  const [createShipment, { isLoading, error, isSuccess }] =
    useCreateShipmentMutation();

  const { selectedPolicies } = useGetSelections();
  const selectCorrectNoOfOrders = selectedPolicies?.length === 1;
  const isAllPolicyUploaded =
    selectedPolicies &&
    selectedPolicies[0]?.approvalStatuses?.every(
      (status) => status === 'POLICY_UPLOADED'
    );

  const disabled = !selectCorrectNoOfOrders || !isAllPolicyUploaded;

  const handleCreateShipment = async (
    currentSelection: ShipmentOrderPoliciesType
  ) => {
    const order = orders?.find(
      (orderItem) =>
        orderItem.id === currentSelection.orderId.split('orders/')[1]
    );
    if (order) {
      const payload: ShipmentMethodPayload = {
        orderId: currentSelection.orderId,
        payload: {
          shipmentMethod,
          courierProvider:
            shipmentMethod === ShipmentMethods.SHIPMENT_METHOD_DIGITAL
              ? undefined
              : shipmentProvider,
          items: currentSelection.items,
        },
      };

      try {
        const {
          items,
          shipmentMethod: responseShipmentMethod,
          shipmentStatus,
          statusUpdateTime,
          trackingNumber,
        } = await createShipment(payload).unwrap();

        const patch = { shipmentStatus, statusUpdateTime };
        if (!originalArgs) return;
        dispatch(
          orderSlice.util.updateQueryData(
            'searchOrders',
            originalArgs,
            (draft) => {
              const orderIndex = _findIndex(draft.orders, [
                'id',
                currentSelection.orderId.split('/')[1],
              ]);
              updateOrderPolicies(
                draft.orders[orderIndex],
                items,
                patch,
                responseShipmentMethod as ShipmentMethods,
                trackingNumber
              );
            }
          ) as any
        );
      } catch (e) {
        const errorResponse = _get(e, 'data.message', getString('text.error'));
        handleError(getErrorMsg(errorResponse));
      }
    }
  };

  useEffect(() => {
    if (error) {
      const errorResponse = _get(
        error,
        'data.message',
        getString('text.error')
      );
      handleError(getErrorMsg(errorResponse));
    }
  }, [error, handleError]);

  useEffect(() => {
    if (!isSuccess) return;
    dispatch(clearSelected());
    dispatch(clearItemAssign());
  }, [isSuccess, dispatch]);

  return {
    handleCreateShipment,
    selectedPolicies,
    disabled,
    isLoading,
  };
}
