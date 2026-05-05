import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import ImportRedbook from '.';

describe.skip('ImportRedbook', () => {
  it('should render correctly', () => {
    render(<ImportRedbook />);
    expect(
      screen.getByTestId('redbook-import-main-container')
    ).toBeInTheDocument();
  });

  it('should show import modal if click btn', () => {
    render(<ImportRedbook />);
    userEvent.click(
      screen.getByRole('button', { name: 'text.redbookImport' })
    );
    const modal = within(screen.getByRole('presentation'));
    expect(modal.getByText('text.redbookImport')).toBeInTheDocument();
  });
});
