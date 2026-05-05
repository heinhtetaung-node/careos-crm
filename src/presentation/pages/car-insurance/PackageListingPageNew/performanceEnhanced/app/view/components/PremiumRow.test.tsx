import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PremiumRow from './PremiumRow';
import { getPremiumAttrs, formatPriceUnits } from '../../../helper';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
  getLanguage: jest.fn(() => 'en'),
}));

jest.mock('shared/helper/utilities', () => ({
  formatCurrency: jest.fn((val) => `THB ${val}`),
  formatDate: jest.fn((d) => d.toISOString().split('T')[0]),
}));

jest.mock('../../../helper', () => ({
  getPremiumAttrs: jest.fn((premium) => ({
    display_name: 'PKG-001',
    insuranceType: 'Comprehensive',
    repairType: 'Authorized Workshop',
    submodel: 'Sedan',
    maximumannualcoverage: '500000',
    deductible: '1000',
  })),
  getPremiumIdFromName: jest.fn((name) => `id-${name}`),
  formatPriceUnits: jest.fn((units) => {
    const num = Number.parseInt(units, 10);
    return Number.isNaN(num) ? units : (num / 100).toLocaleString('en-US');
  }),
  normalizeInsuranceTypeLabel: jest.fn((value) => value || ''),
}));

const mockGetPremiumAttrs = getPremiumAttrs as jest.MockedFunction<
  typeof getPremiumAttrs
>;
const mockFormatPriceUnits = formatPriceUnits as jest.MockedFunction<
  typeof formatPriceUnits
>;

const mockPremium = {
  premiumId: 'PKG-001',
  name: 'pkg-name-001',
  price: { units: '15000', nanos: 0, currencyCode: 'THB' },
};

const mockPremiumDetail = {
  product: {
    premium: {
      description: 'Test Premium Description',
      price: { units: '15000', nanos: 0, currencyCode: 'THB' },
    },
    package: {
      packageName: 'Test Package',
      insurer: 'insurer-1',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      applicableProvince: 'Bangkok',
    },
    coverages: [
      {
        name: 'mandatoryPrice',
        coverageName: 'Mandatory Insurance',
        coverageType: 'mandatoryPrice',
        singleValue: { units: '600', nanos: 0, currencyCode: 'THB' },
      },
      {
        name: 'voluntaryPrice',
        coverageName: 'Voluntary Insurance',
        coverageType: 'voluntaryPrice',
        singleValue: { units: '400', nanos: 0, currencyCode: 'THB' },
      },
      {
        name: 'repairType',
        coverageName: 'Repair Type',
        coverageType: 'repairType',
        textValue: 'Authorized Workshop',
      },
      {
        name: 'dashCam',
        coverageName: 'Dash Cam Discount',
        coverageType: 'dashCam',
        textValue: 'Required',
      },
      {
        name: 'oicCode',
        coverageName: 'OIC Code',
        coverageType: 'oicCode',
        textValue: 'OIC-123',
      },
      {
        name: 'insuranceType',
        coverageName: 'Insurance Type',
        coverageType: 'insuranceType',
        textValue: 'Comprehensive',
      },
      {
        name: 'deductible',
        coverageName: 'Deductible',
        coverageType: 'deductible',
        singleValue: { units: '1000', nanos: 0, currencyCode: 'THB' },
      },
    ],
  },
};

const columnClasses = [
  'col-0',
  'col-1',
  'col-2',
  'col-3',
  'col-4',
  'col-5',
  'col-6',
];

type PremiumRowProps = React.ComponentProps<typeof PremiumRow>;

function buildProps(overrides: Partial<PremiumRowProps> = {}): PremiumRowProps {
  return {
    premium: mockPremium,
    insurerId: 'insurer-1',
    isDescriptionExpanded: false,
    premiumDetail: undefined,
    onToggleDescription: jest.fn(),
    onCompare: jest.fn(),
    onPayment: jest.fn(),
    getInsurerName: jest.fn((id) => `Insurer ${id}`),
    onQuotation: jest.fn(),
    concatWithBrandModelYear: jest.fn((subModel) => subModel),
    columnClasses,
    ...overrides,
  };
}

