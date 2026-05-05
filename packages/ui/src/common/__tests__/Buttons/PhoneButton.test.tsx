import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import PhoneButton from '../../Buttons/PhoneButton';

describe('PhoneButton component', () => {
  const number = '1438';
  const text = 'image';

  it('should render with the correct props', () => {
    render(<PhoneButton number={number} subText={text} />);

    expect(screen.getByText(number)).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('link'));
    expect(screen.getByRole('link')).toHaveAttribute('href', `tel:${number}`);
  });

  it('should override conflicting classnames', () => {
    render(<PhoneButton number={number} className="bg-secondary" />);

    expect(screen.getByText(number)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveClass('bg-secondary border-primary');
    expect(screen.getByRole('link')).not.toHaveClass('bg-primary');
  });
});
