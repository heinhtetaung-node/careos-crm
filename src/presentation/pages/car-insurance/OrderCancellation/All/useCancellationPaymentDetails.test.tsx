import { renderHook } from '@testing-library/react-hooks';
import * as accountingSlice from '../../../../../data/slices/accountingSlice';
import * as leadSlice from '../../../../../data/slices/leadSlice';
import * as orderSlice from '../../../../../data/slices/orderSlice';
import * as currencyUtils from '../../../../../utils/currency';
import snackbarUtils from '../../../../../utils/snackbar';
import * as localization from '../../../../theme/localization';
import useCancellationPaymentDetails from './useCancellationPaymentDetails';

jest.mock('../../../../../data/slices/leadSlice', () => ({
  useGetNewLeadPaymentDetailsQuery: jest.fn(),
  useGetNewLeadPaymentDetailsWithOrderItemIdQuery: jest.fn(),
  useGetPaymentRefundQuery: jest.fn(),
}));

jest.mock('../../../../../data/slices/orderSlice', () => ({
  useGetOrderByLeadIdQuery: jest.fn(),
}));

jest.mock('../../../../../data/slices/accountingSlice', () => ({
  useLazyGetAccountingQuery: jest.fn(),
  useGetCancellationDataQuery: jest.fn(),
}));

jest.mock('../../../../../utils/currency', () => ({
  numberToMoney: jest.fn(),
  satangToBaht: jest.fn(),
}));

jest.mock('../../../../../utils/snackbar', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../../../presentation/theme/localization', () => ({
  getString: jest.fn(),
}));

