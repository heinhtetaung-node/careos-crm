import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import ToggleSwitch from 'common/ToggleSwitch';

describe('Toggle Switch Button', () => {
  it('should render correctly', () => {
    render(<ToggleSwitch label="demo toggle button" />);
    expect(screen.getByTestId('toggle-switch-btn')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-btn-label').innerHTML).toBe(
      'demo toggle button'
    );
  });
});