describe('PremiumRow', () => {
  it('renders the premium ID', () => {
    render(React.createElement(PremiumRow, buildProps()));
    expect(screen.getByText('PKG-001')).toBeInTheDocument();
  });

  it('renders description toggle button', () => {
    render(React.createElement(PremiumRow, buildProps()));
    expect(
      screen.getByText('newPackageListing.description')
    ).toBeInTheDocument();
  });

  it('renders compare and payment buttons', () => {
    render(React.createElement(PremiumRow, buildProps()));
    expect(
      screen.getByText('newPackageListing.addCompare')
    ).toBeInTheDocument();
    expect(screen.getByText('newPackageListing.payment')).toBeInTheDocument();
  });

  it('calls onToggleDescription when description button is clicked', () => {
    const onToggleDescription = jest.fn();
    render(
      React.createElement(PremiumRow, buildProps({ onToggleDescription }))
    );
    fireEvent.click(screen.getByText('newPackageListing.description'));
    expect(onToggleDescription).toHaveBeenCalledWith(mockPremium.name);
  });

  it('calls onCompare when compare button is clicked', () => {
    const onCompare = jest.fn();
    render(React.createElement(PremiumRow, buildProps({ onCompare })));
    fireEvent.click(screen.getByText('newPackageListing.addCompare'));
    expect(onCompare).toHaveBeenCalledWith(mockPremium.name);
  });

  it('calls onPayment when payment button is clicked', () => {
    const onPayment = jest.fn();
    render(React.createElement(PremiumRow, buildProps({ onPayment })));
    fireEvent.click(screen.getByText('newPackageListing.payment'));
    expect(onPayment).toHaveBeenCalledWith(mockPremium, 'insurer-1');
  });

  it('does not show description section when isDescriptionExpanded is false', () => {
    render(
      React.createElement(
        PremiumRow,
        buildProps({ isDescriptionExpanded: false })
      )
    );
    expect(
      screen.queryByText('newPackageListing.uploadPackageName:')
    ).not.toBeInTheDocument();
  });

  it('shows loading state when expanded but no premiumDetail', () => {
    render(
      React.createElement(
        PremiumRow,
        buildProps({
          isDescriptionExpanded: true,
          premiumDetail: undefined,
        })
      )
    );
    expect(screen.getByText('text.loading')).toBeInTheDocument();
  });

  it('shows error state when isDetailError is true', () => {
    render(
      React.createElement(
        PremiumRow,
        buildProps({
          isDescriptionExpanded: true,
          isDetailError: true,
          premiumDetail: undefined,
        })
      )
    );
    expect(screen.getByText('text.errorFetchingData')).toBeInTheDocument();
    expect(screen.queryByText('text.loading')).not.toBeInTheDocument();
  });

  it('shows detail section when expanded with premiumDetail', () => {
    render(
      React.createElement(
        PremiumRow,
        buildProps({
          isDescriptionExpanded: true,
          premiumDetail: mockPremiumDetail,
        })
      )
    );
    expect(
      screen.getByText('newPackageListing.uploadPackageName:')
    ).toBeInTheDocument();
  });

  it('calls onQuotation when quotation button is clicked in expanded view', () => {
    const onQuotation = jest.fn();
    render(
      React.createElement(
        PremiumRow,
        buildProps({
          isDescriptionExpanded: true,
          premiumDetail: mockPremiumDetail,
          onQuotation,
        })
      )
    );
    fireEvent.click(screen.getByText('newPackageListing.quotation'));
    expect(onQuotation).toHaveBeenCalledWith(mockPremium.name);
  });

  it('renders insurance type badge', () => {
    render(React.createElement(PremiumRow, buildProps()));
    expect(screen.getByText('Comprehensive')).toBeInTheDocument();
  });

  it('renders numeric deductible values directly', () => {
    mockGetPremiumAttrs.mockReturnValueOnce({
      display_name: 'PKG-001',
      insuranceType: 'Comprehensive',
      repairType: 'Authorized Workshop',
      submodel: 'Sedan',
      maximumannualcoverage: '500000',
      deductible: '500000',
    });

    render(React.createElement(PremiumRow, buildProps()));

    expect(mockFormatPriceUnits).toHaveBeenCalledWith('500000');
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });

  it('renders boolean deductible values as yes/no labels', () => {
    mockGetPremiumAttrs.mockReturnValueOnce({
      display_name: 'PKG-001',
      insuranceType: 'Comprehensive',
      repairType: 'Authorized Workshop',
      submodel: 'Sedan',
      maximumannualcoverage: '500000',
      deductible: 'true',
    });

    render(React.createElement(PremiumRow, buildProps()));

    expect(screen.getByText('customTrueFalse.yes')).toBeInTheDocument();
  });

  it('renders dash cam discount based on coverage', () => {
    render(
      React.createElement(
        PremiumRow,
        buildProps({
          isDescriptionExpanded: true,
          premiumDetail: mockPremiumDetail,
        })
      )
    );
    expect(screen.getByText('customTrueFalse.true')).toBeInTheDocument();
  });

  it('divider has aria-hidden="true"', () => {
    const { container } = render(React.createElement(PremiumRow, buildProps()));
    const divider = container.querySelector('.bg-gradient-to-r');
    expect(divider).toHaveAttribute('aria-hidden', 'true');
  });
});
