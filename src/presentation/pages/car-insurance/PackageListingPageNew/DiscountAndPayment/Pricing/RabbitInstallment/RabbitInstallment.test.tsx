import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import RabbitInstallment from '.';

describe('<RabbitInstallment />', () => {
  it('should render component correctly', async () => {
    const mockSelect = jest.fn();
    render(
      <RabbitInstallment
        rabbitCareInstallmentData={{
          name: 'rabbitCareInstallment',
          options: [
            {
              name: 'QR Code',
              options: [
                {
                  initialAmount: '668362',
                  subsequentAmount: '603840',
                  feeAmount: '35521',
                  discountAmount: '74000',
                  discountRate: -4,
                  netPremiumAmount: '1876042',
                  discountType: 'DISCOUNT_TYPE_RCL',
                  paymentOption: 'RABBIT_CARE_INSTALLMENT',
                  paymentMethod: 'QR_CODE',
                  installment: 3,
                  issuingBank: null,
                  discount: {
                    percentage: 6,
                  } as any,
                },
                {
                  initialAmount: '371744',
                  subsequentAmount: '307224',
                  feeAmount: '104341',
                  discountAmount: '111000',
                  discountRate: -6,
                  netPremiumAmount: '1907864',
                  discountType: 'DISCOUNT_TYPE_RCL',
                  paymentOption: 'RABBIT_CARE_INSTALLMENT',
                  paymentMethod: 'QR_CODE',
                  installment: 6,
                  issuingBank: null,
                  discount: {
                    percentage: 6,
                  } as any,
                },
                {
                  initialAmount: '305391',
                  subsequentAmount: '240870',
                  feeAmount: '150960',
                  discountAmount: '74000',
                  discountRate: -4,
                  netPremiumAmount: '1991481',
                  discountType: 'DISCOUNT_TYPE_RCL',
                  paymentOption: 'RABBIT_CARE_INSTALLMENT',
                  paymentMethod: 'QR_CODE',
                  installment: 8,
                  issuingBank: null,
                  discount: {
                    percentage: 6,
                  } as any,
                },
                {
                  initialAmount: '547094',
                  subsequentAmount: '160860',
                  feeAmount: '191315',
                  discountAmount: '111000',
                  discountRate: -6,
                  netPremiumAmount: '1994834',
                  discountType: 'DISCOUNT_TYPE_RCL',
                  paymentOption: 'RABBIT_CARE_INSTALLMENT',
                  paymentMethod: 'QR_CODE',
                  installment: 10,
                  issuingBank: null,
                  discount: {
                    percentage: 6,
                  } as any,
                },
              ],
            },
          ],
        }}
        handleSelect={mockSelect}
        checkSelected={(option) =>
          option.paymentOption === 'RABBIT_CARE_INSTALLMENT' &&
          option.paymentMethod === 'QR_CODE' &&
          option.installment === 3
        }
      />
    );
    expect(screen.getByTestId('rabbitInstallment-section')).toBeInTheDocument();
    expect(
      screen.getByText('paymentOptions.RABBIT_CARE_INSTALLMENT')
    ).toBeInTheDocument();
    expect(screen.getByText('discountPricing.qrCode')).toBeInTheDocument();

    const allRows = screen.getAllByTestId('informationRow-container');
    const firstRowInput = within(allRows[0]).getByRole('radio');
    const secondRowInput = within(allRows[1]).getByRole('radio');

    expect(firstRowInput).toBeChecked();
    expect(secondRowInput).not.toBeChecked();

    await userEvent.click(secondRowInput);
    expect(mockSelect).toHaveBeenCalledWith({
      discountPercentage: 6,
      discountType: 'DISCOUNT_TYPE_RCL',
      numberOfInstallment: 6,
      paymentOption: 'RABBIT_CARE_INSTALLMENT',
      paymentMethod: 'QR_CODE',
    });
  });
});
