import { WarningIcon } from '@alphafounders/icons';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import WarningModal from '.';

describe('WarningModal', () => {
  it('renders correctly when props are passed', () => {
    render(
      <WarningModal
        logo={<WarningIcon viewBox="0 0 60 60" />}
        title="This is the title"
        description={<span>This is the description</span>}
        button={<button type="button">Click Me</button>}
      />
    );

    expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-logo')).toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-title')).toBeInTheDocument();
    expect(screen.getByText('This is the title')).toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-description')).toBeInTheDocument();
    expect(screen.getByText('This is the description')).toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-button')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders correctly and hides logo and description', () => {
    render(
      <WarningModal
        title="This is the title"
        button={<button type="button">Click Me</button>}
      />
    );

    const logo = screen.queryByTestId('warning-modal-logo');
    const description = screen.queryByTestId('warning-modal-description');

    expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
    expect(logo).not.toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-title')).toBeInTheDocument();
    expect(screen.getByText('This is the title')).toBeInTheDocument();
    expect(description).not.toBeInTheDocument();
    expect(screen.getByTestId('warning-modal-button')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
