import deliveryOptionsData from '@alphafounders/mock-data/json/deliveryOptions.json';
import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';

import { useGetDeliveryOptionsQuery } from '.';

describe('useGetDeliveryOptionsQuery', () => {
  it('should fetch delivery options', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/deliveryOptions`,
        () => HttpResponse.json(deliveryOptionsData)
      )
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetDeliveryOptionsQuery()
    );
    expect((result.current as any).data).toBeUndefined();
    expect((result.current as any).isLoading).toBeTruthy();

    await waitForNextUpdate();

    expect((result.current as any).data).toEqual(deliveryOptionsData);
  });
});
