import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { useState } from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';

import EmailForm from './index';

jest.mock('shared/helper/utilities', () => ({
  ...jest.requireActual('shared/helper/utilities'),
  getLeadIdFromPath: jest.fn().mockReturnValue('leadIdOnUrl'),
}));

jest.setTimeout(10000);

const props = {
  changeForm: () => null,
  email: {
    message: 'test',
    emailTemplate: 'quote',
    to: 'xyz@gmail.com',
    cc: [],
    subject: 'test subject',
    attachment: [],
    packageUrl: '',
  },
};

function WrappedComponent() {
  const [email, setEmail] = useState({ ...props.email });
  return <EmailForm email={email} changeForm={setEmail as any} />;
}

describe('<Email Form Component/>', () => {
  it('initial state', () => {
    render(<EmailForm {...props} />);
    screen.getByText('text.emailTemplate');
    screen.getByText('text.to');
    screen.getByText('text.cc');
    screen.getByText('text.subject');
    screen.getByText('text.message');
    screen.getByText('text.quotesAndPackageURL');
    screen.getByText('text.add');

    screen.getByDisplayValue('xyz@gmail.com');
    screen.getByDisplayValue('test subject');
  });

  it.skip('should set the return message on add quotation url with filter and click add', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/leadIdOnUrl/transform-placeholders`,
        () => HttpResponse.json({ text: 'return message from server' })
      )
    );
    render(<WrappedComponent />);
    user.type(
      screen.getByRole('textbox', {
        name: 'text.quotesAndPackageURL text.message',
      }),
      'https://staging-finance.rabbitinternet.com/en/product/motor-insurance/quotes?details=12345&filter=insuranceCategory=both,sumInsured_min=430000,sumInsured_max=660000'
    );
    await user.click(screen.getByRole('button', { name: 'text.add' }));
    await waitForElementToBeRemoved(screen.getByTestId('spinner'));
    expect(screen.getByText('return message from server')).toBeInTheDocument();
  });

  it('button should disable when add quotation url without filter', () => {
    render(<WrappedComponent />);
    user.type(
      screen.getByRole('textbox', {
        name: 'text.quotesAndPackageURL text.message',
      }),
      'https://staging-finance.rabbitinternet.com/en/product/motor-insurance/quotes?details=12345'
    );
    expect(screen.getByRole('button', { name: 'text.add' })).toBeDisabled();
  });
});
