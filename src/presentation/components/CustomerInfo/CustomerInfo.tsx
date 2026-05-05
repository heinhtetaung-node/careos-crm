import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useUpdateOrderDataMutation, orderSlice } from 'data/slices/orderSlice';
import { IInputTextPayload } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/InputData';
import InfoPanel from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel';
import { IField } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/type';

import {
  OrderActionTypes,
  updateCustomer,
  updateOrder,
} from 'presentation/redux/actions/order';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { ShipmentProviders, ShippingMethods } from 'shared/constants/orderType';
import { format } from 'utils/datetime';

import { shipmentPayload } from './helper';
import { useDeliveryOptions } from './hooks/preferedDeliveryOptions';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

export const formatCustomerPayload = (
  name: string,
  value: string | number | Date
) => {
  let res;
  switch (name) {
    case 'gender':
      res = (value as string).toUpperCase();
      break;
    case 'dateOfBirth':
      res = new Date(value).toISOString();
      break;
    default:
      res = value;
      break;
  }
  return res;
};

interface CustomerInfoProps {
  readOnly?: boolean;
  isHealthOrder?: boolean;
  isSupervisorOrSalesAgent?: boolean;
}

export const getShipmentPayload = (type: string) => {
  switch (type) {
    case 'ExpressDelivery':
      return [
        {
          op: 'add',
          path: 'data/docsShipmentMethod',
          value: ShippingMethods.COURIER,
        },
        {
          op: 'add',
          path: 'data/deliveryOption',
          value: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
        },
        {
          op: 'add',
          path: 'data/shipmentFee',
          value: 0,
        },
      ];
    case 'StandardDelivery':
      return [
        {
          op: 'add',
          path: 'data/docsShipmentMethod',
          value: ShippingMethods.COURIER,
        },
        {
          op: 'add',
          path: 'data/deliveryOption',
          value: ShipmentProviders.COURIER_PROVIDER_KERRY,
        },
        {
          op: 'add',
          path: 'data/shipmentFee',
          value: 0,
        },
      ];
    case 'DigitalDelivery':
      return [
        {
          op: 'add',
          path: 'data/docsShipmentMethod',
          value: ShippingMethods.EMAIL,
        },
        {
          op: 'add',
          path: 'data/deliveryOption',
          value: ShipmentProviders.EMAIL,
        },
        {
          op: 'add',
          path: 'data/shipmentFee',
          value: 0,
        },
      ];
    default:
      return [
        {
          op: 'add',
          path: 'data/docsShipmentMethod',
          value: type,
        },
      ];
  }
};

