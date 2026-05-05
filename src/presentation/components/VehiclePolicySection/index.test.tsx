import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { render } from '__tests__/rtl-test-utils';
import { getMockOrder } from 'shared/helper/OrderMockData';

import VehiclePolicySection from '.';

const mockStore = configureMockStore();
const initialState = {
  order: {
    payload: getMockOrder(),
  },
};

const store = mockStore(initialState);

test('VehiclePolicySection Component mounted', () => {
  render(
    <Provider store={store as any}>
      <VehiclePolicySection isEditable />
    </Provider>
  );
  expect(screen.getByText('text.vehicle')).toBeInTheDocument();
  expect(screen.getByText('text.vehicle')).toHaveTextContent('text.vehicle');
  expect(screen.getByText('text.chassisNumber')).toBeInTheDocument();
  expect(screen.getByText('leadDetailFields.engineNumber')).toBeInTheDocument();
  expect(
    screen.getByText('leadDetailFields.firstDriverName')
  ).toBeInTheDocument();
  expect(
    screen.getByText('leadDetailFields.secondDriverName')
  ).toBeInTheDocument();
});

test('VehiclePolicySection Component handles input value change', async () => {
  const { getAllByRole } = render(
    <Provider store={store as any}>
      <VehiclePolicySection isEditable />
    </Provider>
  );
  const inputs = getAllByRole('textbox');
  const buttons = getAllByRole('button');
  await userEvent.click(buttons[0]);
  await userEvent.clear(inputs[0]);
  await userEvent.type(inputs[1], '123');
});

test.skip('VehiclePolicySection Component handles input error', async () => {
  const { getByTestId } = render(
    <Provider store={store as any}>
      <VehiclePolicySection isEditable />
    </Provider>
  );
  const input = getByTestId('license-input-left')
    .firstChild as HTMLInputElement;
  await userEvent.clear(input);
  await userEvent.tab();
  await userEvent.type(getByTestId('license-input-left'), '!!!');
});

test('VehiclePolicySection Component handles date change', async () => {
  const { getAllByRole, getByDisplayValue, getByText } = render(
    <Provider store={store as any}>
      <VehiclePolicySection isEditable />
    </Provider>
  );
  const editbutton = getAllByRole('button')[1];
  await userEvent.click(editbutton);
  const chassisNumber = getByDisplayValue('1JXMN10918');
  await userEvent.clear(chassisNumber);
  await userEvent.type(chassisNumber, '123!');
  await userEvent.tab();
  expect(getByText('Please enter a valid value')).toBeInTheDocument();
});
