import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import Dialog from 'presentation/components/common/Dialog';

import CommentForm from './CommentForm';

const handleSubmit = jest.fn();
const setDialogProps = jest.fn();
const handleDialogToggle = jest.fn();

function MockDialog(props: any) {
  return (
    <Dialog
      open
      formId="update-qc-comment"
      content={
        <CommentForm
          formId="update-qc-comment"
          onSubmit={handleSubmit}
          setDialogProps={setDialogProps}
        />
      }
      showButton
      buttonText="Save"
      buttonProps={{ disabled: true }}
      title="Pass QC"
      handleToggle={handleDialogToggle}
      {...props}
    />
  );
}

it('Should render comment form correctly', () => {
  render(<MockDialog />);
  expect(screen.getByTestId('common-textfield')).toBeInTheDocument();
});

it('Should close dialog function called', async () => {
  render(<MockDialog />);
  const closeDialogBtn = screen.getByTestId('close-dialog-button');
  expect(closeDialogBtn).toBeTruthy();
  await userEvent.click(closeDialogBtn);
  expect(handleDialogToggle).toHaveBeenCalled();
});

it('Should enable button when type to textfield', async () => {
  render(<MockDialog />);
  const textfield = screen.getByTestId('common-textfield');
  await userEvent.type(textfield, 'Comment to Pass QC');
  expect(setDialogProps).toHaveBeenCalled();
});

it('Should post comment to API when hitting submit', async () => {
  render(<MockDialog buttonProps={{ disabled: false }} />);
  const textfield = screen.getByTestId('common-textfield');
  await userEvent.type(textfield, 'Comment to Pass QC');

  const submitButton = screen.getByTestId('form-button');
  await userEvent.click(submitButton);
  expect(handleSubmit).toHaveBeenCalled();
});
