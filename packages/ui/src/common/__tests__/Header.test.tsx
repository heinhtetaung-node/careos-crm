import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header component', () => {
  const divWithTestId = (testId: string) => <div data-testid={testId} />;

  it('should render all the passed props', () => {
    render(
      <Header
        icon={divWithTestId('icon')}
        label="label"
        menuButton={divWithTestId('menuButton')}
        phoneButton={divWithTestId('phoneButton')}
        contactButtons={[divWithTestId('contactButton')]}
        customerPortalButton={divWithTestId('customerPortalButton')}
        localeButtons={[divWithTestId('localeButton')]}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('label')).toBeInTheDocument();
    expect(screen.getByTestId('menuButton')).toBeInTheDocument();
    expect(screen.getByTestId('phoneButton')).toBeInTheDocument();
    expect(screen.getByTestId('contactButton')).toBeInTheDocument();
    expect(screen.getByTestId('customerPortalButton')).toBeInTheDocument();
    expect(screen.getByTestId('localeButton')).toBeInTheDocument();
  });
});
