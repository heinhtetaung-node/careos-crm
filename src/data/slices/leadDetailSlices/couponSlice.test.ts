import { HttpResponse, http } from 'msw';
import { act } from 'react-dom/test-utils';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import { useAddCouponMutation, useDeleteCouponMutation } from './couponSlice';

describe('couponSlice', () => {
  it('should call go bff to add voucher', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:addVoucher`,
        () => HttpResponse.json(mockHandler())
      )
    );
    const { result } = renderHook(() => useAddCouponMutation());
    await act(() =>
      (result.current as any)[0]({ leadId: 'leadId', coupon: 'coupon' })
    );
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });
  it('should call go bff to remove voucher', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        () => HttpResponse.json(mockHandler())
      )
    );
    const { result } = renderHook(() => useDeleteCouponMutation());
    await act(() => (result.current as any)[0]('leadId'));
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });
});
