import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import InputContainer from '.';

describe('<InputContainer />', () => {
  it('should show subText if provided', () => {
    render(
      <InputContainer
        title="Test label"
        subText="Some additional information"
      />
    );

    expect(screen.getByTestId('subText')).toBeInTheDocument();
  });

  it('should trigger handleRemove function if passed and not a title', async () => {
    const handleRemove = jest.fn();
    render(
      <InputContainer
        title="Test label"
        subText="Some additional information"
        handleRemove={handleRemove}
        isRemovable
      />
    );

    const iconButton = screen.getByRole('button');

    expect(iconButton).toBeInTheDocument();
    await userEvent.click(iconButton);
    expect(handleRemove).toHaveBeenCalled();
  });
});
