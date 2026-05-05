import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RenderInputAutoComplete from './RenderInputAutoComplete';

describe('Test <RenderInputAutoComplete/>', () => {
  it('<RenderInputAutoComplete/> called handleOnUpdate callback when user select option', async () => {
    const handleOnUpdate = jest.fn();
    render(
      <RenderInputAutoComplete
        handleOnUpdate={handleOnUpdate}
        name="vehicleColor"
        allowMaxTags={1}
      />
    );
    const combobox = screen.getByTestId('common-my-complete');
    const input = within(combobox).getByPlaceholderText('text.select');

    await userEvent.click(input);

    const options = screen.getAllByTestId('option-select-item');

    await userEvent.click(options[0]);
    expect(handleOnUpdate).toHaveBeenCalled();
  });
});
