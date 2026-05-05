import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Rating from '../Rating';

test('should render successful', () => {
  render(<Rating rating={3.33} />);
  expect(screen.getByText('3.33')).toBeInTheDocument();
});
