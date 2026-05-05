import React from 'react';

import { render, screen, fireEvent } from '__tests__/rtl-test-utils';

import ProductSectionContent from './ProductSectionContent';

describe('ProductSectionContent', () => {
  const mockOnOrderClick = jest.fn();
  const mockOnInfoClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders orderId from data using default orderIdKey', () => {
    render(<ProductSectionContent fields={[]} data={{ orderId: 'ORD-123' }} />);

    expect(screen.getByText('ORD-123')).toBeInTheDocument();
  });

  it('renders orderId from data using custom orderIdKey', () => {
    render(
      <ProductSectionContent
        fields={[]}
        data={{ customOrderId: 'ORD-456' }}
        orderIdKey="customOrderId"
      />
    );

    expect(screen.getByText('ORD-456')).toBeInTheDocument();
  });

  it('renders "-" when orderId is not present', () => {
    render(<ProductSectionContent fields={[]} data={{}} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('does not call onOrderClick when callback is not provided', () => {
    render(<ProductSectionContent fields={[]} data={{ orderId: 'ORD-123' }} />);

    fireEvent.click(screen.getByText('ORD-123'));

    expect(mockOnOrderClick).not.toHaveBeenCalled();
  });

  it('calls onInfoClick with orderId, productType, and data when info button is clicked', () => {
    const testData = { orderId: 'ORD-123', policyNumber: 'POL-001' };
    render(
      <ProductSectionContent
        fields={[]}
        data={testData}
        productType="carInsurance"
        onInfoClick={mockOnInfoClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '' }));

    expect(mockOnInfoClick).toHaveBeenCalledWith(
      'ORD-123',
      'carInsurance',
      testData
    );
  });

  it('does not call onInfoClick when orderId is missing', () => {
    render(
      <ProductSectionContent
        fields={[]}
        data={{}}
        onInfoClick={mockOnInfoClick}
      />
    );

    const infoButton = screen.getByRole('button', { name: '' });
    fireEvent.click(infoButton);

    expect(mockOnInfoClick).not.toHaveBeenCalled();
  });

  it('does not call onInfoClick when callback is not provided', () => {
    render(<ProductSectionContent fields={[]} data={{ orderId: 'ORD-123' }} />);

    const infoButton = screen.getByRole('button', { name: '' });
    fireEvent.click(infoButton);

    expect(mockOnInfoClick).not.toHaveBeenCalled();
  });
});
