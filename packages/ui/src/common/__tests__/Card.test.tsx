import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import Card from '../Card';

describe('Card component', () => {
  it('should render for primary variant', () => {
    render(
      <Card variant="primary" title="primary">
        Hello
      </Card>
    );
    expect(screen.getByTestId('card-title-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title-header')).toHaveClass(
      'bg-primary text-white'
    );
  });

  it('should render for info variant', () => {
    render(
      <Card variant="info" title="info">
        Hello
      </Card>
    );
    expect(screen.getByTestId('card-title-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title-header')).toHaveClass(
      'bg-success text-white'
    );
  });

  it('should render for secondary variant', () => {
    render(
      <Card variant="secondary" title="secondary">
        Hello
      </Card>
    );
    expect(screen.getByTestId('card-title-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title-header')).toHaveClass(
      'bg-secondary text-white'
    );
  });

  it('should render without any variant', () => {
    render(<Card title="no Var">Hello</Card>);
    expect(screen.getByTestId('card-title-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title-header')).toHaveClass(
      'rounded-t-lg p-3 text-white text-base font-bold'
    );
  });
});
