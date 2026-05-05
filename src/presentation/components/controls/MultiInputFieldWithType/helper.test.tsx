import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { InputActionButtons, InputAsPerType } from './helper';

describe('Testing InputActionButtons', () => {
  it('should render the remove button if inputs are more than 0', () => {
    render(
      <InputActionButtons
        {...{
          index: 0,
          inputs: [
            { id: 'number', key: 0, value: '' },
            { id: 'text', key: 1, value: '' },
          ],
          shouldShowAddBtn: false,
          handleAddInputs: jest.fn(),
          handleRemoveInputs: jest.fn(),
        }}
      />
    );

    expect(screen.queryByTestId('add-input-btn')).not.toBeInTheDocument();
    expect(screen.getByTestId('remove-input-btn')).toBeInTheDocument();
  });
  it('should render the add button if shouldShowAdButton is true', () => {
    render(
      <InputActionButtons
        {...{
          index: 0,
          inputs: [],
          shouldShowAddBtn: true,
          handleAddInputs: jest.fn(),
          handleRemoveInputs: jest.fn(),
        }}
      />
    );

    expect(screen.getByTestId('add-input-btn')).toBeInTheDocument();
    expect(screen.queryByTestId('remove-input-btn')).not.toBeInTheDocument();
  });
});

describe('Testing InputAsPerType', () => {
  it('should render Input as per type', () => {
    render(<InputAsPerType type="number" dataTestId="number-input" />);

    const input = screen.getByTestId('number-input');
    expect(input).toBeInTheDocument();
  });

  it('should render Input as per type', () => {
    render(<InputAsPerType type="text" dataTestId="text-input" />);
    const input = screen.getByTestId('text-input');
    expect(input).toBeInTheDocument();
    if (input?.firstElementChild) {
      expect(input.firstElementChild.getAttribute('type')).toBe('text');
    }
  });
});
