import { act, renderHook } from '@testing-library/react-hooks';

import usePurchaseButton from './usePurchaseButton';

const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
const mockShowErrorSnackbar = jest.fn();
const mockShowSuccessSnackbar = jest.fn();
const mockCreateOrder = jest.fn();
const mockConnectLead = jest.fn();
const mockTriggerConnectedLeads = jest.fn();
const mockTriggerUsersFromPhone = jest.fn();
const mockCreateCustomer = jest.fn();
const mockCreatePhone = jest.fn();
const mockCreateEmail = jest.fn();
const mockUpdateCustomer = jest.fn();
const mockUseFlags = jest.fn();
const mockUseGetAuthenticateQuery = jest.fn();
const mockValidateLead = jest.fn(() => ({ type: 'validateLead' }));

jest.mock('flagsmith/react', () => ({
  useFlags: (...args: any[]) => mockUseFlags(...args),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

jest.mock('utils/snackbar', () =>
  jest.fn().mockImplementation(() => ({
    showErrorSnackbar: mockShowErrorSnackbar,
    showSuccessSnackbar: mockShowSuccessSnackbar,
  }))
);

jest.mock('data/slices/errorSlice/leadDetailError', () => ({
  validateLead: (..._args: any[]) => mockValidateLead(),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: (...args: any[]) =>
    mockUseGetAuthenticateQuery(...args),
}));

jest.mock('data/slices/leadDetailSlices/createOrderSlice', () => ({
  useCreateOrderMutation: () => [mockCreateOrder, { isLoading: false }],
}));

jest.mock('data/slices/leadSlice', () => ({
  useConnectLeadToCustomerMutation: () => [mockConnectLead],
}));

jest.mock('data/slices/customerSlice', () => ({
  useLazyGetConnectedLeadsQuery: () => [mockTriggerConnectedLeads],
  useLazyGetUserFromPhoneNumberQuery: () => [mockTriggerUsersFromPhone],
  useCreateNewCustomerMutation: () => [mockCreateCustomer],
  useCreatePhoneNumberMutation: () => [mockCreatePhone],
  useCreateCustomerEmailMutation: () => [mockCreateEmail],
  useUpdateCustomerMutation: () => [mockUpdateCustomer],
}));

const CAR_INSURANCE = 'products/car-insurance';

const defaultCarPurchaseDocuments = [
  { type: 'DOCUMENT_TYPE_ID_CARD', name: 'doc-id' },
  { type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION', name: 'doc-vr' },
];

let selectorState: { globalProduct: string; documents: any[] };

const lead = {
  name: 'leads/lead-1',
  status: 'LEAD_STATUS_PENDING_PAYMENT',
  data: {
    customerFirstName: 'John',
    customerLastName: 'Doe',
    customerDOB: '1990-01-01',
    customerGender: 'm',
    customerPhoneNumber: [{ phone: '+6612345678' }],
    customerEmail: ['john@example.com'],
  },
} as any;

describe('usePurchaseButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectorState = {
      globalProduct: CAR_INSURANCE,
      documents: [...defaultCarPurchaseDocuments],
    };
    mockUseFlags.mockImplementation((keys: string[]) =>
      Object.fromEntries(keys.map((key) => [key, { enabled: false }]))
    );
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'ROLE_SALE', name: 'users/tester' },
    });
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({
        typeSelectorReducer: {
          globalProductSelectorReducer: {
            data: selectorState.globalProduct,
          },
        },
        leadsReducer: {
          createDocumentReducer: { documents: selectorState.documents },
        },
      })
    );
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve({}),
    }));
    mockCreateOrder.mockResolvedValue({ data: { name: 'orders/1' } });
    mockConnectLead.mockResolvedValue({
      data: { name: 'customers/1/leads/1' },
    });
    mockTriggerConnectedLeads.mockResolvedValue({
      data: { customer: { name: 'customers/1' } },
    });
    mockTriggerUsersFromPhone.mockResolvedValue({ data: { customers: [] } });
    mockCreateCustomer.mockResolvedValue({ data: { name: 'customers/new-1' } });
    mockCreatePhone.mockResolvedValue({ data: { name: 'phones/new-1' } });
    mockCreateEmail.mockResolvedValue({ data: { name: 'emails/new-1' } });
    mockUpdateCustomer.mockResolvedValue({ data: {} });
  });

  test('creates order when mapping already exists', async () => {
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockCreateOrder).toHaveBeenCalledWith({
      leadId: 'leads/lead-1',
      form: { includeCustomQuote: true },
    });
    expect(mockShowSuccessSnackbar).toHaveBeenCalledWith(
      'text.createOrderSuccess'
    );
  });

  test('blocks purchase when car lead status is not pending payment', async () => {
    const wrongStatusLead = {
      ...lead,
      status: 'LEAD_STATUS_PROSPECT',
    };
    const { result } = renderHook(() =>
      usePurchaseButton({ lead: wrongStatusLead })
    );

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
      'errors.carPurchaseRequiresPendingPaymentStatus'
    );
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockTriggerConnectedLeads).not.toHaveBeenCalled();
  });

  test('blocks purchase when car lead is missing required uploaded documents', async () => {
    selectorState.documents = [];
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
      'errors.carPurchaseRequiredDocuments'
    );
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockTriggerConnectedLeads).not.toHaveBeenCalled();
  });

  test('stops when validation returns error', async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('invalid')),
    }));
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockTriggerConnectedLeads).not.toHaveBeenCalled();
  });

  test('shows purchase role error when restricted and user not sales', async () => {
    mockUseFlags.mockImplementation((keys: string[]) =>
      Object.fromEntries(keys.map((key) => [key, { enabled: true }]))
    );
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'ROLE_AGENT', name: 'users/tester' },
    });

    const { result } = renderHook(() => usePurchaseButton({ lead }));
    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
      'errors.purchaseBySalesAgentOnly'
    );
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('shows error when create order returns API error', async () => {
    mockCreateOrder.mockResolvedValue({
      error: {
        data: {
          message: 'api-fail',
          details: [],
        },
      },
    });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalled();
  });

  test('maps directly when exactly one customer is found', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({
      data: { leads: [{ phone: '1' }] },
    });
    mockTriggerUsersFromPhone.mockResolvedValue({
      data: { customers: [{ name: 'customers/existing-1' }] },
    });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockConnectLead).toHaveBeenCalledWith({
      customerId: 'customers/existing-1',
      lead: 'leads/lead-1',
    });
    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test('creates and connects new customer when multiple customers match phone (no modal)', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({
      data: { leads: [{ phone: '1' }] },
    });
    mockTriggerUsersFromPhone.mockResolvedValue({
      data: { customers: [{ name: 'c/1' }, { name: 'c/2' }] },
    });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockCreateCustomer).toHaveBeenCalled();
    expect(mockConnectLead).toHaveBeenCalledWith({
      customerId: 'customers/new-1',
      lead: 'leads/lead-1',
    });
    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test('creates and connects customer when none found', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockCreateCustomer).toHaveBeenCalled();
    expect(mockCreatePhone).toHaveBeenCalled();
    expect(mockUpdateCustomer).toHaveBeenCalled();
    expect(mockCreateEmail).toHaveBeenCalled();
    expect(mockConnectLead).toHaveBeenCalledWith({
      customerId: 'customers/new-1',
      lead: 'leads/lead-1',
    });
    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test('shows error when getConnectedLeads fails', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({
      error: { message: 'failed' },
    });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('shows error when user lookup from phone fails', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({
      data: { leads: [{ phone: '1' }] },
    });
    mockTriggerUsersFromPhone.mockResolvedValue({
      error: { message: 'failed' },
    });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('shows error when create customer API fails', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    mockCreateCustomer.mockResolvedValue({ error: { message: 'failed' } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockConnectLead).not.toHaveBeenCalled();
  });

  test('shows error when create phone fails during silent customer creation', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    mockCreatePhone.mockResolvedValue({ error: { message: 'failed' } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockUpdateCustomer).not.toHaveBeenCalled();
    expect(mockConnectLead).not.toHaveBeenCalled();
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('shows error when primary phone resource is missing after create phone', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    mockCreatePhone.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockUpdateCustomer).not.toHaveBeenCalled();
    expect(mockConnectLead).not.toHaveBeenCalled();
  });

  test('shows error when updateCustomer primaryPhoneId fails during silent creation', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    mockUpdateCustomer.mockResolvedValue({ error: { message: 'failed' } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockConnectLead).not.toHaveBeenCalled();
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('still connects and creates order when email creation fails after phone OK', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    mockCreateEmail.mockResolvedValue({ error: { message: 'failed' } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).not.toHaveBeenCalledWith(
      'text.updateLeadFail'
    );
    expect(mockConnectLead).toHaveBeenCalled();
    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test('still creates order when no primary phone exists', async () => {
    const phoneLessLead = {
      ...lead,
      data: { ...lead.data, customerPhoneNumber: [] },
    };
    const { result } = renderHook(() =>
      usePurchaseButton({ lead: phoneLessLead })
    );

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockTriggerConnectedLeads).toHaveBeenCalledWith({
      leadId: 'leads/lead-1',
      currentCustomer: phoneLessLead,
    });
    expect(mockTriggerUsersFromPhone).not.toHaveBeenCalled();
    expect(mockCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateOrder).toHaveBeenCalled();
  });

  test('shows error when customer creation cannot proceed without names', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({ data: { leads: [] } });
    const namelessLead = {
      ...lead,
      data: { ...lead.data, customerFirstName: '' },
    };
    const { result } = renderHook(() =>
      usePurchaseButton({ lead: namelessLead })
    );

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.nameIsMissing');
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  test('shows update error when connect customer fails', async () => {
    mockTriggerConnectedLeads.mockResolvedValue({
      data: { leads: [{ phone: '1' }] },
    });
    mockTriggerUsersFromPhone.mockResolvedValue({
      data: { customers: [{ name: 'customers/existing-1' }] },
    });
    mockConnectLead.mockResolvedValue({ error: { message: 'cannot connect' } });
    const { result } = renderHook(() => usePurchaseButton({ lead }));

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});
