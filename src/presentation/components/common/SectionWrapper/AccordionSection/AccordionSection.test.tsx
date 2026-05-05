import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import AccordionSection from '.';

test('AccordionSection renders', () => {
  const props = {
    isCollapsible: false,
    summary: 'Non-Collapsible',
    details: <p>Content</p>,
    label: 'Policy issued',
  };
  render(<AccordionSection {...props} />);
  expect(screen.queryByText('Non-Collapsible')).toBeInTheDocument();
  expect(screen.queryByText('Content')).toBeInTheDocument();
});

test('AccordionSection collapse or expands on click', async () => {
  const props = {
    isCollapsible: true,
    summary: 'Collapsible',
    details: <p>Content</p>,
  };
  render(<AccordionSection {...props} />);
  const expandIcon = screen.getByRole('button');
  expect(screen.getByRole('button', { expanded: true })).toBeTruthy();
  await userEvent.click(expandIcon);
  expect(screen.getByRole('button', { expanded: false })).toBeTruthy();
});
