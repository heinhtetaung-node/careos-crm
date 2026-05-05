import mockPaymentOptions from '@alphafounders/mock-data/json/paymentOptions.json';
import transformedPaymentOptions from '@alphafounders/mock-data/json/transformedPaymentOptions.json';
import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import usePaymentInformation from './usePaymentInformation';

describe('usePaymentInformation', () => {
  test('should call the api but return data as undefined when showPricing is passed as false', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'v1alpha1/leads/fakeLeadId/packages/fakePackageId:getPaymentOptions'
        ),
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );

    const { result }: any = renderHook(() => usePaymentInformation());
    await result.current.getPaymentOptions({
      leadId: 'leads/fakeLeadId',
      packageId: 'packages/fakePackageId',
      queryParams: {
        'discount.percentage': 7,
        'discount.amount': 1000,
        'discount.discountType': 'car_discount',
      },
    });

    expect(result.current.data).toEqual(
      expect.objectContaining({
        fullPayment: undefined,
        rabbitCareInstallment: undefined,
        creditCardInstallment: undefined,
      })
    );
  });

  // fix mock data
  test.skip('should call the api but return formatted data', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'v1alpha1/leads/fakeLeadId/packages/fakePackageId:getPaymentOptions'
        ),
        () => HttpResponse.json(mockPaymentOptions)
      )
    );

    const { result }: any = renderHook(() => usePaymentInformation());
    await result.current.getPaymentOptions({
      leadId: 'leads/fakeLeadId',
      packageId: 'packages/fakePackageId',
      queryParams: {
        'discount.percentage': 7,
        'discount.amount': 1000,
        'discount.discountType': 'car_discount',
      },
    });

    expect(result.current.data).toEqual(transformedPaymentOptions);
  });
});
