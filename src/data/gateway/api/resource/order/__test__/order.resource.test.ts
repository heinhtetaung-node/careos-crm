import { OrderType } from 'shared/constants/orderType';

import {
  getName,
  getCallback,
  getFilter,
  getAssignedParamsByOrderPage,
  getFieldFilter,
} from '..';

test('Test getFieldFilter run well 1st', () => {
  expect(getFieldFilter(OrderType.QC)).toEqual('order');
});

test('Test getFieldFilter run well 2nd', () => {
  expect(getFieldFilter(OrderType.Submission)).toEqual('items[]');
});

test('Test getName run well 1st', () => {
  expect(getName('products/duynt')).toEqual('duynt');
});

test('Test getName run well 2nd', () => {
  expect(getName({})).toEqual('');
});

test('Test getName run well 3rd', () => {
  expect(getName('products/')).toEqual('car-insurance');
});

test('Test getCallback run well', () => {
  expect(getCallback('id')).not.toEqual(() => null);
});

test('Test getFilter run well 1st', () => {
  expect(
    getFilter(
      {
        filters: [],
      },
      {}
    )
  ).toEqual([]);
});

test('Test getFilter run well 2nd', () => {
  expect(
    getFilter(
      {
        filters: ['Mock filters'],
      },
      {}
    )
  ).toEqual(['Mock filters']);
});

test('Test getAssignedParamsByOrderPage run well 1st', () => {
  expect(getAssignedParamsByOrderPage(OrderType.Document)).toEqual(
    'order.documentBy'
  );
});

test('Test getAssignedParamsByOrderPage run well 2nd', () => {
  expect(getAssignedParamsByOrderPage(OrderType.QC)).toEqual('order.qcBy');
});

test('Test getAssignedParamsByOrderPage run well 3rd', () => {
  expect(getAssignedParamsByOrderPage('other')).toEqual('');
});
