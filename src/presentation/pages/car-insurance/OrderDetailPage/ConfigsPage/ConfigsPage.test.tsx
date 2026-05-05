/* eslint-disable jsx-a11y/control-has-associated-label */
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import { formatFilterURI } from './helper';

import ConfigsPage from '.';

jest.mock(
  'presentation/components/FilterPanel',
  () =>
    function FilterPanel({
      onSubmit,
      onReset,
    }: {
      onSubmit: (id: any) => void;
      onReset: () => void;
    }) {
      let isInput = false;
      return (
        <>
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) isInput = true;
              else isInput = false;
            }}
            id="btn-check"
          />
          <button
            type="button"
            disabled={isInput}
            onClick={() =>
              onSubmit({
                status: '',
                effectiveDate: null,
                group: null,
                name: null,
              })
            }
            id="btn-submit"
          >
            Submit
          </button>
          <button
            type="button"
            disabled={isInput}
            onClick={() => onReset()}
            id="btn-reset"
          >
            Reset
          </button>
        </>
      );
    }
);

jest.mock(
  'presentation/hooks/useTableList',
  () =>
    function useTableList(
      tableType: any,
      columns: any,
      initialSearchCondition: any,
      mainFunction: any,
      selected: string,
      handleSelect: (id: string) => void
    ) {
      function PaginationComponent() {
        return <div id="mock-pagination">Pages</div>;
      }

      function TableComponent() {
        return (
          <table id="mock-table">
            <tbody>
              <tr>
                <td>
                  <input
                    id="mock-checkbox"
                    type="checkbox"
                    onChange={() => handleSelect('orders/test-123')}
                  />
                </td>
                <td>
                  <span id="mock-type">leadTypeFilter.renewal</span>
                </td>
                <td>
                  <span>Testing</span>
                </td>
              </tr>
            </tbody>
          </table>
        );
      }

      return { TopComponent: PaginationComponent, TableComponent };
    }
);

jest.mock(
  './deleteConfigModal',
  () =>
    function DeleteConfigModal({ onClose }: any) {
      return (
        <div data-testid="delete-config-modal">
          <button id="confirm-btn" onClick={() => onClose()} type="button">
            Confirm
          </button>
        </div>
      );
    }
);

describe('<ConfigsPage />', () => {
  it('render <ConfigsPage />', () => {
    render(<ConfigsPage />);
    expect(screen.getByTestId('order-configs-page')).toBeInTheDocument();
  });
  it('should filter data on applying filters', async () => {
    render(<ConfigsPage />);
    const groupBtn = document.getElementById('btn-check');
    const submitBtn = document.getElementById('btn-submit');
    expect(groupBtn).toBeInTheDocument();
    await userEvent.click(groupBtn as HTMLElement);
    expect(submitBtn).toBeEnabled();
    await userEvent.click(submitBtn as HTMLElement);
  });
  it('should reset filter', async () => {
    render(<ConfigsPage />);
    const groupBtn = document.getElementById('btn-check');
    const resetBtn = document.getElementById('btn-reset');
    expect(resetBtn).toBeInTheDocument();
    await userEvent.click(groupBtn as HTMLElement);
    expect(resetBtn).toBeEnabled();
    await userEvent.click(resetBtn as HTMLElement);
  });
  it('should popup createConfig modal and close modal', async () => {
    render(<ConfigsPage />);
    const createCOnfigBtn = document.getElementById('create-config-btn');
    await userEvent.click(createCOnfigBtn as HTMLElement);
    const modalElem = screen.getByTestId('create-config-modal');
    expect(modalElem).toBeInTheDocument();
    const closeBtn = document.getElementById('create-config-close');
    await userEvent.click(closeBtn as HTMLElement);
    waitFor(() => {
      expect(modalElem).not.toBeInTheDocument();
    });
  });
  it('should popup delete modal', async () => {
    server.use(
      http.delete(
        getApiEndpoint(`/api/autoassign/v1alpha1/orderConfigs/test-123`),
        () => HttpResponse.json({})
      )
    );
    render(<ConfigsPage />);
    const checkboxElem = document.getElementById('mock-checkbox');
    await userEvent.click(checkboxElem as HTMLElement);
    const deleteBtn = document.getElementById('delete-btn');
    expect(deleteBtn).toBeEnabled();
    await userEvent.click(deleteBtn as HTMLElement);
    const modalElem = screen.getByTestId('delete-config-modal');
    expect(modalElem).toBeInTheDocument();
    const confirmBtn = document.getElementById('confirm-btn');
    await userEvent.click(confirmBtn as HTMLElement);
  });
  it('should popup status modal', async () => {
    server.use(
      http.patch(
        getApiEndpoint(`/api/autoassign/v1alpha1/orderConfigs/test-123`),
        () => HttpResponse.json({})
      )
    );

    render(<ConfigsPage />);
    const checkboxElem = document.getElementById('mock-checkbox');
    await userEvent.click(checkboxElem as HTMLElement);
    const statusBtn = document.getElementById('status-btn');
    expect(statusBtn).toBeEnabled();
    await userEvent.click(statusBtn as HTMLElement);
    const modalElem = screen.getByTestId('config-status-modal');
    expect(modalElem).toBeInTheDocument();
    const optionBtn = document.getElementById(
      'mui-component-select-config-status'
    );
    await userEvent.click(optionBtn as HTMLElement);
    const absentOptn = screen.getAllByRole('option')[1];
    await userEvent.click(absentOptn);
    const confirmBtn = screen.getByText('text.confirmChange');
    await userEvent.click(confirmBtn);
    waitFor(() => {
      expect(modalElem).not.toBeInTheDocument();
    });
  });
});

describe('Testing helpers', () => {
  const payload = {
    status: '2',
    group: [
      {
        id: 0,
        title: 'QC: CI',
        value: 'QC_CASH_INSTALLMENT',
      },
    ],
    name: [
      {
        name: 'users/e61100ef-e4f1-4f50-b1e6-db5d3ae4296a',
      },
    ],
    effectiveDate: new Date('2023-04-11T09:58:00.000Z'),
  };

  expect(formatFilterURI(payload)).toBe(
    'config.absent=false config.effectiveDate="2023-04-11"config.group in ("QC_CASH_INSTALLMENT") user.name in ("undefined")'
  );
});
