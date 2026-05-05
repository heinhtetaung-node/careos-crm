import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { showQuotationHistoryButton } from 'config/feature-flags';

import ActivityModal from '.';

const handleCloseModal = jest.fn();

const initialProps = {
  openDialog: true,
  activeId: 1,
  closeDialog: handleCloseModal,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest
    .fn()
    .mockReturnValue({ environment: 'dev', service: 'fakeService' }),
}));

const buttons = [
  { id: 1, label: 'lead.activity', testId: 'activity-table' },
  { id: 2, label: 'lead.communication', testId: 'communication-table' },
];

if (showQuotationHistoryButton) {
  buttons.push({
    id: 3,
    label: 'lead.quotation',
    testId: 'quotation-history-table',
  });
} else {
  buttons.push(
    { id: 3, label: 'lead.assignment', testId: '' },
    { id: 4, label: 'lead.audit', testId: '' }
  );
}

describe('<ActivityModal Component/>', () => {
  it('will be mounted correctly', () => {
    render(<ActivityModal {...initialProps} />);
  });

  it('should display data of group header button', () => {
    render(<ActivityModal {...initialProps} />);
    buttons.forEach((item: any) => {
      expect(screen.getByRole('button', { name: item.label })).toBeTruthy();
    });
  });

  it('should click to group header button', async () => {
    render(<ActivityModal {...initialProps} />);
    buttons.forEach(async (item: any) => {
      if (item.testId !== '') {
        await user.click(screen.getByRole('button', { name: item.label }));
        expect(await screen.findByTestId(item.testId)).toBeVisible();
      }
    });
  });

  it('should show the Payment History tab when feature flag is on', async () => {
    render(<ActivityModal {...initialProps} />);
    expect(screen.getByTestId('payment-history-tab-btn')).toBeInTheDocument();
  });

  it('should click to button close', async () => {
    render(<ActivityModal {...initialProps} />);
    await user.click(screen.getByTestId('activity__close-btn'));
    expect(handleCloseModal).toHaveBeenCalled();
  });

  afterEach(() => {
    handleCloseModal.mockClear();
  });
});
