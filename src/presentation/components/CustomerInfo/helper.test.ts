import { MockDeliveryOptions } from 'mock-data/DeliveryOptions.mock';
import { ShipmentProviders, ShippingMethods } from 'shared/constants/orderType';

import { shipmentPayload } from './helper';

test('Should shipmentPayload return correct docsShipmentMethod as email', () => {
  expect(
    shipmentPayload(
      ShipmentProviders.EMAIL,
      MockDeliveryOptions.deliveryOptions
    )
  ).toStrictEqual([
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
  ]);
});

test('Should shipmentPayload return correct docsShipmentMethod as courier', () => {
  expect(
    shipmentPayload(
      ShipmentProviders.COURIER_PROVIDER_KERRY,
      MockDeliveryOptions.deliveryOptions
    )
  ).toStrictEqual([
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
      value: 50,
    },
  ]);
});

test('Should shipmentPayload return correct shipping fee', () => {
  expect(
    shipmentPayload(
      ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
      MockDeliveryOptions.deliveryOptions
    )
  ).toStrictEqual([
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
      value: 80,
    },
  ]);
});
