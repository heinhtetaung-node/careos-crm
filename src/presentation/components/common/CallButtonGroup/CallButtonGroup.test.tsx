/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-shadow */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { maskPhoneNumber } from 'shared/helper/utilities';

import CallButtonGroup from '.';

const options = [
  {
    phone: '+66889999999',
    status: 'unverified',
    phoneIndex: 1,
  },
  {
    phone: '+66879740465',
    status: 'unverified',
    phoneIndex: 0,
  },
];

describe('Test <CallButtonGroup/>', () => {
  it('Test <CallButtonGroup/> render successfully', () => {
    render(<CallButtonGroup phoneNumbers={options} />);
    expect(
      screen.getByText(maskPhoneNumber(options[0].phone))
    ).toBeInTheDocument();
  });

  it('Test <CallButtonGroup/> go to connecting state when start calling', async () => {
    render(<CallButtonGroup phoneNumbers={options} />);
    const callButton = screen.getByRole('button', {
      name: maskPhoneNumber(options[0].phone),
    });
    await userEvent.click(callButton);

    const connectingBtn = screen.getByTestId('connecting-btn');
    expect(connectingBtn).toBeInTheDocument();
  });

  it('Test <CallButtonGroup/> show hung up button and timer after connected', async () => {
    render(<CallButtonGroup phoneNumbers={options} />);
    const callButton = screen.getByRole('button', {
      name: maskPhoneNumber(options[0].phone),
    });
    await userEvent.click(callButton);

    await waitFor(
      () => {
        const timer = screen.queryByTestId('call-timer');
        const hungUpBtn = screen.queryByTestId('hung-up-btn');
        const transferBtn = screen.queryByRole('button', {
          name: 'Transfer',
        });

        expect(hungUpBtn).toBeInTheDocument();
        expect(transferBtn).toBeInTheDocument();
        expect(timer).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('Test <CallButtonGroup/> after hunging up, transfer, hung up and timer should not be in the document', async () => {
    render(<CallButtonGroup phoneNumbers={options} />);
    const callButton = screen.getByRole('button', {
      name: maskPhoneNumber(options[0].phone),
    });
    await userEvent.click(callButton);

    await waitFor(
      async () => {
        const timer = screen.queryByTestId('call-timer');
        const hungUpBtn = screen.queryByTestId('hung-up-btn');
        const transferBtn = screen.queryByRole('button', {
          name: 'Transfer',
        });

        expect(transferBtn).toBeInTheDocument();
        expect(timer).toBeInTheDocument();

        await userEvent.click(hungUpBtn!);

        const callButton = screen.getByRole('button', {
          name: maskPhoneNumber(options[0].phone),
        });

        expect(transferBtn).not.toBeInTheDocument();
        expect(timer).not.toBeInTheDocument();
        expect(callButton).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
