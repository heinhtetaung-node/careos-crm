import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import Customer from './index';

const config = {
  customerData: {
    customer: {
      name: 'customers/40c4687d-93cb-48ce-ac5c-b49c941643f2',
      createTime: '2022-01-18T07:01:26.471574Z',
      updateTime: '2022-01-18T07:01:26.471574Z',
      deleteTime: null,
      createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
      humanId: 'C55557',
      firstName: 'Sunee',
      lastName: 'Pui',
    },
    phones: [],
    emails: [],
  },
};

it('Render Customer infopanel', () => {
  render(<Customer {...config} />);
  expect(screen.getByText('order.customerInfo')).toBeVisible();
});

it('Handle Customer infopanel data update', async () => {
  const user = userEvent.setup();
  render(<Customer {...config} />);

  // Wait for the input to be available before interacting with it
  const textbox = await waitFor(() =>
    screen.getByTestId('customer-first-name-input')
  );

  await user.clear(textbox);
  await user.type(textbox, 'Test');

  await waitFor(() => {
    expect(textbox).toHaveValue('Test');
  });
});
