import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import AnchorButton from '../../Buttons/AnchorButton';

describe('AnchorButton component', () => {
  it('should render with the correct props', () => {
    const testId = 'anchorButton';
    const icon = <div data-testid="icon" />;
    const children = <div data-testid="children" />;
    render(
      <AnchorButton href="href" rel="rel" dataTestId={testId} icon={icon}>
        {children}
      </AnchorButton>
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toHaveAttribute('rel');
    expect(screen.getByTestId(testId)).toHaveAttribute('href');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });
});
