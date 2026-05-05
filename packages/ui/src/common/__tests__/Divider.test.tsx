import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Divider from '../Divider';

describe('<Divider />', () => {
  test('render correctly', () => {
    render(<Divider />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('render for solid variant', () => {
    render(<Divider pattern="solid" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('render for dash variant', () => {
    render(<Divider pattern="dash" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('render for horizontal orientation', () => {
    render(<Divider orientation="horizontal" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('render for vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('divider with text', () => {
    render(<Divider text="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  test('divider with color primary', () => {
    render(<Divider variant="primary" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('divider with color gray', () => {
    render(<Divider variant="primary" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
  test('divider with color primary', () => {
    render(<Divider variant="secondary" />);
    expect(screen.getByTestId('careos-divider')).toBeInTheDocument();
  });
});
