import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, act } from '__tests__/rtl-test-utils';

import OrderSection from './orderSection';

describe('Testing orderSection Component', () => {
  it('should render no leads text', () => {
    render(<OrderSection orders={[]} classes={{}} />);
    expect(screen.getByTestId('no-orders')).toBeInTheDocument();
  });
  it('should render leads', () => {
    render(
      <OrderSection
        orders={[
          {
            carPlate: 'test',
            orderId: 'test',
            paymentStatus: 'Yes',
            totalInvoice: 12345,
          },
        ]}
        classes={{}}
      />
    );
    const accordion = screen.getByTestId('test-accordion');
    expect(accordion).toBeInTheDocument();

    act(() => {
      expect(accordion.firstElementChild).toBeInTheDocument();
      if (accordion.firstElementChild) {
        userEvent.click(accordion.firstElementChild);
      }
    });
  });
});
