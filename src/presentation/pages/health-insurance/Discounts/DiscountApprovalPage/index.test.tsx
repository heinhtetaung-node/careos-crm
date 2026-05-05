/* eslint-disable jsx-a11y/control-has-associated-label */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { act, render, screen, waitFor } from '__tests__/rtl-test-utils';
import * as CONSTANTS from 'shared/constants';

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

const mockRefetch = jest.fn();
const mockDispatch = jest.fn();

let mutationMockResult: {
  data?: { status: string; name: string };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock(
  'presentation/hooks/useTableList',
  () =>
    function useTableList(
      _tableType: any,
      columns: any,
      _initialSearchCondition: any,
      _mainFunction: any,
      _selected: string,
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
                      columns[0].onClick?.({
                        name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
                        agentName: 'SalesAgentRole -',
                        configId:
                          'leads/79e8b6f2-4666-4262-8a19-1cc2ab800c72/renewalPackages/e6cdc351-ea65-4716-afcc-324edca4b035/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
                        description: 'test discount',
                        discount: 'percentage',
                        discountType: 'match-price',
                        insuranceType: 'type_1',
                        insurer: '',
                        leadId: 'L9898200',
                        leadName: 'leads/79e8b6f2-4666-4262-8a19-1cc2ab800c72',
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

      return {
        TopComponent: PaginationComponent,
        TableComponent,
        refetch: mockRefetch,
      };
    }
);

jest.mock('data/slices/discountSlice', () => {
  const actual = jest.requireActual('data/slices/discountSlice');
  return {
    ...actual,
    useGetAllCampaignsQuery: () => ({
      data: {
        campaigns: [
          {
            name: 'campaigns/f016c4f1-f6f4-4d77-baab-1e9f50cf22be',
            createTime: '2023-02-03T08:48:47.581418Z',
            updateTime: '2023-02-03T08:48:47.581418Z',
            deleteTime: null,
            product: 'products/health-insurance',
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
        data: { documents: [] },
        isLoading: false,
        isError: false,
      },
    ],
    useDiscountApprovalMutation: () => [jest.fn(), mutationMockResult],
  };
});

describe('Health DiscountApprovalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue({ data: { imports: [] } });
    mutationMockResult = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it('renders discount approval page', () => {
    render(<DiscountApprovalPage />, { initialState });
    expect(screen.getByTestId('discount-approval-page')).toBeInTheDocument();
  });

  it('dispatches error snackbar when mutation returns isError with status 400', async () => {
    mutationMockResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 400 },
    };

    render(<DiscountApprovalPage />, { initialState });

    await waitFor(
      () => {
        const errorCall = mockDispatch.mock.calls.find(
          (call: any[]) =>
            call[0]?.payload?.status === CONSTANTS.snackBarConfig.type.error &&
            call[0]?.payload?.message
        );
        expect(errorCall).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('dispatches generic error snackbar when mutation returns isError without status 400', async () => {
    mutationMockResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500 },
    };

    render(<DiscountApprovalPage />, { initialState });

    await waitFor(
      () => {
        const errorCall = mockDispatch.mock.calls.find(
          (call: any[]) =>
            call[0]?.payload?.status === CONSTANTS.snackBarConfig.type.error
        );
        expect(errorCall).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('dispatches success snackbar and starts polling when mutation returns success data', async () => {
    mutationMockResult = {
      data: {
        status: 'APPROVED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<DiscountApprovalPage />, { initialState });

    await waitFor(
      () => {
        const successCall = mockDispatch.mock.calls.find(
          (call: any[]) =>
            call[0]?.payload?.status === CONSTANTS.snackBarConfig.type.success
        );
        expect(successCall).toBeDefined();
      },
      { timeout: 2000 }
    );
  });

  it('calls refetch and schedules another poll when the request still exists', async () => {
    mutationMockResult = {
      data: {
        status: 'APPROVED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    mockRefetch.mockResolvedValueOnce({
      data: {
        imports: [{ name: 'requests/test' }],
      },
    });

    render(<DiscountApprovalPage />, { initialState });

    await waitFor(
      () => {
        expect(mockRefetch).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('clears existing polling timeout before starting a new polling session', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // Initial success triggers polling and sets pollingTimeoutRef.current via setTimeout(...)
    mutationMockResult = {
      data: {
        status: 'APPROVED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    mockRefetch.mockResolvedValue({
      data: {
        imports: [{ name: 'requests/test' }],
      },
    });

    const { rerender, unmount } = render(<DiscountApprovalPage />, {
      initialState,
    });

    await waitFor(() => expect(mockRefetch).toHaveBeenCalled(), {
      timeout: 2000,
    });
    await waitFor(() => expect(setTimeoutSpy).toHaveBeenCalled(), {
      timeout: 2000,
    });

    // Simulate a new successful mutation result, causing the success useEffect to run again.
    // This should clear the previous polling timeout (lines 275-277) and start a new polling session.
    mutationMockResult = {
      data: {
        status: 'REJECTED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    rerender(<DiscountApprovalPage />);

    await waitFor(() => expect(clearTimeoutSpy).toHaveBeenCalled(), {
      timeout: 2000,
    });
    await waitFor(() => expect(mockRefetch.mock.calls.length).toBeGreaterThan(1), {
      timeout: 2000,
    });

    unmount();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });

  it('clears polling timeout and bumps generation on unmount', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // Simulate a successful approval so polling starts
    mutationMockResult = {
      data: {
        status: 'APPROVED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    // First refetch call returns an entry that keeps polling alive
    mockRefetch.mockResolvedValueOnce({
      data: {
        imports: [{ name: 'requests/test' }],
      },
    });

    const { unmount } = render(<DiscountApprovalPage />, { initialState });

    // Wait until polling has started (refetch called at least once)
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });

    // Unmount should trigger cleanup useEffect which clears timeout
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('dispatches listing-not-updated error snackbar when polling exceeds max attempts', async () => {
    jest.useFakeTimers();

    mutationMockResult = {
      data: {
        status: 'APPROVED',
        name: 'leads/demo-lead/requests/test',
      },
      isLoading: false,
      isError: false,
      error: null,
    };

    // Every refetch returns the request still in the list so polling keeps going
    mockRefetch.mockResolvedValue({
      data: {
        imports: [{ name: 'requests/test' }],
      },
    });

    render(<DiscountApprovalPage />, { initialState });

    // Flush initial refetch promise so first setTimeout(500) is scheduled
    await act(async () => {
      await Promise.resolve();
    });
    // Run 10 timer advances; after each advance the polling callback runs and calls refetch,
    // flush promises so the next setTimeout is scheduled. On the 10th advance
    // keepPollingRefetch(..., 10) runs and hits attempt >= MAX_POLLING_TIMES (lines 223-230).
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        jest.advanceTimersByTime(500);
        await Promise.resolve();
      });
    }

    // Lines 223-230: when attempt >= MAX_POLLING_TIMES we dispatch error snackbar with text.listingNotUpdated
    const errorCall = mockDispatch.mock.calls.find(
      (call: any[]) =>
        call[0]?.payload?.status === CONSTANTS.snackBarConfig.type.error &&
        (call[0]?.payload?.message?.includes('not updated') ||
          call[0]?.payload?.message?.includes('listingNotUpdated'))
    );
    expect(errorCall).toBeDefined();

    jest.useRealTimers();
  });
});
