import mockPackages from '@alphafounders/mock-data/json/packages.json';
import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Observable } from 'rxjs';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { baseUrls } from 'data/slices/apiSlice';
import WebSocketGateway from 'data/gateway/websocket';
import getEndpoint from 'utils/endpointHelper';
import { buildUrl } from 'utils/url';

/** Matches getPackages RTK query (goBff), including when query params are appended. */
const packagesSearchWithPricingPath = /\/v1alpha1\/leads\/[^/]+\/packages:searchWithPricing/;

/** Same as generateQuotation mutation (goBff + WithPricing). */
const generateAndDownloadQuotationWithPricingUrl = buildUrl(baseUrls.goBff, {
  path: '/v1alpha1:generateAndDownloadQuotationWithPricing',
});

import PackageComparisonPage from '.';
import { usePackagesForComparison } from 'data/slices/packageListing/selector';
import { useLazyGetGenericPackageDetailQuery } from 'data/slices/genericPackageSlice';
import { mockLeadStatusPurchasedPackage } from 'mock-data/GenericPackageDetailResponse.mock';

var mockPushFn: jest.Mock;

jest.mock('react-router-dom', () => {
  mockPushFn = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: 'leadId' }),
    useNavigate: jest.fn().mockReturnValue(mockPushFn),
    useLocation: jest.fn().mockReturnValue({
      search: 'id=packages/1200618,packages/1181883&insuranceKind=BOTH',
    }),
  };
});

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/admin',
    },
  })),
}));

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

jest.mock('data/slices/packageListing/selector', () => ({
  ...jest.requireActual('data/slices/packageListing/selector'),
  usePackagesForComparison: jest
    .fn()
    .mockReturnValue(['packages/1200618', 'packages/1181883']),
}));

jest.mock('data/slices/genericPackageSlice', () => {
  const {
    mockPackageDetailResponse: detailFixture,
  } = require('mock-data/GenericPackageDetailResponse.mock') as typeof import('mock-data/GenericPackageDetailResponse.mock');
  const premiumDetailExtras = {
    invoicePrice: '50000',
    grossMandatoryPremium: '15000',
    grossVoluntaryPremium: '15000',
    sumInsuredDefault: '410000',
    sumInsuredMin: '370000',
    sumInsuredMax: '430000',
  };
  return {
    useLazyGetGenericPackageDetailQuery: jest.fn(() => [
      jest.fn((params: { id: string }) => ({
        unwrap: jest.fn().mockResolvedValue({
          ...detailFixture,
          ...premiumDetailExtras,
          package: {
            ...detailFixture.package,
            name: params.id,
            carRepairType: 'GARAGE',
            carInsuranceType: 'TYPE_1',
          },
        }),
      })),
      { isLoading: false, error: null },
    ]),
  };
});
jest.spyOn(WebSocketGateway, 'getInstance').mockReturnValue({
  subscribe: jest.fn().mockReturnValue(new Observable()),
} as any);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/useAuthorizedUsers',
  () => () => ({
    isLoading: false,
    isUserAllowed: true,
  })
);

const initialState = {
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: 'products/car-insurance',
    },
  },
};

