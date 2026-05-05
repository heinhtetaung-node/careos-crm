import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RenderInputLicensePlate from './RenderInputLicensePlate';
import { FormField } from './RenderItem';

const useStateSpy = jest.spyOn(React, 'useState');
const isEditText = false;
const setIsEditText = jest.fn();
const leftInput = '';
const setLeftInput = jest.fn();
const rightInput = '';
const setRightInput = jest.fn();
const abbr = '';
const setAbbr = jest.fn();
const error = false;
const setError = jest.fn();
useStateSpy.mockImplementation((() => [isEditText, setIsEditText]) as any);
useStateSpy.mockImplementation((() => [leftInput, setLeftInput]) as any);
useStateSpy.mockImplementation((() => [rightInput, setRightInput]) as any);
useStateSpy.mockImplementation((() => [abbr, setAbbr]) as any);
useStateSpy.mockImplementation((() => [error, setError]) as any);
const onEnter = jest.fn();
const onBlur = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

test('RenderInputLicensePlate Component render', () => {
  const { getAllByRole, getByTestId } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  const inputs = getAllByRole('textbox');
  expect(inputs.length).toBe(2);
  expect(getByTestId('license-input')).toBeTruthy();
});

test('RenderInputLicensePlate Component handle button click to edit', async () => {
  const { getByRole } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  await userEvent.click(getByRole('button'));
});

test('RenderInputLicensePlate Component handle input values change', async () => {
  const { getByTestId } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  const leftVal = getByTestId('license-input-left');
  const rightVal = getByTestId('license-input-right');
  await userEvent.type(leftVal, '3กพ');
  await userEvent.tab();
  await userEvent.type(rightVal, '1900');
});

test('RenderInputLicensePlate Component make license fields readonly', async () => {
  const { getByRole } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  await userEvent.click(getByRole('button'));
});

test('RenderInputLicensePlate Component handle invalid input', async () => {
  const { getAllByRole, getByRole } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  const inputs = getAllByRole('textbox');
  await userEvent.click(getByRole('button'));
  await userEvent.clear(inputs[0]);
  await userEvent.type(inputs[1], '😆');
  await userEvent.tab();
  expect(setError).toHaveBeenCalled();
});

test("RenderInputLicensePlate Component click action doesn't make form field editable while isEditable flag is false", async () => {
  render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
    />
  );
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  await userEvent.click(screen.getAllByRole('textbox')[1]);
  expect(setIsEditText).not.toHaveBeenCalled();
});

test('RenderInputLicensePlate Component handle input length validation', async () => {
  const { getByTestId } = render(
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  );
  const leftVal = getByTestId('license-input-left');
  await userEvent.type(leftVal, '1234');
  await userEvent.tab();
  expect(setError).toHaveBeenCalled();
});

test('RenderInputLicensePlate Component passed as a render props to <FormField/>', () => {
  const renderProps = jest.fn(() => (
    <RenderInputLicensePlate
      licenseNo="กพ-2001 กท"
      name="carLicensePlate"
      handleOnEnter={onEnter}
      handleOnBlur={onBlur}
      registeredProvince={100000}
      isEditable
    />
  ));
  render(<FormField>{renderProps}</FormField>);
  expect(renderProps).toHaveBeenCalled();
});

test('RenderInputLicensePlate Component call setShowHighlight and set correct highlight color when right input form field is empty', async () => {
  render(
    <FormField>
      {({ setShowHighlight }) => (
        <RenderInputLicensePlate
          name="carLicensePlate"
          handleOnEnter={onEnter}
          handleOnBlur={onBlur}
          setShowHighlight={setShowHighlight}
          registeredProvince={100000}
          isEditable
        />
      )}
    </FormField>
  );
  /* eslint-disable @typescript-eslint/no-shadow */
  const rightInput = screen.getByTestId('license-input-right');

  await userEvent.type(rightInput, '{backspace}{backspace}');
  await userEvent.keyboard('[Enter]');

  const styles = window.getComputedStyle(screen.getByTestId('field'));
  expect(styles.backgroundColor).toEqual('rgb(251, 218, 218)');
});

test('RenderInputLicensePlate Component call setShowHighlight and set correct highlight color when left input form field is empty', async () => {
  render(
    <FormField>
      {({ setShowHighlight }) => (
        <RenderInputLicensePlate
          name="carLicensePlate"
          handleOnEnter={onEnter}
          handleOnBlur={onBlur}
          setShowHighlight={setShowHighlight}
          registeredProvince={100000}
          isEditable
        />
      )}
    </FormField>
  );
  /* eslint-disable @typescript-eslint/no-shadow */
  const leftInput = screen.getByTestId('license-input-left');

  await userEvent.type(leftInput, '{backspace}{backspace}');
  await userEvent.keyboard('[Enter]');

  const styles = window.getComputedStyle(screen.getByTestId('field'));
  expect(styles.backgroundColor).toEqual('rgb(251, 218, 218)');
});

test('RenderInputLicensePlate Component call setShowHighlight and remove highlight when there is a valid input', async () => {
  render(
    <FormField>
      {({ setShowHighlight }) => (
        <RenderInputLicensePlate
          name="carLicensePlate"
          handleOnEnter={onEnter}
          handleOnBlur={onBlur}
          setShowHighlight={setShowHighlight}
          registeredProvince={100000}
          isEditable
        />
      )}
    </FormField>
  );
  /* eslint-disable @typescript-eslint/no-shadow */
  const rightInput = screen.getByTestId('license-input-right');
  const leftInput = screen.getByTestId('license-input-left');

  // empty left input
  await userEvent.type(leftInput, '{backspace}{backspace}');
  await userEvent.keyboard('[Enter]');

  // empty right input
  await userEvent.type(rightInput, '{backspace}{backspace}');
  await userEvent.keyboard('[Enter]');

  let styles = window.getComputedStyle(screen.getByTestId('field'));
  expect(styles.backgroundColor).toEqual('rgb(251, 218, 218)');

  await userEvent.type(leftInput, 'กพ');
  await userEvent.keyboard('[Enter]');
  await userEvent.type(rightInput, '9882');
  await userEvent.keyboard('[Enter]');

  styles = window.getComputedStyle(screen.getByTestId('field'));
  expect(styles.backgroundColor).toEqual('rgb(255, 255, 255)');
});
