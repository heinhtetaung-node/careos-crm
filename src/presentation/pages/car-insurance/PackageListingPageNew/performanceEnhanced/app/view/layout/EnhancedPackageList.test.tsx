import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedPackageList from './EnhancedPackageList';
import type { EnhancedMiddleContentProps } from './EnhancedPackageList';
import { useEnhancedPackageListController } from '../../controller/useEnhancedPackageListController';
import { getAggregationRanges } from '../../model/insurancePackageApi';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string) => key),
}));

const mockLoadAggregation = jest.fn();
const mockToggleInsurer = jest.fn();
const mockHandleSort = jest.fn();
const mockGetInsurerName = jest.fn((id: string) => `Insurer ${id}`);

jest.mock('../../controller/useEnhancedPackageListController', () => ({
  useEnhancedPackageListController: jest.fn(),
}));

jest.mock('../../model/insurancePackageApi', () => ({
  getAggregationRanges: jest.fn((metrics: unknown[]) => ({
    priceMin: 1000,
    priceMax: 50000,
    coverageMin: 100000,
    coverageMax: 500000,
    subModels: [],
  })),
}));

jest.mock('../components/InsurerBlock', () => {
  return function MockInsurerBlock({
    insurer,
    onToggle,
    concatWithBrandModelYear,
  }: {
    insurer: { insurerId: string; packageCount: number };
    onToggle: (id: string) => void;
    concatWithBrandModelYear?: (subModel: string) => string;
  }) {
    const subModelProbes =
      insurer.insurerId === 'ins-x'
        ? (['Civic LX', 'civic', ''] as const)
        : insurer.insurerId === 'ins-y'
          ? (['3 Sport', '3', ''] as const)
          : (['Camry LE Hybrid', 'camry', ''] as const);
    const concatProbe =
      typeof concatWithBrandModelYear === 'function'
        ? subModelProbes.map((s) => concatWithBrandModelYear(s)).join('||')
        : '';
    return (
      <div data-testid="insurer-block" data-insurer-id={insurer.insurerId}>
        {concatProbe ? (
          <span data-testid={`concat-probe-${insurer.insurerId}`}>
            {concatProbe}
          </span>
        ) : null}
        <button type="button" onClick={() => onToggle(insurer.insurerId)}>
          {insurer.insurerId} ({insurer.packageCount})
        </button>
      </div>
    );
  };
});

const mockUseController =
  useEnhancedPackageListController as jest.MockedFunction<
    typeof useEnhancedPackageListController
  >;

function getDefaultControllerReturn(): ReturnType<
  typeof useEnhancedPackageListController
> {
  return {
    aggregationData: null,
    expandedInsurerIds: [],
    expandedInsurerId: null,
    expandedDescriptionPremiumId: null,
    premiumDetailsById: {},
    searchResultsByInsurer: {},
    loadingMoreInsurerIds: [],
    loadingMoreInsurerId: null,
    selectedSubModelByInsurer: {},
    isSearchLoading: false,
    loadAggregation: mockLoadAggregation,
    toggleInsurer: mockToggleInsurer,
    handleScroll: jest.fn(),
    toggleDescription: jest.fn(),
    handlePaymentClick: jest.fn(),
    handleQuotation: jest.fn(),
    handleSubModelChange: jest.fn(),
    totalCount: '0',
    displayLoading: false,
    getInsurerName: mockGetInsurerName,
  };
}

function buildProps(
  overrides: Partial<EnhancedMiddleContentProps> = {}
): EnhancedMiddleContentProps {
  return {
    genericPackages: {} as any,
    isLoading: false,
    error: undefined,
    handleOpenPackage: jest.fn(),
    addForComparison: jest.fn(),
    handleSort: mockHandleSort,
    sortBy: 'price',
    sortDirection: 'asc',
    filterTopKey: 'key1',
    aggregationCriteria: undefined,
    ...overrides,
  };
}

