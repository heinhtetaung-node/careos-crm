import { render, screen } from '@testing-library/react';
import React from 'react';

import PackageDetailGuardedContent from './PackageDetailGuardedContent';

const mockOnGoBack = jest.fn();
const mockOnSelect = jest.fn();
const mockOnCompare = jest.fn();
const mockOnDownloadQuotation = jest.fn();

const defaultProps = {
  lead: {
    name: 'leads/123',
    product: 'products/car-insurance',
    data: { carSubModelYear: 2023, insuranceKind: 'VOLUNTARY' },
  },
  leadId: '123',
  isUserAllowed: true,
  hasTransactions: false,
  packageDetail: {
    id: 'packages/1',
    name: 'Test Package',
    insuranceKind: 'VOLUNTARY',
  },
  orderId: 'Order ID: 12345',
  carDetails: { brand: 'Toyota', model: 'Camry' },
  translatedPackageData: [],
  onGoBack: mockOnGoBack,
  onSelect: mockOnSelect,
  onCompare: mockOnCompare,
  onDownloadQuotation: mockOnDownloadQuotation,
  isSelectLoading: false,
  isDownloadLoading: false,
  isSelected: false,
  isSelectedForComparison: false,
  showButtons: true,
};

jest.mock('presentation/components/NotFound', () => {
  return function MockNotFound({ text }: any) {
    return <div data-testid="not-found">{text}</div>;
  };
});

jest.mock('./InsurerHeader', () => {
  return function MockInsurerHeader() {
    return <div data-testid="insurer-header" />;
  };
});

describe('PackageDetailGuardedContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render PackageDetailContent when all conditions are met', () => {
    render(<PackageDetailGuardedContent {...defaultProps} />);
    expect(screen.getByTestId('insurer-header')).toBeInTheDocument();
    expect(screen.queryByTestId('not-found')).not.toBeInTheDocument();
  });

  it('should render NotFound when packageDetail is null', () => {
    render(<PackageDetailGuardedContent {...defaultProps} packageDetail={null} />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('insurer-header')).not.toBeInTheDocument();
  });

  it('should render NotFound when user is not allowed', () => {
    render(<PackageDetailGuardedContent {...defaultProps} isUserAllowed={false} />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('insurer-header')).not.toBeInTheDocument();
  });

  it('should render NotFound when there are transactions', () => {
    render(<PackageDetailGuardedContent {...defaultProps} hasTransactions />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('insurer-header')).not.toBeInTheDocument();
  });

  it('should render NotFound when lead is not motor or health lead', () => {
    const invalidLead = { 
      name: 'leads/123', 
      product: 'products/loan-lease',
      data: {} 
    };
    render(<PackageDetailGuardedContent {...defaultProps} lead={invalidLead} />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('insurer-header')).not.toBeInTheDocument();
  });
});
