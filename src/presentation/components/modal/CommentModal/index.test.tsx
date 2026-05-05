import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import CommentModal from '.';

describe('Comment modal', () => {
  it('should pass the comment into the onSubmit function if passed', async () => {
    const onSubmit = jest.fn();
    render(<CommentModal onSubmit={onSubmit} />);

    userEvent.type(screen.getByTestId('comment-input'), 'test');
    await waitFor(() => {
      const textArea = screen
        .getByTestId('comment-input')
        .getElementsByTagName('textarea')[0];
      expect(textArea).toHaveValue('test');
    });
    await userEvent.click(screen.getByTestId('comment-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should be in a loading state if isLoading', () => {
    render(<CommentModal isLoading />);

    expect(screen.getByTestId('comment-submit')).toBeDisabled();
  });
});
