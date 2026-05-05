import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '../Badge';

test('should render for primary variant', () => {
  render(
    <Badge badge="badge" variant="primary">
      Hello
    </Badge>
  );
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.getByText('badge')).toBeInTheDocument();
});

test('should render for warning variant', () => {
  render(
    <Badge badge="badge" variant="warning">
      Hello
    </Badge>
  );
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.getByText('badge')).toBeInTheDocument();
});
