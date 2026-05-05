import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from 'presentation/redux/store';
import { OrderType } from 'shared/constants/orderType';

import useOrderSearch, {
  getSearch,
  getNewValue,
  getPayload,
  isCustomerPhone,
} from '..';

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={store as any}>{children}</Provider>
);

test('should useOrderSearch behavior run well', () => {
  const response = renderHook(() => useOrderSearch(), { wrapper });
  expect(response.result).toBeDefined();
});

test('should useOrderSearch > handleSearch behavior run well', () => {
  const response = renderHook(() => useOrderSearch(), { wrapper });
  expect(
    response.result.current.handleSearch({
      orderType: OrderType.All,
      values: {
        search: {
          value: 'mock val',
        },
        date: {
          startDate: 'Start time',
          endDate: 'End time',
        },
      },
    })
  ).toBe(undefined);
});

test('should getSearch run well 1', () => {
  expect(
    getSearch({
      search: {
        value: 'duynt',
      },
    })
  ).toEqual({
    value: 'duynt',
  });
});

test('should getSearch run well 2', () => {
  expect(
    getSearch({
      search: {
        key: 'customerPhone',
        value: '09682',
      },
    })
  ).toEqual({
    key: 'customerPhone',
    value: '09682',
  });
});

test('should getSearch run well 3', () => {
  expect(
    getSearch({
      search: {
        key: 'customerPhone',
        value: 'abcdef',
      },
    })
  ).toEqual({
    key: 'customerPhone',
    value: 'abcdef',
  });
});

test('should getNewValue run well 1', () => {
  expect(
    getNewValue(
      {
        date: {
          startDate: 'Start time',
          endDate: 'End time',
        },
      },
      {
        value: 'customerPhone',
      }
    )
  ).not.toEqual(null);
});

test('should getPayload run well 1', () => {
  expect(getPayload({})).toEqual({
    currentPage: 1,
    isSearching: true,
  });
});

test('should isCustomerPhone run well 1', () => {
  expect(
    isCustomerPhone({
      key: '',
    })
  ).toEqual(false);
});

test('should isCustomerPhone run well 2', () => {
  expect(
    isCustomerPhone({
      key: 'customerPhone',
    })
  ).toEqual(true);
});

test('should isCustomerPhone run well 3', () => {
  expect(isCustomerPhone(null)).toEqual(false);
});
