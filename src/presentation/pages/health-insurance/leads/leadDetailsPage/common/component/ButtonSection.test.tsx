// ButtonsSection.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ButtonsSection from './ButtonSection';

// ---- Mocks ----

// keep it simple: our "Controls.Button" renders a native button
jest.mock('presentation/components/controls/Control', () => ({
  __esModule: true,
  default: {
    // eslint-disable-next-line react/display-name
    Button: ({ children, onClick, disabled, ...rest }: any) => (
      <button type="button" onClick={onClick} disabled={disabled} {...rest}>
        {children}
      </button>
    ),
  },
}));

// CommonModal: only render children when open, show title text so we can assert it
jest.mock('presentation/components/modal/CommonModal', () => ({
  __esModule: true,
  default: ({ open, title, children }: any) =>
    open ? (
      <div>
        {title ? <div>{title}</div> : null}
        {children}
      </div>
    ) : null,
}));

// App form modal placeholder
jest.mock(
  'presentation/components/modal/LeadDetailsModal/ApplicationFormModal',
  () => ({
    __esModule: true,
    default: () => <div>APP_FORM_MODAL</div>,
  })
);

// i18n helper: just echo the key
jest.mock('presentation/theme/localization', () => ({
  getString: (k: string) => k,
}));

// router navigate not used in these tests, but component imports it
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// feature flags
const flagsMock: Record<string, { enabled: boolean }> = {};
jest.mock('flagsmith/react', () => ({
  useFlags: (keys: string[]) => {
    const result: Record<string, { enabled: boolean }> = {};
    keys.forEach((k) => {
      result[k] = flagsMock[k] ?? { enabled: false };
    });
    return result;
  },
}));

// flag constants
const ENABLE_APP_FORM_FLAG =
  'BROK_2243_ENABLE_AUTO_FILL_APPLICATION_FORM_HEALTH_20250423';
const ENABLE_PAYMENT_FLOW_FLAG =
  'BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP';

jest.mock('config/flagsmithConfig', () => ({
  __esModule: true,
  default: {
    BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP:
      'BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP',
    BROK_2243_ENABLE_AUTO_FILL_APPLICATION_FORM_HEALTH_20250423:
      'BROK_2243_ENABLE_AUTO_FILL_APPLICATION_FORM_HEALTH_20250423',
  },
}));

// auth query (not relevant here; keep trivial)
jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: () => ({ data: { role: 'agent' } }),
}));

// user role access helper
jest.mock('utils/userRolesAccess', () => ({
  getUserRoleAccessLead: () => ({
    viewSelectedPackage: false,
    canCreatePayment: true,
    canCreateContract: true,
  }),
}));

// lead selector (we control insurance category + name)
const leadBase = {
  name: 'leads/123',
  status: 'LEAD_STATUS_CREATED',
  isRejected: false,
  data: {
    insurance: { category: 'ipdOpd' }, // valid default
    policyHolder: { dob: '1990-01-01' },
    checkout: {},
  },
};
jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: () => leadBase,
}));

// util: id extraction
jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromLeadName: (name: string) => name.split('/')[1] || name,
}));

// selected package (we control insurer id)
let insurerId: string | undefined = 'insurers/7'; // valid default
jest.mock('data/slices/packageListing/api', () => ({
  useGetSelectedPackageQuery: () => ({
    data: {
      healthPackage: {
        package: {
          insurerDetails: { careOsInsurerId: insurerId },
        },
      },
    },
  }),
}));

// package details: presence determines disabled state
let hasPackageDetails = true;
jest.mock('data/slices/customQuoteSlice', () => ({
  useGetCustomPackageByIdQuery: () =>
    hasPackageDetails ? { data: { id: 'pkg1' } } : { data: undefined },
}));

jest.mock('data/slices/transactionSlice', () => ({
  useGetTransactionByIdQuery: () => ({ data: undefined }),
}));
jest.mock('data/slices/errorSlice/leadDetailError', () => ({
  useLeadDetailError: () => ({ errors: {}, setFieldTouch: jest.fn() }),
}));
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: () => ({}),
  useAppDispatch: () => jest.fn(), // Add missing useAppDispatch mock
}));