describe('useCancellationPaymentDetails', () => {
  const mockShowErrorSnackbar = jest.fn();
  const mockShowSuccessSnackbar = jest.fn();
  const mockRefetch = jest.fn();
  const mockGetAccountingDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup snackbar mock
    (snackbarUtils as jest.Mock).mockReturnValue({
      showErrorSnackbar: mockShowErrorSnackbar,
      showSuccessSnackbar: mockShowSuccessSnackbar,
    });

    // Setup localization mock
    (localization.getString as jest.Mock).mockImplementation((key) => key);

    // Setup currency mocks
    (currencyUtils.numberToMoney as jest.Mock).mockImplementation(
      (value) => `$${value}`
    );
    (currencyUtils.satangToBaht as jest.Mock).mockImplementation(
      (value) => parseFloat(value) / 100
    );

    // Setup RTK Query mocks
    (leadSlice.useGetNewLeadPaymentDetailsQuery as jest.Mock).mockReturnValue({
      data: null,
    });
    (
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery as jest.Mock
    ).mockReturnValue({
      data: null,
      refetch: jest.fn().mockReturnValue(Promise.resolve()),
    });
    (leadSlice.useGetPaymentRefundQuery as jest.Mock).mockReturnValue({
      data: null,
    });
    (orderSlice.useGetOrderByLeadIdQuery as jest.Mock).mockReturnValue({
      data: null,
    });
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockGetAccountingDetail.mockReturnValue({
      unwrap: mockUnwrap,
    });
    (accountingSlice.useLazyGetAccountingQuery as jest.Mock).mockReturnValue([
      mockGetAccountingDetail,
      { data: null },
    ]);
    (accountingSlice.useGetCancellationDataQuery as jest.Mock).mockReturnValue({
      data: null,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(result.current.newPaymentDetails).toBeNull();
    expect(result.current.leadIdFromOrder).toBeNull();
    expect(result.current.usedCreditShell).toBe('0');
    expect(result.current.availableCreditShell).toBe('0');
    expect(result.current.refundData).toBeNull();
    expect(result.current.paidCharges).toEqual([]);
    expect(result.current.accountingData).toBeNull();
  });

  it('should call getAccountingDetail when orderItemId is provided', () => {
    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(mockGetAccountingDetail).toHaveBeenCalledWith({
      orderItemId: 'orderItem123',
    });
  });

  it('should update leadIdFromOrder when orderData is available', () => {
    (orderSlice.useGetOrderByLeadIdQuery as jest.Mock).mockReturnValue({
      data: {
        orders: [
          {
            lead: 'leads/lead456',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(result.current.leadIdFromOrder).toBe('lead456');
  });

  it('should show success snackbar when isSuccess is true', () => {
    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        true,
        false,
        null,
        jest.fn()
      )
    );

    expect(mockShowSuccessSnackbar).toHaveBeenCalledWith(
      'cancellation.popup.updateStatusSuccessfully'
    );
  });

  it('should close popup without refetch when isSuccess and query is uninitialized', async () => {
    const mockClose = jest.fn();
    const localMockRefetch = jest.fn().mockResolvedValue(undefined);
    (
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery as jest.Mock
    ).mockReturnValue({
      data: null,
      refetch: localMockRefetch,
      isUninitialized: true,
    });

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        true,
        false,
        null,
        mockClose
      )
    );

    expect(mockShowSuccessSnackbar).toHaveBeenCalledWith(
      'cancellation.popup.updateStatusSuccessfully'
    );
    expect(localMockRefetch).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it('should refetch then close popup when isSuccess and query started', async () => {
    const mockClose = jest.fn();
    const localMockRefetch = jest.fn().mockResolvedValue(undefined);
    (
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery as jest.Mock
    ).mockReturnValue({
      data: null,
      refetch: localMockRefetch,
      isUninitialized: false,
    });

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        true,
        false,
        null,
        mockClose
      )
    );

    // allow the refetch().then(...) microtask to flush
    await Promise.resolve();

    expect(localMockRefetch).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it('should show error snackbar when isError is true with error message', () => {
    const mockError = {
      data: {
        message: 'Custom error message',
      },
    };

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        true,
        mockError,
        jest.fn()
      )
    );

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('Custom error message');
  });

  it('should show default error snackbar when isError is true without error message', () => {
    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        true,
        {},
        jest.fn()
      )
    );

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
      'cancellation.popup.updateStatusFailed'
    );
  });

  it('should map refund_already_exists error code to localized message', () => {
    const mockError = {
      data: {
        message: 'refund_already_exists: cannot create new refund',
      },
    };

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        true,
        mockError,
        jest.fn()
      )
    );

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
      'errors.refund_already_exists'
    );
  });

  it('should update status data when newPaymentDetails is available', () => {
    const mockNewPaymentDetails = {
      totalCreditUsed: { amount: '10000' },
      totalCreditAvailable: { amount: '50000' },
      paidCharges: [{ id: 1, amount: 100 }],
    };

    (
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery as jest.Mock
    ).mockReturnValue({
      data: mockNewPaymentDetails,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(currencyUtils.satangToBaht).toHaveBeenCalledWith('10000');
    expect(currencyUtils.satangToBaht).toHaveBeenCalledWith('50000');
    expect(currencyUtils.numberToMoney).toHaveBeenCalled();
    expect(result.current.paidCharges).toEqual([{ id: 1, amount: 100 }]);
  });

  it('should fetch refund data when fetchRefund is true', () => {
    const mockRefundData = { refundAmount: 1000 };
    (leadSlice.useGetPaymentRefundQuery as jest.Mock).mockReturnValue({
      data: mockRefundData,
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        true,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(leadSlice.useGetPaymentRefundQuery).toHaveBeenCalledWith(
      'orderItem123',
      {
        skip: false,
      }
    );
    expect(result.current.refundData).toEqual(mockRefundData);
  });

  it('should skip refund query when fetchRefund is false', () => {
    (leadSlice.useGetPaymentRefundQuery as jest.Mock).mockReturnValue({
      data: null,
    });

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(leadSlice.useGetPaymentRefundQuery).toHaveBeenCalledWith(
      'orderItem123',
      {
        skip: true,
      }
    );
  });

  it('should skip queries when leadHumanId is not provided', () => {
    (orderSlice.useGetOrderByLeadIdQuery as jest.Mock).mockReturnValue({
      data: null,
    });

    renderHook(() =>
      useCancellationPaymentDetails(
        '',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(orderSlice.useGetOrderByLeadIdQuery).toHaveBeenCalledWith(
      {
        leadId: '',
      },
      {
        skip: true,
      }
    );
  });

  it('should skip new payment details query when leadIdFromOrder is not available', () => {
    (
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery as jest.Mock
    ).mockReturnValue({
      data: null,
    });

    renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    expect(
      leadSlice.useGetNewLeadPaymentDetailsWithOrderItemIdQuery
    ).toHaveBeenCalledWith(
      { leadIdFromOrder: null, orderItemId: 'orderItem123' },
      {
        skip: true,
        refetchOnMountOrArgChange: true,
      }
    );
  });

  it('should sort cancellation details by createTime in descending order and use the newest one (line 71)', () => {
    const mockCancellationData = {
      cancellationDetails: [
        {
          createTime: '2024-01-01T00:00:00Z',
          cancellationFee: '1000',
          excludedProcessingFee: '200',
          excludedDiscount: '50',
        },
        {
          createTime: '2024-01-03T00:00:00Z', // Newest
          cancellationFee: '3000',
          excludedProcessingFee: '600',
          excludedDiscount: '150',
        },
        {
          createTime: '2024-01-02T00:00:00Z',
          cancellationFee: '2000',
          excludedProcessingFee: '400',
          excludedDiscount: '100',
        },
      ],
    };

    (accountingSlice.useGetCancellationDataQuery as jest.Mock).mockReturnValue({
      data: mockCancellationData,
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    // Should use the newest cancellation detail (2024-01-03)
    // satangToBaht is mocked to return parseFloat(value) / 100
    expect(currencyUtils.satangToBaht).toHaveBeenCalledWith('3000');
    expect(currencyUtils.satangToBaht).toHaveBeenCalledWith('600');
    expect(currencyUtils.satangToBaht).toHaveBeenCalledWith('150');

    // Verify the values are from the newest entry
    expect(result.current.totalCancellationFee).toBe(30); // 3000 / 100
    expect(result.current.processingFee).toBe(6); // 600 / 100
    expect(result.current.discountProRate).toBe(1.5); // 150 / 100
  });

  it('should handle empty cancellation details array', () => {
    const mockCancellationData = {
      cancellationDetails: [],
    };

    (accountingSlice.useGetCancellationDataQuery as jest.Mock).mockReturnValue({
      data: mockCancellationData,
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    // Should use default values when array is empty
    expect(result.current.totalCancellationFee).toBe(0);
    expect(result.current.processingFee).toBe(0);
    expect(result.current.discountProRate).toBe(0);
  });

  it('should handle null cancellationData', () => {
    (accountingSlice.useGetCancellationDataQuery as jest.Mock).mockReturnValue({
      data: null,
    });

    const { result } = renderHook(() =>
      useCancellationPaymentDetails(
        'lead123',
        'orderItem123',
        false,
        false,
        false,
        null,
        jest.fn()
      )
    );

    // Should use default values when cancellationData is null
    expect(result.current.totalCancellationFee).toBe(0);
    expect(result.current.processingFee).toBe(0);
    expect(result.current.discountProRate).toBe(0);
  });
});
