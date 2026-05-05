import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import { dataTableList } from './activityTable.helper';

import ActivityTable from '.';

const dataTable = dataTableList[0];

describe.skip('<ActivityTable Component/>', () => {
  it('will be mounted correctly', () => {
    render(<ActivityTable />);
  });

  it('should display data of name', () => {
    const { container } = render(<ActivityTable />);
    dataTable.data.forEach((item: any) => {
      expect(
        container.querySelector(
          `.unittest-row-${item.sequenceNumber} .unittest-user-name`
        )
      ).toHaveTextContent(item.userName);
    });
  });

  it('should display data of status', () => {
    const { container } = render(<ActivityTable />);
    dataTable.data.forEach((item: any) => {
      expect(
        container.querySelector(
          `.unittest-row-${item.sequenceNumber} .unittest-status`
        )
      ).toHaveTextContent(item.status);
    });
  });

  it('should display data of summary', () => {
    const { container } = render(<ActivityTable />);
    dataTable.data.forEach((item: any) => {
      expect(
        container.querySelector(
          `.unittest-row-${item.sequenceNumber} .unittest-summary`
        )
      ).toHaveTextContent(item.summary);
    });
  });
});
