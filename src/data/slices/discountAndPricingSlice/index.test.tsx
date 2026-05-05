import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import {
  useLazyGetDiscountCampaignsQuery,
  useLazyGetApproverQuery,
  useLazyGetPricingPaymentOptionsQuery,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('useLazyGetDiscountCampaignsQuery', async () => {
  const mockHandler = jest.fn().mockReturnValue({
    campaigns: [
      {
        name: 'product/products/car-insurance/carmodel/brands/24/models/183/insurer/insurers/27/premium/1000000/repairtype/DEALER/leadtype/LEAD_TYPE_NEW',
        displayName: 'Normal',
        maxDiscountPercent: 0,
      },
    ],
  });

  server.use(
    http.get(
      getApiEndpoint(
        'v1alpha1/leads/fakeLeadId/packages/fakePackageId:discountDetails'
      ),
      () => HttpResponse.json(mockHandler())
    )
  );

  const { result } = renderHook(() => useLazyGetDiscountCampaignsQuery(), {
    wrapper,
  });
  const [getCampaigns] = result.current;

  await act(async () => {
    await getCampaigns({
      leadId: 'leads/fakeLeadId',
      packageId: 'packages/fakePackageId',
      discountType: 'agent_discount',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual([
      {
        displayName: 'Normal',
        maxDiscountPercent: 0,
        name: 'product/products/car-insurance/carmodel/brands/24/models/183/insurer/insurers/27/premium/1000000/repairtype/DEALER/leadtype/LEAD_TYPE_NEW',
      },
    ]);
  });
});

test('useLazyGetApproverQuery', async () => {
  const mockHandler = jest.fn();
  server.use(
    http.get(
      getApiEndpoint('/v1alpha1/products/car-insurance:getApprover'),
      () => HttpResponse.json(mockHandler())
    )
  );

  const { result } = renderHook(() => useLazyGetApproverQuery(), {
    wrapper,
  });
  const [getApprover] = result.current;

  await act(async () => {
    await getApprover({
      queryParams: {
        product: 'products/car-insurance',
        maxDiscountPercent: 12500,
        source: 'fake/campaign/source',
      },
    });
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
});

test('useLazyGetPricingPaymentOptionsQuery', async () => {
  const mockHandler = jest.fn();
  server.use(
    http.get(
      getApiEndpoint(
        'v1alpha1/leads/fakeLeadId/packages/fakePackageId:getPaymentOptions'
      ),
      () => HttpResponse.json(mockHandler())
    )
  );

  const { result } = renderHook(() => useLazyGetPricingPaymentOptionsQuery(), {
    wrapper,
  });
  const [getPricingPaymentOptions] = result.current;

  await act(async () => {
    await getPricingPaymentOptions({
      leadId: 'leads/fakeLeadId',
      packageId: 'packages/fakePackageId',
      queryParams: {
        'discount.percentage': 7,
        'discount.amount': 1000,
        'discount.discountType': 'car_discount',
        shipmentFee: 10,
      },
    });
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => {
    expect(mockHandler).toHaveBeenCalled();
    expect(isLoading).toBeFalsy();
  });
});
