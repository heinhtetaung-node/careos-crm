import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PolicyDetailModal from './PolicyDetailModal';

describe('PolicyDetailModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders car insurance fields when productType is car-insurance', () => {
    render(
      <PolicyDetailModal
        open
        onClose={mockOnClose}
        orderId="ORD-123"
        productType="products/car-insurance"
        data={{ brand: 'Toyota', model: 'Camry' }}
      />
    );

    expect(
      screen.getByText(/Order #ORD-123 - productionOptions.carInsurance/)
    ).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.brand')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.model')).toBeInTheDocument();
  });

  it('renders health insurance fields when productType is not car-insurance', () => {
    render(
      <PolicyDetailModal
        open
        onClose={mockOnClose}
        orderId="ORD-456"
        productType="products/health-insurance"
        data={{ planName: 'Premium Plan' }}
      />
    );

    expect(
      screen.getByText(/Order #ORD-456 - productionOptions.healthInsurance/)
    ).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.productPlan')
    ).toBeInTheDocument();
  });
});
