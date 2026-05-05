import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import LinkField from '.';

describe('<LinkField />', () => {
  it('should show title, value passed as props', () => {
    render(<LinkField title="title" value="value" link="link" />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('should show dash if value is undefined', () => {
    render(<LinkField title="title" value={undefined} link="link" />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should not clickable the link if the field is disabled', () => {
    render(<LinkField title="title" value="value" link="link" isDisabled />);
    expect(
      screen.queryByRole('link', { name: 'value' })
    ).not.toBeInTheDocument();
  });
});
