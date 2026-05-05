import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SmoothMount from '../SmoothMount';

describe('Smooth Mount', () => {
  it('should mount the child components', async () => {
    render(
      <SmoothMount>
        <div>Test Component</div>
      </SmoothMount>
    );
    await waitFor(() =>
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    );
  });
});
