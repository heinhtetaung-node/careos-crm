import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,

} from '__tests__/rtl-test-utils';
import getEndpoint from 'utils/endpointHelper';

import CustomPackageDetailPage from './CustomPackageDetailPage';

var mockGoBackFn: jest.Mock;
var mockLocation: jest.Mock;
var mockSortAndFilter: jest.Mock;

jest.mock('@careos/sorting-filtering', () => {
  mockSortAndFilter = jest.fn((_: string, packages: any[]) => ({
    normalPackages: [],
    customPackages: packages || [],
  }));
  return mockSortAndFilter;
});

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation',
  () => jest.fn((packages: any[]) => packages || [])
);

jest.mock('react-router-dom', () => {
  mockGoBackFn = jest.fn();
  mockLocation = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: 'leadId' }),
    useNavigate: jest.fn().mockReturnValue(mockGoBackFn),
    useLocation: mockLocation.mockReturnValue({
      search:
        '?insuranceKind=VOLUNTARY&sumInsuredMin=36000000&sumInsuredMax=46000000&id=customPackages/123',
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

const mockCarData = [
  {
    car: [
      {
        id: 'cars/123',
        displayName: 'Test Car',
        engineSize: 2000,
        transmissionType: 'AUTOMATIC',
        doors: 4,
        sumInsuredMax: 1000000,
      },
    ],
    manufacturedYears: [2023],
    uniqueBrands: [{ id: 'brands/1', name: 'Toyota' }],
    uniqueModels: [{ id: 'models/1', name: 'Camry' }],
  },
];

const mockCustomPackages = [
  {
    id: 'customPackages/123',
    name: 'customPackages/123',
    title: 'Custom Package 1',
    insuranceKind: 'VOLUNTARY',
    premium: 30000,
    price: 30000,
    invoicePrice: '3000000',
    carInsuranceType: 'type1',
  },
];

describe('<CustomPackageDetailPage />', () => {
  beforeEach(() => {
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/leadId'), () =>
        HttpResponse.json({
          name: 'leads/leadId',
          humanId: 'H12345',
          product: 'products/car-insurance',
          data: {
            carSubModelYear: 2023,
            insuranceKind: 'VOLUNTARY',
            carUsageType: 'PERSONAL',
            carDashCam: false,
            registeredProvince: 'Bangkok',
            checkout: {
              installments: 10,
              paymentMethod: 'QR_CODE',
              paymentOption: 'RABBIT_CARE_INSTALLMENT',
              package: '',
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
                name: 'leads/leadId/assignments/123',
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
      ),
      http.get(
        getEndpoint('/api/car/v1alpha1/brands/-/models/-/submodels/-/years/2023:getUniqueCars'),
        () => HttpResponse.json(mockCarData)
      ),
      http.get(getEndpoint('/v1alpha1/leads/leadId/packages:searchWithPricing'), () =>
        HttpResponse.json({
          packages: {
            packages: mockCustomPackages,
            carDetails: {
              brand: 'Toyota',
              model: 'Camry',
              year: 2023,
            },
          },
        })
      )
    );
    mockGoBackFn.mockClear();
  });

  test('should render correctly', async () => {
    render(<CustomPackageDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('remark.title')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should go back when click back btn', async () => {
    render(<CustomPackageDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('text.back')).toBeInTheDocument();
    }, { timeout: 3000 });
    const backBtn = screen.getByText('text.back');
    await user.click(backBtn);
    expect(mockGoBackFn).toHaveBeenCalledTimes(1);
  });

  test('should handle car data loading', async () => {
    render(<CustomPackageDetailPage />);
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
