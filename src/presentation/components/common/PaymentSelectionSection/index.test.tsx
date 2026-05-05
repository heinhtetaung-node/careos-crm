import { waitFor } from '@testing-library/dom';
import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { mockPaymentOptions } from 'mock-data/LeadPaymentInformation';
import {
  PackageDetails,
  PaymentOption,
  PaymentOptions,
} from 'shared/types/lead';
import { PriceDetail } from 'shared/types/packages';

import PaymentSelectionSection from '.';

const renderWithFormik = (
  props: {
    isLoading?: boolean;
    packageDetails?: PackageDetails;
    paymentOptions?: PaymentOptions;
  },
  initialValues = {
    issuingBank: 0,
    paymentOption: 0,
    installmentPlan: 0,
    paymentMethod: 0,
  }
) =>
  render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <PaymentSelectionSection {...props} />
    </Formik>
  );

describe('Payment Selection section', () => {
  it('show a loading spinner if the state is loading.', async () => {
    renderWithFormik({
      isLoading: true,
      paymentOptions: mockPaymentOptions,
    });

    await waitFor(() => {
      const selectionContainer = screen.getByTestId(
        'payment-selection-container'
      );

      expect(selectionContainer).toBeInTheDocument();

      const appLoader = selectionContainer.getElementsByClassName('app-loader');

      expect(appLoader).toHaveLength(1);

      expect(
        screen.queryByText('paymentDetails.paymentOption')
      ).not.toBeInTheDocument();
    });
  });

  it('should show payment method field if payment option is not CREDIT_CARD_INSTALLMENT.', async () => {
    renderWithFormik({
      paymentOptions: mockPaymentOptions,
    });

    expect(
      screen.getByText('paymentDetails.paymentMethod')
    ).toBeInTheDocument();
  });

  it('should render installment plans from issuing banks if payment option CREDIT_CARD_INSTALLMENT.', () => {
    renderWithFormik(
      {
        paymentOptions: {
          fullPayment: mockPaymentOptions.fullPayment,
          creditCardInstallment: mockPaymentOptions.creditCardInstallment,
          rabbitCareInstallment: mockPaymentOptions.rabbitCareInstallment,
        },
      },
      {
        paymentOption: PaymentOption.CREDIT_CARD_INSTALLMENT,
        paymentMethod: 0,
        issuingBank: 0,
        installmentPlan: 0,
      }
    );

    expect(
      screen.getAllByText('paymentDetails.installmentPlan')[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('paymentDetails.issuingBank')[0]
    ).toBeInTheDocument();
  });

  it.each([
    ['FULL_PAYMENT', 'RABBIT_CARE_INSTALLMENT', 'CREDIT_CARD_INSTALLMENT'],
  ])('should render appropriate fields for %s', (paymentOption) => {
    renderWithFormik(
      {
        paymentOptions: mockPaymentOptions,
      },
      {
        paymentOption:
          PaymentOption[paymentOption as keyof typeof PaymentOption],
        paymentMethod: 0,
        issuingBank: 0,
        installmentPlan: 0,
      }
    );

    expect(
      screen.getByText(`paymentOptions.${paymentOption}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('payment-method')).toBeInTheDocument();

    if (paymentOption === 'CREDIT_CARD_INSTALLMENT') {
      expect(screen.getByTestId('issuing-bank')).toBeInTheDocument();
      expect(
        screen.getByText('Bank of Ayudhya Public Company Limited')
      ).toBeInTheDocument();
    }
    if (paymentOption !== 'FULL_PAYMENT')
      expect(screen.getByTestId('installment-plan')).toBeInTheDocument();
  });

  it('should not render issuing bank if credit card is null', () => {
    renderWithFormik(
      {
        paymentOptions: {
          fullPayment: mockPaymentOptions.fullPayment,
          rabbitCareInstallment: null,
          creditCardInstallment: null,
        },
      },
      {
        paymentOption: PaymentOption.CREDIT_CARD_INSTALLMENT,
        paymentMethod: 0,
        issuingBank: 0,
        installmentPlan: 0,
      }
    );

    expect(
      screen.queryByTestId(`paymentOptions.CREDIT_CARD_INSTALLMENT`)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('issuing-bank')).not.toBeInTheDocument();
    expect(screen.queryByTestId('installment-plan')).not.toBeInTheDocument();
  });

  it('should be read only if package details is passed', () => {
    renderWithFormik({
      paymentOptions: {
        fullPayment: null,
        rabbitCareInstallment: null,
        creditCardInstallment: mockPaymentOptions.creditCardInstallment,
      },
      packageDetails: {
        paymentOption: 'CREDIT_CARD_INSTALLMENT',
        paymentMethod: 'QR_CODE',
        numberOfInstallments: 3,
        cardProvider: 'card-providers/BAY',
        priceDetails: {} as PriceDetail,
      },
    });

    expect(screen.getByTestId('payment-option')).toHaveTextContent(
      `paymentOptions.CREDIT_CARD_INSTALLMENT`
    );
    expect(screen.getByTestId('payment-method')).toHaveTextContent(
      `paymentMethods.QR_CODE`
    );
    expect(screen.getByTestId('issuing-bank')).toHaveTextContent(
      `Bank of Ayudhya Public Company Limited`
    );
    expect(screen.getByTestId('installment-plan')).toHaveTextContent('3');
  });
});
