import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import LicensePlate from './LicensePlate';

describe('Test <LicensePlate/>', () => {
  it('<LicensePlate/> render successfully', () => {
    render(
      <LicensePlate
        placeholder="License plate"
        name="licensePlate"
        title="License plate"
      />
    );
    expect(screen.getByPlaceholderText('License plate')).toBeInTheDocument();
  });

  it('<LicensePlate/> format correctly when user input numbers', async () => {
    render(
      <LicensePlate
        placeholder="License plate"
        name="licensePlate"
        title="License plate"
        dataTestId="license-plate"
      />
    );
    const input = screen.getByTestId('license-plate-input');
    await userEvent.type(input, '123456');
    expect(input).toHaveValue('12 3456');
  });

  it('<LicensePlate/> format correctly when user input mixed characters', async () => {
    render(
      <LicensePlate
        placeholder="License plate"
        name="licensePlate"
        title="License plate"
        dataTestId="license-plate"
      />
    );

    const input = screen.getByTestId('license-plate-input');
    await userEvent.type(input, 'กข1204');
    expect(input).toHaveValue('กข 1204');

    await userEvent.clear(input);

    await userEvent.type(input, '1กข1204');
    expect(input).toHaveValue('1กข 1204');
  });

  it("<LicensePlate/> doesn't put extra space if default value already include one.", () => {
    render(
      <LicensePlate
        placeholder="License plate"
        name="licensePlate"
        title="License plate"
        value="กข 1204"
        dataTestId="license-plate"
      />
    );

    const input = screen.getByTestId('license-plate-input');
    expect(input).toHaveValue('กข 1204');
  });

  it("<LicensePlate/> put extra space if default value doesn't include one", () => {
    render(
      <LicensePlate
        placeholder="License plate"
        name="licensePlate"
        title="License plate"
        value="112022"
        dataTestId="license-plate"
      />
    );

    const input = screen.getByTestId('license-plate-input');
    expect(input).toHaveValue('11 2022');
  });
});
