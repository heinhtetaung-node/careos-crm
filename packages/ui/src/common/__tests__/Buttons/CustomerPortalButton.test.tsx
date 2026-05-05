import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import CustomerPortalButton from '../../Buttons/CustomerPortalButton';

describe('CustomerPortalButton component', () => {
  const text = 'image';
  it('should render with the correct props', () => {
    render(<CustomerPortalButton href="href" text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('link'));
    expect(screen.getByRole('link')).toHaveAttribute('href', 'href');
  });

  it('should override conflicting classnames', () => {
    render(
      <CustomerPortalButton
        href="href"
        text={text}
        className="bg-secondary text-primary"
      />
    );

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveClass('bg-secondary text-primary');
    expect(screen.getByRole('link')).not.toHaveClass('bg-primary text-white ');
  });
});
