/* eslint-disable jsx-a11y/control-has-associated-label */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import DiscountApprovalPage from '.';

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

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
                    onChange={() => handleSelect('test')}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    id="data-file-icon"
                    onClick={() =>
                      columns[0].onClick({
                        name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
                        agentName: 'SalesAgentRole -',
                        configId:
                          'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72/renewalPackages/e6cdc351-ea65-4716-afcc-324edca4b035/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
                        description: 'test discount',
                        discount: 'percentage',
                        discountType: 'match-price',
                        insuranceType: 'type_1',
                        insurer: '',
                        leadId: 'L9898200',
                        leadName: 'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72',
                        maxDiscount: 8,
                        packageType: 'leadTypeFilter.renewal',
                        requestDiscount: '6.9%',
                        requestTime: '',
                        approver: 'first last',
                        approvalTime: '',
                        status: 'PENDING',
                        approvalReason: 'test discount',
                        index: 1,
                      })
                    }
                  >
                    Click
                  </button>
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

jest.mock('data/slices/discountSlice', () => ({
  ...jest.requireActual('data/slices/discountSlice'),
  useGetAllCampaignsQuery: () => ({
    data: {
      campaigns: [
        {
          name: 'campaigns/f016c4f1-f6f4-4d77-baab-1e9f50cf22be',
          createTime: '2023-02-03T08:48:47.581418Z',
          updateTime: '2023-02-03T08:48:47.581418Z',
          deleteTime: null,
          product: 'products/car-insurance',
          campaignCode: 'Campaign1y3t',
          discountPercentage: '175',
          startDate: '2023-02-03T00:00:00Z',
          endDate: '2023-03-31T00:00:00Z',
          approver: 'roles/manager',
          description: 'kerry express',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useLazyGetDiscountRequestDocumentsQuery: () => [
    jest.fn(),
    {
      data: {
        documents: [],
      },
      isLoading: false,
      isError: false,
    },
  ],
  useDiscountApprovalMutation: () => [
    jest.fn(),
    {
      data: {},
      isLoading: false,
      isError: false,
    },
  ],
}));

describe('Testing Discount Approval Page filter', () => {
  it('should display loading text when user click on approver dropdown', async () => {
    const { container } = render(<DiscountApprovalPage />, { initialState });
    const approver = container.querySelector(`input[name="approver"]`);
    await userEvent.click(approver as HTMLElement);

    expect(screen.queryByRole('presentation')).toBeInTheDocument();
    expect(screen.queryByText('text.loading')).toBeInTheDocument();
  });
  it('should display loading text when user click on agent dropdown', async () => {
    const { container } = render(<DiscountApprovalPage />, { initialState });
    const agentName = container.querySelector(`input[name="agentName"]`);
    await userEvent.click(agentName as HTMLElement);

    expect(screen.queryByRole('presentation')).toBeInTheDocument();
    expect(screen.queryByText('text.loading')).toBeInTheDocument();
  });
});

describe('Testing Discount Approval Page', () => {
  it('should render ApprovalPage', () => {
    render(<DiscountApprovalPage />, { initialState });
    expect(screen.getByTestId('discount-approval-page')).toBeInTheDocument();
  });

  it('should reset the filter if clicked on reset button', async () => {
    render(<DiscountApprovalPage />, { initialState });
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(5));
    const packageTypeElem = screen.getAllByRole('textbox')[4];
    const resetBtn = screen.getByTestId('reset-btn');

    await userEvent.click(packageTypeElem);
    await userEvent.click(screen.getAllByRole('option')[1]);
    expect(resetBtn).toBeEnabled();

    await userEvent.click(resetBtn);

    waitFor(() =>
      expect(document.getElementsByName('leadTypeFilter.renewal')).toHaveLength(
        0
      )
    );
  });

  it('should filter and render the data accordingly', async () => {
    render(<DiscountApprovalPage />, { initialState });
    const packageTypeElem = screen.getAllByRole('textbox')[4];
    const submitBtn = screen.getByTestId('submit-btn');

    await userEvent.click(packageTypeElem);
    await userEvent.click(screen.getAllByRole('option')[0]);
    expect(submitBtn).toBeEnabled();
  });

  it('should approve discount after clicking checkbox', async () => {
    render(<DiscountApprovalPage />, { initialState });
    const checkboxElem = document.getElementById('mock-checkbox');
    const approveBtn = document.getElementById('discount-approve');

    await userEvent.click(checkboxElem as HTMLElement);
    waitFor(() => {
      expect(approveBtn).toBeEnabled();
    });

    await userEvent.click(approveBtn as HTMLElement);
  });

  it.skip('should reject discount after clicking checkbox', async () => {
    render(<DiscountApprovalPage />, { initialState });
    const checkboxElem = document.getElementById('mock-checkbox');
    const rejectBtn = document.getElementById('discount-reject');

    await userEvent.click(checkboxElem as HTMLElement);
    await waitFor(() => {
      expect(rejectBtn).toBeEnabled();
    });

    await userEvent.click(rejectBtn as HTMLElement);
    await waitFor(() => {
      expect(document.getElementById('form-dialog-title')).toBeInTheDocument();
    });

    const rejectMsg = screen.getByTestId('reject-modal-message');
    const submitBtn = screen.getAllByRole('button')[0];

    await userEvent.type(rejectMsg, 'test');
    expect(submitBtn).toBeEnabled();

    await userEvent.click(submitBtn);
  });

  it('should open preview modal on click of a button', async () => {
    render(<DiscountApprovalPage />, { initialState });
    const previewBtn = document.getElementById('data-file-icon');

    await userEvent.click(previewBtn as HTMLElement);

    waitFor(() => {
      expect(screen.getByTestId('file-browse-modal')).toBeInTheDocument();
    });
  });

  it('should show all request on checking checkbox and clear when click Clear All', async () => {
    const { container } = render(<DiscountApprovalPage />, { initialState });
    const showAllCheck = container.querySelectorAll(
      'div[name="myLead.showAll"]'
    )[0];
    await userEvent.click(showAllCheck as HTMLElement);

    const packageTypeElem = screen.getAllByRole('textbox')[4];
    await userEvent.click(showAllCheck as HTMLElement);

    const resetBtn = screen.getByTestId('reset-btn');
    await userEvent.click(showAllCheck as HTMLElement);

    await userEvent.click(packageTypeElem);
    await userEvent.click(screen.getAllByRole('option')[1]);
    expect(resetBtn).toBeEnabled();

    await userEvent.click(resetBtn);

    await waitFor(() =>
      expect(document.getElementsByName('leadTypeFilter.renewal')).toHaveLength(
        0
      )
    );
  });
});
