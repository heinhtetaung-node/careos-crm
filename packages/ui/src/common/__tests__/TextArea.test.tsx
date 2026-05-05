import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import TextArea from '../Textarea';

describe('TextArea', () => {
  it('should resize', async () => {
    render(<TextArea label="Label" />);
    expect(screen.getByText('Label')).toBeInTheDocument();
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'abc\ndef');
    expect(textbox.style.height).toBe('0px');
  });

  it('should not show label if not provided', () => {
    render(<TextArea />);
    expect(screen.queryByText('Label')).not.toBeInTheDocument();
  });

  it('should show error', () => {
    render(<TextArea error="error message" />);
    expect(screen.getByText('error message')).toBeInTheDocument();
  });
});
