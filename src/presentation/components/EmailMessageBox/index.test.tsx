import { render } from '@testing-library/react';
import React from 'react';

import EmailMessageBox from './index';

const mockHandleChange = jest.fn();

describe('Email Message Box', () => {
  it('renders successfully', () => {
    render(<EmailMessageBox value="" handleChange={mockHandleChange} />);
  });
});
