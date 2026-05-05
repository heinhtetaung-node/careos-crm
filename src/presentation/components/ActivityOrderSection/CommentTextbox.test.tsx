import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { ComponentWithProvider, render } from '__tests__/rtl-test-utils';

import CommentTextbox from './CommentTextbox';

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

test('CommentTextbox Component renders', () => {
  render(
    <ComponentWithProvider>
      <CommentTextbox />
    </ComponentWithProvider>
  );
  expect(screen.getByTestId('unittest-text-area-comment')).toBeTruthy();
});

test('CommentTextbox Component handles input change and submit', () => {
  const { getByLabelText, getByText, getByRole } = render(
    <ComponentWithProvider>
      <CommentTextbox />
    </ComponentWithProvider>
  );
  const textarea = getByLabelText('empty textarea');
  const button = getByRole('button');
  fireEvent.change(textarea, {
    target: { value: 'testing' },
  });
  expect(getByText('testing')).toBeInTheDocument();
  fireEvent.click(button);
});
