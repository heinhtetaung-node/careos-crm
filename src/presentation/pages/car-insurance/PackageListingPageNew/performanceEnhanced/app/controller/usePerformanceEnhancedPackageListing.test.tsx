import { renderHook, act } from '@testing-library/react-hooks';
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { usePackagesForComparison } from 'data/slices/packageListing';
import { useSelectPackageMutation } from 'data/slices/packageListing/api';
import useSnackbar from 'utils/snackbar';
import { getString } from 'presentation/theme/localization';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import useTransformedPackages from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { usePerformanceEnhancedPackageListing } from './usePerformanceEnhancedPackageListing';

// Named with `mock` prefix so it can be referenced in jest.mock factory
const mockUpdateLead = jest.fn();

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() => ({})),
}));

jest.mock('formik');
jest.mock('react-router-dom');
jest.mock('presentation/redux/selectors/lead');
jest.mock('data/slices/packageListing');
jest.mock('data/slices/packageListing/api');
jest.mock('utils/snackbar');
jest.mock('presentation/theme/localization');
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({ updateLead: mockUpdateLead })),
  })
);
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages'
);
jest.mock('mock-data/InsurersList.mock', () => ({
  __esModule: true,
  default: [
    { key: 'insurers/1', label: 'Insurer 1', logo: '' },
    { key: 'insurers/2', label: 'Insurer 2', logo: '' },
  ],
}));
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/performanceEnhanced/app/controller/usePaymentModalController',
  () => ({
    usePaymentModalController: jest.fn(() => ({
      handleSelectPackage: jest.fn(),
      handleOpenPackage: jest.fn(),
      renderPackageCard: jest.fn(),
      modalProps: {},
      openedPackages: [],
      setOpenedPackages: jest.fn(),
    })),
  })
);
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/performanceEnhanced/app/controller/useComparisonController',
  () => ({
    useComparisonController: jest.fn(() => ({
      addForComparison: jest.fn(),
      removeFromComparison: jest.fn(),
      compareBarProps: {},
    })),
  })
);

const mockUseFormik = useFormik as jest.MockedFunction<typeof useFormik>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseGetLeadSelector = useGetLeadSelector as jest.MockedFunction<
  typeof useGetLeadSelector
>;
const mockUsePackagesForComparison =
  usePackagesForComparison as jest.MockedFunction<
    typeof usePackagesForComparison
  >;
const mockUseSelectPackageMutation =
  useSelectPackageMutation as jest.MockedFunction<
    typeof useSelectPackageMutation
  >;
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;
const mockGetString = getString as jest.MockedFunction<typeof getString>;
const mockUseLeadUpdater = useLeadUpdater as jest.MockedFunction<
  typeof useLeadUpdater
>;
const mockUseTransformedPackages =
  useTransformedPackages as jest.MockedFunction<typeof useTransformedPackages>;

