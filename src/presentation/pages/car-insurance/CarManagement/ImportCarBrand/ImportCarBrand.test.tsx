import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import ImportCarBrand from '.';

describe.skip('ImportCarBrand', () => {
  it('should render correctly', () => {
    render(<ImportCarBrand />);
    expect(screen.getByTestId('brand-import')).toBeInTheDocument();
  });

  it('should show import modal if click btn', () => {
    render(<ImportCarBrand />);
    userEvent.click(screen.getByRole('button', { name: 'text.brandImport' }));
    const modal = within(screen.getByRole('presentation'));
    expect(modal.getByText('text.brandImport')).toBeInTheDocument();
  });
});
