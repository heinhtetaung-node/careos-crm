import mockPackages from '@alphafounders/mock-data/json/packages.json';
import mockSelectedPackageResponse from '@alphafounders/mock-data/json/selectedPackage.json';
import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Observable } from 'rxjs';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';
import WebSocketGateway from 'data/gateway/websocket';
import getEndpoint from 'utils/endpointHelper';

import PackageDetailPage from './index';

var mockGoBackFn: jest.Mock;
var mockLocation: jest.Mock;

jest.mock('react-router-dom', () => {
  mockGoBackFn = jest.fn();
  mockLocation = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: 'leadId' }),
    useNavigate: jest.fn().mockReturnValue(mockGoBackFn),
    useLocation: mockLocation.mockReturnValue({
      search:
        '?insuranceKind=VOLUNTARY&sumInsuredMin=36000000&sumInsuredMax=46000000&id=packages/1200618',
    }),
  };
});

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/sales',
      name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
    },
  })),
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/useAuthorizedUsers',
  () => () => ({
    isLoading: false,
    isUserAllowed: true,
  })
);

jest.mock('shared/helper/SessionStorage', () => ({
  ...jest.requireActual('shared/helper/SessionStorage'),
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getItemByKey: jest.fn((key) => {
      if (key === 'PACKAGE_FILTER-') {
        return '{"sortBy":"brand","insuranceCategory":"both","insuranceType":{"Type 1":true,"Type 2":true,"Type 3":true,"Type 2+":true,"Type 3+":true},"repairType":"both","deductible":"no_deductible","price":{"min":646,"max":25000},"sumInsured":{"min":0,"max":10000000},"insurer":{"insurer/5":true, "insurer/27": true}}';
      }
      return null;
    }),
  })),
}));

jest.spyOn(WebSocketGateway, 'getInstance').mockReturnValue({
  subscribe: jest.fn().mockReturnValue(new Observable()),
} as any);