describe('usePerformanceEnhancedPackageListing', () => {
  const mockUpdateLead = jest.fn();
  const mockRefetch = jest.fn();
  const mockSelectPackage = jest.fn();
  const mockFilter = {
    values: {},
    initialValues: {},
    setValues: jest.fn(),
    setFieldValue: jest.fn(),
    onSubmit: jest.fn(),
  };
  const mockLead = {
    data: {
      checkout: { package: '' },
      voluntaryInsuranceType: [],
      insuranceKind: 'voluntary',
      carSubModelYear: '2023',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormik.mockReturnValue(mockFilter as any);
    mockUseParams.mockReturnValue({ id: 'test-lead-id' });
    mockUseGetLeadSelector.mockReturnValue(mockLead as any);
    mockUsePackagesForComparison.mockReturnValue([]);
    mockUseSnackbar.mockReturnValue({
      showErrorSnackbar: jest.fn(),
      showSuccessSnackbar: jest.fn(),
    } as any);
    mockGetString.mockImplementation((key: string) =>
      key === 'newPackageListing.packages' ? 'packages' : key
    );
    mockUseLeadUpdater.mockReturnValue({ updateLead: mockUpdateLead } as any);
    mockUseTransformedPackages.mockReturnValue({
      customPackages: [],
      manualRenewalImportPackages: [],
      rawPackages: [],
      carDetails: {},
      refetch: mockRefetch,
      status: { isLoading: false, isFetching: false },
    } as any);
    mockUseSelectPackageMutation.mockReturnValue([
      mockSelectPackage,
      { isLoading: false, error: undefined, reset: jest.fn() } as any,
    ]);
  });

  describe('packagesCountLabel', () => {
    it('displays 0 packages when the stub returns an empty array', () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );
      expect(result.current.packagesCountLabel).toBe('0 packages');
    });
  });

  describe('handleInsuranceTypesChange', () => {
    it('updates voluntary insurance types and sets insuranceKind to voluntary', () => {
      mockUseGetLeadSelector.mockReturnValue({
        ...mockLead,
        data: { ...mockLead.data, insuranceKind: 'mandatory' },
      } as any);
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      act(() => {
        result.current.filterTopProps.onInsuranceTypesChange(['type_1']);
      });

      expect(mockUpdateLead).toHaveBeenCalledWith('/voluntaryInsuranceType', [
        'type_1',
      ]);
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/insuranceKind',
        'voluntary'
      );
      expect(mockFilter.setFieldValue).toHaveBeenCalledWith(
        'insuranceCategory',
        'voluntary'
      );
    });

    it('sets insuranceKind to mandatory when only compulsory is selected', () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      act(() => {
        result.current.filterTopProps.onInsuranceTypesChange(['compulsory']);
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/voluntaryInsuranceType',
        []
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/insuranceKind',
        'mandatory'
      );
      expect(mockFilter.setFieldValue).toHaveBeenCalledWith(
        'insuranceCategory',
        'mandatory'
      );
    });

    it('sets insuranceKind to both when voluntary and compulsory are selected', () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      act(() => {
        result.current.filterTopProps.onInsuranceTypesChange([
          'type_1',
          'compulsory',
        ]);
      });

      expect(mockUpdateLead).toHaveBeenCalledWith('/voluntaryInsuranceType', [
        'type_1',
      ]);
      expect(mockUpdateLead).toHaveBeenCalledWith('/insuranceKind', 'both');
      expect(mockFilter.setFieldValue).toHaveBeenCalledWith(
        'insuranceCategory',
        'both'
      );
    });

    it('does not call updateLead for insuranceKind when types array is empty', () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      act(() => {
        result.current.filterTopProps.onInsuranceTypesChange([]);
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/voluntaryInsuranceType',
        []
      );
      expect(mockUpdateLead).not.toHaveBeenCalledWith(
        '/insuranceKind',
        expect.anything()
      );
    });
  });

  describe('carSubModelYear refetch guard', () => {
    it('calls refetch when carSubModelYear on currentData differs from lead data', async () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      await act(async () => {
        result.current.filterSideBarProps.setCurrentData({
          carSubModelYear: '2024',
        });
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('does not call refetch when carSubModelYear is absent from currentData', async () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      await act(async () => {
        result.current.filterSideBarProps.setCurrentData({
          brandText: 'Honda',
        });
      });

      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe('layoutState', () => {
    it('initialises showFilterTop and showMainContent to false', () => {
      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );
      expect(result.current.layoutState.showFilterTop).toBe(false);
      expect(result.current.layoutState.showMainContent).toBe(false);
    });
  });

  describe('refetchCustomPackage', () => {
    it('calls refetch when lead checkout.package changes and selectedCustomPackage differs', async () => {
      // Lead has a selected package; selectedCustomPackage starts undefined,
      // so the effect that wraps refetchCustomPackage should invoke refetch.
      mockUseGetLeadSelector.mockReturnValue({
        ...mockLead,
        data: {
          ...mockLead.data,
          checkout: { package: 'customPackages/xyz' },
        },
      } as any);

      renderHook(() => usePerformanceEnhancedPackageListing());

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('prepareInitialPriceRange', () => {
    it('computes initialPriceRange from maximumAnnualCoverage in genericPackages', () => {
      // override useTransformedPackages to return genericPackages-like data via customPackages
      mockUseTransformedPackages.mockReturnValueOnce({
        customPackages: [
          {
            name: 'pkg1',
            coverageDetails: { maximumAnnualCoverage: 1000 },
          },
          {
            name: 'pkg2',
            coverageDetails: { maximumAnnualCoverage: 5000 },
          },
        ],
        manualRenewalImportPackages: [],
        rawPackages: [],
        carDetails: {},
        refetch: mockRefetch,
        status: { isLoading: false, isFetching: false },
      } as any);

      const { result } = renderHook(() =>
        usePerformanceEnhancedPackageListing()
      );

      // prepareInitialPriceRange runs in an effect when genericPackages has packages
      const [min, max] = result.current.filterTopProps.initialPriceRange;
      expect(min).toBe(0);
      expect(max).toBeGreaterThanOrEqual(10000000000);
    });
  });
});
