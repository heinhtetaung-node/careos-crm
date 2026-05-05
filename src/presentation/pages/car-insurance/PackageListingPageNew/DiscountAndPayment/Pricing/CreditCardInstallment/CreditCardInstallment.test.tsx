import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import CreditCardInstallment from '.';

describe('<CreditCardInstallment />', () => {
  it('should render component correctly', async () => {
    const mockSelectFunction = jest.fn();
    render(
      <CreditCardInstallment
        creditCardPaymentData={{
          name: 'creditCardInstallment',
          cards: {
            BAY: [
              {
                name: 'EDC',
                options: [
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '638173',
                    subsequentAmount: '638173',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'EDC',
                    installment: 3,
                    issuingBank: 'BAY',
                  },
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '319086',
                    subsequentAmount: '319086',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'EDC',
                    installment: 6,
                    issuingBank: 'BAY',
                  },
                ],
              },
              {
                name: 'ONLINECARD',
                options: [
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '638173',
                    subsequentAmount: '638173',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'ONLINECARD',
                    installment: 3,
                    issuingBank: 'BAY',
                  },
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '319086',
                    subsequentAmount: '319086',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'ONLINECARD',
                    installment: 6,
                    issuingBank: 'BAY',
                  },
                ],
              },
            ],
            BBL: [
              {
                name: 'EDC',
                options: [
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '478630',
                    subsequentAmount: '478630',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'EDC',
                    installment: 4,
                    issuingBank: 'BBL',
                  },
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '319086',
                    subsequentAmount: '319086',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'EDC',
                    installment: 6,
                    issuingBank: 'BBL',
                  },
                ],
              },
              {
                name: 'ONLINECARD',
                options: [
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '478630',
                    subsequentAmount: '478630',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'ONLINECARD',
                    installment: 4,
                    issuingBank: 'BBL',
                  },
                  {
                    discount: {
                      percentage: 0,
                    },
                    initialAmount: '319086',
                    subsequentAmount: '319086',
                    feeAmount: '0',
                    discountAmount: '0',
                    discountRate: 0,
                    netPremiumAmount: '1914521',
                    discountType: '',
                    paymentOption: 'CREDIT_CARD_INSTALLMENT',
                    paymentMethod: 'ONLINECARD',
                    installment: 6,
                    issuingBank: 'BBL',
                  },
                ],
              },
            ],
          } as any,
          cardProviders: [
            {
              name: 'BAY',
              shortName: 'BAY',
              displayName: 'Bank of Ayudhya Public Company Limited',
            },
            {
              name: 'BBL',
              shortName: 'BBL',
              displayName: 'Bangkok Bank Public Company Limited',
            },
          ],
        }}
        handleSelect={mockSelectFunction}
        checkSelected={(option) =>
          option.paymentOption === 'CREDIT_CARD_INSTALLMENT' &&
          option.paymentMethod === 'EDC' &&
          option.installment === 3
        }
        resetSelected={jest.fn()}
      />
    );
    expect(
      screen.getByTestId('creditCardInstallment-section')
    ).toBeInTheDocument();
    expect(
      screen.getByText('paymentOptions.CREDIT_CARD_INSTALLMENT')
    ).toBeInTheDocument();
    expect(screen.getByText('discountPricing.edc')).toBeInTheDocument();

    const allRows = screen.getAllByTestId('informationRow-container');
    const firstRowInput = within(allRows[0]).getByRole('radio');
    const secondRowInput = within(allRows[1]).getByRole('radio');

    expect(firstRowInput).toBeChecked();
    expect(secondRowInput).not.toBeChecked();

    await userEvent.click(secondRowInput);
    expect(mockSelectFunction).toHaveBeenCalledWith({
      cardProvider: 'BAY',
      discountPercentage: 0,
      discountType: '',
      numberOfInstallment: 6,
      paymentOption: 'CREDIT_CARD_INSTALLMENT',
      paymentMethod: 'EDC',
    });
  });
});
