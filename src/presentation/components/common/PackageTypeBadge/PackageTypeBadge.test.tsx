import { render, screen } from '@testing-library/react';
import React from 'react';

import PackageTypeBadge from '.';

describe('PackageTypeBadge', () => {
  it('returns null when label is undefined', () => {
    const { container } = render(<PackageTypeBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when label is null', () => {
    const { container } = render(<PackageTypeBadge label={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when label is empty string', () => {
    const { container } = render(<PackageTypeBadge label="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the label text when label is provided', () => {
    render(<PackageTypeBadge label="Basic" />);
    expect(screen.getByText('Basic')).toBeInTheDocument();
  });

  it('applies premium style when label is "premium"', () => {
    render(<PackageTypeBadge label="premium" />);
    const badge = screen.getByText('premium');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-800');
  });

  it('applies premium style when label is "Premium" (case insensitive)', () => {
    render(<PackageTypeBadge label="Premium" />);
    const badge = screen.getByText('Premium');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-800');
  });

  it('applies basic style when label is "basic"', () => {
    render(<PackageTypeBadge label="basic" />);
    const badge = screen.getByText('basic');
    expect(badge).toHaveClass('bg-slate-200');
    expect(badge).toHaveClass('text-slate-700');
  });

  it('applies recommended style when label is "recommended"', () => {
    render(<PackageTypeBadge label="recommended" />);
    const badge = screen.getByText('recommended');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('applies basic style as fallback for unknown label', () => {
    render(<PackageTypeBadge label="custom-type" />);
    const badge = screen.getByText('custom-type');
    expect(badge).toHaveClass('bg-slate-200');
    expect(badge).toHaveClass('text-slate-700');
  });

  it('renders with base layout classes', () => {
    render(<PackageTypeBadge label="Basic" />);
    const badge = screen.getByText('Basic');
    expect(badge).toHaveClass('ml-2');
    expect(badge).toHaveClass('inline-block');
    expect(badge).toHaveClass('rounded');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});
