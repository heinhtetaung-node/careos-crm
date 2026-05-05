import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import ImportPackagePageHelper from '.';

describe('<ImportPackagePageHelper />', () => {
  it('will be mounted correctly', () => {
    render(<ImportPackagePageHelper />);
  });
});

describe.skip('<ImportPackagePage>', () => {
  test('Import Package Component loads', async () => {
    render(<ImportPackagePageHelper />);
    const container = await screen.findByTestId('package-import-page');
    expect(container).toBeInTheDocument();
  });

  test('handle Standard Package btn click', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importPackages',
    });
    await userEvent.click(btn);
    const modal = await screen.findByRole('dialog', {
      name: 'text.importPackages',
    });
    expect(modal).toBeInTheDocument();
  });

  test('handleRenewal Package btn click', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importRenewPackages',
    });
    await userEvent.click(btn);
    const modal = await screen.findByRole('dialog', {
      name: 'text.importRenewPackages',
    });
    expect(modal).toBeInTheDocument();
  });

  test('handle Mandatory Package btn click', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importMandatoryPackages',
    });
    await userEvent.click(btn);
    const modal = await screen.findByRole('dialog', {
      name: 'text.importMandatoryPackages',
    });
    expect(modal).toBeInTheDocument();
  });

  test('should be closed renewal package Import Modal', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importRenewPackages',
    });
    await userEvent.click(btn);
    await userEvent.click(screen.getByTestId('close-button'));
    expect(screen.queryByText('modal title')).not.toBeInTheDocument();
  });

  test('should be closed standard package Import Modal', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importPackages',
    });
    await userEvent.click(btn);
    await userEvent.click(screen.getByTestId('close-button'));
    expect(screen.queryByText('modal title')).not.toBeInTheDocument();
  });

  test('should be closed mandatory package Import Modal', async () => {
    render(<ImportPackagePageHelper />);
    const btn = await screen.findByRole('button', {
      name: 'text.importMandatoryPackages',
    });
    await userEvent.click(btn);
    await userEvent.click(screen.getByTestId('close-button'));
    expect(screen.queryByText('modal title')).not.toBeInTheDocument();
  });
});
