import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import RedemptionCard from '../RedemptionCard';

describe('RedemptionCard', () => {
  it('should render RedemptionCard', () => {
    render(
      <RedemptionCard
        partnerName="Test Partner"
        discount="10%"
        code="TESTCODE"
        copyButtonText="Copy"
      />
    );
    expect(screen.getByText('Test Partner')).toBeInTheDocument();
    expect(screen.getByText('TESTCODE')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
  it('should copy code to clipboard', () => {
    const { navigator } = window;
    Object.defineProperty(window, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn(),
        },
      },
      writable: true,
    });
    render(
      <RedemptionCard
        partnerName="Test Partner"
        discount="10%"
        code="TESTCODE"
      />
    );
    const copyButton = screen.getByText('Copy Code');
    copyButton.click();
    Object.defineProperty(window, 'navigator', navigator);
    waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    );
  });
});
