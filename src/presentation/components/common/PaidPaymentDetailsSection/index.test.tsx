import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PaidPaymentDetailsSection from '.';

describe('Customer Information section', () => {
  it('show a loading spinner if the state is loading.', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaidPaymentDetailsSection
          isLoading
          paidChargesAmount={0}
          firstMonthRemainingAmount={0}
          firstMonthSurplusAmount={0}
        />
      </Formik>
    );

    const paymentDetails = screen.getByTestId('paid-payment-details-container');

    expect(paymentDetails).toBeInTheDocument();

    const appLoader = paymentDetails.getElementsByClassName('app-loader');

    expect(appLoader).toHaveLength(1);

    expect(
      screen.queryByText('carepay.changeOrder.referenceLeadId')
    ).not.toBeInTheDocument();
  });

  it('should load the information if the state is not loading', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaidPaymentDetailsSection
          {...{
            isLoading: false,
            isReadOnly: true,
            paidChargesAmount: 1764521,
            firstMonthRemainingAmount: 126275,
            paymentMethod: 'QR_CODE',
            paidPaymentDate: '2024-02-27T09:49:41.373535Z',
            firstMonthSurplusAmount: '0',
          }}
        />
      </Formik>
    );

    expect(
      screen.getByText('carepay.changeOrder.referenceLeadId')
    ).toBeInTheDocument();
  });

  it('should display available credit shell and total credit used', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaidPaymentDetailsSection
          isLoading={false}
          isReadOnly
          paidChargesAmount={1764521}
          firstMonthRemainingAmount={126275}
          paymentMethod="QR_CODE"
          paidPaymentDate="2024-02-27T09:49:41.373535Z"
          firstMonthSurplusAmount="0"
          availableCreditShell={500000}
          totalCreditUsed={200000}
        />
      </Formik>
    );

    expect(
      screen.getByText('carepay.changeOrder.creditShellAvailable')
    ).toBeInTheDocument();

    expect(
      screen.getByText('carepay.changeOrder.usedCreditShell')
    ).toBeInTheDocument();
  });
});
