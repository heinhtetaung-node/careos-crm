import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import FullPayment from '.';

describe('<FullPayment />', () => {
  it('should render component correctly', async () => {
    const mockSelect = jest.fn();
    render(
      <FullPayment
        fullPaymentData={{
          name: 'fullPayment',
          options: [
            {
              discount: {
                percentage: 33,
              } as any,
              discountAmount: '6105',
              discountRate: -0.33,
              discountType: 'car_discount',
              feeAmount: '0',
              initialAmount: '0',
              installment: 1,
              issuingBank: null,
              netPremiumAmount: '1908416',
              paymentOption: 'FULLPAYMENT',
              paymentMethod: 'BANK_TRANSFER',
              subsequentAmount: '0',
            },
            {
              discountAmount: '6105',
              discountRate: -0.33,
              discountType: 'car_discount',
              feeAmount: '0',
              initialAmount: '0',
              installment: 1,
              issuingBank: null,
              netPremiumAmount: '1908416',
              paymentOption: 'FULLPAYMENT',
              paymentMethod: 'DIRECT_PAYMENT',
              subsequentAmount: '0',
              discount: {
                percentage: 33,
              } as any,
            },
            {
              discountAmount: '6105',
              discountRate: -0.33,
              discountType: 'car_discount',
              feeAmount: '0',
              initialAmount: '0',
              installment: 1,
              issuingBank: null,
              netPremiumAmount: '1908416',
              paymentOption: 'FULLPAYMENT',
              paymentMethod: 'EDC',
              subsequentAmount: '0',
              discount: {
                percentage: 33,
              } as any,
            },
            {
              discountAmount: '6105',
              discountRate: -0.33,
              discountType: 'car_discount',
              feeAmount: '0',
              initialAmount: '0',
              installment: 1,
              issuingBank: null,
              netPremiumAmount: '1908416',
              paymentOption: 'FULLPAYMENT',
              paymentMethod: 'ONLINECARD',
              subsequentAmount: '0',
              discount: {
                percentage: 33,
              } as any,
            },
            {
              discountAmount: '6105',
              discountRate: -0.33,
              discountType: 'car_discount',
              feeAmount: '0',
              initialAmount: '0',
              installment: 1,
              issuingBank: null,
              netPremiumAmount: '1908416',
              paymentOption: 'FULLPAYMENT',
              paymentMethod: 'QR_CODE',
              subsequentAmount: '0',
              discount: {
                percentage: 33,
              } as any,
            },
          ],
        }}
        handleSelect={mockSelect}
        checkSelected={(option) =>
          option.paymentOption === 'FULLPAYMENT' &&
          option.paymentMethod === 'ONLINECARD' &&
          option.installment === 1
        }
      />
    );
    expect(screen.getByTestId('fullPayment-section')).toBeInTheDocument();
    expect(screen.getByText('paymentOptions.FULL_PAYMENT')).toBeInTheDocument();
    expect(screen.getByText('discountPricing.onlinecard')).toBeInTheDocument();

    const allRows = screen.getAllByTestId('informationRow-container');
    const preSelectedRadio = within(allRows[3]).getByRole('radio');
    const secondRowInput = within(allRows[1]).getByRole('radio');

    expect(preSelectedRadio).toBeChecked();
    expect(secondRowInput).not.toBeChecked();
    await userEvent.click(secondRowInput);
    expect(mockSelect).toHaveBeenCalledWith({
      discountPercentage: 33,
      discountType: 'car_discount',
      numberOfInstallment: 1,
      paymentOption: 'FULLPAYMENT',
      paymentMethod: 'DIRECT_PAYMENT',
    });
  });
});
