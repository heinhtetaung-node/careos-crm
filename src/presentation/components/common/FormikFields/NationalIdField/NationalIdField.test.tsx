import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import NationalIdField from '.';

describe('Test <NationalIdField/>', () => {
  it('<NationalIdField/> render successfully', () => {
    render(
      <NationalIdField
        name="nationalId"
        dataTestId="nid"
        title="National ID n."
      />
    );
    expect(screen.getByTestId('nid-input')).toBeInTheDocument();
  });

  it('<NationalIdField/> only allow to input number', async () => {
    render(
      <NationalIdField
        name="nationalId"
        dataTestId="nid"
        title="National ID n."
      />
    );

    const input = screen.getByTestId('nid-input');
    await userEvent.type(input, '123');
    expect(input).toHaveValue('1 23');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    expect(input).not.toHaveValue('abc');
  });
});
