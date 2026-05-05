import userEvent from '@testing-library/user-event';
import React from 'react';

import { screen, render } from '__tests__/rtl-test-utils';

import CommonTextField from './CommonTextField';

describe('Test <CommonTextField/>', () => {
  it('<CommonTextField/> render successfully', () => {
    render(<CommonTextField label="Label" placeholder="Placeholder" />);
    expect(screen.getByPlaceholderText('Placeholder')).toBeInTheDocument();
  });

  it('<CommonTextField/> submit form when lose focus or press enter', async () => {
    const handleDataUpdate = jest.fn();
    render(
      <CommonTextField
        label="Label"
        placeholder="Placeholder"
        handleDataUpdate={handleDataUpdate}
      />
    );
    const textField = screen.getByTestId<HTMLInputElement>('common-textfield');
    await userEvent.type(textField, 'Form Input');
    expect(textField.value).toBe('Form Input');
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).toHaveBeenCalled();
    await userEvent.keyboard('{Tab}');
    expect(handleDataUpdate).toHaveBeenCalled();
  });
});
