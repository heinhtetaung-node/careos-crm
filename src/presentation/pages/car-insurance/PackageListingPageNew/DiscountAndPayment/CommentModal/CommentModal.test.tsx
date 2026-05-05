import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import CommentModal from '.';

describe('CommentModal', () => {
  it('should call onSubmit function with file comment when click', async () => {
    const mockSubmit = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: 'something' }));

    render(
      <CommentModal
        isOpen
        onClose={jest.fn()}
        onSubmit={mockSubmit}
        isDocumentOptional
      />
    );
    within(screen.getByTestId('input-comment')).getByRole('textbox').focus();
    await userEvent.paste('abcd');
    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));
    await waitFor(() =>
      expect(screen.getByText('text.saveComplete')).toBeInTheDocument()
    );
    expect(mockSubmit).toHaveBeenCalled();
  });
});
