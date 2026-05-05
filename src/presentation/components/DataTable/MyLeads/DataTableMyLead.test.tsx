import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import MockColumns from './mock-data/columns.json';
import OriginalData from './mock-data/originalData.json';

import { DataTableMyLead } from '.';

describe('DataTableMyLead Component', () => {
  const user = userEvent.setup();

  test('renders component correctly', () => {
    render(
      <BrowserRouter>
        <DataTableMyLead
          columns={MockColumns}
          originalData={OriginalData}
          perPage={15}
          isLoading={false}
          sortTable={jest.fn()}
          handleDisableBtn={jest.fn()}
          starButtonAction={jest.fn()}
          updateSingleImportant={jest.fn()}
          rows={OriginalData}
          setRows={jest.fn()}
        />
      </BrowserRouter>
    );
    expect(screen.getByTestId('myLeads-dataTable')).toBeTruthy();
  });

  test('should call sort function when clicked on table header with sort enabled', async () => {
    const mockSortTable = jest.fn();
    render(
      <BrowserRouter>
        <DataTableMyLead
          columns={MockColumns}
          originalData={OriginalData}
          perPage={15}
          isLoading={false}
          sortTable={mockSortTable}
          handleDisableBtn={jest.fn()}
          starButtonAction={jest.fn()}
          updateSingleImportant={jest.fn()}
          rows={OriginalData}
          setRows={jest.fn()}
        />
      </BrowserRouter>
    );

    const sortBtn = screen.getByTestId('table-head-leadId');
    expect(sortBtn).toBeInTheDocument();
    await user.click(sortBtn);

    await userEvent.click(sortBtn as HTMLElement);
    expect(mockSortTable).toHaveBeenNthCalledWith(1, 'leadId');
  });

  test('should call updateSingleImport function with correct params', async () => {
    const mockUpdateSingleImportant = jest.fn();
    render(
      <BrowserRouter>
        <DataTableMyLead
          columns={MockColumns}
          originalData={OriginalData[0]}
          perPage={15}
          isLoading={false}
          sortTable={jest.fn()}
          handleDisableBtn={jest.fn()}
          starButtonAction={jest.fn()}
          updateSingleImportant={mockUpdateSingleImportant}
          rows={OriginalData}
          setRows={jest.fn()}
        />
      </BrowserRouter>
    );

    const tableBody = screen.getByTestId('myLead-table-body');
    await waitFor(() => {
      expect(tableBody).toBeInTheDocument();

      const firstRow = screen.getAllByTestId('myLead-table-row')[0];
      expect(firstRow).toBeInTheDocument();

      const starBtn = within(firstRow).getByTestId(
        `lead-star-${OriginalData[0].leadId}`
      );
      expect(starBtn).toBeInTheDocument();
    });

    await user.click(
      screen.getByTestId(`lead-star-unimportant-${OriginalData[0].leadId}`)
    );
    expect(mockUpdateSingleImportant).toHaveBeenNthCalledWith(1, {
      humanIds: [
        {
          humanId: `${OriginalData[0].leadId}`,
          id: `${OriginalData[0].fullLeadId}`,
        },
      ],
      ids: [`${OriginalData[0].fullLeadId}`],
      important: true,
    });
  });
});
