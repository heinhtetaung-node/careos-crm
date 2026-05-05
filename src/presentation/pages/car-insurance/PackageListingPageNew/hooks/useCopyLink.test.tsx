import { http, HttpResponse } from 'msw';
import { act } from 'react-dom/test-utils';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import useCopyLink from './useCopyLink';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

const mockPayload = {
  lead: 'leads/leadId',
  action: 'details',
  product: 'products/car-insurance',
  packageFilter: {
    insuranceCategory: 'mandatory',
    sumInsuredMin: 1000,
    sumInsuredMax: 100000,
    paymentOption: 'FULL_PAYMENT',
    installment: 1,
  },
} as {
  lead: string;
  action: 'details' | 'comparison';
  packageFilter: any;
};

describe('useCopyLink', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should display success snackbar if api returns redirect url and is copied to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    server.use(
      http.post(
        getApiEndpoint('v1alpha1:generateLink', ServicesName.GFF),
        (_) =>
          HttpResponse.json({
            url: 'fakeRedirectUrl',
          })
      )
    );

    const { result } = renderHook(useCopyLink);
    const current = result.current as ReturnType<typeof useCopyLink>;
    await act(async () => {
      await current.copyLink(mockPayload);
    });

    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'clipboard.success',
      status: 'success',
    });
  });

  test('should call new api when feature flag is on', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.post(
        getApiEndpoint('v1alpha1:generateLinkWithPricing', ServicesName.GFF),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );

    const { result }: any = renderHook(useCopyLink);
    await result.current.copyLink({
      ...mockPayload,
      packageFilter: {
        insuranceKind: 'BOTH',
        sumInsuredMin: '100000',
        sumInsuredMax: '10000000',
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        installmentPlan: 1,
      },
    });

    expect(mockHandler).toHaveBeenCalledWith({
      action: 'details',
      lead: 'leads/leadId',
      packageFilter: {
        installmentPlan: 1,
        insuranceKind: 'BOTH',
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        sumInsuredMax: '10000000',
        sumInsuredMin: '100000',
      },
      product: 'products/car-insurance',
      includeCustomQuote: true,
    });
  });

  test('should display error snackbar if api returns error', async () => {
    server.use(
      http.post(getApiEndpoint('v1alpha1:generateLink', ServicesName.GFF), () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    );

    const { result }: any = renderHook(useCopyLink);
    await result.current.copyLink({
      ...mockPayload,
      packageFilter: {
        insuranceCategory: 'mandatory',
        sumInsuredMin: 1000,
        sumInsuredMax: 100000,
        paymentOption: 'RABBIT_CARE_INSTALLMENT',
        installment: 10,
      },
    });

    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'clipboard.apiFailure',
      status: 'error',
    });
  });
});
