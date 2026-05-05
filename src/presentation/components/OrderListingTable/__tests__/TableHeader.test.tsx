import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { columnDocumentsQC } from 'presentation/components/OrderListingTable/helper';

import TableHeader from '../TableHeader';

const mockDocumentColumn = {
  id: 'orderId',
  label: 'leadDetailFields.orderId',
  field: 'order.humanId',
  sorting: 'asc',
  minWidth: '120',
  isNotSorting: true,
};

describe('<TableHeader>', () => {
  test('Table Header Component loads', async () => {
    render(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        handleColumnSort={jest.fn()}
      />
    );
    const container = await screen.findByTestId('table-header');
    expect(container).toBeInTheDocument();
  });

  test('should be render ArrowUpwardIcon', async () => {
    render(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        handleColumnSort={jest.fn()}
      />
    );
    const container = await screen.findByTestId('table-header');
    expect(container).toBeInTheDocument();
    expect(mockDocumentColumn.isNotSorting).not.toEqual(false);
    expect(mockDocumentColumn.sorting).toEqual('asc');
    expect(ArrowUpwardIcon).toBeDefined();
  });

  test('should be render SyncAltIcon', async () => {
    render(<TableHeader isDisableExpand columnSettings={columnDocumentsQC} />);
    const container = await screen.findByTestId('table-header');
    expect(container).toBeInTheDocument();
    expect(mockDocumentColumn.isNotSorting).not.toEqual(false);
    expect(mockDocumentColumn.sorting).not.toEqual('none');
    expect(SyncAltIcon).toBeDefined();
  });

  test('should be call column wise sorting', async () => {
    render(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        handleColumnSort={jest.fn()}
      />
    );
    const container = await screen.findByTestId('table-header');
    expect(container).toBeInTheDocument();
    expect(mockDocumentColumn.isNotSorting).not.toEqual(false);
    const sortableLabel = await screen.findAllByTestId('table-sort-label');
    // sort by order id
    userEvent.click(sortableLabel[0]);
  });
});
