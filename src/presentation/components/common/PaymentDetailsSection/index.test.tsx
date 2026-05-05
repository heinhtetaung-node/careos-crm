import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PaymentDetailsSection from '.';

describe('Customer Information section', () => {
  it('show a loading spinner if the state is loading.', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaymentDetailsSection isLoading />
      </Formik>
    );

    const paymentDetails = screen.getByTestId('payment-details-container');

    expect(paymentDetails).toBeInTheDocument();

    const appLoader = paymentDetails.getElementsByClassName('app-loader');

    expect(appLoader).toHaveLength(1);

    expect(
      screen.queryByText('paymentDetails.installmentDetails.firstMonth')
    ).not.toBeInTheDocument();
  });

  it('should load the information if the state is not loading', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaymentDetailsSection />
      </Formik>
    );

    expect(
      screen.getByText(
        'paymentDetails.installmentDetails.firstMonthInstallment'
      )
    ).toBeInTheDocument();
  });

  it('should show mandatory not included text if enabled', () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PaymentDetailsSection mandatoryNotIncluded />
      </Formik>
    );

    expect(
      screen.getByText('paymentDetails.installmentDetails.mandatoryNotIncluded')
    ).toBeInTheDocument();
  });
});
