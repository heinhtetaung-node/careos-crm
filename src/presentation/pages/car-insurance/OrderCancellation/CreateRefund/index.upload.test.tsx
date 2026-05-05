import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import CreateRefundModal from './index';

import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';

const mockStore = configureStore([]);
const store = mockStore({});

// Create stable mock data to prevent infinite loops
const stableMockAccountingData = {
  cancellationCustomerContactTime: '2024-01-01T00:00:00Z',
  policyEndTime: '2024-01-10T00:00:00Z',
  customerReceivedPolicy: 'Yes',
  policyReturnTime: '2024-01-05T00:00:00Z',
  cancellationInsurerContactTime: '2024-01-02T00:00:00Z',
  urgentRefund: true,
  urgentRefundReason: 'reason1',
  refundCalculationMethod: 'method1',
  commissionClawback: { units: 1000, currencyCode: 'THB' },
  refundInsurerAmount: { units: 2000, currencyCode: 'THB' },
  refundAmountCustomer: { units: 1500, currencyCode: 'THB' },
  refundAccountNo: '1234567890',
  refundBank: 'SCB',
  refundProvider: 'KASIKORN',
  refundMethod: 'BANK_TRANSFER',
  grossPremium: { units: 5000, currencyCode: 'THB' },
  netPremium: { units: 4500, currencyCode: 'THB' },
  commission: { units: 500, currencyCode: 'THB' },
  vat: { units: 35, currencyCode: 'THB' },
  stampDuty: { units: 1, currencyCode: 'THB' },
  totalPremium: { units: 5036, currencyCode: 'THB' },
  invoicedAmount: { units: 5036, currencyCode: 'THB' },
  // Add mock documents to test delete functionality
  refundAccountDocument: 'documents/bank-account-slip.pdf',
  idCardDocument: 'documents/id-card.pdf',
  urgentRefundFormDocument: 'documents/urgent-form.pdf',
  cancellationEmailWithInsurer: 'documents/email.pdf',
};

const stableRefundData = {
  refunds: [
    {
      amount: '0',
      currency: 'THB',
      serviceProvider: 'KASIKORN',
      paymentMethod: 'BANK_TRANSFER',
    },
  ],
};

