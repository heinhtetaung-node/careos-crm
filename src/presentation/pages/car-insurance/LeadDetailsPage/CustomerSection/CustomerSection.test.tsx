import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CustomerSection from './index';

const initialState = {
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'name/leadId',
        data: {
          policyHolderType: 'straw_buyer',
        },
      },
    },
  },
};

test('renders successfully', async () => {
  render(<CustomerSection />, { initialState });
  expect(screen.getByTestId('customer-section')).toBeInTheDocument();
});
