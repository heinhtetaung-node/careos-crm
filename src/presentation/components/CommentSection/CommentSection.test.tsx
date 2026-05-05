import { render, screen, within } from '@testing-library/react';
import * as React from 'react';

import getAllActivity from 'shared/helper/AllActivityMock';

import CommentSection from './CommentSection';

const mockedActivity = getAllActivity();

it('CommentSection component render with no comments', () => {
  const props = {
    loadMore: jest.fn(),
    data: {
      comments: [],
      nextPageToken: '',
    },
  };
  render(<CommentSection {...props} />);
  const comments = screen.getByRole('list');
  const { queryAllByRole } = within(comments);
  const items = queryAllByRole('list');
  expect(items.length).toBe(0);
});

it('CommentSection component render with comments', () => {
  const props = {
    loadMore: jest.fn(),
    data: mockedActivity,
  };
  render(<CommentSection {...props} />);
  const comments = screen.getByRole('list');
  const { getAllByRole } = within(comments);
  const items = getAllByRole('listitem');
  expect(items.length).toBe(6);
});
