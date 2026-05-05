import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import DownloadDocumentModal from '.';

const close = jest.fn();

describe('DownloadDocumentModal Component', () => {
  test('render download document modal', () => {
    render(<DownloadDocumentModal close={close} />);
    expect(screen.queryByTestId('download-document-modal')).toBeTruthy();
  });

  test('handle select option', async () => {
    render(<DownloadDocumentModal close={close} />);
    await userEvent.click(screen.getByRole('button', { name: 'Select' }));
    await waitFor(() => {
      expect(screen.getByText('All')).toBeTruthy();
    });
    await userEvent.click(screen.getByText('All'));
    await waitFor(() => {
      expect(screen.getByTestId('select-documentType')).toHaveValue('All');
    });
  });

  test('handle submit selected option', async () => {
    render(<DownloadDocumentModal close={close} />);
    await userEvent.click(screen.getByRole('button', { name: 'Select' }));
    await waitFor(() => {
      expect(screen.getByText('All')).toBeTruthy();
    });
    await userEvent.click(screen.getByText('All'));
    await waitFor(() => {
      expect(screen.getByTestId('select-documentType')).toHaveValue('All');
    });
    await userEvent.click(screen.getByTestId('download-document-submit-btn'));
  });

  test('handle cancel modal', async () => {
    render(<DownloadDocumentModal close={close} />);
    await userEvent.click(screen.getByTestId('download-document-cancel-btn'));
    await waitFor(() => {
      expect(close).toHaveBeenCalled();
    });
  });
});
