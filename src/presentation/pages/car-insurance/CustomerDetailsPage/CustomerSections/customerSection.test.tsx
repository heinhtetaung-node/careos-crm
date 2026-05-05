import customerData from '@alphafounders/mock-data/json/orderData.json';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import leadDetail from 'mock-data/LeadDetail.mock';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import CustomerSection from './customerSection';

import FormatedResponse from '../helper.test';

// TODO: Refactor
describe('Testing CustomerSection Component', () => {
  it('should render all 3 sections', () => {
    render(
      <CustomerSection
        leads={[leadDetail]}
        orders={OrderDetail.customerOrder}
        styles={{}}
        dataSchema={FormatedResponse}
        refetchContacts={jest.fn()}
      />
    );
    expect(screen.getAllByTestId('customer-section-comp').length).toEqual(3);
  });
  it('should render contact information sections', () => {
    render(
      <CustomerSection
        leads={[leadDetail]}
        orders={OrderDetail.customerOrder}
        styles={{}}
        dataSchema={FormatedResponse}
        contacts={{
          emails: customerData.orderItems.customer.emails,
          phones: customerData.orderItems.customer.phones,
        }}
      />
    );
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });
});
