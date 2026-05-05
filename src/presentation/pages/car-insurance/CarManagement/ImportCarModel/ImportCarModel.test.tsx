import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import ImportCarModel from '.';

describe.skip('ImportCarModel', () => {
  it('should render CarModal correctly', () => {
    render(<ImportCarModel />);
    expect(screen.getByText('text.modelImport')).toBeInTheDocument();
  });

  it('should show import modal if click on import model button', () => {
    render(<ImportCarModel />);
    userEvent.click(screen.getByRole('button', { name: 'text.modelImport' }));
    const modal = within(screen.getByRole('presentation'));
    expect(modal.getByText('text.modelImport')).toBeInTheDocument();
  });
});