// Mock missing helper function
jest.mock('../../helper', () => ({
  hasPackageSearchRequiredFields: () => false, // Disable complex validation
}));

// ---- Helpers ----
const renderWithFlag = (flagOn: boolean) => {
  flagsMock[ENABLE_APP_FORM_FLAG] = { enabled: flagOn };
  // Payment flow flag not needed, but set a stable default
  flagsMock[ENABLE_PAYMENT_FLOW_FLAG] = { enabled: false };
  return render(
    <ButtonsSection isFieldDisabled={false} onRequestQuote={() => {}} />
  );
};

describe('ButtonsSection – Application Form button block', () => {
  beforeEach(() => {
    // reset defaults before each test
    hasPackageDetails = true;
    insurerId = 'insurers/7'; // valid insurer
    (leadBase.data.insurance as any).category = 'ipdOpd'; // valid category
  });

  test('renders the button disabled when packageDetails are missing', () => {
    hasPackageDetails = false;
    renderWithFlag(true);

    const btn = screen.getByText('text.createApplicationForm');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('renders the button disabled when insurer is not in allowed list', () => {
    insurerId = 'insurers/999'; // invalid
    renderWithFlag(true);

    const btn = screen.getByText('text.createApplicationForm');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('renders the button disabled when category is not allowed', () => {
    (leadBase.data.insurance as any).category = 'somethingElse'; // invalid
    renderWithFlag(true);

    const btn = screen.getByText('text.createApplicationForm');
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('renders enabled and opens the app form modal on click when all conditions are valid', () => {
    // all defaults are valid
    renderWithFlag(true);

    const btn = screen.getByText('text.createApplicationForm');
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);

    // Modal title appears once isOpenAppForm flips to true
    expect(screen.getByText('text.applicationFormPreview')).toBeInTheDocument();

    // And our placeholder content is shown
    expect(screen.getByText('APP_FORM_MODAL')).toBeInTheDocument();
  });

  test('validates policyHolderNationalId is required for non-company policyHolderType', () => {
    (leadBase.data as any).policyHolderType = 'customer';
    (leadBase.data as any).policyHolderNationalId = ''; // empty national ID

    flagsMock[ENABLE_PAYMENT_FLOW_FLAG] = { enabled: true };

    render(
      <ButtonsSection isFieldDisabled={false} onRequestQuote={() => {}} />
    );

    const contractBtn = screen.getByText('text.createContract');
    expect(contractBtn).toBeInTheDocument();
    expect(contractBtn).toBeDisabled();
  });

  test('validates policyHolderNationalId is optional for company policyHolderType', () => {
    // Set up company policy holder type
    (leadBase.data as any).policyHolderType = 'company';
    (leadBase.data as any).policyHolderNationalId = ''; // empty national ID should be OK for company

    // Add required company fields
    (leadBase.data as any).customerPolicyAddress = [
      {
        addressType: 'company',
        companyName: 'Test Company',
        taxId: '1234567890',
        address: 'Test Address',
        province: 1,
        district: 1,
        subDistrict: 1,
        postCode: 10100,
      },
    ];
    (leadBase.data as any).customerEmail = ['test@company.com'];
    (leadBase.data as any).policyStartDate = '2024-01-01';
    (leadBase.data as any).customerPhoneNumber = [
      { phone: '0812345678', status: 'verified' },
    ];
    (leadBase.data as any).checkout = {
      ...leadBase.data.checkout,
      paymentOption: 'RABBIT_CARE_INSTALLMENT',
    };

    flagsMock[ENABLE_PAYMENT_FLOW_FLAG] = { enabled: true };

    render(
      <ButtonsSection isFieldDisabled={false} onRequestQuote={() => {}} />
    );

    const contractBtn = screen.getByText('text.createContract');
    expect(contractBtn).toBeInTheDocument();
  });
});
