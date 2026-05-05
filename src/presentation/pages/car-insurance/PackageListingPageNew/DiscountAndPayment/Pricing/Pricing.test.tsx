import transformedPaymentOptions from '@alphafounders/mock-data/json/transformedPaymentOptions.json';
import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PricingSection from '.';

describe('<PricingSection />', () => {
  it('should render component correctly when data is not passed', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PricingSection pricingData={{}} />
      </Formik>
    );
    expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
    expect(
      screen.getByText('discountPricing.installmentRemark')
    ).toBeInTheDocument();

    expect(screen.queryByTestId('fullPayment-section')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('rabbitInstallment-section')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('creditCardInstallment-section')
    ).not.toBeInTheDocument();
  });

  it('should render component correctly when data is passed', async () => {
    render(
      <Formik
        initialValues={{
          issuingBank: 'BBL',
        }}
        onSubmit={jest.fn()}
      >
        <PricingSection
          pricingData={{
            fullPayment: transformedPaymentOptions.fullPayment,
            rabbitCareInstallment:
              transformedPaymentOptions.rabbitCareInstallment,
            creditCardInstallment: undefined,
          }}
        />
      </Formik>
    );
    expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
    expect(
      screen.getByText('discountPricing.installmentRemark')
    ).toBeInTheDocument();

    expect(screen.queryByTestId('fullPayment-section')).toBeInTheDocument();
    expect(
      screen.queryByTestId('rabbitInstallment-section')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('creditCardInstallment-section')
    ).not.toBeInTheDocument();
  });
});