export default function CustomerInfo({
  readOnly = false,
  isHealthOrder,
  isSupervisorOrSalesAgent = false,
}: CustomerInfoProps) {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const order = useAppSelector((state) => state.order?.payload);
  const customer = useAppSelector((state) => state.order?.payload?.customer);
  const orderItemsState = useAppSelector((state: any) =>
    orderSlice.endpoints.getOrderItems?.select({
      orderId: orderId ?? '',
    } as any)(state)
  );
  const policyHolder = useAppSelector(
    (state) => state.order?.payload?.data?.policyHolder
  );
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const flags = useFlags([
    FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP,
  ]);
  const isPolicyOptionPreselectFlag =
    flags[FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP]
      ?.enabled ?? false;
  const isCarInsurance = globalProduct === 'products/car-insurance';
  const deliveryOptionEditableLogicIfFlagEnabled =
    !readOnly && !isSupervisorOrSalesAgent;

  const [updatePolicyHolder] = useUpdateOrderDataMutation();
  const [updateOrderSlice] = useUpdateOrderDataMutation();
  const { updateLead } = useLeadUpdater();
  const { deliveryOptionsSelect, deliveryOptionsResponse } =
    useDeliveryOptions(isHealthOrder);

  const handleCustomerChange = ({ name, value }: IInputTextPayload) => {
    if (!value) return;
    dispatch({
      type: OrderActionTypes.UPDATE_CUSTOMER,
      payload: { [name]: value },
    });
  };

  const dataSchema: IField[] = [
    {
      title: 'CustomerFirstName',
      value: customer?.firstName || '',
      type: 'text',
      name: 'firstName',
      isEditable: !readOnly && !!customer,
      testId: 'customer-first-name',
    },
    {
      title: 'CustomerLastName',
      value: customer?.lastName || '',
      type: 'text',
      name: 'lastName',
      isEditable: !readOnly && !!customer,
      testId: 'customer-last-name',
    },
    {
      title: 'Gender',
      value: customer?.gender ? customer?.gender.toLowerCase() : '',
      type: 'select',
      isEditable: !readOnly,
      name: 'gender',
      testId: 'customer-gender',
    },
    {
      titleString: getString('text.dateOfBirth'),
      type: 'date',
      value: customer?.dateOfBirth || null,
      name: 'dateOfBirth',
      isEditable: !readOnly,
      disabled: readOnly,
      testId: 'customer-date-of-birth',
    },
    {
      title: 'CommunicationLanguage',
      name: 'communicationLanguage',
      value:
        (orderItemsState?.data as any)?.data?.customerLanguage ||
        policyHolder?.communicationLanguage ||
        'th-th',
      type: 'select',
      isEditable: !readOnly,
      testId: 'customer-comm-lang',
    },
    {
      title: 'CustomerId',
      value: customer?.humanId || '',
      type: 'text',
      isEditable: false,
      testId: 'customer-id',
      name: 'humanId',
      onChange: (payload: IInputTextPayload) => handleCustomerChange(payload),
    },
    {
      title: 'newPreferredDeliveryOptions',
      value: order?.data?.deliveryOption,
      type: 'select',
      isEditable:
        isPolicyOptionPreselectFlag && isCarInsurance
          ? deliveryOptionEditableLogicIfFlagEnabled
          : !readOnly,
      testId: 'prefered-delivery-option',
      name: 'docsShipmentMethod',
      options: deliveryOptionsSelect,
    },
  ];

  const shouldPolicyHolderUpdate = (name: string) =>
    ['firstName', 'lastName', 'dateOfBirth'].includes(name) &&
    policyHolder.isCustomer;

  const onUpdateOrder = async (payload: any) => {
    if (!order?.name) return;
    if (payload.name === 'docsShipmentMethod') {
      const { deliveryOptions } = deliveryOptionsResponse ?? {};
      const updateShipmentMethod = await updateOrderSlice({
        orderId: orderId!,
        payload: deliveryOptions
          ? shipmentPayload(payload.value, deliveryOptions)
          : getShipmentPayload(payload.value),
      });

      const error = (updateShipmentMethod as any)?.error ?? undefined;
      if (error) {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.updateOrderFailed', {
              message: error?.data?.message ?? '',
            }),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
      } else {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.updateOrderSuccessfully'),
            status: CONSTANTS.snackBarConfig.type.success,
          })
        );
      }
    } else if (payload.name === 'communicationLanguage') {
      const isThaiNational = payload.value === 'th-th';

      if (order?.data?.policyHolder?.isCustomer) {
        // if a customer is the policy holder and the customer’s communication language is changed,
        // then update lead.data.customer.isThaiNational as well as lead.data.policyHolder.locale
        // plus update order.data.policyHolder.communicationLanguage
        await updatePolicyHolder({
          orderId: orderId ?? '',
          payload: [
            {
              op: 'add',
              path: 'data/policyHolder/communicationLanguage',
              value: payload.value,
            },
          ],
        });
        await updateLead('/customer/isThaiNational', isThaiNational); // policyHolder/locale update along with it
      } else {
        // if a customer is not the policy holder and the customer’s communication language is changed, then update lead.data.customer.isThaiNational only
        await updateLead('/customer/isThaiNational', isThaiNational);
      }
    } else {
      const { name, value } = payload;
      const formatedOrder = {
        [name]: formatCustomerPayload(name, value),
      };

      dispatch(updateCustomer(formatedOrder));
      // Update policyholder data inside order if field relates to it
      if (shouldPolicyHolderUpdate(name)) {
        await updatePolicyHolder({
          orderId: orderId ?? '',
          payload: [
            {
              op: 'add',
              path: `data/policyHolder/${name}`,
              value:
                name === 'dateOfBirth'
                  ? format(new Date(value), 'yyyy-MM-dd')
                  : value,
            },
          ],
        });
      }
    }
  };

  return (
    <InfoPanel
      dataSchema={dataSchema}
      title={getString('order.customerInfo')}
      handleUpdateOrder={onUpdateOrder}
    />
  );
}
