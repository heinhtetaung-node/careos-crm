import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { HttpResponse, http } from 'msw';
import { renderHook } from '@testing-library/react-hooks';

import { server } from '__mocks__/server';
import getApiEndpoint from 'utils/endpointHelper';
import { setupApiStore } from '__tests__/rtl-store';
import { act, waitFor } from '__tests__/rtl-test-utils';

import { apiSlice } from '../apiSlice';

import {
  useGetAllItemsQuery,
  useLazyGetAllItemsQuery,
  useGetAccountingQuery,
  useLazyGetAccountingQuery,
  useGetCancellationDataQuery,
} from '.';
import { showMoneyFromUnit } from '../shared/utils';

// Mock data for accounting tests
const mockAccountings = [
  {
    item: {
      humanId: 'ACC001',
      policyNumber: 'POL123',
      grossPremium: 100000, // 1000 baht in satang
      createTime: '2024-01-01T10:00:00Z',
      policyStartDate: '2024-01-01',
    },
    accounting: {
      cancellationStatus: 'ACTIVE',
      actualRemittanceAmountRcb: { units: 100000 },
      premiumRemittanceStatus: 'PAID',
      remittanceRcbTime: '2024-01-01T10:00:00Z',
      actualRemittanceAmountInsurer: { units: 100000 },
      remittanceInsurerTime: '2024-01-01T10:00:00Z',
      premiumReturnStatus: 'NONE',
      latestPremiumRemittanceStatusTime: '2024-01-01T10:00:00Z',
      latestPremiumReturnStatusTime: '2024-01-01T10:00:00Z',
      actualReturnAmountInsurer: { units: 0 },
      returnInsurerTime: '2024-01-01T10:00:00Z',
      actualReturnAmountRcb: { units: 0 },
      returnRcbTime: '2024-01-01T10:00:00Z',
      policyEndTime: '2024-12-31',
      refundCalculationMethod: 'PRO_RATA',
      refundInsurerAmount: { units: 0 },
      commissionClawback: { units: 0 },
      refundAmountCustomer: { units: 0 },
      actualRefundAmountCustomer: { units: 0 },
      refundCustomerTime: '2024-01-01T10:00:00Z',
    },
    attributes: {
      policyHolder: {
        companyName: 'Test Company',
        firstName: 'John',
        lastName: 'Doe',
      },
      carLicensePlate: 'ABC123',
      chassisNumber: 'CHASSIS123',
      paymentPlan: 'MONTHLY',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PAID',
    },
  },
];

const mockAccountingDetail = {
  id: 'ACC001',
  policyNumber: 'POL123',
  cancellationStatus: 'ACTIVE',
  premium: '1,000.00',
  insuredPersonName: 'Test Company',
  licensePlate: 'ABC123',
  chassisNumber: 'CHASSIS123',
  orderCreateDate: '01/01/2024 10:00',
  policyStartDate: '01/01/2024',
  paymentPlan: 'Monthly',
  paymentStatus: 'PAID',
  actualPremiumRemittanceAmountToRCB: '1,000.00',
  premiumRemittanceStatus: 'PAID',
  premiumRemittanceDateToRCB: '01/01/2024',
  actualPremiumRemittanceAmountToInsurer: '1,000.00',
  premiumRemittanceDateToInsurer: '01/01/2024',
  premiumReturnStatus: 'NONE',
  latestPremiumRemittanceStatusDate: '01/01/2024',
  latestPremiumReturnStatusDate: '01/01/2024',
  actualReturnAmountFromInsurer: '-',
  premiumReturnDateFromInsurer: '01/01/2024',
  actualReturnAmountFromRCB: '-',
  premiumReturnDateFromRCB: '01/01/2024',
  policyEndDate: '01/01/2024',
  refundCalculationMethod: 'PRO_RATA',
  refundAmountFromInsurer: '-',
  commissionClawback: '-',
  refundAmountToCustomer: '-',
  actualRefundAmountToCustomer: '-',
  refundDate: '01/01/2024',
};

