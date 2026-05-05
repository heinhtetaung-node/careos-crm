import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, cleanup, waitFor } from '__tests__/rtl-test-utils';
import * as featureFlags from 'config/feature-flags';

import ButtonRow from './ButtonRow';

jest.mock(
  'presentation/components/modal/activityModal',
  () =>
    function MockActivityModal() {
      return <div data-testid="activity-modal">Activity Modal Section</div>;
    }
);

jest.mock('config/feature-flags', () => ({
  __esModule: true,
  showQuotationHistoryButton: null,
}));
const mockFeatureFlag = featureFlags as unknown as {
  showQuotationHistoryButton: boolean;
};

describe('ButtonRow Component', () => {
  afterEach(cleanup);

  it('renders correctly when show quotation history is false', () => {
    mockFeatureFlag.showQuotationHistoryButton = false;
    render(<ButtonRow />);
    expect(screen.getByTestId('activity-section-button-row')).toBeTruthy();
    expect(screen.getByTestId('activity-buttons').children.length).toBe(4);
    expect(screen.getByTestId('payment-buttons').children.length).toBe(3);
    expect(
      screen.getByRole('button', { name: 'lead.assignment' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'lead.audit' })).toBeTruthy();
  });

  it('renders correctly when show quotation history is true', () => {
    mockFeatureFlag.showQuotationHistoryButton = true;
    render(<ButtonRow />);
    expect(screen.getByTestId('activity-buttons').children.length).toBe(3);
    expect(
      screen.getByRole('button', { name: 'lead.activity' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.communication' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.quotation' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.paymentHistory' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.approvalHistory' })
    ).not.toBeDisabled();
  });

  it('button are disabled if lead status is purchased', () => {
    mockFeatureFlag.showQuotationHistoryButton = true;
    render(<ButtonRow isPurchased />);
    expect(screen.getByTestId('activity-buttons').children.length).toBe(3);
    expect(screen.getByTestId('payment-buttons').children.length).toBe(3);
    expect(
      screen.getByRole('button', { name: 'lead.activity' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.communication' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.quotation' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.paymentHistory' })
    ).not.toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'lead.approvalHistory' })
    ).not.toBeDisabled();
  });

  it('should show the Payment History button when feature flag is on', async () => {
    render(<ButtonRow />);
    await waitFor(() =>
      expect(screen.getByTestId('payment-history-btn')).toBeInTheDocument()
    );
  });

  it('should open dialog box on onclick', async () => {
    mockFeatureFlag.showQuotationHistoryButton = true;
    render(<ButtonRow />);
    const activityButton = screen.getByRole('button', {
      name: 'lead.approvalHistory',
    });
    expect(activityButton).toBeEnabled();
    await userEvent.click(activityButton);
    expect(screen.getByTestId('activity-modal')).toBeInTheDocument();
  });
});
