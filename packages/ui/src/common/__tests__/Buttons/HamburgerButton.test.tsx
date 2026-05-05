import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import HamburgerButton from '../../Buttons/HamburgerButton';

describe('HamburgerButton component', () => {
  it('should override conflicting classnames', () => {
    render(<HamburgerButton className="stroke-secondary" />);

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveClass(
      'stroke-secondary cursor-pointer'
    );
    expect(screen.getByRole('img')).not.toHaveClass('stroke-primary');
  });

  it('should have a closed state if isOpen is not provided', () => {
    render(<HamburgerButton />);

    expect(screen.getByRole('img').childNodes[0]).toHaveStyle({
      strokeDasharray: '60 207',
      strokeDashoffset: '0',
    });
    expect(screen.getByRole('img').childNodes[1]).toHaveStyle({
      strokeDasharray: '60 60',
      strokeDashoffset: '0',
    });
    expect(screen.getByRole('img').childNodes[2]).toHaveStyle({
      strokeDasharray: '60 207',
      strokeDashoffset: '0',
    });
  });

  it('should have an open state if isOpen is provided', () => {
    render(<HamburgerButton isOpen />);

    expect(screen.getByRole('img').childNodes[0]).toHaveStyle({
      strokeDasharray: '90 207',
      strokeDashoffset: '-134',
    });
    expect(screen.getByRole('img').childNodes[1]).toHaveStyle({
      strokeDasharray: '1 60',
      strokeDashoffset: '-30',
    });
    expect(screen.getByRole('img').childNodes[2]).toHaveStyle({
      strokeDasharray: '90 207',
      strokeDashoffset: '-134',
    });
  });
});
