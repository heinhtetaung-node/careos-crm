import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Price from '../Price';

describe('<Price />', () => {
  test('render correctly', () => {
    render(<Price value={2000} />);
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });
  test('render for normal variant', () => {
    render(<Price value={2000} variant="normal" />);
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });
  test('render for oldPrice variant', () => {
    render(<Price value={2000} variant="oldPrice" />);
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });
  test('render for newPrice variant', () => {
    render(<Price value={2000} variant="newPrice" />);
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });
});
