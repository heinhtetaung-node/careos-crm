import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SortableHeader from './SortableHeader';

describe('SortableHeader', () => {
  const mockOnSort = jest.fn();

  beforeEach(() => {
    mockOnSort.mockClear();
  });

  it('renders the label', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="other"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Price');
  });

  it('calls onSort with sortKey when clicked', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="other"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSort).toHaveBeenCalledWith('price');
  });

  it('does not show the chevron icon when not active', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="other"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.queryByTestId('chevron-icon')).not.toBeInTheDocument();
  });

  it('shows the chevron icon when active', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('applies -rotate-180 class when active and direction is asc', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByTestId('chevron-icon')).toHaveClass('-rotate-180');
  });

  it('does not apply -rotate-180 class when active and direction is desc', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="desc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByTestId('chevron-icon')).not.toHaveClass('-rotate-180');
  });

  it('sets aria-label to "Sort by {label}" when not active', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="other"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Sort by Price'
    );
  });

  it('sets aria-label with ascending direction when active and direction is asc', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Sort by Price, ascending'
    );
  });

  it('sets aria-label with descending direction when active and direction is desc', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="desc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Sort by Price, descending'
    );
  });

  it('does not set aria-sort when active (direction in aria-label only)', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-sort');
  });

  it('does not set aria-sort when active and direction is desc', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="price"
        direction="desc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-sort');
  });

  it('does not set aria-sort when not active', () => {
    render(
      <SortableHeader
        label="Price"
        sortKey="price"
        currentSort="other"
        direction="asc"
        onSort={mockOnSort}
      />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-sort');
  });
});