// Setup store and wrapper
const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

beforeEach(() => {
  server.use(
    // Mock getAllItems endpoint
    http.get(
      getApiEndpoint('/api/lead-search/v1alpha1/accountings:search'),
      () => HttpResponse.json({ accountings: mockAccountings, total: 1 })
    ),
    // Mock getAccounting endpoint
    http.get(
      getApiEndpoint('/api/order/v1alpha1/:orderItemId/accounting'),
      () => HttpResponse.json(mockAccountingDetail)
    )
  );
});

// Test showMoneyFromUnit utility function
describe('showMoneyFromUnit utility function', () => {
  it('should return "-" when amount has no units', () => {
    const amount = { someOtherProperty: 'value' };
    const result = showMoneyFromUnit(amount);
    expect(result).toBe('-');
  });

  it('should return "-" when amount is null', () => {
    const result = showMoneyFromUnit(null);
    expect(result).toBe('-');
  });

  it('should return "-" when amount is undefined', () => {
    const result = showMoneyFromUnit(undefined);
    expect(result).toBe('-');
  });

  it('should return "-" for edge cases', () => {
    expect(showMoneyFromUnit(0)).toBe('-');
    expect(showMoneyFromUnit(-1)).toBe('-');
    expect(showMoneyFromUnit('100')).toBe('-');
    expect(showMoneyFromUnit([])).toBe('-');
    expect(showMoneyFromUnit({})).toBe('-');
  });
});

// Test useGetAllItemsQuery
test('Test useGetAllItemsQuery returns accountings', async () => {
  const { result, waitForNextUpdate } = renderHook(
    () => useGetAllItemsQuery({ queryParams: {} }),
    { wrapper }
  );

  await waitForNextUpdate();

  expect(result.current.data).toBeDefined();
  expect(result.current.isSuccess).toBe(true);
  expect(result.current.data?.imports).toHaveLength(1);
  expect(result.current.data?.imports[0].id).toBe('ACC001');
});

// Test useLazyGetAllItemsQuery
test('Test useLazyGetAllItemsQuery', async () => {
  const { result } = renderHook(() => useLazyGetAllItemsQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ queryParams: {} });
  });

  await waitFor(() => {
    expect(result.current[1].data?.imports?.length).toBeGreaterThan(0);
    expect(result.current[1].isSuccess).toBe(true);
  });
});

// Test useLazyGetAllItemsQuery error state
test('Test useLazyGetAllItemsQuery error state', async () => {
  server.use(
    http.get(
      getApiEndpoint('/api/lead-search/v1alpha1/accountings:search'),
      () => HttpResponse.error()
    )
  );

  const { result } = renderHook(() => useLazyGetAllItemsQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ queryParams: {} });
  });

  await waitFor(() => {
    expect(result.current[1].isError).toBe(true);
  });
});

// Test useGetAccountingQuery
test('Test useGetAccountingQuery returns accounting detail', async () => {
  const { result, waitForNextUpdate } = renderHook(
    () => useGetAccountingQuery({ orderItemId: 'ACC001' }),
    { wrapper }
  );

  await waitForNextUpdate();

  expect(result.current.data).toBeDefined();
  expect(result.current.isSuccess).toBe(true);
  expect(result.current.data?.id).toBe('ACC001');
});

// Test useLazyGetAccountingQuery
test('Test useLazyGetAccountingQuery', async () => {
  const { result } = renderHook(() => useLazyGetAccountingQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ orderItemId: 'ACC001' });
  });

  await waitFor(() => {
    expect(result.current[1].data).toBeDefined();
    expect(result.current[1].isSuccess).toBe(true);
  });
});

// Test useLazyGetAccountingQuery error state
test('Test useLazyGetAccountingQuery error state', async () => {
  server.use(
    http.get(
      getApiEndpoint('/api/order/v1alpha1/:orderItemId/accounting'),
      () => HttpResponse.error()
    )
  );

  const { result } = renderHook(() => useLazyGetAccountingQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ orderItemId: 'ACC001' });
  });

  await waitFor(() => {
    expect(result.current[1].isError).toBe(true);
  });
});

