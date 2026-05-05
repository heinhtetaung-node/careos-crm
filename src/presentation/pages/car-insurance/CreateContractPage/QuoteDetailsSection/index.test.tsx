import { waitFor } from '@testing-library/dom';
import { add } from 'date-fns';
import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { QuoteInformation } from 'shared/types/lead';

import QuoteDetailsSection from '.';

describe('Customer Information section', () => {
  it('show a loading spinner if the state is loading.', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <QuoteDetailsSection isLoading />
      </Formik>
    );

    await waitFor(() => {
      const quoteDetailsContainer = screen.getByTestId(
        'quote-details-container'
      );

      expect(quoteDetailsContainer).toBeInTheDocument();

      const appLoader =
        quoteDetailsContainer.getElementsByClassName('app-loader');

      expect(appLoader).toHaveLength(1);

      expect(
        screen.queryByText('paymentDetails.insurerName')
      ).not.toBeInTheDocument();
    });
  });

  it('should load the information if the state is not loading', async () => {
    const data = {
      insurerName: 'Bangkok Insurer',
      insuranceType: 'TYPE_1', // TYPE_1, TYPE_2, TYPE_2_PLUS, TYPE_3, TYPE_3_PLUS
      licensePlate: '999-1234',
      car: 'Toyota Fortuner 2700 CC 4 doors V Wagon',
      grossVoluntaryPremium: 645,
      totalPremium: 1354500,
      startDate: new Date().toDateString(),
      endDate: add(new Date(), { years: 1 }).toDateString(),
    } as QuoteInformation;
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <QuoteDetailsSection data={data} />
      </Formik>
    );

    expect(screen.getByText('paymentDetails.insurerName')).toBeInTheDocument();
    expect(screen.getByText(data.insurerName)).toBeInTheDocument();
    expect(
      screen.getByText('paymentDetails.discountIncluded')
    ).toBeInTheDocument();
    expect(screen.getByText('13,545.00')).toBeInTheDocument();
  });

  it('should show processing fee if it is passed', () => {
    const data = {
      processingFee: 555,
    } as QuoteInformation;
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <QuoteDetailsSection data={data} />
      </Formik>
    );

    expect(
      screen.getByText('paymentDetails.processingFee')
    ).toBeInTheDocument();
  });
});
