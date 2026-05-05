import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import { constructConfig } from './interface';

import SectionRenderer from '.';

function MockItem({ name }: any) {
  return <span data-testid={`input-comp-${name}`}>Input</span>;
}

function MockCustomRow({ children, title }: any) {
  return (
    <span data-testid="mock-custom-row">
      <span>{title}</span>
      {children}
    </span>
  );
}

function MockRow({ children, title }: any) {
  return (
    <span data-testid="mock-row">
      <span>{title}</span>
      {children}
    </span>
  );
}

const mockSchema = {
  firstRow: constructConfig(MockItem, { title: 'mock title 1', name: 'row1' }),
  secondRow: constructConfig(
    MockItem,
    { title: 'mock title 2', name: 'row2' },
    MockCustomRow
  ),
};
const mockConfig = { title: 'Mock section title', Row: MockRow };

describe('SectionRenderer', () => {
  it('should render all elements', () => {
    render(<SectionRenderer config={mockConfig} dataSchema={mockSchema} />);
    expect(screen.getByText('Mock section title')).toBeInTheDocument();
    expect(screen.getByText('mock title 1')).toBeInTheDocument();
    expect(screen.getByText('mock title 2')).toBeInTheDocument();
  });
  it('should use default Row conponent if row is not specified in dataschema', () => {
    render(<SectionRenderer config={mockConfig} dataSchema={mockSchema} />);
    const row1 = within(screen.getByTestId('mock-row'));
    expect(row1.getByTestId('input-comp-row1')).toBeInTheDocument();
  });
  it('should use custom Row conponent if row is specified in dataschema', () => {
    render(<SectionRenderer config={mockConfig} dataSchema={mockSchema} />);
    const row2 = within(screen.getByTestId('mock-custom-row'));
    expect(row2.getByTestId('input-comp-row2')).toBeInTheDocument();
  });
});
