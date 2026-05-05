import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';

const mockStore = configureStore([]);
const store = mockStore({});

let CreateRefundModal: any;
let mockUseCancellationPaymentDetails: jest.Mock;

beforeAll(async () => {
  mockUseCancellationPaymentDetails = jest.fn();
  jest.doMock('../All/useCancellationPaymentDetails', () => ({
    __esModule: true,
    default: mockUseCancellationPaymentDetails,
  }));
  // Import after mock is set up using dynamic import
  const module = await import('./index');
  CreateRefundModal = module.default;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFlags([
    FeatureFlags.BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP,
  ]);
  mockUseCancellationPaymentDetails.mockReset();
  mockUseCancellationPaymentDetails.mockReturnValue({
    newPaymentDetails: {
      totalCreditUsed: { amount: '0' },
      totalCreditAvailable: { amount: '0' },
    },
    leadIdFromOrder: 'leads/123',
    usedCreditShell: '0',
    availableCreditShell: '100',
    refundData: {
      refund: {
        amount: '0',
        currency: 'THB',
      },
    },
    accountingData: { urgentRefund: false, customerReceivedPolicy: false },
    paidCharges: [],
  });
});

const mockAccountingData = {
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
  invoicedAmount: { units: 5000, currencyCode: 'THB' },
  totalCancellationFee: { units: 500, currencyCode: 'THB' },
};

// Mock all the required modules
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
        documents: [],
        total: 0,
      },
    }),
    {
      data: {
        documents: [],
        total: 0,
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
    object: () => ({
      shape: () => ({
        validate: jest.fn().mockResolvedValue({}),
        validateSync: jest.fn().mockReturnValue({}),
        isValid: jest.fn().mockResolvedValue(true),
        isValidSync: jest.fn().mockReturnValue(true),
        cast: jest.fn().mockReturnValue({}),
      }),
      required: jest.fn().mockReturnThis(),
      when: jest.fn().mockReturnThis(),
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
      default: jest.fn().mockReturnThis(),
    }),
  };
});

jest.mock('utils/currency', () => ({
  currencyToMoney: (val: number) => ({ amount: val, currency: 'THB' }),
  moneyToCurrency: (money: any) => money?.units || 0,
  satangToBaht: (money: any) => (money?.units ? money.units / 100 : 0),
}));

jest.mock('shared/helper/utilities', () => ({
  parseDate: (date: string) => date,
  NewDateFormatters: jest.fn().mockReturnValue({
    DDMMYYYY: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      return '01/01/2024';
    }),
    ISODate: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      return '2024-01-01T00:00:00.000Z';
    }),
    DDMMYYYYHM: jest.fn().mockImplementation((date: string) => {
      if (!date) return '';
      return '01/01/2024 12:00';
    }),
  }),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock(
  'presentation/components/modal/CommonModal',
  () =>
    function CommonModal({ children }: any) {
      return <div data-testid="common-modal">{children}</div>;
    }
);

jest.mock(
  'presentation/components/common/FormikFields/DetailViewTextField',
  () =>
    function DetailViewTextField({
      title,
      placeholder,
      type,
      value,
      disabled,
    }: any) {
      return (
        <input
          data-testid={title}
          placeholder={placeholder}
          type={type || 'text'}
          value={value || ''}
          disabled={disabled}
          title={title}
        />
      );
    }
);

