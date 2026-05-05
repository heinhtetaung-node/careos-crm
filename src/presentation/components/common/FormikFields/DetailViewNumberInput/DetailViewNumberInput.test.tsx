import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DetailViewNumberInput from '.';

const mockValueChangeFn = jest.fn();
const mockSubmitFn = jest.fn();

const props = {
  name: 'componentName',
  title: 'Title',
  value: 12345,
  onValueChange: mockValueChangeFn,
  handleUpdate: mockSubmitFn,
  dataTestId: 'test',
};

describe('DetailViewNumberInput', () => {
  it('should call change function if value change', async () => {
    render(<DetailViewNumberInput {...props} />);
    await user.type(screen.getByRole('textbox'), '1');

    expect(mockValueChangeFn).toHaveBeenCalledWith({
      floatValue: 123451,
      formattedValue: '123451',
      value: '123451',
    });
  });
  it('should call submit function if the component is unfocused', async () => {
    render(<DetailViewNumberInput {...props} />);
    await user.type(screen.getByRole('textbox'), '1');
    await user.tab();

    expect(mockSubmitFn).toHaveBeenCalledWith({
      componentName: 123451,
    });
  });
  it('should show read only field if field is readonly', () => {
    render(<DetailViewNumberInput {...props} isReadOnly />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
