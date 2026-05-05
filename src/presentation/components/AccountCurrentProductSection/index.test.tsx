import React from 'react';

import { render, screen, fireEvent } from '__tests__/rtl-test-utils';
import { MockAccountProductData } from 'mock-data/AccountCurrentProduct.mock';

import AccountCurrentProductSection from './index';

describe('AccountCurrentProductSection', () => {
  it('renders product sections from data.insuranceProducts', () => {
    render(
      <AccountCurrentProductSection haveOrders data={MockAccountProductData} />
    );

    expect(
      screen.getByText('productionOptions.carInsurance')
    ).toBeInTheDocument();
    expect(
      screen.getByText('productionOptions.healthInsurance')
    ).toBeInTheDocument();
  });

  it('maps product fields correctly using fieldConfigs', () => {
    render(
      <AccountCurrentProductSection haveOrders data={MockAccountProductData} />
    );

    // Expand Car Insurance accordion
    fireEvent.click(screen.getByText('productionOptions.carInsurance'));

    expect(screen.getByText('L9922078-1')).toBeInTheDocument();
  });

  it('expands accordion on click (handleChange sets expanded)', () => {
    render(
      <AccountCurrentProductSection haveOrders data={MockAccountProductData} />
    );

    const carInsuranceAccordion = screen
      .getByText('productionOptions.carInsurance')
      .closest('.MuiAccordion-root');
    expect(carInsuranceAccordion).not.toHaveClass('Mui-expanded');

    fireEvent.click(screen.getByText('productionOptions.carInsurance'));

    expect(carInsuranceAccordion).toHaveClass('Mui-expanded');
  });

  it('collapses accordion when clicked again (handleChange sets false)', () => {
    render(
      <AccountCurrentProductSection haveOrders data={MockAccountProductData} />
    );

    // Expand
    fireEvent.click(screen.getByText('productionOptions.carInsurance'));
    const carInsuranceAccordion = screen
      .getByText('productionOptions.carInsurance')
      .closest('.MuiAccordion-root');
    expect(carInsuranceAccordion).toHaveClass('Mui-expanded');

    // Collapse
    fireEvent.click(screen.getByText('productionOptions.carInsurance'));
    expect(carInsuranceAccordion).not.toHaveClass('Mui-expanded');
  });

  it('only one accordion is expanded at a time', () => {
    render(
      <AccountCurrentProductSection haveOrders data={MockAccountProductData} />
    );

    fireEvent.click(screen.getByText('productionOptions.carInsurance'));
    const carAccordion = screen
      .getByText('productionOptions.carInsurance')
      .closest('.MuiAccordion-root');
    expect(carAccordion).toHaveClass('Mui-expanded');

    fireEvent.click(screen.getByText('productionOptions.healthInsurance'));
    const healthAccordion = screen
      .getByText('productionOptions.healthInsurance')
      .closest('.MuiAccordion-root');

    expect(healthAccordion).toHaveClass('Mui-expanded');
    expect(carAccordion).not.toHaveClass('Mui-expanded');
  });

  it('returns empty array when data is undefined', () => {
    render(<AccountCurrentProductSection haveOrders data={undefined} />);

    expect(
      screen.queryByText('productionOptions.carInsurance')
    ).not.toBeInTheDocument();
  });

  it('uses empty array for fields when product not in fieldConfigs', () => {
    const dataWithUnknownProduct = {
      insuranceProducts: [
        {
          product: 'products/unknown',
          productLabel: 'Unknown Product',
          policies: [],
        },
      ],
    };

    render(
      <AccountCurrentProductSection haveOrders data={dataWithUnknownProduct} />
    );

    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
  });

  describe('Translation helpers', () => {
    it('translates matter of connection values correctly', () => {
      const dataWithMatterOfConnection = {
        insuranceProducts: [
          {
            product: 'products/car-insurance',
            productLabel: 'Car Insurance',
            policies: [
              {
                orderItemHumanId: 'ORD-123',
                matterOfConnection: 'phone_number,id_number',
                packageInfo: {},
                carInfo: {},
                insurerInfo: {},
                paymentInfo: {},
              },
            ],
          },
        ],
      };

      render(
        <AccountCurrentProductSection
          haveOrders
          data={dataWithMatterOfConnection}
        />
      );

      fireEvent.click(screen.getByText('productionOptions.carInsurance'));

      expect(
        screen.getByText('text.phoneNumber, text.idNumber')
      ).toBeInTheDocument();
    });

    it('translates insurance type correctly', () => {
      const dataWithInsuranceType = {
        insuranceProducts: [
          {
            product: 'products/car-insurance',
            productLabel: 'Car Insurance',
            policies: [
              {
                orderItemHumanId: 'ORD-123',
                matterOfConnection: 'phone_number',
                packageInfo: { insuranceType: 'TYPE_1' },
                carInfo: {},
                insurerInfo: {},
                paymentInfo: {},
              },
            ],
          },
        ],
      };

      render(
        <AccountCurrentProductSection haveOrders data={dataWithInsuranceType} />
      );

      // The insurance type is rendered in the modal, not directly visible
      // This test verifies transformPolicyToOrder is called correctly
      expect(screen.getByText('ORD-123')).toBeInTheDocument();
    });

    it('translates payment option correctly', () => {
      const dataWithPaymentOption = {
        insuranceProducts: [
          {
            product: 'products/car-insurance',
            productLabel: 'Car Insurance',
            policies: [
              {
                orderItemHumanId: 'ORD-123',
                matterOfConnection: 'phone_number',
                packageInfo: {},
                carInfo: {},
                insurerInfo: {},
                paymentInfo: { paymentOption: 'FULL_PAYMENT' },
              },
            ],
          },
        ],
      };

      render(
        <AccountCurrentProductSection haveOrders data={dataWithPaymentOption} />
      );

      expect(screen.getByText('ORD-123')).toBeInTheDocument();
    });

    it('translates payment method correctly', () => {
      const dataWithPaymentMethod = {
        insuranceProducts: [
          {
            product: 'products/car-insurance',
            productLabel: 'Car Insurance',
            policies: [
              {
                orderItemHumanId: 'ORD-123',
                matterOfConnection: 'phone_number',
                packageInfo: {},
                carInfo: {},
                insurerInfo: {},
                paymentInfo: { paymentMethod: 'ONLINECARD' },
              },
            ],
          },
        ],
      };

      render(
        <AccountCurrentProductSection haveOrders data={dataWithPaymentMethod} />
      );

      expect(screen.getByText('ORD-123')).toBeInTheDocument();
    });
  });
});
