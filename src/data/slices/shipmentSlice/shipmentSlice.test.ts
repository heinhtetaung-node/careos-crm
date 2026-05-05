import { ShipmentMethods } from 'shared/constants/orderType';

import type { OrderTransform } from '../orderSlice';

import { updateOrderPolicies } from '.';

describe('Test utils', () => {
  const patch = {
    shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
    statusUpdateTime: '2022-12-14T04:49:03.100453982Z',
  };
  const orderInput = {
    products: [{ name: 'items/123' }, { name: 'items/456' }],
  };
  test.each([
    [
      ShipmentMethods.SHIPMENT_METHOD_COURIER,
      orderInput,
      ['items/123'],
      patch,
      'RABL098919300',
      {
        products: [
          {
            name: 'items/123',
            deliveredByCourier: patch,
            trackingNumber: 'RABL098919300',
          },
          { name: 'items/456' },
        ],
      },
    ],
  ])(
    'Test updateOrderPolicies with shipment method %s ',
    (method, order, items, updatedPatch, trackingNumber, expectation) => {
      updateOrderPolicies(
        order as OrderTransform,
        items,
        updatedPatch,
        method,
        trackingNumber
      );
      expect(orderInput).toMatchObject(expectation);
    }
  );
});