jest.mock(
  'presentation/components/common/FormikFields/FormikRadioField',
  () =>
    function FormikRadioField({ title, options, name, value }: any) {
      return (
        <div title={title}>
          {options.map((option: any) => (
            <label key={option.value} htmlFor={`${name}-${option.value}-input`}>
              <input
                data-testid={`${name}-${option.value}`}
                id={`${name}-${option.value}-input`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }
);

jest.mock(
  'presentation/components/common/FormikFields/InputContainer',
  () =>
    function InputContainer({ children }: any) {
      return <div>{children}</div>;
    }
);

jest.mock(
  'presentation/components/common/FormikFields/LeadAutocomplete',
  () =>
    function LeadAutocomplete({ title, options }: any) {
      return (
        <select data-testid={title} title={title}>
          <option value="">Select</option>
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
);

jest.mock(
  'presentation/components/common/UploadComponent',
  () =>
    function UploadComponent({ title }: any) {
      return (
        <div>
          <input data-testid={`upload-${title}`} type="file" />
        </div>
      );
    }
);

jest.mock(
  'presentation/components/controls/DatePickerWithThaiYear',
  () =>
    function DatePickerWithThaiYear({ title, value }: any) {
      return (
        <input
          data-testid={title}
          placeholder="dd/mm/yyyy"
          type="date"
          value={value || '01/01/2024'}
        />
      );
    }
);

jest.mock(
  'presentation/components/common/FormikFields/DetailViewNumberInput',
  () =>
    function DetailViewNumberInput({ title, value, disabled }: any) {
      return (
        <input
          data-testid={title}
          title={title}
          type="number"
          value={value || 0}
          disabled={disabled}
        />
      );
    }
);

jest.mock('data/slices/transactionSlice', () => ({
  useUploadDocumentFileMutation: jest
    .fn()
    .mockReturnValue([
      jest.fn().mockResolvedValue({ data: { success: true } }),
      { isLoading: false, isError: false },
    ]),
}));

jest.mock('@careos/utils', () => ({
  uploadDocumentViaDocumentService: jest
    .fn()
    .mockResolvedValue({ success: true }),
}));

const mockRow = {
  cancellationContactDate: '2024-01-01',
  policyEndDate: '2024-01-10',
  customerReceivePolicy: 'Yes',
  policyReturnDate: '2024-01-05',
  cancellationContactedDate: '2024-01-02',
  urgentRefund: 'Yes',
  urgentRefundReason: 'reason1',
  refundCalculationMethod: 'method1',
  commissionClawback: 1000,
  refundAmountFromInsurer: 2000,
  refundAmountCustomer: 1500,
  bankAccountNumber: '1234567890',
  bankName: 'SCB',
  refundMethod: 'BANK_TRANSFER',
  item: { name: 'orders/123/items/456' },
  orderItemId: 'OID123',
};

describe('CreateRefundModal Conditional Field Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags([
      FeatureFlags.BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP,
    ]);
  });

  it('does not show urgentRefundReason field when urgentRefund is No', () => {
    mockUseCancellationPaymentDetails.mockReturnValue({
      newPaymentDetails: {
        totalCreditUsed: { amount: '0' },
        totalCreditAvailable: { amount: '0' },
      },
      leadIdFromOrder: 'leads/123',
      usedCreditShell: '0',
      availableCreditShell: '100',
      refundData: {
        refund: {
          amount: '0',
          currency: 'THB',
        },
      },
      accountingData: { ...mockAccountingData, urgentRefund: false },
      paidCharges: [],
    });

    render(
      <Provider store={store}>
        <CreateRefundModal
          onClose={jest.fn()}
          row={{
            ...mockRow,
            urgentRefund: 'No',
            urgentRefundReason: undefined,
          }}
          updateCancellationStatus={jest.fn()}
          setOpenClosePopup={jest.fn()}
          handleOpenFile={jest.fn()}
        />
      </Provider>
    );

    expect(screen.queryByTestId('urgentRefundReason')).not.toBeInTheDocument();
  });

  it('does not show policyReturnDate field when customerReceivePolicy is No', () => {
    mockUseCancellationPaymentDetails.mockReturnValue({
      newPaymentDetails: {
        totalCreditUsed: { amount: '0' },
        totalCreditAvailable: { amount: '0' },
      },
      leadIdFromOrder: 'leads/123',
      usedCreditShell: '0',
      availableCreditShell: '100',
      refundData: {
        refund: {
          amount: '0',
          currency: 'THB',
        },
      },
      accountingData: { ...mockAccountingData, customerReceivedPolicy: 'No' },
      paidCharges: [],
    });

    render(
      <Provider store={store}>
        <CreateRefundModal
          onClose={jest.fn()}
          row={{
            ...mockRow,
            customerReceivePolicy: 'No',
            policyReturnDate: undefined,
          }}
          updateCancellationStatus={jest.fn()}
          setOpenClosePopup={jest.fn()}
          handleOpenFile={jest.fn()}
        />
      </Provider>
    );

    expect(screen.queryByTestId('policyReturnDate')).not.toBeInTheDocument();
  });
});