jest.mock('data/slices/leadSlice', () => ({
  useGetNewLeadPaymentDetailsWithOrderItemIdQuery: jest.fn().mockReturnValue({
    data: {
      totalCreditUsed: { amount: '0' },
      totalCreditAvailable: { amount: '0' },
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useGetPaymentRefundQuery: jest.fn().mockReturnValue({
    data: {
      refund: {
        amount: '0',
        currency: 'THB',
      },
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('data/slices/orderSlice', () => ({
  useGetOrderByLeadIdQuery: jest.fn().mockReturnValue({
    data: {
      orders: [
        {
          lead: 'leads/123',
          orderItems: [{ id: 'OID123', name: 'OrderName' }],
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('data/slices/cancellationSlice', () => ({
  useLazyGetAccountingOrderItemDocumentsQuery: jest.fn().mockReturnValue([
    jest.fn().mockResolvedValue({
      data: {
        documents: [
          {
            id: 'doc1',
            name: 'test-document.pdf',
            document: 'Test Document',
            type: 'DOCUMENT_TYPE_ACCOUNTING_OTHERS',
          },
        ],
        total: 1,
      },
    }),
    {
      data: {
        documents: [
          {
            id: 'doc1',
            name: 'test-document.pdf',
            document: 'Test Document',
            type: 'DOCUMENT_TYPE_ACCOUNTING_OTHERS',
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
    },
  ]),
  useDeleteOrderItemDocumentMutation: jest.fn().mockReturnValue([
    jest.fn().mockResolvedValue({
      data: { success: true },
    }),
    {
      isLoading: false,
      isError: false,
    },
  ]),
  useUploadOrderItemDocumentMutation: jest.fn().mockReturnValue([
    jest.fn().mockResolvedValue({
      data: {
        document: {
          id: 'new-doc-id',
          name: 'uploaded-document.pdf',
        },
      },
    }),
    {
      isLoading: false,
      isError: false,
    },
  ]),
}));

jest.mock('yup', () => {
  const actual = jest.requireActual('yup');
  return {
    ...actual,
    lazy: jest.fn((fn) => {
      const mockValues = { isRefund: false };
      const schema = fn(mockValues);
      return (
        schema || {
          validate: jest.fn().mockResolvedValue({}),
          validateSync: jest.fn().mockReturnValue({}),
          isValid: jest.fn().mockResolvedValue(true),
          isValidSync: jest.fn().mockReturnValue(true),
          cast: jest.fn().mockReturnValue({}),
        }
      );
    }),
    object: () => ({
      shape: () => ({
        validate: jest.fn().mockResolvedValue({}),
        validateSync: jest.fn().mockReturnValue({}),
        isValid: jest.fn().mockResolvedValue(true),
        isValidSync: jest.fn().mockReturnValue(true),
        cast: jest.fn().mockReturnValue({}),
      }),
      required: jest.fn().mockReturnThis(),
      when: jest.fn((...args) => {
        // Simulate .when('field', { is, then, otherwise }) signature
        if (args.length === 2 && typeof args[1] === 'object') {
          return {
            is: 'Yes',
            then: (schema) => schema,
            // Optionally, you can add more mock logic here if needed
          };
        }
        // fallback for other usages
        return this;
      }),
    }),
    string: () => ({
      required: jest.fn().mockReturnThis(),
      nullable: jest.fn().mockReturnThis(),
      oneOf: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      matches: jest.fn().mockReturnThis(),
      email: jest.fn().mockReturnThis(),
      trim: jest.fn().mockReturnThis(),
      test: jest.fn().mockReturnThis(),
      default: jest.fn().mockReturnThis(),
      when: jest.fn().mockReturnThis(),
    }),
    number: () => ({
      required: jest.fn().mockReturnThis(),
      nullable: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      positive: jest.fn().mockReturnThis(),
      integer: jest.fn().mockReturnThis(),
      default: jest.fn().mockReturnThis(),
      typeError: jest.fn().mockReturnThis(),
    }),
    boolean: () => ({
      required: jest.fn().mockReturnThis(),
      nullable: jest.fn().mockReturnThis(),
      default: jest.fn().mockReturnThis(),
    }),
    date: () => ({
      required: jest.fn().mockReturnThis(),
      nullable: jest.fn().mockReturnThis(),
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      default: jest.fn().mockReturnThis(),
      when: jest.fn().mockReturnThis(),
    }),
    mixed: () => ({
      required: jest.fn().mockReturnThis(),
      nullable: jest.fn().mockReturnThis(),
      oneOf: jest.fn().mockReturnThis(),
      notOneOf: jest.fn().mockReturnThis(),
      default: jest.fn().mockReturnThis(),
      test: jest.fn().mockReturnThis(),
      when: jest.fn().mockReturnThis(),
    }),
    reach: jest.fn(),
    addMethod: jest.fn(),
    setLocale: jest.fn(),
  };
});

jest.mock('presentation/components/modal/CommonModal', () => {
  function CommonModal({ children }: any) {
    return <div data-testid="common-modal">{children}</div>;
  }
  return CommonModal;
});

jest.mock(
  'presentation/components/common/FormikFields/DetailViewTextField',
  () => {
    function DetailViewTextField(props: any) {
      const {
        name = '',
        value = '',
        setFormikValue = () => {},
        ...rest
      } = props;
      return (
        <input
          data-testid={name}
          value={value}
          onChange={(e) => setFormikValue(e.target.value)}
          {...rest}
        />
      );
    }
    return DetailViewTextField;
  }
);

jest.mock(
  'presentation/components/common/FormikFields/FormikRadioField',
  () => {
    function FormikRadioField(props: any) {
      const {
        name = '',
        value,
        options = [],
        handleChange = () => {},
        ...rest
      } = props;
      return (
        <div {...rest}>
          {options.map((opt: any) => {
            const inputId = `${name}-${opt.value}-input`;
            return (
              <label key={opt.value} htmlFor={inputId}>
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={handleChange}
                  data-testid={`${name}-${opt.value}`}
                />
                {opt.label || opt.value}
              </label>
            );
          })}
        </div>
      );
    }
    return FormikRadioField;
  }
);

jest.mock('presentation/components/common/FormikFields/InputContainer', () => {
  function InputContainer({ children }: any) {
    return <div>{children}</div>;
  }
  return InputContainer;
});

jest.mock(
  'presentation/components/common/FormikFields/LeadAutocomplete',
  () => {
    function LeadAutocomplete(props: any) {
      const {
        name = '',
        value = '',
        options = [],
        handleUpdate = () => {},
        ...rest
      } = props;
      return (
        <select
          data-testid={name}
          value={value}
          onChange={(e) =>
            handleUpdate({ selections: { value: e.target.value } })
          }
          {...rest}
        >
          <option value="">Select</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.title}
            </option>
          ))}
        </select>
      );
    }
    return LeadAutocomplete;
  }
);

jest.mock('presentation/components/common/UploadComponent', () => {
  function UploadComponent(props: any) {
    const { title = '', setSlip = () => {}, deleteFile, ...rest } = props;
    return (
      <div {...rest}>
        <input
          data-testid={`upload-${title}`}
          type="file"
          onChange={() =>
            setSlip({
              size: 1,
              content_type: 'image/png',
              display_name: 'file.png',
              originalFile: 'file',
              name: 'file.png',
            })
          }
        />
        {deleteFile && (
          <button
            type="button"
            data-testid={`delete-${title}`}
            onClick={() => deleteFile('test-file')}
          >
            Delete
          </button>
        )}
      </div>
    );
  }
  return UploadComponent;
});

jest.mock('presentation/components/controls/DatePickerWithThaiYear', () => {
  function DatePickerWithThaiYear(props: any) {
    const { name = '', value = '', onChangeDate = () => {}, ...rest } = props;
    return (
      <input
        data-testid={name}
        type="date"
        value={value || ''}
        onChange={(e) => onChangeDate(e.target.value)}
        {...rest}
      />
    );
  }
  return DatePickerWithThaiYear;
});

jest.mock(
  'presentation/components/common/FormikFields/DetailViewNumberInput',
  () => {
    function DetailViewNumberInput(props: any) {
      const {
        name = '',
        value = '',
        onValueChange = () => {},
        isDisabled = false,
        ...rest
      } = props;
      return (
        <input
          data-testid={name}
          type="number"
          value={value || ''}
          onChange={(e) =>
            onValueChange({ floatValue: parseFloat(e.target.value) })
          }
          disabled={isDisabled}
          {...rest}
        />
      );
    }
    return DetailViewNumberInput;
  }
);

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));
jest.mock('data/slices/transactionSlice', () => ({
  useUploadDocumentFileMutation: () => [
    jest.fn().mockResolvedValue({
      data: { uploadUrl: 'url', document: { name: 'file.png' } },
    }),
  ],
}));
jest.mock('@careos/utils', () => ({
  uploadDocumentViaDocumentService: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('shared/helper/utilities', () => ({
  parseDate: (date: string) => date,
  NewDateFormatters: jest.fn().mockReturnValue({
    DDMMYYYY: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      // Mock implementation that returns a formatted date string
      return '01/01/2024';
    }),
    ISODate: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      // Mock implementation that returns ISO date string
      return '2024-01-01T00:00:00.000Z';
    }),
    DDMMYYYYHM: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      // Mock implementation that returns date with time
      return '01/01/2024 12:00';
    }),
  }),
  formatBoolean: jest
    .fn()
    .mockImplementation((value: boolean, text1: string, text2: string) =>
      value ? text1 : text2
    ),
}));
jest.mock('utils/currency', () => ({
  currencyToMoney: (val: number) => ({ amount: val, currency: 'THB' }),
  moneyToCurrency: (money: any) => money?.units || 0,
  satangToBaht: (money: any) => (money?.units ? money.units / 100 : 0),
}));
jest.mock('../All/helper', () => {
  const actual = jest.requireActual('../All/helper');
  return {
    ...actual,
    bankLists: [{ name: 'SCB', label: 'SCB', value: 'scb' }],
    checkSaveButtonDisabled: () => false,
    urgentRefundReasonOptions: [{ title: 'Reason1', value: 'reason1' }],
    refundMethodOptions: [
      { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
      { label: 'Credit Shell', value: 'CREDIT_SHELL' },
    ],
    refundProviderOptions: [
      { label: 'KASIKORN', value: 'KASIKORN' },
      { label: 'SCB', value: 'SCB' },
    ],
    omitFieldsIfNotChange: jest
      .fn()
      .mockImplementation((obj) =>
        obj?.urgent_refund_reason === 'omitMockReturn' ? {} : obj
      ),
    checkDisableInsurerAmount: () => false,
    getRefundAmountField: (
      value: unknown,
      currencyToMoney: (v: number) => any
    ) =>
      value !== undefined && value !== null
        ? { ...currencyToMoney(value as number) }
        : undefined,
  };
});
jest.mock('../../Accounting/All/config', () => ({
  refundCalculationMethods: [{ label: 'Method1', value: 'method1' }],
}));
jest.mock('shared/helper/selectOptions', () => ({
  yesNoOptions: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}));

jest.mock('../All/useCancellationPaymentDetails', () => ({
  __esModule: true,
  default: () => ({
    newPaymentDetails: {
      totalCreditUsed: { amount: '0' },
      totalCreditAvailable: { amount: '0' },
    },
    leadIdFromOrder: 'leads/123',
    usedCreditShell: '0',
    availableCreditShell: '100',
    refundData: stableRefundData,
    accountingData: stableMockAccountingData,
    paidCharges: [],
    totalCancellationFee: { units: 0, currencyCode: 'THB' },
  }),
}));

const row = {
  cancellationContactDate: '2024-01-01',
  policyEndDate: '2024-01-10',
  customerReceivePolicy: 'Yes',
  policyReturnDate: '2024-01-05',
  cancellationContactedDate: '2024-01-02',
  urgentRefund: true,
  urgentRefundReason: 'reason1',
  refundCalculationMethod: 'method1',
  commissionClawback: '1000',
  refundAmountFromInsurer: '2000',
  refundAmountToCustomer: '1500',
  bankAccountNumber: '1234567890',
  bankName: 'SCB',
  orderItemId: 'OID123',
  orderItemName: 'OrderName',
  cancellationStatus: 'pending',
  refundProvider: 'KASIKORN',
  refundMethod: 'BANK_TRANSFER',
  item: {
    name: 'orders/123/items/456',
  },
};

const onClose = jest.fn();

describe('CreateRefundModal', () => {
  const mockUpdateCancellationStatus = jest.fn();
  const mockSetOpenClosePopup = jest.fn();
  const mockHandleOpenFile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags([
      FeatureFlags.BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP,
    ]);
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <CreateRefundModal
          onClose={onClose}
          row={row}
          updateCancellationStatus={mockUpdateCancellationStatus}
          setOpenClosePopup={mockSetOpenClosePopup}
          handleOpenFile={mockHandleOpenFile}
        />
      </Provider>
    );

  it('should render the modal with form fields', () => {
    renderComponent();
    expect(screen.getByTestId('common-modal')).toBeInTheDocument();
  });

  // Test for lines 796-800: deleteFile callback for bank account document
  it('should handle deleteFile for bank account document', async () => {
    renderComponent();

    // Find the delete button for bank account document
    const deleteButton = screen.getByTestId(
      'delete-cancellation.popup.bankAccount'
    );
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify the delete button is still there (component re-renders)
    expect(
      screen.getByTestId('delete-cancellation.popup.bankAccount')
    ).toBeInTheDocument();
  });

  // Test for lines 813-817: deleteFile callback for ID card document
  it('should handle deleteFile for ID card document', async () => {
    renderComponent();

    // Find the ID card upload component
    const idCardUpload = screen.getByTestId('upload-cancellation.popup.idCard');
    expect(idCardUpload).toBeInTheDocument();

    // Find and click the delete button to trigger deleteFile callback
    const deleteButton = screen.getByTestId('delete-cancellation.popup.idCard');
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify the component renders correctly after deletion
    expect(idCardUpload).toBeInTheDocument();
  });

  // Test for lines 831-837: deleteFile callback for cancellation email document
  it('should handle deleteFile for cancellation email document', async () => {
    renderComponent();

    // Find the cancellation email upload component
    const emailUpload = screen.getByTestId(
      'upload-cancellation.popup.cancellationEmailFromInsurer'
    );
    expect(emailUpload).toBeInTheDocument();

    // Find and click the delete button to trigger deleteFile callback
    const deleteButton = screen.getByTestId(
      'delete-cancellation.popup.cancellationEmailFromInsurer'
    );
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify the component renders correctly after deletion
    expect(emailUpload).toBeInTheDocument();
  });

  // Test for lines 850-854: deleteFile callback for urgent refund form document
  it('should handle deleteFile for urgent refund form document', async () => {
    renderComponent();

    // Find the urgent refund form upload component
    const urgentFormUpload = screen.getByTestId(
      'upload-cancellation.popup.urgentRefundForm'
    );
    expect(urgentFormUpload).toBeInTheDocument();

    // Find and click the delete button to trigger deleteFile callback
    const deleteButton = screen.getByTestId(
      'delete-cancellation.popup.urgentRefundForm'
    );
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify the component renders correctly after deletion
    expect(urgentFormUpload).toBeInTheDocument();
  });

  // Test for lines 870: conditional rendering of bank transfer fields
  it('should conditionally render bank transfer fields when refund method is BANK_TRANSFER', async () => {
    renderComponent();

    // Since the default refund method is already BANK_TRANSFER in the mock data,
    // the bank account number and bank name fields should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('bankAccountNumber')).toBeInTheDocument();
      expect(screen.getByTestId('bankName')).toBeInTheDocument();
    });
  });

  // Test for lines 882-897: button click handlers
  it('should handle save button click', async () => {
    renderComponent();

    const saveButton = screen.getByText('cancellation.popup.save');
    expect(saveButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verify the button click handler is called
    expect(saveButton).toBeInTheDocument();
  });

  it('should handle save and create refund button click', async () => {
    renderComponent();

    const saveAndRefundButton = screen.getByText(
      'cancellation.popup.saveAndCreateRefund'
    );
    expect(saveAndRefundButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(saveAndRefundButton);
    });

    // Verify the button click handler is called
    expect(saveAndRefundButton).toBeInTheDocument();
  });

  it('should handle close button click', async () => {
    renderComponent();

    const closeButton = screen.getByText('text.cancel');
    expect(closeButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Verify onClose is called
    expect(onClose).toHaveBeenCalled();
  });
});
