import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';

import useGenerateQuotation from './useGenerateQuotation';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

describe('useGenerateQuoation', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should call show success snackbar if api success when feature flag is off', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateAndDownloadQuotation`,
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    const { result }: any = renderHook(useGenerateQuotation);
    await result.current.generateQuotation({
      leadId: 'leads/e7c89d52-7210-43fe-ac83-e537970e8086',
      packageFilter: {
        packages: ['packages/1'],
        insuranceKind: 'MANDATORY',
        sumInsuredMin: '100000',
        sumInsuredMax: '10000000',
      },
    });
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        lead: 'leads/e7c89d52-7210-43fe-ac83-e537970e8086',
        packageFilter: {
          insuranceKind: 'MANDATORY',
          packages: ['packages/1'],
          sumInsuredMax: '10000000',
          sumInsuredMin: '100000',
        },
        product: '',
      })
    );
  });

  test('should call new api and show success snackbar if api success when feature flag is on', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateAndDownloadQuotationWithPricing`,
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    const { result }: any = renderHook(useGenerateQuotation);
    await result.current.generateQuotation({
      leadId: 'leads/e7c89d52-7210-43fe-ac83-e537970e8086',
      packageFilter: {
        packages: ['packages/1'],
        insuranceKind: 'MANDATORY',
        sumInsuredMin: '100000',
        sumInsuredMax: '10000000',
        paymentOption: 'FULL_PAYMENT',
        paymentMethod: 'QR_CODE',
        installmentPlan: 1,
        includeCustomQuote: true,
        includeShipmentFee: true,
      },
    });

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        lead: 'leads/e7c89d52-7210-43fe-ac83-e537970e8086',
        packageFilter: {
          installmentPlan: 1,
          insuranceKind: 'MANDATORY',
          packages: ['packages/1'],
          paymentMethod: 'QR_CODE',
          paymentOption: 'FULL_PAYMENT',
          sumInsuredMax: '10000000',
          sumInsuredMin: '100000',
          includeCustomQuote: true,
          includeShipmentFee: true,
        },
        product: '',
      })
    );
  });

  test('should call show error snackbar if api is error when feature flag is off', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateAndDownloadQuotation`,
        () => HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useGenerateQuotation);
    await result.current.generateQuotation({
      leadId: 'leads/e7c89d52-7210-43fe-ac83-e537970e8086',
      packageFilter: {
        packages: ['packages/1'],
        insuranceCategory: 'mandatory',
        sumInsuredMin: 1000,
        sumInsuredMax: 100000,
      },
    });
    expect(mockedShowSnackBar).toHaveBeenCalled();
  });
});
