import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { render, screen } from '__tests__/rtl-test-utils';
import { getMockOrder, getMockCustomer } from 'shared/helper/OrderMockData';

import { genderConvert, languageConvert } from './helper';

import CustomerInfo from '.';

const mockStore = configureMockStore();
const initialState = {
  order: {
    payload: getMockOrder(),
  },
};
const store = mockStore(initialState);

test('Render Customer info panel ', () => {
  render(
    <Provider store={store as any}>
      <CustomerInfo customerInfo={getMockCustomer} />
    </Provider>
  );
  const textboxes = screen.getAllByRole('textbox');
  expect(screen.getByText('order.customerInfo')).toBeTruthy();
  expect(textboxes).toBeTruthy();
});

test('Customer info panel data not ready ', () => {
  render(
    <Provider store={store as any}>
      <CustomerInfo customerInfo={undefined} />
    </Provider>
  );
  expect(screen.getByTestId('loading-wrapper')).toBeTruthy();
});

test('Customer info handleUpdate', async () => {
  render(
    <Provider store={store as any}>
      <CustomerInfo customerInfo={getMockCustomer} isEditable />
    </Provider>
  );
  const buttons = await screen.getAllByRole('button');
  await userEvent.click(buttons[2]);
  expect(screen.getByRole('presentation')).toBeTruthy();

  const languageOptions = await screen.getAllByRole('option');
  await userEvent.click(languageOptions[1]);
  expect(screen.queryByRole('presentation')).toBeNull();
});

describe('Helper tests', () => {
  it('Helper test genderConvert', () => {
    expect(genderConvert('M')).toBe('text.male');
  });

  it('Helper test languageConvert', () => {
    expect(languageConvert('th-en')).toBe('text.english');
  });
});

describe('Customer Infopanel show email and phone conditionally', () => {
  it('Customer info panel hide email and phone when showEmailAndPhone not pass', () => {
    render(
      <CustomerInfo
        customerInfo={{
          customer: { primaryPhoneId: 'phone-primary' },
          emails: [{ email: 'user@mail.com' }],
          phones: [{ name: 'phone-primary', phone: '+6566666666' }],
        }}
      />
    );
    expect(screen.queryByText('user@mail.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+6566666666')).not.toBeInTheDocument();
  });

  it('Customer info panel show email and phone when showEmailAndPhone pass', () => {
    render(
      <CustomerInfo
        customerInfo={{
          customer: { primaryPhoneId: 'phone-primary' },
          emails: [{ email: 'user@mail.com' }],
          phones: [{ name: 'phone-primary', phone: '+6566666666' }],
        }}
        showPhoneAndEmail
      />
    );

    expect(screen.getByText('user@mail.com')).toBeInTheDocument();
    expect(screen.getByText('+6566666666')).toBeInTheDocument();
  });
});
