import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import Input from './Input';

describe('Input', () => {
  test('should render', () => {
    render(<Input dataTestid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });
});
