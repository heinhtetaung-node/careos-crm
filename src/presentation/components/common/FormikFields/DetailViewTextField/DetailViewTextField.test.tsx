import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DetailViewTextField from './index';

const handleUpdate = jest.fn();
const config = {
  title: 'First Name',
  name: 'firstName',
  value: 'John',
  dataTestId: 'first-name',
};

describe('DetailViewTextField renders - ', () => {
  it('empty field with placeholder', () => {
    const props = {
      title: 'First Name',
      name: 'firstName',
      value: '',
      isReadOnly: false,
      placeholder: 'Enter First Name',
      dataTestId: 'first-name',
      handleUpdate,
    };
    render(<DetailViewTextField {...props} />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'Enter First Name'
    );
  });

  it('field with value', () => {
    render(<DetailViewTextField {...config} isReadOnly />);
    expect(screen.getByTestId('first-name-input')).toHaveDisplayValue('John');
  });
});

describe('DetailViewTextField handles value change - ', () => {
  it('user input change', async () => {
    render(<DetailViewTextField {...config} handleUpdate={handleUpdate} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.clear(textbox);
    await userEvent.type(textbox, 'Jane');
    await waitFor(() => {
      expect(textbox).toHaveValue('Jane');
    });
  });

  it('updates value when input loses focus', async () => {
    render(<DetailViewTextField {...config} handleUpdate={handleUpdate} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.type(textbox, 'ny');
    await userEvent.tab();
    await waitFor(() => {
      expect(textbox).toHaveValue('Johnny');
    });
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });
  });

  // Refactor this test
  it.skip('does not update value when user presses ESC key', async () => {
    render(<DetailViewTextField {...config} handleUpdate={handleUpdate} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.clear(textbox);
    await userEvent.type(textbox, 'Jane');
    await userEvent.type(textbox, '{esc}');
    await waitFor(() => {
      expect(textbox).toHaveValue('John');
    });
  });

  it('pressing ENTER key saves and updates value', async () => {
    render(<DetailViewTextField {...config} handleUpdate={handleUpdate} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.clear(textbox);
    await userEvent.type(textbox, 'Jane');
    await userEvent.type(textbox, '{enter}');
    await waitFor(() => {
      expect(textbox).toHaveValue('Jane');
    });
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });
  });

  it('trim leading or trailing spaces, double spaces in between value text', async () => {
    render(<DetailViewTextField {...config} handleUpdate={handleUpdate} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.clear(textbox);
    await userEvent.type(textbox, '    Jane   {enter}');
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith({ firstName: 'Jane' });
    });
  });
});
