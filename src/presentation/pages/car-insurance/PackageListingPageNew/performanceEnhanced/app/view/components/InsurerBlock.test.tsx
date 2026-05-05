import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InsurerBlock from './InsurerBlock';
import type { InsurerBlockProps } from './InsurerBlock';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string, opts?: { count?: number }) =>
    opts?.count != null ? `${key}:${opts.count}` : key
  ),
}));

jest.mock('../../../../components/MinMaxNumber', () => {
  return function MockMinMaxNumber({ min, max }: { min: number; max: number }) {
    return (
      <span data-testid="min-max">
        {min}-{max}
      </span>
    );
  };
});

jest.mock('./PremiumRow', () => {
  return function MockPremiumRow({ premium }: { premium: { name: string } }) {
    return <div data-testid="premium-row">{premium.name}</div>;
  };
});

jest.mock('../../../helper', () => ({
  getPremiumIdFromName: jest.fn((name: string) =>
    name.replace(/^premiums\//, '')
  ),
}));

const columnClasses = [
  'col-0',
  'col-1',
  'col-2',
  'col-3',
  'col-4',
  'col-5',
  'col-6',
] as const;

function buildProps(
  overrides: Partial<InsurerBlockProps> = {}
): InsurerBlockProps {
  return {
    insurer: {
      insurerId: 'insurers/7',
      packageCount: 12,
      metrics: [],
    },
    expanded: false,
    ranges: {
      priceMin: 1000,
      priceMax: 50000,
      coverageMin: 100000,
      coverageMax: 500000,
      subModels: [],
    },
    subModels: [],
    selectedSub: '',
    premiums: [],
    isSearchLoading: false,
    isLoadingMore: false,
    onToggle: jest.fn(),
    onSubModelChange: jest.fn(),
    onScroll: jest.fn(),
    expandedDescriptionPremiumId: null,
    premiumDetailsById: {},
    onToggleDescription: jest.fn(),
    onCompare: jest.fn(),
    onPayment: jest.fn(),
    getInsurerName: jest.fn((id: string) => `Insurer ${id}`),
    onQuotation: jest.fn(),
    columnClasses,
    ...overrides,
  };
}

describe('InsurerBlock', () => {
  it('renders insurer name and package count', () => {
    const getInsurerName = jest.fn(() => 'Bangkok Insurance');
    render(<InsurerBlock {...buildProps({ getInsurerName })} />);
    expect(screen.getByText('Bangkok Insurance')).toBeInTheDocument();
    expect(
      screen.getByText(/carInsurance.packagesCount:12/)
    ).toBeInTheDocument();
  });

  it('calls onToggle when header row is clicked', () => {
    const onToggle = jest.fn();
    render(
      <InsurerBlock
        {...buildProps({
          onToggle,
          insurer: { insurerId: 'ins-1', packageCount: 5, metrics: [] },
        })}
      />
    );
    fireEvent.click(screen.getByText('Insurer ins-1'));
    expect(onToggle).toHaveBeenCalledWith('ins-1');
  });

  it('shows submodel select when subModels has options', () => {
    render(
      <InsurerBlock
        {...buildProps({
          subModels: ['Sedan', 'GR Sport'],
          selectedSub: 'Sedan',
        })}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('Sedan');
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('GR Sport')).toBeInTheDocument();
  });

  it('calls onSubModelChange when submodel select changes', () => {
    const onSubModelChange = jest.fn();
    render(
      <InsurerBlock
        {...buildProps({
          subModels: ['Sedan', 'GR Sport'],
          selectedSub: 'Sedan',
          onSubModelChange,
          insurer: { insurerId: 'ins-2', packageCount: 3, metrics: [] },
        })}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'GR Sport' },
    });
    expect(onSubModelChange).toHaveBeenCalledWith('ins-2', 'GR Sport');
  });

  it('shows MinMaxNumber for coverage when ranges have coverageMin and coverageMax', () => {
    render(
      <InsurerBlock
        {...buildProps({
          ranges: {
            priceMin: undefined,
            priceMax: undefined,
            coverageMin: 100000,
            coverageMax: 500000,
            subModels: [],
          },
        })}
      />
    );
    expect(screen.getByTestId('min-max')).toHaveTextContent('100000-500000');
  });

  it('shows MinMaxNumber for price when ranges have priceMin and priceMax', () => {
    render(
      <InsurerBlock
        {...buildProps({
          ranges: {
            priceMin: 5000,
            priceMax: 25000,
            coverageMin: undefined,
            coverageMax: undefined,
            subModels: [],
          },
        })}
      />
    );
    expect(screen.getByTestId('min-max')).toHaveTextContent('5000-25000');
  });

  it('does not show expanded content when expanded is false', () => {
    render(
      <InsurerBlock
        {...buildProps({
          expanded: false,
          premiums: [{ name: 'premiums/P1' } as any],
        })}
      />
    );
    expect(screen.queryByTestId('premium-row')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when expanded, no premiums, and isSearchLoading', () => {
    render(
      <InsurerBlock
        {...buildProps({
          expanded: true,
          premiums: [],
          isSearchLoading: true,
        })}
      />
    );
    const pulseEls = document.querySelectorAll('.animate-pulse');
    expect(pulseEls.length).toBeGreaterThan(0);
  });

  it('renders PremiumRow for each premium when expanded and not loading', () => {
    render(
      <InsurerBlock
        {...buildProps({
          expanded: true,
          premiums: [
            { name: 'premiums/P1' } as any,
            { name: 'premiums/P2' } as any,
          ],
          isSearchLoading: false,
        })}
      />
    );
    expect(screen.getByText('premiums/P1')).toBeInTheDocument();
    expect(screen.getByText('premiums/P2')).toBeInTheDocument();
  });

  it('calls onScroll when scrollable area is scrolled', () => {
    const onScroll = jest.fn();
    render(
      <InsurerBlock
        {...buildProps({
          expanded: true,
          premiums: [{ name: 'P1' } as any],
          onScroll,
          insurer: { insurerId: 'ins-scroll', packageCount: 1, metrics: [] },
        })}
      />
    );
    const scrollDiv = screen.getByText('P1').closest('.overflow-y-auto');
    expect(scrollDiv).toBeInTheDocument();
    fireEvent.scroll(scrollDiv!, { bubbles: true });
    expect(onScroll).toHaveBeenCalled();
  });
});
