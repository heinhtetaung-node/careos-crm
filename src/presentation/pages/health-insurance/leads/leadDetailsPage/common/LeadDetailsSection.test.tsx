import React from 'react';
import { render, screen } from '@testing-library/react';
import { useFlags } from 'flagsmith/react';
import { MockAccountProductData } from 'mock-data/AccountCurrentProduct.mock';
import { useFetchPolicies } from 'presentation/hooks/useFetchPolicies/useFetchPolicies';
import LeadDetailsSections from './LeadDetailsSection';

jest.mock('presentation/hooks/useFetchPolicies/useFetchPolicies', () => ({
  useFetchPolicies: jest.fn(() => MockAccountProductData),
}));

jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn(() => ({
    'brok-4125_show_account_current_product_section_20251127_temp': {
      enabled: true,
    },
  })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(() => ({
    name: 'leads/test-123',
    source: 'sources/test',
    data: {
      customerFirstName: 'John',
      customerLastName: 'Doe',
      customerPhoneNumber: [{ phone: '+66999999999' }],
      policyHolderNationalId: '1234567890123',
    },
  })),
}));

jest.mock('./component/CustomerSection', () => ({
  __esModule: true,
  default: () => <div data-testid="customer-section">CustomerSection</div>,
}));

jest.mock('./component/Beneficiary', () => ({
  BeneficiarySection: () => (
    <div data-testid="beneficiary-section">BeneficiarySection</div>
  ),
}));

jest.mock('./component/InsuranceSection', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="insurer-info-section">InsurerInfoSection</div>
  ),
}));

jest.mock('presentation/components/ActivitySection', () => ({
  __esModule: true,
  default: () => <div data-testid="activity-section">ActivitySection</div>,
}));

jest.mock('presentation/components/AccountCurrentProductSection', () => ({
  __esModule: true,
  default: ({ haveOrders, data }: any) => (
    <div data-testid="account-current-product-section">
      <span data-testid="have-orders">{String(haveOrders)}</span>
      <span data-testid="data-exists">{String(!!data)}</span>
    </div>
  ),
}));

jest.mock('presentation/components/LeadDetails/LeadHistoricalData', () => ({
  __esModule: true,
  default: () => <div>LeadHistoricalData</div>,
}));

const mockProps = {
  id: 'test-lead-id',
  isPageDisabled: false,
  preferredInsurersList: [],
  isPendingRejection: false,
  isPartiallyDisabled: false,
  getStatus: jest.fn(),
};

describe('LeadDetailsSections - Health Insurance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFetchPolicies hook', () => {
    it('should call useFetchPolicies with lead data', () => {
      render(<LeadDetailsSections {...mockProps} />);

      expect(useFetchPolicies).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'leads/test-123',
          source: 'sources/test',
        })
      );
    });

    it('should pass policies data to AccountCurrentProductSection', () => {
      render(<LeadDetailsSections {...mockProps} />);

      expect(screen.getByTestId('have-orders')).toHaveTextContent('true');
      expect(screen.getByTestId('data-exists')).toHaveTextContent('true');
    });
  });

  describe('Feature flag: BROK_4125_SHOW_ACCOUNT_CURRENT_PRODUCT_SECTION_20251127_TEMP', () => {
    it('should show AccountCurrentProductSection when feature flag is enabled', () => {
      (useFlags as jest.Mock).mockReturnValue({
        'brok-4125_show_account_current_product_section_20251127_temp': {
          enabled: true,
        },
      });

      render(<LeadDetailsSections {...mockProps} />);

      expect(
        screen.getByTestId('account-current-product-section')
      ).toBeInTheDocument();
    });

    it('should hide AccountCurrentProductSection when feature flag is disabled', () => {
      (useFlags as jest.Mock).mockReturnValue({
        'brok-4125_show_account_current_product_section_20251127_temp': {
          enabled: false,
        },
      });

      render(<LeadDetailsSections {...mockProps} />);

      expect(
        screen.queryByTestId('account-current-product-section')
      ).not.toBeInTheDocument();
    });

    it('should request correct feature flag from useFlags', () => {
      render(<LeadDetailsSections {...mockProps} />);

      expect(useFlags).toHaveBeenCalledWith([
        'brok-4125_show_account_current_product_section_20251127_temp',
      ]);
    });
  });
});
