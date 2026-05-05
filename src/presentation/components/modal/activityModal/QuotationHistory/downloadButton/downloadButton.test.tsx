import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DownloadButton from '.';

test('renders DownloadButton successfully', async () => {
  const onClick = jest.fn();
  const documentName = 'documents/fakename';
  render(<DownloadButton document={documentName} onClick={onClick} />);
  expect(screen.getByTestId('download-button')).toBeTruthy();

  const button = screen.getByTestId('download-button');
  await userEvent.click(button);
  expect(onClick).toHaveBeenNthCalledWith(1, documentName);
});