describe('<PackageDetailPage />', () => {
  beforeEach(() => {
    server.use(
      http.get(
        getEndpoint('/v1alpha1/leads/leadId/packages:searchWithPricing'),
        () =>
          HttpResponse.json({
            packages: {
              packages: mockPackages,
              carDetails: {
                brand: 'Toyota',
                model: 'Camry',
                year: 2023,
              },
            },
          })
      ),
      http.get(getEndpoint('/api/lead/v1alpha2/leads/leadId'), () =>
        HttpResponse.json({
          name: 'leads/leadId',
          product: 'products/car-insurance',
          data: {
            insuranceKind: 'VOLUNTARY',
            carSubModelYear: 2023,
            checkout: {
              installments: 10,
              paymentMethod: 'QR_CODE',
              paymentOption: 'RABBIT_CARE_INSTALLMENT',
            },
          },
        })
      ),
      http.get(
        getEndpoint('/api/assign/v1alpha1/leads/leadId/assignments'),
        () =>
          HttpResponse.json({
            assignments: [
              {
                name: 'leads/074cc961-7e74-48c6-a63f-95dffff7421c/assignments/4e8822e2-a4e0-49e2-9b73-e9231ee4bd9a',
                user: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
                createTime: '2022-09-06T10:36:34.504682Z',
                deleteTime: null,
                kind: 'LEAD',
                createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
                deleteBy: '',
              },
            ],
            nextPageToken: '',
          })
      )
    );
    mockGoBackFn.mockClear();
  });

  test('should render correctly', async () => {
    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    expect(screen.getByText('remark.title')).toBeInTheDocument();
    expect(screen.getByText('Assets Insurance')).toBeInTheDocument();
  });

  test('should go back when click back btn', async () => {
    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    await user.click(screen.getByText('text.back'));
    expect(mockGoBackFn).toHaveBeenCalled();
  });

  test('test on Download Quotation', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(
        getEndpoint('/v1alpha1:generateAndDownloadQuotationWithPricing'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    await user.click(downloadBtns[0]);
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          carInsuranceQuotationFilter: {
            filters: [
              expect.objectContaining({
                insuranceKind: expect.stringMatching(
                  /^(VOLUNTARY|MANDATORY|BOTH)$/
                ),
                package: 'packages/1200618',
                sumInsuredMax: '46000000',
                sumInsuredMin: '36000000',
              }),
            ],
          },
          includeCustomQuote: true,
          includeShipmentFee: true,
          lead: 'leads/leadId',
          product: '',
        })
      )
    );
  });

  test('test on Compare click', async () => {
    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    await user.click(screen.getByText('packageListing.compare'));
    expect(mockGoBackFn).toHaveBeenCalled();
  });

  test('showing selected package should work correctly if feature flag is on', async () => {
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/leadId'), (_) =>
        HttpResponse.json({
          name: 'leads/leadId',
          product: 'products/car-insurance',
          data: { checkout: { package: 'packages/1200618' } },
        })
      )
    );
    render(<PackageDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('packageListing.selected')).toBeInTheDocument()
    );
  });

  test('should call view selected package endpoint if there is no query params', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.get(
        getEndpoint('/v1alpha1/leads/leadId:viewSelectedPackageWithPricing'),
        () => {
          mockHandler();
          return HttpResponse.json(mockSelectedPackageResponse);
        }
      )
    );
    mockLocation.mockReturnValue({ search: '' });
    render(<PackageDetailPage />);
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });

  test('Download Quotation with multiple query params', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(
        getEndpoint('/v1alpha1:generateAndDownloadQuotationWithPricing'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    mockLocation.mockReturnValue({
      search:
        '?insuranceKind=BOTH&paymentOption=RABBIT_CARE_INSTALLMENT&installmentPlan=10&sumInsuredMin=36000000&sumInsuredMax=46000000&id=packages/1200618',
    });

    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    await user.click(downloadBtns[0]);
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          carInsuranceQuotationFilter: {
            filters: [
              expect.objectContaining({
                installmentPlan: 10,
                insuranceKind: expect.stringMatching(
                  /^(VOLUNTARY|MANDATORY|BOTH)$/
                ),
                package: 'packages/1200618',
                paymentMethod: 'QR_CODE',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                sumInsuredMax: '46000000',
                sumInsuredMin: '36000000',
              }),
            ],
          },
          includeCustomQuote: true,
          includeShipmentFee: true,
          lead: 'leads/leadId',
          product: '',
        })
      )
    );
  });

  test('Download Quotation when user opens the page as view selected package', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(
        getEndpoint('/v1alpha1:generateAndDownloadQuotationWithPricing'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      ),
      http.get(
        getEndpoint('/v1alpha1/leads/leadId:viewSelectedPackageWithPricing'),
        (_) => HttpResponse.json(mockSelectedPackageResponse)
      )
    );

    render(<PackageDetailPage />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    await user.click(downloadBtns[0]);
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          carInsuranceQuotationFilter: {
            filters: [
              expect.objectContaining({
                installmentPlan: 10,
                insuranceKind: expect.stringMatching(
                  /^(VOLUNTARY|MANDATORY|BOTH)$/
                ),
                package: 'packages/1200618',
                paymentMethod: 'QR_CODE',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                sumInsuredMax: '46000000',
                sumInsuredMin: '36000000',
              }),
            ],
          },
          includeCustomQuote: true,
          includeShipmentFee: true,
          lead: 'leads/leadId',
          product: '',
        })
      )
    );
  });

  // FIX ME: This test is failing because of multiple loaders in it.
  test.skip('Download Quotation when user opens the page as view selected package', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(
        getEndpoint('/v1alpha1:generateAndDownloadQuotationWithPricing'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      ),
      http.get(
        getEndpoint('/v1alpha1/leads/leadId:viewSelectedPackageWithPricing'),
        (_) =>
          HttpResponse.json({
            carPackageWithPricing: {
              ...mockSelectedPackageResponse.carPackage,
              customQuoteDetails: {
                paymentOption: 'CREDIT_CARD_INSTALLMENT',
                paymentMethod: 'ONLINECARD',
                numberOfInstallments: 6,
              },
            },
          })
      )
    );

    render(<PackageDetailPage />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    expect(downloadBtns).toHaveLength(2);

    await user.click(downloadBtns[0]);

    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          carInsuranceQuotationFilter: {
            filters: [
              expect.objectContaining({
                insuranceKind: expect.stringMatching(
                  /^(VOLUNTARY|MANDATORY|BOTH)$/
                ),
                package: 'packages/1200618',
                sumInsuredMax: '46000000',
                sumInsuredMin: '36000000',
              }),
            ],
          },
          includeCustomQuote: true,
          includeShipmentFee: true,
          lead: 'leads/leadId',
          product: '',
        })
      )
    );
  });
});
