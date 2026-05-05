import userEvent from '@testing-library/user-event';
import React from 'react';

import { act, render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import mockPriceData from './PriceMockDetail.json';
import mockTransactionData from './TransactionMockData.json';
import UpdateModal from './TransactionModals';

import TransactionListingPage from '.';

var mockedShowSnackBar: jest.Mock;
var mockedAssign: jest.Mock;
var mockShowError: jest.Mock;
var mockShowSuccess: jest.Mock;
var mockedUnAssign: jest.Mock;
var mockedUpdateFollowup: jest.Mock;

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: () => ({
    role: 'roles/admin',
  }),
}));

jest.mock('data/slices/leadSearchSlice', () => ({
  useLazyGenericSearchQuery: () => [
    jest.fn(),
    {
      data: {
        imports: [
          mockTransactionData.filter((a) => a.paymentStatus === 'SUCCESSFUL'),
        ],
        total: 1,
      },
    },
  ],
}));
jest.mock('data/slices/transactionSlice', () => {
  mockedAssign = jest.fn();
  mockedUnAssign = jest.fn();
  mockedUpdateFollowup = jest.fn();

  return {
    useAssignFollowupMutation: () => [
      mockedAssign,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: '',
      },
    ],
    useUnassignFollowupMutation: () => [
      mockedUnAssign,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: '',
      },
    ],
    useUpdateFollowupMutation: () => [
      mockedUpdateFollowup,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: '',
      },
    ],
    useGetPriceDetailQuery: () => ({
      data: {
        price: {
          name: 'prices/284801e8-10d8-4389-a75d-31d22bd09577',
          priceDetail: {
            resourceName: 'packages/1357849',
            priceSummary: {
              interestRate: 0.74,
              interestAmount: '17846',
              processingFeeRate: 0.37,
              processingFeeAmount: '8924',
              feeRate: 1.1,
              feeAmount: '26770',
              discountRate: 3,
              discountAmount: '75000',
              netDiscountRate: -1.93,
              netDiscountAmount: '-48230',
              packagePriceAfterDiscount: '2425000',
              netPremiumAmount: '2451769',
              initialAmount: '817257',
              subsequentAmount: '817256',
              discount: {
                type: 'DISCOUNT_TYPE_RCL',
                percentage: 300,
                amount: '75000',
              },
              shipmentFee: '0',
              feeAmountNoShip: '26770',
              vatRate: 7,
              vatAmount: '163552',
              stampRate: 0.4,
              stampAmount: '9400',
              whtRate: 1,
              whtAmount: '0',
            },
            installmentDetails: [
              {
                period: 1,
                paymentAmount: '817257',
                principal: '808333',
                addOns: '0',
                interest: '0',
                processingFee: '8924',
                principalBalance: '1616667',
                interestBalance: '17846',
                processingFeeBalance: '0',
                totalBalance: '1634512',
              },
              {
                period: 2,
                paymentAmount: '817256',
                principal: '805374',
                addOns: '0',
                interest: '11883',
                processingFee: '0',
                principalBalance: '811293',
                interestBalance: '5963',
                processingFeeBalance: '0',
                totalBalance: '817256',
              },
              {
                period: 3,
                paymentAmount: '817256',
                principal: '811293',
                addOns: '0',
                interest: '5963',
                processingFee: '0',
                principalBalance: '0',
                interestBalance: '0',
                processingFeeBalance: '0',
                totalBalance: '0',
              },
            ],
          },
          paymentOption: 'RABBIT_CARE_INSTALLMENT',
          paymentMethod: 'QR_CODE',
          numberOfInstallments: 3,
          cardProvider: '',
          createTime: '2024-03-18T06:15:40.690118Z',
          updateTime: '2024-03-18T06:15:40.690118Z',
          discountEntity: {
            name: 'leads/6b13e4af-9c2b-426c-9610-412908d11a34/packages/1357849/discounts/314459b6-ef3c-4029-af50-4b81c47ba914',
            requestResource: '',
            source: '',
            amount: 0,
            percentage: 300,
            type: 'DISCOUNT_TYPE_RCL',
            createTime: '2024-03-18T06:15:40.565355Z',
            updateTime: '2024-03-18T06:15:40.565355Z',
            deleteTime: null,
            createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
          },
          discountType: 'DISCOUNT_TYPE_RCL',
          packageResource: {
            carPackage: {
              package: 'packages/1357849',
              packagePrice: {
                voluntaryPrice: '2500000',
                compulsoryPrice: '0',
                discount: {
                  type: 'DISCOUNT_TYPE_RCL',
                  percentage: 300,
                  amount: '0',
                },
              },
              insurer: 'insurers/27',
              insuranceType: 'TYPE_1',
            },
          },
        },
      },
    }),
    useUpdateSMSStatusMutation: () => [
      jest.fn(),
      { isLoading: true, isSuccess: false, error: null, isError: false },
    ],
    useUpdateFollowupStatusMutation: () => [
      jest.fn(),
      { isLoading: false, isSuccess: false, error: null, isError: false },
    ],
    useUploadDocumentFileMutation: () => [
      jest.fn(),
      { isLoading: false, isSuccess: false, error: null, isError: false },
    ],
    useCreateDirectPaymentMutation: () => [
      jest.fn(),
      { isLoading: false, isSuccess: false, error: null, isError: false },
    ],
    useSendSMSMutation: () => [
      jest.fn(),
      { isLoading: false, isSuccess: false, error: null, isError: false },
    ],
    useGetTransactionHistoryQuery: () => ({
      data: {
        charges: {
          charges: [],
          nextPageToken: '',
        },
        refunds: {
          refunds: [],
          nextPageToken: '',
        },
        credits: {
          credits: [
            {
              name: 'leads/d409d1c1-0cc6-4cd5-a42f-4777edf3fc4f/credits/f6709d7d-c7b6-4ba8-b4e3-50116532e38e',
              money: {
                currencyCode: 'THB',
                amount: '5000',
              },
              status: 'STATUS_PENDING',
              createTime: '2024-07-04T09:49:41.483967Z',
              updateTime: '2024-07-04T09:49:41.483967Z',
              deleteTime: null,
            },
          ],
          nextPageToken: '',
        },
      },
      isLoading: false,
      isSuccess: false,
      error: null,
      isError: false,
    }),
  };
});

jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});
jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  mockShowSuccess = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: mockShowSuccess,
  });
});

jest.mock('data/slices/userSlice', () => ({
  useGetUsersQuery: () => ({
    data: {
      users: [
        {
          key: 'user/123',
          name: 'user/123',
          humanId: '1212',
          role: 'roles/cash-installment-agent',
          firstName: 'ABC',
          lastName: 'User',
          annotations: {},
          title: 'ABC',
          loginTime: '12/12/1202',
        },
      ],
      nextPageToken: '',
    },
  }),
}));

jest.mock('data/slices/packageSlice', () => ({
  useGetPackageDetailsQuery: () => ({
    data: mockPriceData,
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({
    'paym-2407_show-mock-data_20230126_temp': { enabled: false },
  }),
}));

describe('Testing Carepay component', () => {
  it.skip('should render the sms modal on click of schedule status edit button', async () => {
    render(<TransactionListingPage />);
    expect(screen.getByTestId('transaction-listing-page')).toBeInTheDocument();
    await userEvent.click(screen.getAllByTestId('expand-row-button')[0]);
    await waitFor(() =>
      expect(screen.getByTestId('followup-table')).toBeInTheDocument()
    );

    const smsEditBtn = screen.getAllByTestId('edit-btn')[1];

    expect(smsEditBtn).toBeInTheDocument();
    expect(smsEditBtn).toBeEnabled();
    await userEvent.click(smsEditBtn);
    await waitFor(() => {
      expect(screen.getByTestId('sms-modal')).toBeInTheDocument();
    });
  }, 8000);

  it.skip('should be able to assign QA by checking followups', async () => {
    render(<TransactionListingPage />);
    expect(screen.getByTestId('transaction-listing-page')).toBeInTheDocument();
    await userEvent.click(screen.getAllByTestId('expand-row-button')[0]);
    await waitFor(() =>
      expect(screen.getByTestId('followup-table')).toBeInTheDocument()
    );

    const checkbox = screen.getAllByTestId('checkbox-followup')[0];
    expect(checkbox).toBeEnabled();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const checkbox2 = screen.getAllByTestId('checkbox-')[0];
    await userEvent.click(checkbox2);

    const inputs = screen.getAllByRole('textbox');
    const assignBtn = screen.getByTestId('assign-button');
    expect(assignBtn).toBeInTheDocument();
    expect(assignBtn).toBeDisabled();

    await userEvent.type(inputs[inputs.length - 1], 'ABC');

    await userEvent.click(
      within(screen.getAllByRole('presentation')[0]).getByRole('option', {
        name: 'ABC',
      })
    );

    expect(assignBtn).toBeEnabled();
    await userEvent.click(assignBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('assign-confirm-button'));

    await waitFor(() => expect(mockedAssign).toHaveBeenCalled());
  }, 8000);

  it.skip('should be able to un-assign QA by checking followups', async () => {
    render(<TransactionListingPage />);
    expect(screen.getByTestId('transaction-listing-page')).toBeInTheDocument();
    await userEvent.click(screen.getAllByTestId('expand-row-button')[0]);
    await waitFor(() =>
      expect(screen.getByTestId('followup-table')).toBeInTheDocument()
    );

    const checkbox = screen.getAllByTestId('checkbox-followup')[0];
    expect(checkbox).toBeEnabled();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const checkbox2 = screen.getAllByTestId('checkbox-')[0];
    await userEvent.click(checkbox2);

    const inputs = screen.getAllByRole('textbox');
    const unassignBtn = screen.getByTestId('unassign-button');
    expect(unassignBtn).toBeInTheDocument();

    await userEvent.type(inputs[inputs.length - 1], 'ABC');

    await userEvent.click(
      within(screen.getAllByRole('presentation')[0]).getByRole('option', {
        name: 'ABC',
      })
    );

    expect(unassignBtn).toBeEnabled();
    await userEvent.click(unassignBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('assign-confirm-button'));

    await waitFor(() => expect(mockedUnAssign).toHaveBeenCalled());
  }, 8000);
});

describe('Testing Transaction Modals', () => {
  const mockHandleModal = jest.fn();
  const fiveMb = 5242880;

  it('should display status update modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'status' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('status-modal')).toBeInTheDocument();
    });
  });

  it('should display date update modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'due-date' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('dueDate-modal')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('dueDate-update-btn'));
    await waitFor(() => {
      expect(mockedUpdateFollowup).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith('paymentStatus.successful');
    });
  });

  it('should display more field if selected status is Paid', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'status', label: 'status', shouldAskForSlip: true }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('status-modal')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('button')[0]);
    await userEvent.click(screen.getByTestId('muiSelect-menuItem-4'));

    await userEvent.type(screen.getByTestId('payment-date'), '12/12/1212');

    await userEvent.click(screen.getAllByRole('button')[2]);
    await userEvent.click(screen.getByTestId('muiSelect-menuItem-2'));

    const testDocumentFile = new File(['hello'], 'hello.jpeg', {
      type: 'image/jpeg',
    });
    Object.defineProperty(testDocumentFile, 'size', {
      value: fiveMb,
    });
    const fileInputTrigger: any = screen.getByTestId('chooseFileBtn');
    await userEvent.click(fileInputTrigger);
    const fileInput = screen.getByTestId('doc-file');
    await act(async () => {
      await userEvent.upload(fileInput, testDocumentFile);
    });

    await userEvent.click(screen.getByRole('button', { name: 'text.update' }));
    waitFor(() => expect(mockHandleModal).toHaveBeenCalled());
  });

  it('should display sms update modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'sms' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('sms-modal')).toBeInTheDocument();
    });
  });

  it('should display payment history modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'payment-history', uid: 'transactions/123' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('paymentHistory-modal')).toBeInTheDocument();
    });
  });

  it('should display payment status link update modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'payment-status-link' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('paymentStatusLink-modal')).toBeInTheDocument();
    });
  });

  it('should display payment link update modal', async () => {
    render(
      <UpdateModal
        modalInfo={{ type: 'payment-link' }}
        handleModal={mockHandleModal}
        refetch={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('createPaymentLink-modal')).toBeInTheDocument();
    });
  });
});
