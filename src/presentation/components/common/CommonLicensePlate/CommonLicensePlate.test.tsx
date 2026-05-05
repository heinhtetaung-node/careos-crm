import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CommonLicensePlate from '.';

const testId = 'common-textfield';

describe('Test <CommonLicensePlate/>', () => {
  it('<CommonLicensePlate/> render successfully', () => {
    render(<CommonLicensePlate name="licensePlate" value="กข 01204" />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('<CommonLicensePlate/> format correctly when user input numbers', async () => {
    render(<CommonLicensePlate name="licensePlate" />);
    const input = screen.getByTestId(testId);
    await userEvent.type(input, '123456');
    expect(input).toHaveValue('12 3456');
  });

  it('<CommonLicensePlate/> format correctly when user input mixed characters', async () => {
    render(<CommonLicensePlate name="licensePlate" />);
    const input = screen.getByTestId(testId);
    await userEvent.type(input, '1กข1204');
    expect(input).toHaveValue('1กข 1204');
  });

  it("<CommonLicensePlate/> doesn't put extra space if default value already include one", () => {
    render(<CommonLicensePlate name="licensePlate" value="1กข 1204" />);
    const input = screen.getByTestId(testId);
    expect(input).toHaveValue('1กข 1204');
  });

  it("<CommonLicensePlate/> put extra space if default value doesn't have one", () => {
    render(<CommonLicensePlate name="licensePlate" value="112022" />);
    const input = screen.getByTestId(testId);
    expect(input).toHaveValue('11 2022');
  });

  it('<CommonLicensePlate/> called handleDataUpate when blur or press enter', async () => {
    const handleDataUpdate = jest.fn();
    render(
      <CommonLicensePlate
        name="licensePlate"
        handleDataUpdate={handleDataUpdate}
      />
    );
    const input = screen.getByTestId(testId);
    await userEvent.type(input, '1122334');
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).toHaveBeenCalledWith({ licensePlate: '11 22334' });

    await userEvent.keyboard('{Tab}');
    expect(handleDataUpdate).toHaveBeenCalledWith({ licensePlate: '11 22334' });
  });

  it("<CommonLicensePlate/> doesn't called handleDataUpdate unless license plate value changed", async () => {
    const handleDataUpdate = jest.fn();
    render(
      <CommonLicensePlate
        name="licensePlate"
        handleDataUpdate={handleDataUpdate}
      />
    );
    const input = screen.getByTestId(testId);
    await userEvent.type(input, '1122334');
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).toHaveBeenCalledWith({ licensePlate: '11 22334' });
    handleDataUpdate.mockClear();
    await userEvent.type(input, '1122334');
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).not.toHaveBeenCalledWith({
      licensePlate: '11 22334',
    });
  });
});
