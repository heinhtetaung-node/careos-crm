import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import ImportPackagePage from './index';

jest.mock('flagsmith/react', () => {
  const actual = jest.requireActual('flagsmith/react');
  return {
    ...actual,
    useFlags: jest.fn().mockReturnValue({
      'brok-2613_enable-generic-package-import_20250530': {
        enabled: true,
      },
      'brok-4712_enable-insurance-motor-import-button_20250220_temp': {
        enabled: true,
      },
    }),
  };
});

jest.mock('presentation/hooks/useTableList', () =>
  jest.fn(() => ({
    TableComponent: () => <div data-testid="table-component" />,
    TopComponent: () => <div data-testid="top-component" />,
    refetch: jest.fn(),
  }))
);

jest.mock(
  'presentation/components/modal/ImportModal',
  () =>
    function ImportModalMock({ title, showModal, onClose }: any) {
      if (!showModal) return null;
      return (
        <div role="dialog" aria-label={title}>
          <button data-testid="close-button" onClick={onClose}>
            close
          </button>
        </div>
      );
    }
);

jest.mock('presentation/components/controls/Control', () => ({
  Button: ({ text, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  ),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock('./index.style', () => () => ({
  importButtons: '',
}));

describe('ImportPackagePage - Insurance Motor Modal', () => {
  beforeEach(() => {
    (require('flagsmith/react').useFlags as jest.Mock).mockReturnValue({
      'brok-2613_enable-generic-package-import_20250530': {
        enabled: true,
      },
      'brok-4712_enable-insurance-motor-import-button_20250220_temp': {
        enabled: true,
      },
    });
  });

  it('opens Insurance Motor import modal when button is clicked', async () => {
    render(<ImportPackagePage />);

    const openButton = await screen.findByRole('button', {
      name: 'text.importInsuranceMotor',
    });

    await userEvent.click(openButton);

    expect(
      screen.getByRole('dialog', { name: 'text.importInsuranceMotor' })
    ).toBeInTheDocument();
  });

  it('closes Insurance Motor import modal when onClose is triggered', async () => {
    render(<ImportPackagePage />);

    const openButton = await screen.findByRole('button', {
      name: 'text.importInsuranceMotor',
    });

    await userEvent.click(openButton);

    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);

    expect(
      screen.queryByRole('dialog', { name: 'text.importInsuranceMotor' })
    ).not.toBeInTheDocument();
  });
});
