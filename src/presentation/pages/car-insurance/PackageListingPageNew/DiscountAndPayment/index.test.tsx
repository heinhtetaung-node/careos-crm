import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '__tests__/rtl-test-utils';

import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { FilterInterface } from '../PackageFilter/interface';
import DiscountAndPayment from './index';
import { CarInsuranceType } from 'shared/types/packages';

let mockCreatePackageTrigger: any;
let mockUpdatePackageTrigger: any;

jest.mock('./usePaymentInformation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getPaymentOptions: jest.fn(),
    data: {},
    status: { isFetching: false },
  })),
}));

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: () => ({
    showErrorSnackbar: jest.fn(),
  }),
}));

jest.mock('./helper', () => ({
  __esModule: true,
  validationSchema: {
    validateSync: jest.fn(() => ({})),
    validate: jest.fn(() => Promise.resolve({})),
  },
  checkRequireDiscountRequest: jest.fn(() => false),
  updateEligibleVoucherInformation: jest.fn(),
  getFormattedError: jest.fn(() => 'error'),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  __esModule: true,
  useAppSelector: jest.fn(() => 'products/car-insurance'),
}));
// Mock Discount to enable showPricing
jest.mock('./Discount', () => ({
  __esModule: true,
  default: React.forwardRef((props: any, ref: any) => {
    React.useEffect(() => {
      props?.showPricing?.(true);
    }, []);
    return <div data-testid="voucher-section" />;
  }),
}));

const isVoucherLoadingMock = false;

const triggerGetVoucherMock = jest.fn<Promise<any>, [any]>();
const triggerGetCustomPackageMock = jest.fn<Promise<any>, [any]>();
const mockVoucherResponse = {
  data: {
    eligible: true,
    totalValue: { units: 5000 }, // 50 baht
  },
};

const mockCustomPackageResponse = {
  data: {
    voucherEligibility: {
      eligible: true,
      totalValue: { units: 5000 }, // 50 baht
    },
  },
};

triggerGetVoucherMock.mockImplementation(() =>
  Promise.resolve(mockVoucherResponse)
);
triggerGetCustomPackageMock.mockImplementation(() =>
  Promise.resolve(mockCustomPackageResponse)
);
// Mock RTK mutations
jest.mock('data/slices/discountAndPricingSlice', () => ({
  __esModule: true,
  useCreatePackageMutation: () => [
    mockCreatePackageTrigger,
    { isSuccess: false },
  ],
  useUpdatePackageMutation: () => [mockUpdatePackageTrigger, {}],
  useGetVoucherMutation: () => [
    triggerGetVoucherMock,
    { isLoading: isVoucherLoadingMock },
  ],
  useGetCustomPackageMutation: () => [
    triggerGetCustomPackageMock,
    { isLoading: isVoucherLoadingMock },
  ],
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: () => ({
      resetCheckout: jest.fn(),
    }),
  })
);

const mockLeadData: any = {
  name: 'leads/test-lead',
  customer: {
    id: 'customer-1',
    name: 'Test Customer',
    email: 'test@example.com',
    phoneNumber: '0123456789',
  },
  insuranceKind: 'voluntary',
  packageSource: 'standard',
  customQuoteDetail: null,
};

const mockPackageData: any = {
  id: 'test-package-id',
  name: 'Test Package',
  insuranceKind: 'voluntary',
};

const mockCustomPackageData: any = {
  id: 'test-package-id',
  name: 'Test Package',
  insuranceKind: 'voluntary',
  packageSource: 'custom',
  customQuoteDetail: {
    numberOfInstallments: 1,
    discountPercentage: 0,
  },
};

const mockFilter: FilterInterface = {
  insuranceCategory: 'voluntary',
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  orderBy: undefined,
  sortBy: 'default',
  insuranceType: {} as Record<CarInsuranceType, boolean>,
  repairType: 'both',
  deductible: 'all_packages',
  price: { min: 10000, max: 20000 }, // Adjust the range values as needed
  sumInsured: { min: 0, max: 0 }, // Replace with appropriate Range values
  insurer: {},
  isDefaultSumInsured: false,
  subModel: undefined,
  dashCam: false,
  modification: false,
  drivingPurpose: undefined,
  province: undefined,
};

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({
    'brok-3220_enable-voucher-checkbox-on-package-payment-detail-page_20251007_temp':
      {
        enabled: true,
      },
  }),
}));

const defaultProps = {
  onClose: jest.fn(),
  isPackageSelected: false,
  leadData: mockLeadData,
  packageData: mockPackageData,
  filter: mockFilter,
  disable: false,
  setExpendedPackage: jest.fn(),
  setOpenedPackage: jest.fn(),
  refetch: jest.fn(),
};

const renderComponent = (
  props: Partial<{
    onClose: () => void;
    isPackageSelected: boolean;
    leadData: Lead;
    packageData: TransformedPackageType;
    filter: FilterInterface;
    disable?: boolean;
    setExpendedPackage?: (id: string | null) => void;
    setOpenedPackage?: (arg: string[]) => void;
    refetch?: () => void;
  }> = {}
) => render(<DiscountAndPayment {...defaultProps} {...props} />);

describe('DiscountAndPayment', () => {
  beforeEach(() => {
    mockCreatePackageTrigger = jest.fn().mockResolvedValue({ data: {} });
    mockUpdatePackageTrigger = jest.fn().mockResolvedValue({ data: {} });
  });

  it('renders and shows submit button text', () => {
    renderComponent();

    expect(screen.getByTestId('discount-and-payment')).toBeInTheDocument();
    expect(
      screen.getByText(getString('discountPricing.submit'))
    ).toBeInTheDocument();
  });

  it('triggers create mutation on submit', async () => {
    renderComponent();

    const submit = screen.getByText(getString('discountPricing.submit'));
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mockCreatePackageTrigger).toHaveBeenCalled();
    });
  });

  it('triggers update mutation on submit for custom package', async () => {
    renderComponent({
      packageData: mockCustomPackageData,
    });

    const submit = screen.getByText(getString('discountPricing.submit'));
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mockUpdatePackageTrigger).toHaveBeenCalled();
    });
  });

  it('handles error response from getVoucher', () => {
    const mockErrorResponse = { error: { message: 'Something went wrong' } };

    // Mock rejected or error response
    triggerGetVoucherMock.mockImplementation(() =>
      Promise.resolve(mockErrorResponse)
    );
    renderComponent({
      packageData: mockCustomPackageData,
    });

    expect(
      screen.getByText(getString('discountPricing.submit'))
    ).toBeInTheDocument();
  });
});
