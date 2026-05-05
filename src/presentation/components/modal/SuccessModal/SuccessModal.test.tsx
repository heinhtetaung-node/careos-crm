import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import SuccessModal from './index';

describe('SuccessModal', () => {
  const mockCloseFn = jest.fn();
  beforeEach(() => {
    render(
      <SuccessModal
        className="class"
        isOpen
        handleClose={mockCloseFn}
        text="Success Modal"
      />
    );
  });
  it('renders correctly when props are passed', () => {
    expect(screen.getByTestId('success-modal')).toBeInTheDocument();
  });
  it('should trigger handle close function if closed', async () => {
    await userEvent.click(screen.getByTestId('close-button'));
    expect(mockCloseFn).toHaveBeenCalled();
  });
});
