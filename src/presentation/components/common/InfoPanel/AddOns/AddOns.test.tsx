import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';

import AddOns from './AddOns';

test('should <AddOns/> component show all three possible addon type', async () => {
  render(<AddOns />);
  await waitFor(() => {
    expect(screen.getByText('order.addOns.carReplacement')).toBeInTheDocument();
    expect(
      screen.getByText('order.addOns.carAssetCoverage')
    ).toBeInTheDocument();
    expect(
      screen.getByText('order.addOns.roadSideAssistance')
    ).toBeInTheDocument();
  });
  const updateStatusBtns = screen.getAllByText('text.updateStatus');
  expect(updateStatusBtns).toHaveLength(2);

  expect(screen.getByText('text.submitted')).toBeInTheDocument();

  await userEvent.click(updateStatusBtns[0]);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();

  const autocomplete = within(dialog).getByPlaceholderText('text.select');
  const commentBox = within(dialog).getByTestId('comment-form');

  expect(autocomplete).toBeInTheDocument();
  expect(commentBox).toBeInTheDocument();

  const saveBtn = screen.getByText('text.save');
  await userEvent.click(saveBtn);

  await waitForElementToBeRemoved(screen.getByRole('dialog'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
