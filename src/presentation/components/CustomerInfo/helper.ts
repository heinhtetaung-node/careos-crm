import { DeliveryOption } from 'data/slices/deliveryOptionSlice/interface';
import { ShipmentProviders, ShippingMethods } from 'shared/constants/orderType';

export const shipmentPayload = (
  value: string,
  deliveryOptions: DeliveryOption[]
) => {
  const selectedOption = deliveryOptions.find(
    (option: DeliveryOption) => option.name === value
  );
  return [
    {
      op: 'add',
      path: 'data/docsShipmentMethod',
      value:
        value === ShipmentProviders.EMAIL
          ? ShippingMethods.EMAIL
          : ShippingMethods.COURIER,
    },
    {
      op: 'add',
      path: 'data/deliveryOption',
      value,
    },
    {
      op: 'add',
      path: 'data/shipmentFee',
      value: Number(selectedOption?.shipmentFee) ?? 0,
    },
  ];
};

export default shipmentPayload;