// test useGetCancellationDataQuery
test('Test useGetCancellationDataQuery', async () => {
  const mockCancellationData = {
    id: 'ACC001',
    reason: 'Customer request',
    status: 'cancelled',
    refundedAmount: 100,
    createdAt: '2024-06-01T12:00:00Z',
  };

  server.use(
    http.get(
      getApiEndpoint(
        '/api/financialtransaction/v1alpha3/:orderItemId/cancellation-details'
      ),
      () => HttpResponse.json(mockCancellationData)
    )
  );

  const { result, waitForNextUpdate } = renderHook(
    () => useGetCancellationDataQuery({ orderItemId: 'ACC001' }),
    { wrapper }
  );

  await waitForNextUpdate();

  expect(result.current.data).toBeDefined();
  expect(result.current.isSuccess).toBe(true);
  expect(result.current.data?.id).toBe('ACC001');
});

// Test edge cases for getAllItems
test('Test getAllItems with different query parameters', async () => {
  const { result } = renderHook(() => useLazyGetAllItemsQuery(), { wrapper });

  const [trigger] = result.current;

  // Test with status filter
  await act(async () => {
    const response = await trigger({ queryParams: { status: 'ACTIVE' } });
    expect(response).toBeDefined();
  });

  // Test with date range
  await act(async () => {
    const response = await trigger({
      queryParams: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      },
    });
    expect(response).toBeDefined();
  });

  // Test with pagination
  await act(async () => {
    const response = await trigger({
      queryParams: { page: 1, limit: 10 },
    });
    expect(response).toBeDefined();
  });
});

// Test edge cases for getAccounting
test('Test getAccounting with different orderItemId values', async () => {
  const { result } = renderHook(() => useLazyGetAccountingQuery(), { wrapper });

  const [trigger] = result.current;

  // Test with string ID
  await act(async () => {
    const response = await trigger({ orderItemId: 'ACC001' });
    expect(response).toBeDefined();
  });

  // Test with numeric ID
  await act(async () => {
    const response = await trigger({ orderItemId: 12345 });
    expect(response).toBeDefined();
  });

  // Test with UUID format ID
  await act(async () => {
    const response = await trigger({
      orderItemId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(response).toBeDefined();
  });
});

// Test transformResponse edge cases for getAllItems
test('Test getAllItems transformResponse with empty data', async () => {
  server.use(
    http.get(
      getApiEndpoint('/api/lead-search/v1alpha1/accountings:search'),
      () => HttpResponse.json({ accountings: [], total: 0 })
    )
  );

  const { result } = renderHook(() => useLazyGetAllItemsQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ queryParams: {} });
  });

  await waitFor(() => {
    expect(result.current[1].data).toEqual([]);
    expect(result.current[1].isSuccess).toBe(true);
  });
});

test('Test getAllItems transformResponse with missing accountings', async () => {
  server.use(
    http.get(
      getApiEndpoint('/api/lead-search/v1alpha1/accountings:search'),
      () => HttpResponse.json({ total: 0 })
    )
  );

  const { result } = renderHook(() => useLazyGetAllItemsQuery(), { wrapper });

  const [trigger] = result.current;

  act(() => {
    trigger({ queryParams: {} });
  });

  await waitFor(() => {
    expect(result.current[1].data).toEqual([]);
    expect(result.current[1].isSuccess).toBe(true);
  });
});

// Test exported hooks exist and are functions
test('Test exported hooks are functions', () => {
  expect(typeof useGetAllItemsQuery).toBe('function');
  expect(typeof useLazyGetAllItemsQuery).toBe('function');
  expect(typeof useGetAccountingQuery).toBe('function');
  expect(typeof useLazyGetAccountingQuery).toBe('function');
  expect(typeof showMoneyFromUnit).toBe('function');
});
