import React from 'react';
import { render, screen } from '__tests__/rtl-test-utils';
import MinMaxNumber from './MinMaxNumber';

describe('MinMaxNumber', () => {
  it('renders without crashing', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: 1000,
        max: 5000,
        highlighted: 3000,
      })
    );
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays min, max, and highlighted values correctly', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: 1000,
        max: 5000,
        highlighted: 3000,
      })
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('formats large numbers with commas correctly', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: 1000000,
        max: 5000000,
        highlighted: 3000000,
      })
    );

    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('30,000')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    render(
      React.createElement(MinMaxNumber, { min: 0, max: 1000, highlighted: 500 })
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles decimal values correctly', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: 100.5,
        max: 500.75,
        highlighted: 300.25,
      })
    );

    expect(screen.getByText('1.005')).toBeInTheDocument();
    expect(screen.getByText('3.003')).toBeInTheDocument();
    expect(screen.getByText('5.008')).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    const { container } = render(
      React.createElement(MinMaxNumber, {
        min: 1000,
        max: 5000,
        highlighted: 3000,
      })
    );

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass(
      'flex',
      'flex-row',
      'items-center',
      'h-8',
      'w-full',
      'justify-evenly'
    );

    const minSpan = screen.getByText('10');
    expect(minSpan).toHaveClass(
      'text-primaryColor',
      'text-opacity-50',
      'text-[.6rem]',
      'self-end'
    );

    const highlightedSpan = screen.getByText('30');
    expect(highlightedSpan).toHaveClass(
      'text-primaryColor',
      'text-xs',
      'font-medium',
      'self-center',
      'items-center',
      'justify-center'
    );

    const maxSpan = screen.getByText('50');
    expect(maxSpan).toHaveClass(
      'text-primaryColor',
      'text-opacity-50',
      'text-[.6rem]',
      'self-end'
    );
  });

  it('displays values in correct order: min, highlighted, max', () => {
    const { container } = render(
      React.createElement(MinMaxNumber, {
        min: 1000,
        max: 5000,
        highlighted: 3000,
      })
    );

    const mainContainer = container.firstChild;
    const spans = mainContainer.children;

    expect(spans).toHaveLength(3);
    expect(spans[0]).toHaveTextContent('10'); // min
    expect(spans[1]).toHaveTextContent('30'); // highlighted
    expect(spans[2]).toHaveTextContent('50'); // max
  });

  it('handles negative values correctly', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: -1000,
        max: 1000,
        highlighted: 1, // Use non-zero value to trigger highlighted mode
      })
    );

    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles same values for min, max, and highlighted', () => {
    render(
      React.createElement(MinMaxNumber, {
        min: 1000,
        max: 1000,
        highlighted: 1000,
      })
    );

    expect(screen.getAllByText('10')).toHaveLength(3);
  });
});
