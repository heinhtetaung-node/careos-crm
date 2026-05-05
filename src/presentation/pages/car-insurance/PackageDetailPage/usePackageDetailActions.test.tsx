import { act } from '@testing-library/react';

import { renderHook } from '__tests__/rtl-test-utils';

import usePackageDetailActions from './usePackageDetailActions';

var mockDispatch;
var mockNavigate;
var mockGenerateQuotation;
var mockSelectPackageFn;
var mockGenerateLendingApiPayload;
var mockShowSnackBar;
var mockGetString;

jest.mock('react-redux', () => {
  mockDispatch = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

jest.mock('react-router-dom', () => {
  mockNavigate = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/useGenerateQuotation',
  () => {
    mockGenerateQuotation = jest.fn();
    return () => ({
      generateQuotation: mockGenerateQuotation,
      isLoading: false,
    });
  }
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/usePackageStorage',
  () => () => ({
    packageData: [],
    addToComparison: jest.fn(),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/useSelectPackage',
  () => {
    mockSelectPackageFn = jest.fn();
    return () => [mockSelectPackageFn, { isLoading: false }];
  }
);

jest.mock('data/slices/packageListing', () => ({
  addToComparison: jest.fn(),
  usePackagesForComparison: () => [],
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => {
    mockGenerateLendingApiPayload = jest.fn((payload) => payload);
    return {
      isValidLead: jest.fn(() => true),
      generateLendingApiPayload: mockGenerateLendingApiPayload,
      generateDiscountPricingApiPayload: jest.fn(() => []),
      isPackageSelected: jest.fn(() => false),
    };
  }
);

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackBar = jest.fn((payload) => payload);
  return {
    showSnackBar: mockShowSnackBar,
  };
});

jest.mock('presentation/routes/Urls', () => ({
  getPackagesUrl: jest.fn(() => '/leads/lead-id/packages'),
}));

jest.mock('presentation/theme/localization', () => {
  mockGetString = jest.fn(() => 'general error');
  return {
    getString: mockGetString,
  };
});

const baseProps = {
  leadId: 'lead-id',
  leadName: 'leads/lead-id',
  isPackageDetailView: true,
  enableMultipleSuminsured: false,
  sumInsuredInfo: { min: 100000, max: 200000 },
  lead: {
    data: {
      checkout: {},
      insuranceKind: 'VOLUNTARY',
    },
  },
  filterValues: {
    sumInsured: { min: '100000', max: '200000' },
    paymentOption: 'MONTHLY',
    installment: 10,
    insuranceKind: 'VOLUNTARY',
  },
  packageDetail: {
    id: 'customPackages/123',
    insuranceKind: 'VOLUNTARY',
  },
};

describe('usePackageDetailActions - handleSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses custom quote payment fields when available', async () => {
    mockSelectPackageFn.mockResolvedValue({});

    const { result } = renderHook(() =>
      usePackageDetailActions({
        ...baseProps,
        packageDetail: {
          ...baseProps.packageDetail,
          customQuoteDetail: {
            paymentOption: 'CUSTOM_OPTION',
            paymentMethod: 'QR_CODE',
            numberOfInstallments: 3,
          },
        },
      } as any)
    );

    await act(async () => {
      await result.current.handleSelect();
    });

    expect(mockGenerateLendingApiPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        package: 'customPackages/123',
        insuranceKind: 'VOLUNTARY',
        paymentOption: 'CUSTOM_OPTION',
        paymentMethod: 'QR_CODE',
        installment: 3,
      })
    );
    expect(mockSelectPackageFn).toHaveBeenCalledWith({
      leadId: 'lead-id',
      payload: expect.any(Object),
    });
  });

  test('falls back to filter payment fields when custom quote is absent', async () => {
    mockSelectPackageFn.mockResolvedValue({});

    const { result } = renderHook(() =>
      usePackageDetailActions(baseProps as any)
    );

    await act(async () => {
      await result.current.handleSelect();
    });

    expect(mockGenerateLendingApiPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        package: 'customPackages/123',
        insuranceKind: 'VOLUNTARY',
        paymentOption: 'MONTHLY',
        paymentMethod: undefined,
        installment: 10,
      })
    );
  });

  test('dispatches error snackbar when select package returns error', async () => {
    mockSelectPackageFn.mockResolvedValue({
      error: { data: { message: 'failed' } },
    });

    const { result } = renderHook(() =>
      usePackageDetailActions(baseProps as any)
    );

    await act(async () => {
      await result.current.handleSelect();
    });

    expect(mockGetString).toHaveBeenCalledWith('errorMessage.generalErrorMessage');
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        message: 'general error',
      })
    );
    expect(mockShowSnackBar).toHaveBeenCalled();
  });
});
