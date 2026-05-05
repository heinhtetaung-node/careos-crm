import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';

import { FakeRowsSource, FakeRowsSortSource } from 'mock-data/TableData.mock';
import { store } from 'presentation/redux/store';
import themes from 'presentation/theme';
import getApiEndpoint from 'utils/endpointHelper';

import Switch from '../controls/Switch';

import DataTable from '.';

export interface Column {
  id:
    | 'type'
    | 'source'
    | 'medium'
    | 'campaign'
    | 'product'
    | 'leadCount'
    | 'score'
    | 'hide'
    | 'createdBy'
    | 'createdOn'
    | 'updatedOn';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const mockClickFn = jest.fn();
export const columns: Column[] = [
  { id: 'type', label: 'Type', minWidth: 100 },
  { id: 'source', label: 'Source', minWidth: 100 },
  {
    id: 'medium',
    label: 'Medium',
    minWidth: 100,
  },
  {
    id: 'campaign',
    label: 'Campaign',
    minWidth: 100,
  },
  {
    id: 'product',
    label: 'text.product',
    minWidth: 100,
  },
  { id: 'leadCount', label: 'text.leadCount', minWidth: 100 },
  { id: 'score', label: 'text.score', minWidth: 100 },
  { id: 'hide', label: 'text.hide', minWidth: 100 },
  { id: 'createdBy', label: 'text.createBy', minWidth: 100 },
  { id: 'createdOn', label: 'text.createOn', minWidth: 100 },
  { id: 'updatedOn', label: 'text.updatedOn', minWidth: 100 },
];

const mockColumns = [
  ...columns,
  { id: 'file', label: 'text.file', minWidth: 100, onClick: mockClickFn },
  { id: 'status', label: 'text.status', minWidth: 100 },
];

const mockTrue = true;

describe('Testing DataTable.tsx', () => {
  test('renders DataTable successfully', () => {
    const { getByTestId } = render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            openEditModal={() => null}
            disabledEdit={false}
          />
        </MuiThemeProvider>
      </Provider>
    );
    expect(getByTestId('data-table')).toBeTruthy();
  });
  test('renders DataTable with custom element in it', async () => {
    const mockHandleChange = jest.fn();
    const mockStatus = jest.fn();

    const { getByTestId } = render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={mockColumns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            openEditModal={() => null}
            sortTable={jest.fn()}
            ActionCellElements={() => <Switch onChange={mockHandleChange} />}
            handleFailedPackageClick={mockStatus}
          />
        </MuiThemeProvider>
      </Provider>
    );
    expect(getByTestId('data-table')).toBeTruthy();
    const toggleBtn = screen.getAllByRole('checkbox');
    await userEvent.click(toggleBtn[toggleBtn.length - 1]);
    expect(mockHandleChange).toHaveBeenCalled();
    expect(document.getElementById('data-file-icon')).toBeInTheDocument();

    const statusBtn = screen.getAllByRole('presentation')[2];
    expect(statusBtn).toBeInTheDocument();
    await userEvent.click(statusBtn);

    const fileElem = document.getElementById('data-file-icon');
    expect(fileElem).toBeInTheDocument();

    await userEvent.click(fileElem as HTMLElement);
    expect(mockClickFn).toHaveBeenCalled();
  });
  test('should call sort function and download button', async () => {
    const mockSortTable = jest.fn();
    const mockDownload = jest.fn();
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            openEditModal={() => null}
            disabledEdit={false}
            sortTable={mockSortTable}
            isDownloadable={mockTrue}
            isDisabled={false}
            customAction={mockDownload}
          />
        </MuiThemeProvider>
      </Provider>
    );

    const sortBtn = document.getElementById('data-sort-btn');
    const downloadBtn = document.getElementById('data-download-btn');

    await userEvent.click(sortBtn as HTMLElement);
    expect(mockSortTable).toHaveBeenCalled();

    await userEvent.click(downloadBtn as HTMLElement);
    expect(mockDownload).toHaveBeenCalled();
  });
  test('should render selective cell and handle select', async () => {
    const mockHandleSelect = jest.fn();
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            openEditModal={() => null}
            disabledEdit={false}
            isDownloadable={false}
            isDisabled={false}
            isSelectable={mockTrue}
            handleSelect={mockHandleSelect}
            selected=""
          />
        </MuiThemeProvider>
      </Provider>
    );

    const checkboxItem = document.getElementById('data-checkbox');
    expect(checkboxItem).toBeInTheDocument();

    await userEvent.click(checkboxItem as HTMLElement);
    expect(mockHandleSelect).toHaveBeenCalled();
  });
  test('should render edit cell and handle edit', async () => {
    const mockEditHandle = jest.fn();
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            openEditModal={mockEditHandle}
            disabledEdit={false}
            isDownloadable={false}
            isDisabled={false}
            isSelectable={false}
          />
        </MuiThemeProvider>
      </Provider>
    );

    const editItem = document.getElementById('data-edit-btn');
    expect(editItem).toBeInTheDocument();

    await userEvent.click(editItem as HTMLElement);
    expect(mockEditHandle).toHaveBeenCalled();
  });
  test('should render redirect cell and handle redirect', async () => {
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={[
              ...columns,
              { id: 'leadId', label: 'text.leadId', minWidth: 100 },
            ]}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            disabledEdit
            isDownloadable={false}
            isDisabled={false}
            isSelectable={false}
            isRedirectable
          />
        </MuiThemeProvider>
      </Provider>
    );

    const redirectItem = document.getElementById('data-redirect-icon');
    expect(redirectItem).toBeInTheDocument();

    await userEvent.click(redirectItem as HTMLElement);
    expect(redirectItem).toHaveAttribute('href', getApiEndpoint('lead/123123'));
  });
  test('should render skeleton for no data', () => {
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={[]}
            sortData={FakeRowsSortSource}
            disabledEdit={false}
            isDownloadable={false}
            isDisabled={false}
            isSelectable={false}
            isLoading={false}
          />
        </MuiThemeProvider>
      </Provider>
    );
    const skeletonElem = document.getElementById('data-no-data');
    expect(skeletonElem).toBeInTheDocument();
  });
  test('should render row with redirect icon', () => {
    render(
      <Provider store={store as any}>
        <MuiThemeProvider theme={themes[0]}>
          <DataTable
            columns={columns}
            originalData={FakeRowsSource}
            sortData={FakeRowsSortSource}
            disabledEdit={false}
            ActionCellElements={false}
            isRedirectable
          />
        </MuiThemeProvider>
      </Provider>
    );
    const redirectIcon = document.getElementById('data-redirect');
    expect(redirectIcon).toBeInTheDocument();
  });
});
