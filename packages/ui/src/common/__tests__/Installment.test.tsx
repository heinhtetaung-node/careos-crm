import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import Installment from '../Installment';

describe('Installment', () => {
  it('should show installment info correctly', () => {
    render(
      <Installment
        firstMonthPayment="1000"
        nextMonthPayment="2000"
        installmentMonth={3}
        totalFee="300"
      />
    );
    expect(screen.getByText('1000 THB')).toBeInTheDocument();
    expect(screen.getByText('3 x 2000 THB')).toBeInTheDocument();
    expect(screen.getByText('300 THB')).toBeInTheDocument();
  });
});
