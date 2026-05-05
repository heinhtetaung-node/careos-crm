import React from 'react';
import { render, screen } from '@testing-library/react';

import { ArrowDownIcon } from '@alphafounders/icons';
import Input from '../Input';

describe('Testing Input Component', () => {
  it('should render the component', () => {
    render(
      <Input
        dataTestId="input-test-id"
        onChange={jest.fn()}
        onBlur={jest.fn()}
        onFocus={jest.fn()}
      />
    );

    expect(screen.getByTestId('input-test-id')).toBeTruthy();
  });
  it('should render the error message', () => {
    render(
      <Input
        error="its an error"
        onChange={jest.fn()}
        onBlur={jest.fn()}
        onFocus={jest.fn()}
      />
    );

    expect(screen.getByTestId('validation-element').textContent).toBe(
      'its an error'
    );
    expect(screen.getByTestId('validation-element').classList).toContain(
      'text-red-600'
    );
  });
  it('should render the success message', () => {
    render(
      <Input
        success="its a success"
        onChange={jest.fn()}
        onBlur={jest.fn()}
        onFocus={jest.fn()}
      />
    );

    expect(screen.getByTestId('validation-element').textContent).toBe(
      'its a success'
    );
    expect(screen.getByTestId('validation-element').classList).toContain(
      'text-green-600'
    );
  });
  it('should render the adornment', () => {
    render(
      <Input
        adornment={<ArrowDownIcon />}
        onChange={jest.fn()}
        onBlur={jest.fn()}
        onFocus={jest.fn()}
      />
    );

    expect(
      screen.getByTestId('adornment-element').firstElementChild?.nodeName
    ).toBe('svg');
  });
});
