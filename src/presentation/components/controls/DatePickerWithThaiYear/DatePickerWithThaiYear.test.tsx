import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DatePickerWithThaiYear from '.';

const mockedChangedFn = jest.fn();

const props = {
  name: 'name',
  value: '',
  onChangeDate: mockedChangedFn,
};

describe('<DatePickerWithThaiYear />', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should mount and render', () => {
    render(<DatePickerWithThaiYear {...props} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('should show the date value if passed', () => {
    const newProps = {
      ...props,
      showThaiYear: true,
      value: new Date('2022-02-02T00:00:00'),
    };
    render(<DatePickerWithThaiYear {...newProps} />);
    expect(screen.getByRole('textbox')).toHaveValue('02/02/2022 (2565)');
  });

  test('should call onChangeDate if valid date is type', async () => {
    render(<DatePickerWithThaiYear {...props} />);
    await user.type(screen.getByRole('textbox'), '02/02/2020');
    expect(mockedChangedFn).toHaveBeenCalled();
  });

  test('should not call onChangeDate if invalid date is type', async () => {
    render(<DatePickerWithThaiYear {...props} />);
    await user.type(screen.getByRole('textbox'), '32/22/2020');
    expect(mockedChangedFn).not.toHaveBeenCalled();
    expect(screen.getByText('package.invalidDateFormat'));
  });

  test('should add thai year at the end of input if date is valid', async () => {
    render(<DatePickerWithThaiYear showThaiYear {...props} />);
    await user.type(screen.getByRole('textbox'), '02/02/2022');
    expect(screen.getByRole('textbox')).toHaveValue('02/02/2022 (2565)');
  });

  test('should not add thai year at the end of input if show thai year is false', async () => {
    render(<DatePickerWithThaiYear {...props} />);
    await user.type(screen.getByRole('textbox'), '02/02/2022');
    expect(screen.getByRole('textbox')).toHaveValue('02/02/2022');
  });

  test('should not add thai year at the end of input if show thai year is false and field is disabled', () => {
    const newProps = {
      ...props,
      value: new Date('2022-02-02T00:00:00'),
    };
    render(<DatePickerWithThaiYear isFieldDisabled {...newProps} />);
    expect(screen.getByTestId('disabled-datefield')).toHaveTextContent(
      '02/02/2022'
    );
  });

  test('should not have testbox if the field is disabled', () => {
    const newProps = {
      ...props,
      isFieldDisabled: true,
    };
    render(<DatePickerWithThaiYear {...newProps} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('should reset to original value if input is invalid', async () => {
    const newProps = {
      ...props,
      showThaiYear: true,
      value: new Date('2022-02-02T00:00:00'),
    };
    render(<DatePickerWithThaiYear {...newProps} />);
    await user.type(
      screen.getByRole('textbox'),
      '{delete}{backspace}{delete}{backspace}'
    );
    await user.tab();
    expect(screen.queryByRole('textbox')).toHaveValue('02/02/2022 (2565)');
  });
});
