import { render, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RenderInputTextItem from './RenderInputTextItem';

const handleEnter = jest.fn();
const handleBlur = jest.fn();

afterEach(cleanup);

test('RenderInputTextItem Component mounted', () => {
  const { getByTestId } = render(
    <RenderInputTextItem
      valueText="Testdriver"
      name="firstDriverName"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
    />
  );
  expect(getByTestId('text-input-field')).toBeTruthy();
});

test('RenderInputTextItem Component not editable', async () => {
  const { queryByRole } = render(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
    />
  );
  expect(queryByRole('button')).not.toBeInTheDocument();
});

test('RenderInputTextItem Component make input editable', async () => {
  const { getByRole } = render(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
    />
  );
  await userEvent.click(getByRole('button'));
});

test('RenderInputTextItem Component change input value', async () => {
  const { getByRole } = render(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
    />
  );
  await userEvent.click(getByRole('button'));
  await userEvent.type(getByRole('textbox'), 'test');
  await userEvent.tab();
});

test('RenderInputTextItem Component handle invalid input value', async () => {
  const { rerender, getByRole, getByText } = render(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
    />
  );
  await userEvent.click(getByRole('button'));
  await userEvent.type(getByRole('textbox'), '😆');
  await userEvent.tab();
  rerender(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
      error="Please enter a valid value"
      isError
    />
  );
  expect(getByText('Please enter a valid value')).toBeInTheDocument();
});

// FIXME: Pass in isolation, but fail when run with other tests
test.skip("RenderInputTextItem Component doesn't allow to submit whitespace without any characters", async () => {
  render(
    <RenderInputTextItem
      name="firstName"
      valueText=""
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
    />
  );
  await userEvent.type(screen.getByRole('textbox'), '{space}{space}{enter}');
  expect(handleEnter).not.toHaveBeenCalled();
  await userEvent.tab();
  expect(handleBlur).not.toHaveBeenCalled();
});

test('RenderInputTextItem Component submit value', async () => {
  const { getByRole } = render(
    <RenderInputTextItem
      name="firstDriverName"
      valueText="Testdriver"
      handleOnEnter={handleEnter}
      handleOnBlur={handleBlur}
      isEditable
      testId="test-input"
    />
  );
  await userEvent.click(getByRole('button'));
  await userEvent.type(getByRole('textbox'), 'test{enter}');
  expect(handleEnter).toHaveBeenCalled();
  await userEvent.tab();
  expect(handleBlur).toHaveBeenCalled();
});
