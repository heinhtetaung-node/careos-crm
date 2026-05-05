import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';

import mockedScripts from 'shared/helper/scriptsResponse.mock';

import ScriptSection from '.';

it('renders ScriptSection component with no scripts', () => {
  const props = {
    loadMore: jest.fn(),
    data: [],
    hasMore: false,
  };

  render(<ScriptSection {...props} />);
  const scripts = screen.getByRole('list');
  const { queryAllByRole } = within(scripts);
  const items = queryAllByRole('list');
  expect(items.length).toBe(0);
});

it('renders ScriptSection component with scripts', () => {
  const props = {
    loadMore: jest.fn(),
    data: mockedScripts,
    hasMore: true,
  };

  render(<ScriptSection {...props} />);
  const scripts = screen.getByRole('list');
  const { getAllByRole } = within(scripts);
  const items = getAllByRole('listitem');
  expect(items.length).toBe(2);
});

it('renders ScriptSection component render with scripts and calls loadMore when scrolled to the bottom', async () => {
  const props = {
    loadMore: jest.fn(),
    data: mockedScripts,
    hasMore: true,
  };

  const { container } = render(<ScriptSection {...props} />);
  const scripts = screen.getByRole('list');
  const { getAllByRole } = within(scripts);
  const items = getAllByRole('listitem');
  expect(items.length).toBe(2);

  fireEvent.scroll(
    container.querySelector('.infinite-scroll-component') as Element,
    {
      target: { scrollY: 1000 },
    }
  );

  await waitFor(
    () => {
      expect(props.loadMore).toHaveBeenCalledTimes(1);
    },
    { timeout: 2000 }
  );
});
