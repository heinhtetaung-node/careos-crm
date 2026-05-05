import { waitFor } from '@testing-library/dom';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { QuoteInformation } from 'shared/types/lead';

import QuoteDetailsSection from '.';

describe('Quote Details section', () => {
  const shipmentFee = '10000';

  it('show a loading spinner if the state is loading.', async () => {
    render(<QuoteDetailsSection isLoading />);

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
      insurerName: 'Test name',
      insuranceType: 'TYPE_1',
    } as QuoteInformation;
    render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

    expect(screen.getByText('paymentDetails.insurerName')).toBeInTheDocument();
    expect(screen.getByText(data.insurerName)).toBeInTheDocument();
  });

  it('should show mandatory type is included if type is mandatory or both', async () => {
    const data = {
      insuranceKind: 'BOTH',
    } as QuoteInformation;
    render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

    expect(screen.getByText('text.yes')).toBeInTheDocument();
  });

  it('should show mandatory type is not included if type is voluntary', async () => {
    const data = {
      insuranceKind: 'VOLUNTARY',
    } as QuoteInformation;
    render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

    expect(screen.getByText('text.no')).toBeInTheDocument();
  });

  describe('voluntary-type display', () => {
    it('renders the insuranceType when it is a specific voluntary type', () => {
      const data = { insuranceType: 'TYPE_1' } as QuoteInformation;
      render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

      expect(screen.getByTestId('voluntary-type')).toHaveTextContent('TYPE_1');
    });

    it('renders "-" when insuranceType is INSURANCE_TYPES_UNSPECIFIED', () => {
      const data = {
        insuranceType: 'INSURANCE_TYPES_UNSPECIFIED',
      } as QuoteInformation;
      render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

      expect(screen.getByTestId('voluntary-type')).toHaveTextContent('-');
      expect(
        screen.queryByText('INSURANCE_TYPES_UNSPECIFIED')
      ).not.toBeInTheDocument();
    });

    it('renders "-" when insuranceType is INSURANCE_TYPE_MANDATORY', () => {
      const data = {
        insuranceType: 'INSURANCE_TYPE_MANDATORY',
      } as QuoteInformation;
      render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

      expect(screen.getByTestId('voluntary-type')).toHaveTextContent('-');
      expect(
        screen.queryByText('INSURANCE_TYPE_MANDATORY')
      ).not.toBeInTheDocument();
    });

    it('renders "-" when insuranceType is undefined', () => {
      const data = {} as QuoteInformation;
      render(<QuoteDetailsSection data={data} shipmentFee={shipmentFee} />);

      expect(screen.getByTestId('voluntary-type')).toHaveTextContent('-');
    });
  });
});
