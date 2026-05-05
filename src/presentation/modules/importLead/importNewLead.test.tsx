import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import ImportNewLead from './ImportNewLead';

const handleCloseModal = jest.fn();

describe('<ImportNewLead Component/>', () => {
  it('will be mounted correctly', () => {
    render(<ImportNewLead close={handleCloseModal()} />);
  });

  it('should click to button cancel', async () => {
    render(<ImportNewLead close={handleCloseModal} />);
    await user.click(screen.getByRole('button', { name: 'text.cancelButton' }));
    expect(handleCloseModal).toHaveBeenCalled();
  });

  it('should not click to button submit', () => {
    render(<ImportNewLead close={handleCloseModal} />);
    expect(
      screen.getByRole('button', { name: 'text.confirmImport' })
    ).toBeDisabled();
  });
});