describe('<PackageComparisonPage />', () => {
  beforeEach(() => {
    server.use(
      http.get(packagesSearchWithPricingPath, () =>
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
          humanId: 'H123',
          data: {
            insuranceKind: 'VOLUNTARY',
            carSubModelYear: 2023,
            checkout: { package: 'packages/1200618' },
          },
        })
      )
    );
    mockPushFn.mockClear();
  });

  it('should render the page correctly', async () => {
    render(<PackageComparisonPage />);
    await waitFor(() =>
      expect(screen.getByTestId('package-comparison-page')).toBeInTheDocument()
    );

    await user.click(screen.getByText('packageListing.showOnlyDifference'));
    expect(
      screen.getByText('packageListing.showFullDetail')
    ).toBeInTheDocument();

    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    expect(downloadBtns.length).toBeGreaterThan(0);
  });

  it('should call the Download Quotation api', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(generateAndDownloadQuotationWithPricingUrl, async ({ request }) =>
        HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(<PackageComparisonPage />, {
      initialState,
    });
    await waitFor(() =>
      expect(screen.getByTestId('package-comparison-page')).toBeInTheDocument()
    );
    const downloadBtns = screen.getAllByText(
      'packageListing.downloadQuotation'
    );
    await user.click(downloadBtns[0]);
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
      const body = mockHandler.mock.calls[0][0] as {
        lead: string;
        product: string;
        includeCustomQuote: boolean;
        carInsuranceQuotationFilter: { filters: { package: string }[] };
      };
      expect(body.lead).toBe('leads/leadId');
      expect(body.product).toBe('products/car-insurance');
      expect(body.includeCustomQuote).toBe(true);
      const packagesInPayload = body.carInsuranceQuotationFilter.filters.map(
        (f) => f.package
      );
      expect(packagesInPayload).toEqual(
        expect.arrayContaining(['packages/1200618', 'packages/1181883'])
      );
    });
  });

  it('should go back when click back btn', async () => {
    render(<PackageComparisonPage />);
    await waitFor(() =>
      expect(screen.getByTestId('comparison-sticky-header')).toBeInTheDocument()
    );
    expect(screen.getByText('Back')).toBeInTheDocument();
    await user.click(screen.getByText('Back'));
    expect(mockPushFn).toHaveBeenCalledWith('/leads/leadId/packages');
  });
});
describe('PackageComparisonPage - Premium Packages (lines 82-106)', () => {
  beforeEach(() => {
    server.use(
      http.get(packagesSearchWithPricingPath, () =>
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
      )
    );
    mockPushFn.mockClear();
  });
  it('should process premium packages correctly (lines 82-106)', async () => {
    (usePackagesForComparison as jest.Mock).mockReturnValue([
      'premiums/123',
      'premiums/456',
      'packages/1200600',
    ]);
    const {
      mockPackageDetailResponse: detailFixture,
    } = require('mock-data/GenericPackageDetailResponse.mock') as typeof import('mock-data/GenericPackageDetailResponse.mock');
    const premiumDetailExtras = {
      invoicePrice: '50000',
      grossMandatoryPremium: '15000',
      grossVoluntaryPremium: '15000',
      sumInsuredDefault: '410000',
      sumInsuredMin: '370000',
      sumInsuredMax: '430000',
    };
    const mockGetGenericPackage = jest.fn(
      (params: { id: string; carSubModelYear?: number; insuranceKind?: string }) => ({
        unwrap: jest.fn().mockResolvedValue({
          ...detailFixture,
          ...premiumDetailExtras,
          package: {
            ...detailFixture.package,
            name: params.id,
            carRepairType: 'GARAGE',
            carInsuranceType: 'TYPE_1',
          },
        }),
      })
    );
    (useLazyGetGenericPackageDetailQuery as jest.Mock).mockReturnValue([
      mockGetGenericPackage,
      { isLoading: false, error: null },
    ]);
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/leadId'), () =>
        HttpResponse.json({
          name: 'leads/leadId',
          product: 'products/car-insurance',
          humanId: 'H123',
          data: {
            checkout: { package: 'packages/1200618' },
            carSubModelYear: 2023,
            insuranceKind: 'voluntary',
          },
        })
      )
    );
    render(<PackageComparisonPage />);
    await waitFor(() =>
      expect(screen.getByTestId('package-comparison-page')).toBeInTheDocument()
    );
    await waitFor(() => {
      expect(mockGetGenericPackage).toHaveBeenCalledWith({
        id: 'premiums/123',
        carSubModelYear: 2023,
        insuranceKind: 'VOLUNTARY',
      });
      expect(mockGetGenericPackage).toHaveBeenCalledWith({
        id: 'premiums/456',
        carSubModelYear: 2023,
        insuranceKind: 'VOLUNTARY',
      });
    });
  });
});
test('should show 404 page if lead status is purchased', async () => {
  (usePackagesForComparison as jest.Mock).mockReturnValue([]);
  server.use(
    http.get(packagesSearchWithPricingPath, () =>
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
      HttpResponse.json(mockLeadStatusPurchasedPackage)
    )
  );
  render(<PackageComparisonPage />);
  await waitFor(() =>
    expect(screen.getByText('errorPage.packageNotFound')).toBeInTheDocument()
  );
  (usePackagesForComparison as jest.Mock).mockReturnValue([
    'packages/1200618',
    'packages/1181883',
  ]);
});
