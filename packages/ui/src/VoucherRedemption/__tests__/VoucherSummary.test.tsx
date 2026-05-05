import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import VoucherSummary from '../VoucherSummary';

describe('VoucherSummary', () => {
  it('should render VoucherSummary', () => {
    render(
      <VoucherSummary
        image={<img src="https://via.placeholder.com/150" alt="Voucher" />}
        title="Here is your code!"
        subtitle="Use this voucher code by [exp. date]"
        description="If you experience any issue using voucher, please contact [CS tel]"
      />
    );

    expect(screen.getByText('Here is your code!')).toBeInTheDocument();
    expect(
      screen.getByText('Use this voucher code by [exp. date]')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you experience any issue using voucher, please contact [CS tel]'
      )
    ).toBeInTheDocument();
  });
});
