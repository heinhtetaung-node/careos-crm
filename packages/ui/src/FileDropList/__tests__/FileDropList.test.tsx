import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import FileDropList from '..';

const mockFile = new File(['mockfile'], 'mockfile.png', { type: 'image/png' });
const secondMockFile = new File(['mockfile'], 'mockfile.png', {
  type: 'image/png',
});

describe('FileDropList', () => {
  it('should call handleFileChange when file is added or removed', async () => {
    const mockHandleFileChange = jest.fn();
    render(
      <FileDropList maxFileDrop={2} handleFileChange={mockHandleFileChange} />
    );
    await userEvent.upload(screen.getByTestId('drop-zone-input'), [mockFile]);
    await waitFor(() => expect(mockHandleFileChange).toHaveBeenCalled());

    await userEvent.upload(screen.getAllByTestId('drop-zone-input')[1], [
      secondMockFile,
    ]);
    await waitFor(() => expect(mockHandleFileChange).toHaveBeenCalled());

    await userEvent.click(screen.queryAllByTestId('remove-file-btn')[0]);
    await waitFor(() => expect(mockHandleFileChange).toHaveBeenCalled());
  });
});
