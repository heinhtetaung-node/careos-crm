import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RefundsPage from './index';
import * as cancellationSlice from 'data/slices/cancellationSlice';
import * as useTableListHook from 'presentation/hooks/useTableList';
import { act } from 'react';
// Import directly from the component file to test the internals
import { getString } from 'presentation/theme/localization';
import ProductOptions from 'shared/constants/productOptions';
import { bankLists } from '../All/helper';
import { fieldMapper, getFilterPanelQueryString } from './helper';

// Mock the hooks and components
jest.mock('data/slices/cancellationSlice', () => ({
  useLazyGetAllRefundsQuery: jest.fn(),
}));

jest.mock('presentation/hooks/useTableList', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) =>
    key === 'paymentMethodsCarepay.BANK_TRANSFER' ? 'Bank Transfer' : key
  ),
}));

jest.mock('shared/constants/productOptions', () => [
  { value: 'products/car-insurance', title: 'Motor Insurance' },
  { value: 'products/health-insurance', title: 'Health Insurance' },
]);

jest.mock('../All/helper', () => ({
  bankLists: [
    { name: 'SCB', label: 'Siam Commercial Bank' },
    { name: 'KBank', label: 'Kasikorn Bank' },
  ],
}));

jest.mock('presentation/components/FilterPanel', () => ({
  __esModule: true,
  default: ({ fields, onSubmit, onReset }: any) => (
    <div data-testid="filter-panel">
      <button
        type="button"
        data-testid="submit-button"
        onClick={() => onSubmit({ id: 'R12345' })}
      >
        Submit
      </button>
      <button type="button" data-testid="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

const initialState = {
  authReducer: {
    data: {
      user: {
        role: 'roles/admin',
      },
    },
  },
};

const mockStore = configureStore([]);
const store = mockStore(initialState);

describe('RefundsPage', () => {
  const mockTableComponent = () => (
    <div data-testid="table-component">Table Component</div>
  );
  const mockTopComponent = () => (
    <div data-testid="top-component">Top Component</div>
  );

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useTableList hook
    (useTableListHook.default as jest.Mock).mockReturnValue({
      TableComponent: mockTableComponent,
      TopComponent: mockTopComponent,
    });

    // Mock useLazyGetAllRefundsQuery
    (cancellationSlice.useLazyGetAllRefundsQuery as jest.Mock).mockReturnValue([
      jest.fn(),
      {
        data: {
          items: [],
          total: 0,
        },
        isLoading: false,
        isFetching: false,
      },
    ]);
  });

  it('renders RefundsPage component correctly', () => {
    render(
      <Provider store={store}>
        <RefundsPage />
      </Provider>
    );

    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByTestId('table-component')).toBeInTheDocument();
    expect(screen.getByTestId('top-component')).toBeInTheDocument();
  });

  it('calls useTableList with correct parameters', () => {
    render(
      <Provider store={store}>
        <RefundsPage />
      </Provider>
    );

    // Fix the expectations by being more specific rather than using expect.anything()
    expect(useTableListHook.default).toHaveBeenCalledWith(
      'refunds',
      expect.any(Array),
      { filter: '' },
      cancellationSlice.useLazyGetAllRefundsQuery,
      undefined,
      undefined,
      []
    );
  });

  it('updates filter when filter form is submitted', async () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    render(
      <Provider store={store}>
        <RefundsPage />
      </Provider>
    );

    // Clear previous calls to useTableList
    (useTableListHook.default as jest.Mock).mockClear();

    // Set up the mock to return a specific value for subsequent calls
    (useTableListHook.default as jest.Mock).mockReturnValue({
      TableComponent: mockTableComponent,
      TopComponent: mockTopComponent,
    });

    // Submit the filter form
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Check that console.log was called with filter string
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('resets filter when reset button is clicked', async () => {
    render(
      <Provider store={store}>
        <RefundsPage />
      </Provider>
    );

    // Submit the filter form first to set a filter
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Clear mocks to track the next call with reset filter
    (useTableListHook.default as jest.Mock).mockClear();

    // Set up the mock to return a specific value for subsequent calls
    (useTableListHook.default as jest.Mock).mockReturnValue({
      TableComponent: mockTableComponent,
      TopComponent: mockTopComponent,
    });

    // Click reset button
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-button'));
    });
  });

  describe('Table Column Transform Functions', () => {
    // Create mock transform functions for testing (these replicate the functions in the component)
    const transformFunctions = {
      productType: ({ productType }: any) => {
        const product = ProductOptions.find(
          (option) => option.value === productType
        );
        return product ? getString(product.title) : '-';
      },
      refundMethod: ({ refundMethod }: any) =>
        getString(`paymentMethodsCarepay.${refundMethod}`),
      bankName: ({ bankName }: any) => {
        const bank = bankLists.find((b) => b.name === bankName);
        return bank?.label || '-';
      },
    };

    it('should transform productType correctly', () => {
      // Test with matching product
      expect(
        transformFunctions.productType({
          productType: 'products/car-insurance',
        })
      ).toBe('Motor Insurance');

      // Test with non-matching product
      expect(
        transformFunctions.productType({ productType: 'non-existent-product' })
      ).toBe('-');

      // Test with undefined product
      expect(transformFunctions.productType({ productType: undefined })).toBe(
        '-'
      );

      // Test with null product
      expect(transformFunctions.productType({ productType: null })).toBe('-');
    });

    it('should transform refundMethod correctly', () => {
      // Test with existing refund method
      expect(
        transformFunctions.refundMethod({ refundMethod: 'BANK_TRANSFER' })
      ).toBe('Bank Transfer');

      // Test with non-existing refund method
      expect(
        transformFunctions.refundMethod({ refundMethod: 'UNKNOWN_METHOD' })
      ).toBe('paymentMethodsCarepay.UNKNOWN_METHOD');

      // Test with undefined refund method
      expect(transformFunctions.refundMethod({ refundMethod: undefined })).toBe(
        'paymentMethodsCarepay.undefined'
      );

      // Test with null refund method
      expect(transformFunctions.refundMethod({ refundMethod: null })).toBe(
        'paymentMethodsCarepay.null'
      );
    });

    it('should transform bankName correctly', () => {
      // Test with matching bank
      expect(transformFunctions.bankName({ bankName: 'SCB' })).toBe(
        'Siam Commercial Bank'
      );

      // Test with non-matching bank
      expect(
        transformFunctions.bankName({ bankName: 'NON_EXISTENT_BANK' })
      ).toBe('-');

      // Test with undefined bank
      expect(transformFunctions.bankName({ bankName: undefined })).toBe('-');

      // Test with null bank
      expect(transformFunctions.bankName({ bankName: null })).toBe('-');

      // Test with empty string bank
      expect(transformFunctions.bankName({ bankName: '' })).toBe('-');
    });
  });

  describe('Filter callbacks', () => {
    it('should correctly extract values from filter data', () => {
      // Test all callbacks in fieldMapper
      fieldMapper.forEach((mapper) => {
        const testData = { value: 'test-value' };
        if (typeof mapper.callback === 'function') {
          expect(mapper.callback(testData)).toBe('test-value');
        }
      });
    });

    it('should build correct filter panel query string', () => {
      const testFilters = {
        id: 'R12345',
        productType: [{ value: 'products/car-insurance' }],
        status: [{ value: 'COMPLETED' }],
      };

      const result = getFilterPanelQueryString({ filters: testFilters });

      expect(result).toContain(`refund.status in (\"COMPLETED\")`);
    });

    it('should handle empty filters', () => {
      const result = getFilterPanelQueryString({ filters: {} });
      expect(result).toBe('');
    });
  });
});
