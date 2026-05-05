import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformanceEnhancedPackageListingPage from './PerformanceEnhancedPackageListingPage';
import { usePerformanceEnhancedPackageListing } from './app/controller/usePerformanceEnhancedPackageListing';

jest.mock('./app/controller/usePerformanceEnhancedPackageListing', () => ({
  usePerformanceEnhancedPackageListing: jest.fn(),
}));

jest.mock('presentation/components/common/CustomModal', () => {
  return function MockCustomModal({
    show,
    children,
  }: {
    show: boolean;
    children: React.ReactNode;
  }) {
    if (!show) return null;
    return <div data-testid="custom-modal">{children}</div>;
  };
});

jest.mock('presentation/components/Packages/PackagesList', () => ({
  PackagesList: function MockPackagesList() {
    return <div data-testid="packages-list">PackagesList</div>;
  },
}));

jest.mock('../CompareBar', () => {
  return function MockCompareBar() {
    return <div data-testid="compare-bar">CompareBar</div>;
  };
});

jest.mock('../FilterSideBar', () => {
  return function MockFilterSideBar() {
    return <div data-testid="filter-side-bar">FilterSideBar</div>;
  };
});

jest.mock('../FilterTop', () => {
  return function MockFilterTop() {
    return <div data-testid="filter-top">FilterTop</div>;
  };
});

jest.mock('./app/view/layout/EnhancedPackageList', () => {
  return function MockEnhancedMiddleContent() {
    return <div data-testid="enhanced-middle-content">EnhancedMiddleContent</div>;
  };
});

const mockUsePerformanceEnhanced = usePerformanceEnhancedPackageListing as jest.MockedFunction<
  typeof usePerformanceEnhancedPackageListing
>;

function getDefaultHookReturn(): ReturnType<
  typeof usePerformanceEnhancedPackageListing
> {
  return {
    layoutState: {
      showFilterTop: false,
      showMainContent: false,
    },
    filterSideBarProps: {} as any,
    filterTopProps: {} as any,
    enhancedMiddleProps: {} as any,
    packagesListProps: { forceRefreshingTable: false, listProps: {} as any },
    modalProps: {
      show: false,
      handleCloseModal: jest.fn(),
      openedPackage: [],
      setOpenedPackage: jest.fn(),
      renderPackageCard: jest.fn(),
    },
    compareBarProps: {} as any,
    packagesCountLabel: '0 packages',
  };
}

describe('PerformanceEnhancedPackageListingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePerformanceEnhanced.mockReturnValue(getDefaultHookReturn());
  });

  it('renders grid layout with FilterSideBar', () => {
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.getByTestId('filter-side-bar')).toBeInTheDocument();
    expect(screen.getByTestId('compare-bar')).toBeInTheDocument();
  });

  it('does not render FilterTop when showFilterTop is false', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      layoutState: { showFilterTop: false, showMainContent: false },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.queryByTestId('filter-top')).not.toBeInTheDocument();
  });

  it('renders FilterTop when showFilterTop is true', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      layoutState: { showFilterTop: true, showMainContent: false },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.getByTestId('filter-top')).toBeInTheDocument();
  });

  it('does not render EnhancedMiddleContent or PackagesList when showMainContent is false', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      layoutState: { showFilterTop: false, showMainContent: false },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.queryByTestId('enhanced-middle-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('packages-list')).not.toBeInTheDocument();
  });

  it('renders EnhancedMiddleContent and PackagesList when showMainContent is true', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      layoutState: { showFilterTop: false, showMainContent: true },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.getByTestId('enhanced-middle-content')).toBeInTheDocument();
    expect(screen.getByTestId('packages-list')).toBeInTheDocument();
  });

  it('renders CustomModal with modalProps.show', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      modalProps: {
        show: true,
        handleCloseModal: jest.fn(),
        openedPackage: [{ id: 'pkg-1' }],
        setOpenedPackage: jest.fn(),
        renderPackageCard: jest.fn(() => <span>PackageCard</span>),
      },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.getByTestId('custom-modal')).toBeInTheDocument();
    expect(screen.getByText('PackageCard')).toBeInTheDocument();
  });

  it('does not render modal content when modalProps.show is false', () => {
    mockUsePerformanceEnhanced.mockReturnValue({
      ...getDefaultHookReturn(),
      modalProps: {
        show: false,
        handleCloseModal: jest.fn(),
        openedPackage: [],
        setOpenedPackage: jest.fn(),
        renderPackageCard: jest.fn(),
      },
    });
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.queryByTestId('custom-modal')).not.toBeInTheDocument();
  });

  it('renders CompareBar', () => {
    render(<PerformanceEnhancedPackageListingPage />);
    expect(screen.getByTestId('compare-bar')).toBeInTheDocument();
  });
});
