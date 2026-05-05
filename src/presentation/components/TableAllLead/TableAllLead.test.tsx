import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';

import TableAllLead from './index';

describe('<TableAllLead />', () => {
  it('test render lead table successfully', () => {
    const { getByTestId } = render(
      <TableAllLead tableType={TABLE_LEAD_TYPE.LEAD_REJECTION} />
    );
    expect(getByTestId('lead-table')).toBeTruthy();
  });

  it('test rejection table has all necessary columns', () => {
    const { getAllByTestId } = render(
      <TableAllLead tableType={TABLE_LEAD_TYPE.LEAD_REJECTION} />
    );
    expect(getAllByTestId('table-header-cell').length).toBe(13);
  });

  it('test assignment table has all necessary columns', () => {
    const { getAllByTestId } = render(
      <TableAllLead tableType={TABLE_LEAD_TYPE.LEAD_ASSIGNMENT} />
    );
    expect(getAllByTestId('table-header-cell').length).toBe(28);
  });

  it('test all lead table has all necessary columns', () => {
    const { getAllByTestId } = render(
      <TableAllLead tableType={TABLE_LEAD_TYPE.LEAD_ALL} />
    );
    expect(getAllByTestId('table-header-cell').length).toBe(32);
  });
});
