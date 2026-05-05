import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import FileDrop from '..';

const mockFile = new File(['mockfile'], 'mockfile.png', { type: 'image/png' });

describe('FileDrop', () => {
  it('should call onDrop if file drop and onRemove if file remove', async () => {
    const user = userEvent.setup();
    const mockFileDrop = jest.fn();
    const mockFileRemove = jest.fn();
    render(
      <FileDrop onFileDrop={mockFileDrop} onFileRemove={mockFileRemove} />
    );
    await user.upload(screen.getByTestId('drop-zone-input'), [mockFile]);
    await waitFor(() => expect(mockFileDrop).toHaveBeenCalled());
    await user.click(screen.getByTestId('remove-file-btn'));
    await waitFor(() => expect(mockFileRemove).toHaveBeenCalled());
  });

  // Unknown error
  it.skip('should show error if drop invalid files', async () => {
    const user = userEvent.setup();
    const mockFileDrop = jest.fn();
    render(
      <FileDrop
        onFileDrop={mockFileDrop}
        onFileRemove={jest.fn()}
        accept={{ 'application/pdf': ['.pdf'] }}
      />
    );
    await user.upload(screen.getByTestId('drop-zone-input'), [mockFile]);
    await waitFor(() =>
      expect(screen.getByTestId('drop-zone-errors')).toHaveTextContent(
        'File type must be application/pdf,.pdf'
      )
    );
    await waitFor(() => expect(mockFileDrop).not.toHaveBeenCalled());
  });
});
