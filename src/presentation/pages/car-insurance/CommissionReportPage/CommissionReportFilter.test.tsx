import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import CommissionReportFilter from './CommissionReportFilter';

import CommissionReportPage from '.';

describe('<CommissionReportPage/>', () => {
  it('<CommissionReportPage/> should render <CommissionReportFilter/>', () => {
    render(<CommissionReportPage />);
    expect(screen.getByTestId('commission-filter')).toBeInTheDocument();
  });
});

describe('<CommissionReportFilter/>', () => {
  beforeEach(() => {
    render(<CommissionReportFilter />);
  });

  it('should show agent list', async () => {
    const combobox = screen.getAllByRole('combobox');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selectField = combobox[combobox.length - 1].querySelector('input')!;

    userEvent.click(selectField);
    const menu = await screen.findByRole('presentation');
    const option = within(menu).getByText('Agent 1'); // refactor with actual Agent Name when actual implementation start
    expect(option).toBeInTheDocument();
  });

  it('should show date picker', () => {
    const dateField = screen.getByPlaceholderText('text.datePickerPlaceholder');

    userEvent.click(dateField);
    expect(screen.getByText('text.datePresets')).toBeInTheDocument();
  });
});
