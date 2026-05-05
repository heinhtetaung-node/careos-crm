import { act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';
import { basePaths, baseUrls } from 'data/slices/apiSlice';

import useSelectPackage from './useSelectPackage';

describe('useSelectPackage', () => {
  const mockSelectPackageHandler = jest.fn().mockReturnValue({});
  const mockDeleteCouponHandler = jest.fn().mockReturnValue({});
  const mockLeadHandler = jest.fn().mockReturnValue({
    data: { checkout: { coupon: 'abcd' } },
  });
  beforeEach(() => {
    mockSelectPackageHandler.mockClear();
    mockDeleteCouponHandler.mockClear();
    server.use(
      http.get(`${baseUrls.salesFlow}/${basePaths.lead}/leads/leadId`, () =>
        HttpResponse.json(mockLeadHandler())
      ),
      http.post(`${baseUrls.goBff}/v1alpha1/leads/leadId:selectPackage`, () =>
        HttpResponse.json(mockSelectPackageHandler())
      ),
      http.post(`${baseUrls.goBff}/v1alpha1/leads/leadId:removeVoucher`, () =>
        HttpResponse.json(mockDeleteCouponHandler())
      )
    );
  });
  test('should remove coupon if coupon exist and installment is more than 1', async () => {
    const { result } = renderHook(() => useSelectPackage('leadId'));
    await waitFor(() => expect(mockLeadHandler).toHaveBeenCalled());
    await act(() =>
      (result.current as any)[0]({
        leadId: 'leadId',
        payload: { installmentPlan: 3 },
      })
    );
    expect(mockSelectPackageHandler).toHaveBeenCalled();
  });
  test('should not remove coupon if coupon exist or installment is 1', async () => {
    const { result } = renderHook(() => useSelectPackage('leadId'));
    await waitFor(() => expect(mockLeadHandler).toHaveBeenCalled());
    await act(() =>
      (result.current as any)[0]({
        leadId: 'leadId',
        payload: { installmentPlan: 1 },
      })
    );
    expect(mockDeleteCouponHandler).not.toHaveBeenCalled();
    expect(mockSelectPackageHandler).toHaveBeenCalled();
  });
});
