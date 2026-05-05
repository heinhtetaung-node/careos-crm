import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { TypeAssign } from '../TableAllLead.helper';

import AssignModal from '.';

const mockCloseModal = jest.fn();
const mockHandleConfirm = jest.fn();

test('Should render message with a single order and cancel buttons work', async () => {
  render(
    <AssignModal
      closeModal={mockCloseModal}
      type={TypeAssign.ASSIGN}
      quantity={1}
      handleConfirm={mockHandleConfirm}
      typeAssign="order"
    />
  );

  expect(
    screen.getByText('text.doYouWantTo text.assign 1 text.orderAssign?')
  ).toBeInTheDocument();
  const buttons = screen.getAllByRole('button');
  await userEvent.click(buttons[0]);

  expect(mockCloseModal).toHaveBeenCalled();
});

test('Should render message with orders and submit buttons work', async () => {
  render(
    <AssignModal
      closeModal={mockCloseModal}
      type={TypeAssign.ASSIGN}
      quantity={5}
      handleConfirm={mockHandleConfirm}
      typeAssign="order"
    />
  );

  expect(
    screen.getByText('text.doYouWantTo text.assign 5 text.ordersAssign?')
  ).toBeInTheDocument();
  const buttons = screen.getAllByRole('button');
  await userEvent.click(buttons[1]);

  expect(mockHandleConfirm).toHaveBeenCalled();
});

test('Should render message with a policy', () => {
  render(
    <AssignModal
      closeModal={mockCloseModal}
      type={TypeAssign.ASSIGN}
      quantity={1}
      handleConfirm={mockHandleConfirm}
      typeAssign="policy"
    />
  );

  expect(
    screen.getByText('text.doYouWantTo text.assign 1 text.policyAssign?')
  ).toBeInTheDocument();
});

test('Should render message with policies', () => {
  render(
    <AssignModal
      closeModal={mockCloseModal}
      type={TypeAssign.ASSIGN}
      quantity={5}
      handleConfirm={mockHandleConfirm}
      typeAssign="policy"
    />
  );

  expect(
    screen.getByText('text.doYouWantTo text.assign 5 text.policiesAssign?')
  ).toBeInTheDocument();
});
