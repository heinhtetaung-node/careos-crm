import { Form, Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { CustomerInformation } from 'shared/types/lead';

import CustomerInformationSection from '.';

describe('Customer Information section', () => {
  it('show a loading spinner if the state is loading.', async () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Form>
          <CustomerInformationSection isLoading />
        </Form>
      </Formik>
    );

    const customerInformation = screen.getByTestId(
      'customer-information-container'
    );

    expect(customerInformation).toBeInTheDocument();

    const appLoader = customerInformation.getElementsByClassName('app-loader');

    expect(appLoader).toHaveLength(1);

    expect(screen.queryByText('text.leadId')).not.toBeInTheDocument();
  });

  it('should load the information if the state is not loading', async () => {
    const customerInformation = {
      leadId: 'leads/d49defb2-3a62-11ed-a261-0242ac120002',
      humanId: 'L12345',
      orderType: 'Motor',
      customerId: '1234567890',
      customerName: 'Maetad Sukarasud',
      policyAddress: 'Q. House Lumphini Rama 4, Bangkok Thailand 10110',
      email: 'testemail@rabbit.co.th',
      phoneNumber: '081000000',
    } as CustomerInformation;
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Form>
          <CustomerInformationSection data={customerInformation} />
        </Form>
      </Formik>
    );

    expect(screen.getByText('text.leadId')).toBeInTheDocument();
    expect(
      screen.getByText('paymentDetails.policyHolder.name')
    ).toBeInTheDocument();
    expect(screen.getByText(customerInformation.humanId)).toBeInTheDocument();
    expect(
      screen.getByText(customerInformation.customerName)
    ).toBeInTheDocument();
  });

  it('should show company details if policyHolderType is company', () => {
    const customerInformation = {
      leadId: 'leads/d49defb2-3a62-11ed-a261-0242ac120002',
      humanId: 'L12345',
      orderType: 'Motor',
      policyHolderType: 'company',
      customerId: '1234567890',
      customerName: 'Maetad Sukarasud',
      policyAddress: 'Q. House Lumphini Rama 4, Bangkok Thailand 10110',
      email: 'testemail@rabbit.co.th',
      phoneNumber: '081000000',
    } as CustomerInformation;
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Form>
          <CustomerInformationSection data={customerInformation} />
        </Form>
      </Formik>
    );

    expect(screen.getByText('paymentDetails.company.name')).toBeInTheDocument();
    expect(
      screen.getByText('paymentDetails.company.taxId')
    ).toBeInTheDocument();
  });
});
