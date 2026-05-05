import { render, screen, within } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import DisplayTable, { GapType } from '../DisplayTable';

const tableConfig = [
  {
    title: 'firstColumn',
    key: 'firstColumn',
    dataIndex: 'fvalue',
    width: 400,
  },
  {
    title: 'middleColumn',
    key: 'middleColumn',
    dataIndex: 'mvalue',
    width: '40%',
  },
  {
    title: 'lastColumn',
    key: 'lastColumn',
    render: (data: { lvalue: string }) => (
      <span className="text-primary" data-testid="custom-cell">
        {data.lvalue}
      </span>
    ),
  },
];

const data = [
  {
    key: 'k',
    fvalue: 'first',
    mvalue: 'middle',
    lvalue: 'last',
  },
  {
    key: 'l',
    fvalue: 'first',
    mvalue: 'middle',
    lvalue: 'last',
  },
];

describe('DisplayTable', () => {
  it('should render header correctly', () => {
    render(
      <DisplayTable
        tableConfig={tableConfig}
        data={data}
        selectedDataKey="k"
        onSelect={jest.fn()}
      />
    );
    const headers = screen.getAllByTestId('display-table-header');
    expect(headers.length).toBe(3);
    expect(headers[0]).toHaveTextContent('firstColumn');
    expect(headers[1]).toHaveTextContent('middleColumn');
    expect(headers[2]).toHaveTextContent('lastColumn');
  });

  it('should render data correctly', () => {
    render(
      <DisplayTable
        tableConfig={tableConfig}
        data={data}
        selectedDataKey="k"
        onSelect={jest.fn()}
      />
    );
    const rows = screen.getAllByTestId('display-table-row');
    const cells = within(rows[0]).getAllByTestId('display-table-cell');
    expect(cells[0]).toHaveTextContent('first');
    expect(cells[1]).toHaveTextContent('middle');
    expect(cells[2]).toHaveTextContent('last');
    const customCell = within(rows[0]).getByTestId('custom-cell');
    expect(customCell).toHaveTextContent('last');
  });

  it('should render radio selection', () => {
    render(
      <DisplayTable
        tableConfig={tableConfig}
        data={data}
        selectedDataKey="k"
        selectionType="radio"
        onSelect={jest.fn()}
        gap
      />
    );
    const rows = screen.getAllByTestId('display-table-row');
    const cells = within(rows[0]).getAllByTestId('display-table-cell');
    const radioSelection = within(cells[0]).getByRole('radio');
    expect(radioSelection).toBeChecked();
  });

  it('should work colspan and gap big / small', () => {
    const tableConfig = [
      {
        title: 'งวดที่',
        key: 'firstColumn',
        dataIndex: 'fvalue',
        width: '25%',
        className: 'p-2.5 text-center',
      },
      {
        title: 'กำหนดชำระ',
        key: 'middleColumn',
        dataIndex: 'mvalue',
        width: '45%',
        className: 'p-2.5 text-center',
      },
      {
        title: 'ยอดชำระ',
        key: 'lastColumn',
        width: '30%',
        className: 'p-2.5 text-center',
      },
    ];

    const data = [
      {
        key: 'l19',
        fvalue: '9',
        mvalue: '1 กันยายน 2556',
        lvalue: '60,000.50',
        className: 'justify-center bg-white text-sm sm:text-base',
      },
      {
        key: 'l10',
        fvalue: '10',
        mvalue: '1 ตุลาคม 2556',
        lvalue: '60,000.50',
        className: 'justify-center bg-white text-sm sm:text-base',
      },
      {
        key: 'l',
        fvalue: 'Total',
        colspan: ['firstColumn', 'middleColumn'],
        lvalue: '240,002.00',
        className: 'justify-left bg-white font-semibold text-sm sm:text-base',
        firstColumn: {
          width: '70.5%',
        },
      },
    ];

    render(
      <DisplayTable
        gap={GapType.small}
        tableConfig={tableConfig}
        data={data}
        selectedDataKey="k"
        onSelect={jest.fn()}
      />
    );
    const headers = screen.getAllByTestId('display-table-header');
    expect(headers.length).toBe(3);
    expect(headers[0]).toHaveTextContent('งวดที่');
    expect(headers[1]).toHaveTextContent('กำหนดชำระ');
    expect(headers[2]).toHaveTextContent('ยอดชำระ');
  });
});
