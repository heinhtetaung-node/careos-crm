import React from 'react';
import { render, screen } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  it('renders nothing when duration is 0', () => {
    const { container } = render(<Counter duration={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders counter when duration is greater than 0', () => {
    render(<Counter duration={1} />);
    expect(screen.getByTestId('call-duration-counter')).toBeInTheDocument();
  });

  it('displays time correctly for seconds', () => {
    render(<Counter duration={5} />);
    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('formats time correctly for minutes', () => {
    render(<Counter duration={65} />);
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  it('formats time correctly for hours', () => {
    render(<Counter duration={3665} />); // 1 hour, 1 minute, 5 seconds
    expect(screen.getByText('1:01:05')).toBeInTheDocument();
  });

  it('updates when duration changes', () => {
    const { rerender } = render(<Counter duration={5} />);
    expect(screen.getByText('00:05')).toBeInTheDocument();

    rerender(<Counter duration={10} />);
    expect(screen.getByText('00:10')).toBeInTheDocument();
  });

  it('hides when duration is reset to 0', () => {
    const { rerender, container } = render(<Counter duration={5} />);
    expect(screen.getByText('00:05')).toBeInTheDocument();

    rerender(<Counter duration={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className when provided', () => {
    render(<Counter duration={1} className="custom-class" />);
    const counter = screen.getByTestId('call-duration-counter');
    expect(counter).toHaveClass('custom-class');
  });

  it('formats single digit seconds correctly', () => {
    render(<Counter duration={9} />);
    expect(screen.getByText('00:09')).toBeInTheDocument();
  });

  it('formats single digit minutes correctly', () => {
    render(<Counter duration={125} />); // 2 minutes, 5 seconds
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('formats exactly 1 hour correctly', () => {
    render(<Counter duration={3600} />); // 1 hour, 0 minutes, 0 seconds
    expect(screen.getByText('1:00:00')).toBeInTheDocument();
  });

  it('formats exactly 1 minute correctly', () => {
    render(<Counter duration={60} />); // 1 minute, 0 seconds
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('formats 59 minutes 59 seconds correctly', () => {
    render(<Counter duration={3599} />); // 59 minutes, 59 seconds
    expect(screen.getByText('59:59')).toBeInTheDocument();
  });

  it('formats multiple hours correctly', () => {
    render(<Counter duration={9045} />); // 2 hours, 30 minutes, 45 seconds
    expect(screen.getByText('2:30:45')).toBeInTheDocument();
  });

  it('formats 10 hours correctly', () => {
    render(<Counter duration={36000} />); // 10 hours, 0 minutes, 0 seconds
    expect(screen.getByText('10:00:00')).toBeInTheDocument();
  });

  it('formats 24 hours correctly', () => {
    render(<Counter duration={86400} />); // 24 hours, 0 minutes, 0 seconds
    expect(screen.getByText('24:00:00')).toBeInTheDocument();
  });

  it('formats hours with single digit minutes correctly', () => {
    render(<Counter duration={3665} />); // 1 hour, 1 minute, 5 seconds
    expect(screen.getByText('1:01:05')).toBeInTheDocument();
  });

  it('formats hours with zero minutes correctly', () => {
    render(<Counter duration={3605} />); // 1 hour, 0 minutes, 5 seconds
    expect(screen.getByText('1:00:05')).toBeInTheDocument();
  });

  it('formats hours with zero seconds correctly', () => {
    render(<Counter duration={3660} />); // 1 hour, 1 minute, 0 seconds
    expect(screen.getByText('1:01:00')).toBeInTheDocument();
  });

  it('formats 1 second correctly', () => {
    render(<Counter duration={1} />);
    expect(screen.getByText('00:01')).toBeInTheDocument();
  });

  it('formats 59 seconds correctly', () => {
    render(<Counter duration={59} />);
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('formats 60 seconds (1 minute) correctly', () => {
    render(<Counter duration={60} />);
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('formats 99 hours correctly', () => {
    render(<Counter duration={356400} />); // 99 hours, 0 minutes, 0 seconds
    expect(screen.getByText('99:00:00')).toBeInTheDocument();
  });

  it('includes correct dateTime attribute', () => {
    render(<Counter duration={125} />);
    const timeElement = screen.getByText('02:05');
    expect(timeElement).toHaveAttribute('dateTime', 'P125S');
  });

  it('includes correct dateTime attribute for hours', () => {
    render(<Counter duration={3665} />);
    const timeElement = screen.getByText('1:01:05');
    expect(timeElement).toHaveAttribute('dateTime', 'P3665S');
  });

  it('handles empty className string', () => {
    render(<Counter duration={1} className="" />);
    const counter = screen.getByTestId('call-duration-counter');
    expect(counter.className).toBe('');
  });

  it('handles undefined className (default)', () => {
    render(<Counter duration={1} />);
    const counter = screen.getByTestId('call-duration-counter');
    expect(counter.className).toBe('');
  });

  it('handles multiple className values', () => {
    render(<Counter duration={1} className="class1 class2 class3" />);
    const counter = screen.getByTestId('call-duration-counter');
    expect(counter).toHaveClass('class1');
    expect(counter).toHaveClass('class2');
    expect(counter).toHaveClass('class3');
  });

  it('formats edge case: exactly 1 hour 1 minute 1 second', () => {
    render(<Counter duration={3661} />);
    expect(screen.getByText('1:01:01')).toBeInTheDocument();
  });

  it('formats edge case: 23 hours 59 minutes 59 seconds', () => {
    render(<Counter duration={86399} />);
    expect(screen.getByText('23:59:59')).toBeInTheDocument();
  });

  it('formats edge case: 100 hours', () => {
    render(<Counter duration={360000} />);
    expect(screen.getByText('100:00:00')).toBeInTheDocument();
  });
});
