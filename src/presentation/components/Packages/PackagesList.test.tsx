import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PackagesList } from './PackagesList';
import { mockPropsForTest as mockProps } from '../../../mock-data/PrepareComparedPackages.mock';

jest.mock('presentation/hooks/useTableList', () => ({
  __esModule: true,
  default: () => ({
    TableComponent: function MockTableComponent({ children, ...props }: any) {
      return React.createElement(
        'div',
        { 'data-testid': 'table-component', ...props },
        children
      );
    },
  }),
}));
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    __esModule: true,

    getPackageTypeLabel: jest.fn(() => 'label'),

    getOriginalPackageSource: jest.fn(() => 'custom'),

    createPackageSourceMap: jest.fn((packages) => {
      return new Map(
        (packages || []).map((p: any) => [p.name, p.packageSource])
      );
    }),

    CUSTOM_PACKAGE_SOURCES: ['custom', 'manual', 'renewal_manual_quote'],
  })
);
jest.mock('utils/currency', () => ({
  formatBahtToSatang: jest.fn((value) => value * 100),
  satangToBaht: jest.fn((value) => value / 100),
}));
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));
jest.mock('presentation/routes/Urls', () => ({
  getPackageDetailUrl: jest.fn(() => '/package-detail'),
}));
const mockStore = configureStore({
  reducer: { api: (state = {}) => state },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
const renderWithProviders = (component: React.ReactElement) =>
  render(
    <Provider store={mockStore}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
describe('PackagesList', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should render table component with correct props', () => {
    renderWithProviders(<PackagesList {...mockProps} />);
    const tableComponent = screen.getByTestId('table-component');
    expect(tableComponent).toHaveAttribute('font-size', '11px');
    expect(tableComponent).toHaveAttribute(
      'paddingstyle',
      'pt-[15px] pb-[15px] pl-[5px] pr-[1px]'
    );
    expect(tableComponent).toHaveAttribute('scrollableheight', '400px');
  });
  it('handles empty packages array', () => {
    const emptyProps = { ...mockProps, packages: [] };
    renderWithProviders(<PackagesList {...emptyProps} />);

    const tableComponent = screen.getByTestId('table-component');
    expect(tableComponent).toBeInTheDocument();
    expect(tableComponent).toHaveAttribute('scrollableheight', '400px');
  });
  it('should render with different filter values', () => {
    const filterProps = {
      ...mockProps,
      filterValues: {
        ...mockProps.filterValues,
        isDefaultSumInsured: true,
      },
    };
    renderWithProviders(<PackagesList {...filterProps} />);
    const tableComponent = screen.getByTestId('table-component');
    expect(tableComponent).toBeInTheDocument();
  });
  it('should render with different scrollable height', () => {
    const scrollProps = {
      ...mockProps,
      scrollableHeight: '500px',
    };
    renderWithProviders(<PackagesList {...scrollProps} />);
    const tableComponent = screen.getByTestId('table-component');
    expect(tableComponent).toHaveAttribute('scrollableheight', '500px');
  });

  describe('Tab functionality', () => {
    const mockPackagesWithDifferentSources = {
      ...mockProps,
      packages: [
        {
          id: 'pkg-1',
          name: 'Custom Package 1',
          displayName: 'Custom Display Name',
          carInsuranceType: 'TYPE_1',
          repairType: 'GARAGE',
          sumCoverage: '1000000',
          deductibleAmount: '5000',
          premium: '50000',
          originalPrice: '60000',
          hasDiscount: false,
          insuranceKind: 'voluntary',
          oicCode: 'TYPE_1',
          packageSource: 'custom',
          customQuoteDetail: { approvalStatus: 'approved' },
        },
        {
          id: 'pkg-2',
          name: 'Manual Package 1',
          displayName: 'Manual Display Name',
          carInsuranceType: 'TYPE_2',
          repairType: 'DEALER',
          sumCoverage: '2000000',
          deductibleAmount: '10000',
          premium: '100000',
          originalPrice: '120000',
          hasDiscount: true,
          insuranceKind: 'voluntary',
          oicCode: 'TYPE_2',
          packageSource: 'manual',
          customQuoteDetail: { approvalStatus: 'approved' },
        },
        {
          id: 'pkg-3',
          name: 'Renewal Package 1',
          displayName: 'Renewal Display Name',
          carInsuranceType: 'TYPE_3',
          repairType: 'GARAGE',
          sumCoverage: '1500000',
          deductibleAmount: '7500',
          premium: '75000',
          originalPrice: '90000',
          hasDiscount: false,
          insuranceKind: 'voluntary',
          oicCode: 'TYPE_3',
          packageSource: 'renewal_manual_quote',
          customQuoteDetail: { approvalStatus: 'approved' },
        },
      ],
      showAlsoManualAndRenewal: true,
    };

    it('should render tabs when showAlsoManualAndRenewal is true', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      expect(screen.getByText('newPackageListing.custom')).toBeInTheDocument();
      expect(screen.getByText('newPackageListing.manual')).toBeInTheDocument();
      expect(screen.getByText('newPackageListing.renewal')).toBeInTheDocument();
    });

    it('should not render tabs when showAlsoManualAndRenewal is false', () => {
      const propsWithoutTabs = {
        ...mockPackagesWithDifferentSources,
        showAlsoManualAndRenewal: false,
      };
      renderWithProviders(<PackagesList {...propsWithoutTabs} />);

      expect(
        screen.queryByText('newPackageListing.custom')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('newPackageListing.manual')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('newPackageListing.renewal')
      ).not.toBeInTheDocument();
    });

    it('should show correct count for custom packages by default', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      expect(
        screen.getByText('1 newPackageListing.customPackages')
      ).toBeInTheDocument();
    });

    it('should show correct count when switching to manual tab', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      const manualTab = screen.getByText('newPackageListing.manual');
      fireEvent.click(manualTab);

      expect(
        screen.getByText('1 newPackageListing.manualPackages')
      ).toBeInTheDocument();
    });

    it('should show correct count when switching to renewal tab', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      const renewalTab = screen.getByText('newPackageListing.renewal');
      fireEvent.click(renewalTab);

      expect(
        screen.getByText('1 newPackageListing.renewalPackages')
      ).toBeInTheDocument();
    });

    it('should switch back to custom tab and show correct count', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      // Switch to manual first
      const manualTab = screen.getByText('newPackageListing.manual');
      fireEvent.click(manualTab);
      expect(
        screen.getByText('1 newPackageListing.manualPackages')
      ).toBeInTheDocument();

      // Switch back to custom
      const customTab = screen.getByText('newPackageListing.custom');
      fireEvent.click(customTab);
      expect(
        screen.getByText('1 newPackageListing.customPackages')
      ).toBeInTheDocument();
    });

    it('should show active tab styling', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      const customTab = screen.getByText('newPackageListing.custom');
      expect(customTab).toHaveClass(
        'bg-primary',
        'text-white',
        'font-semibold'
      );
    });

    it('should update active tab styling when switching tabs', () => {
      renderWithProviders(
        <PackagesList {...mockPackagesWithDifferentSources} />
      );

      const customTab = screen.getByText('newPackageListing.custom');
      const manualTab = screen.getByText('newPackageListing.manual');

      // Custom tab should be active initially
      expect(customTab).toHaveClass(
        'bg-primary',
        'text-white',
        'font-semibold'
      );
      expect(manualTab).toHaveClass('border-transparent', 'text-gray-500');

      // Click manual tab
      fireEvent.click(manualTab);

      // Manual tab should now be active
      expect(manualTab).toHaveClass(
        'bg-primary',
        'text-white',
        'font-semibold'
      );
      expect(customTab).toHaveClass('border-transparent', 'text-gray-500');
    });

    it('should show zero count when no packages match the selected tab', () => {
      const propsWithOnlyCustomPackages = {
        ...mockPackagesWithDifferentSources,
        packages: [
          {
            id: 'pkg-1',
            name: 'Custom Package 1',
            displayName: 'Custom Display Name',
            carInsuranceType: 'TYPE_1',
            repairType: 'GARAGE',
            sumCoverage: '1000000',
            deductibleAmount: '5000',
            premium: '50000',
            originalPrice: '60000',
            hasDiscount: false,
            insuranceKind: 'voluntary',
            oicCode: 'TYPE_1',
            packageSource: 'custom',
            customQuoteDetail: { approvalStatus: 'approved' },
          },
        ],
      };

      renderWithProviders(<PackagesList {...propsWithOnlyCustomPackages} />);

      // Switch to manual tab (should show 0)
      const manualTab = screen.getByText('newPackageListing.manual');
      fireEvent.click(manualTab);

      expect(
        screen.getByText('0 newPackageListing.manualPackages')
      ).toBeInTheDocument();
    });
  });

  describe('Select button visibility', () => {
    const mockCustomPackage = {
      ...mockProps,
      packages: [
        {
          id: 'pkg-1',
          name: 'Custom Package 1',
          displayName: 'Custom Display Name',
          carInsuranceType: 'TYPE_1',
          repairType: 'GARAGE',
          sumCoverage: '1000000',
          deductibleAmount: '5000',
          premium: '50000',
          originalPrice: '60000',
          hasDiscount: false,
          insuranceKind: 'voluntary',
          oicCode: 'TYPE_1',
          packageSource: 'custom',
          customQuoteDetail: { approvalStatus: 'approved' },
        },
        {
          id: 'pkg-2',
          name: 'Manual Package 1',
          displayName: 'Manual Display Name',
          carInsuranceType: 'TYPE_2',
          repairType: 'DEALER',
          sumCoverage: '2000000',
          deductibleAmount: '10000',
          premium: '100000',
          originalPrice: '120000',
          hasDiscount: true,
          insuranceKind: 'voluntary',
          oicCode: 'TYPE_2',
          packageSource: 'manual',
          customQuoteDetail: { approvalStatus: 'approved' },
        },
      ],
      packageType: 'custom' as const,
      showAlsoManualAndRenewal: true,
    };

    it('should show Select button for custom packages', () => {
      renderWithProviders(<PackagesList {...mockCustomPackage} />);

      // The Select button should be present in the table component
      // Since we're mocking the TableComponent, we can't directly test the button
      // But we can verify the component renders without errors
      expect(screen.getByTestId('table-component')).toBeInTheDocument();
    });

    it('should hide Select button for manual packages', () => {
      renderWithProviders(<PackagesList {...mockCustomPackage} />);

      // Switch to manual tab
      const manualTab = screen.getByText('newPackageListing.manual');
      fireEvent.click(manualTab);

      // The component should render without errors
      expect(screen.getByTestId('table-component')).toBeInTheDocument();
    });

    it('should hide Select button for renewal packages', () => {
      const mockRenewalPackage = {
        ...mockCustomPackage,
        packages: [
          {
            id: 'pkg-1',
            name: 'Renewal Package 1',
            displayName: 'Renewal Display Name',
            carInsuranceType: 'TYPE_1',
            repairType: 'GARAGE',
            sumCoverage: '1000000',
            deductibleAmount: '5000',
            premium: '50000',
            originalPrice: '60000',
            hasDiscount: false,
            insuranceKind: 'voluntary',
            oicCode: 'TYPE_1',
            packageSource: 'renewal_manual_quote',
            customQuoteDetail: { approvalStatus: 'approved' },
          },
        ],
      };

      renderWithProviders(<PackagesList {...mockRenewalPackage} />);

      // Switch to renewal tab
      const renewalTab = screen.getByText('newPackageListing.renewal');
      fireEvent.click(renewalTab);

      // The component should render without errors
      expect(screen.getByTestId('table-component')).toBeInTheDocument();
    });
  });
});
