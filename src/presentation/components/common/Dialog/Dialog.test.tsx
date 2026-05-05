import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import MockForm from './MockForm';

import Dialog from '.';

const handleToggle = jest.fn();
const handleSubmit = jest.fn();

test('Should render default dialog', () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      handleToggle={handleToggle}
      data-testid="generic-dialog"
    />
  );

  expect(screen.getByTestId('generic-dialog')).toBeTruthy();
  expect(screen.queryByText('Example dialog content')).toBeTruthy();
});

test('Should close dialog when click X button', async () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      data-testid="generic-dialog"
      handleToggle={handleToggle}
    />
  );

  const dialog = screen.getByTestId('generic-dialog');
  const closeBtn = within(dialog).getByRole('button');
  expect(closeBtn).toBeTruthy();

  await userEvent.click(closeBtn);

  expect(handleToggle).toHaveBeenCalledTimes(1);
});

test('Should render dialog with footer text', () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      footerContent="Footer text"
      handleToggle={handleToggle}
    />
  );

  expect(screen.queryByText('Footer text')).toBeTruthy();
});

test('Should render dialog with footer button', () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      showButton
      buttonText="Dialog button show"
      handleToggle={handleToggle}
    />
  );

  expect(screen.queryByText('Dialog button show')).toBeTruthy();
});

test('Should render dialog with warning style', async () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      color="warning"
      data-testid="generic-dialog"
      handleToggle={handleToggle}
    />
  );

  const dialog = await screen.findByTestId('generic-dialog');
  expect(dialog.className).not.toBeNull();
  expect(dialog.className).toMatch(/-warning-/);
});

test('Should render dialog with body sroll', async () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      scrollType="body"
      handleToggle={handleToggle}
    />
  );

  const dialogRole = await screen.findByRole('dialog');
  expect(dialogRole.className).not.toBeNull();
  expect(dialogRole.className).toMatch(/-paperScrollBody/);
});

test('Should render dialog with paper scroll', async () => {
  render(
    <Dialog
      open
      content="Example dialog content"
      scrollType="paper"
      handleToggle={handleToggle}
    />
  );

  const dialogRole = await screen.findByRole('dialog');
  expect(dialogRole.className).not.toBeNull();
  expect(dialogRole.className).toMatch(/-paperScrollPaper/);
});

test('Should call handleSubmit with outside form', async () => {
  const formId = 'simple-update-dialog';
  render(
    <Dialog
      open
      formId={formId}
      content={<MockForm formId={formId} onSubmit={handleSubmit} />}
      showButton
      handleToggle={handleToggle}
    />
  );

  const submitButton = await screen.findByTestId('form-button');
  expect(submitButton).toBeTruthy();

  await userEvent.click(submitButton);
  expect(handleSubmit).toHaveBeenCalled();
});