describe('EnhancedPackageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseController.mockImplementation(() => getDefaultControllerReturn());
  });

  it('shows skeleton when displayLoading is true and no aggregationData', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      displayLoading: true,
      aggregationData: null,
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(
      document.querySelectorAll('[class*="animate-pulse"]').length
    ).toBeGreaterThan(0);
  });

  it('shows error message when error has status', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: null,
    });
    render(
      <EnhancedPackageList
        {...buildProps({
          error: { status: 500, data: { message: 'Server error' } },
        })}
      />
    );
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('shows fallback error text when error has status but no message', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: null,
    });
    render(
      <EnhancedPackageList
        {...buildProps({
          error: { status: 502, data: {} as any },
        })}
      />
    );
    expect(screen.getByText('text.error')).toBeInTheDocument();
  });

  it('shows total count and clear button when aggregationData exists', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: {
        insurers: [
          {
            insurerId: 'ins-1',
            packageCount: 5,
            metrics: [],
          },
        ],
      } as any,
      totalCount: '5',
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(
      screen.getByText(/5 newPackageListing.packages/)
    ).toBeInTheDocument();
    expect(screen.getByText('text.clearAll')).toBeInTheDocument();
  });

  it('calls loadAggregation when clear button is clicked', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers: [] } as any,
      totalCount: '0',
    });
    render(<EnhancedPackageList {...buildProps()} />);
    fireEvent.click(screen.getByText('text.clearAll'));
    expect(mockLoadAggregation).toHaveBeenCalled();
  });

  it('shows no matching products when insurers array is empty', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers: [] } as any,
      totalCount: '0',
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(
      screen.getByText('newPackageListing.errors.no_matching_products_found')
    ).toBeInTheDocument();
  });

  it('renders InsurerBlock for each insurer', () => {
    const insurers = [
      { insurerId: 'ins-1', packageCount: 3, metrics: [] },
      { insurerId: 'ins-2', packageCount: 7, metrics: [] },
    ];
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers } as any,
      totalCount: '10',
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(screen.getAllByTestId('insurer-block')).toHaveLength(2);
    expect(screen.getByText('ins-1 (3)')).toBeInTheDocument();
    expect(screen.getByText('ins-2 (7)')).toBeInTheDocument();
  });

  it('renders column headers with expected labels', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers: [] } as any,
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(
      screen.getByText('newPackageListing.packageName')
    ).toBeInTheDocument();
    expect(
      screen.getByText('newPackageListing.insuranceType')
    ).toBeInTheDocument();
    expect(
      screen.getByText('newPackageListing.repairType')
    ).toBeInTheDocument();
    expect(screen.getByText('newPackageListing.subModel')).toBeInTheDocument();
    expect(
      screen.getByText('newPackageListing.deductible')
    ).toBeInTheDocument();
  });

  it('calls getAggregationRanges for each insurer', () => {
    const insurers = [
      {
        insurerId: 'ins-1',
        packageCount: 1,
        metrics: [{ label: 'price_min' }],
      },
    ];
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers } as any,
    });
    render(<EnhancedPackageList {...buildProps()} />);
    expect(getAggregationRanges).toHaveBeenCalledWith(insurers[0].metrics);
  });

  it('calls handleSort directly when no insurer is expanded', () => {
    mockUseController.mockReturnValue({
      ...getDefaultControllerReturn(),
      aggregationData: { insurers: [] } as any,
    });

    render(<EnhancedPackageList {...buildProps()} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sort by newPackageListing.carCoverage',
      })
    );

    expect(mockHandleSort).toHaveBeenCalledWith('maximumannualcoverage');
    expect(mockToggleInsurer).not.toHaveBeenCalled();
  });

  it('re-toggles expanded insurers around sort click', () => {
    const baseController = {
      ...getDefaultControllerReturn(),
      aggregationData: {
        insurers: [
          { insurerId: 'ins-1', packageCount: 3, metrics: [] },
          { insurerId: 'ins-2', packageCount: 2, metrics: [] },
        ],
      } as any,
    };

    mockUseController.mockReturnValue({
      ...baseController,
      expandedInsurerIds: ['ins-1', 'ins-2'],
    } as any);

    const { rerender } = render(<EnhancedPackageList {...buildProps()} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sort by newPackageListing.carCoverage',
      })
    );

    expect(mockToggleInsurer).toHaveBeenNthCalledWith(1, 'ins-1');
    expect(mockToggleInsurer).toHaveBeenNthCalledWith(2, 'ins-2');
    expect(mockHandleSort).toHaveBeenCalledWith('maximumannualcoverage');

    // Keep expanded once to cover pending-return branch.
    mockUseController.mockReturnValue({
      ...baseController,
      expandedInsurerIds: ['ins-1', 'ins-2'],
    } as any);
    rerender(<EnhancedPackageList {...buildProps()} />);

    // Then make expanded empty to trigger reopen branch.
    mockUseController.mockReturnValue({
      ...baseController,
      expandedInsurerIds: [],
    } as any);
    rerender(<EnhancedPackageList {...buildProps()} />);

    expect(mockToggleInsurer).toHaveBeenNthCalledWith(3, 'ins-1');
    expect(mockToggleInsurer).toHaveBeenNthCalledWith(4, 'ins-2');
  });

  describe('concatWithBrandModelYear (brand / model / sub-model label)', () => {
    it('joins brand, model, stripped sub-model, and year when aggregationCriteria is set', () => {
      mockUseController.mockReturnValue({
        ...getDefaultControllerReturn(),
        aggregationData: {
          insurers: [{ insurerId: 'ins-1', packageCount: 1, metrics: [] }],
        } as any,
        totalCount: '1',
      });

      render(
        <EnhancedPackageList
          {...buildProps({
            aggregationCriteria: {
              brandText: 'Toyota',
              modelText: 'Camry',
              year: '2020',
            } as any,
          })}
        />
      );

      expect(screen.getByTestId('concat-probe-ins-1')).toHaveTextContent(
        [
          'Toyota Camry le hybrid 2020',
          'Toyota Camry 2020',
          'Toyota Camry 2020',
        ].join('||')
      );
    });

    it('omits empty sub-model segment when sub-model duplicates model text', () => {
      mockUseController.mockReturnValue({
        ...getDefaultControllerReturn(),
        aggregationData: {
          insurers: [{ insurerId: 'ins-x', packageCount: 1, metrics: [] }],
        } as any,
        totalCount: '1',
      });

      render(
        <EnhancedPackageList
          {...buildProps({
            aggregationCriteria: {
              brandText: 'Honda',
              modelText: 'Civic',
              year: '2019',
            } as any,
          })}
        />
      );

      expect(screen.getByTestId('concat-probe-ins-x')).toHaveTextContent(
        ['Honda Civic lx 2019', 'Honda Civic 2019', 'Honda Civic 2019'].join(
          '||'
        )
      );
    });

    it('builds label from brand and stripped sub-model when model and year are absent', () => {
      mockUseController.mockReturnValue({
        ...getDefaultControllerReturn(),
        aggregationData: {
          insurers: [{ insurerId: 'ins-y', packageCount: 1, metrics: [] }],
        } as any,
        totalCount: '1',
      });

      render(
        <EnhancedPackageList
          {...buildProps({
            aggregationCriteria: {
              brandText: 'Mazda',
            } as any,
          })}
        />
      );

      expect(screen.getByTestId('concat-probe-ins-y')).toHaveTextContent(
        ['Mazda 3 sport', 'Mazda 3', 'Mazda'].join('||')
      );
    });
  });
});
