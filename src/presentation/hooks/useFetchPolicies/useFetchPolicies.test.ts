import { renderHook, waitFor } from '@testing-library/react';
import { useLazyGetAccountPoliciesQuery } from 'data/slices/policySlice';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import type { Lead } from 'shared/types/lead';
import type { AccountCurrentProductData } from 'shared/types/policy';
import { useFetchPolicies } from './useFetchPolicies';

jest.mock('data/slices/policySlice');

describe('useFetchPolicies', () => {
  const mockGetAccountPolicies = jest.fn();
  const mockUnwrap = jest.fn();
  const mockPoliciesResponse: AccountCurrentProductData = {
    insuranceProducts: [
      {
        product: 'motor',
        productLabel: 'Motor Insurance',
        policies: [
          {
            orderItemHumanId: 'POL-001',
            packageInfo: {
              insuranceType: 'motor',
              expirationDate: '2025-01-01',
            },
            insurerInfo: { insurerName: 'Test Insurer' },
          },
        ],
      },
    ],
  };

  const createMockLead = (overrides?: Partial<Lead['data']>): Lead =>
    ({
      data: {
        customerPhoneNumber: [{ phone: '+66812345678', status: 'verified' }],
        policyHolderNationalId: '1234567890123',
        policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
        customerPolicyAddress: [],
        ...overrides,
      },
    }) as Lead;

  beforeEach(() => {
    jest.clearAllMocks();
    (useLazyGetAccountPoliciesQuery as jest.Mock).mockReturnValue([
      mockGetAccountPolicies,
    ]);
    mockGetAccountPolicies.mockReturnValue({ unwrap: mockUnwrap });
    mockUnwrap.mockResolvedValue(mockPoliciesResponse);
  });

  it('should fetch and set policies data successfully', async () => {
    const { result } = renderHook(() => useFetchPolicies(createMockLead()));

    await waitFor(() => {
      expect(mockGetAccountPolicies).toHaveBeenCalledWith({
        phoneNumber: '66812345678',
        idNumber: '1234567890123',
        taxId: '',
      });
      expect(result.current).toEqual(mockPoliciesResponse);
    });
  });

  it('should handle API errors gracefully', async () => {
    mockUnwrap.mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useFetchPolicies(createMockLead()));

    await waitFor(() => expect(mockGetAccountPolicies).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  describe('early returns', () => {
    it('should not call API when lead.data is missing', () => {
      renderHook(() => useFetchPolicies(null));
      renderHook(() => useFetchPolicies({ data: null } as any));
      expect(mockGetAccountPolicies).not.toHaveBeenCalled();
    });

    it('should not call API when all identifiers are empty', () => {
      renderHook(() =>
        useFetchPolicies(
          createMockLead({
            customerPhoneNumber: [],
            policyHolderNationalId: undefined,
          })
        )
      );
      expect(mockGetAccountPolicies).not.toHaveBeenCalled();
    });
  });

  describe('company policy holder', () => {
    it('should extract taxId from customerPolicyAddress', async () => {
      renderHook(() =>
        useFetchPolicies(
          createMockLead({
            policyHolderType: PurchasingPurposes.companyIsPolicyHolder,
            customerPolicyAddress: [{ taxId: '0123456789012' } as any],
          })
        )
      );

      await waitFor(() =>
        expect(mockGetAccountPolicies).toHaveBeenCalledWith({
          phoneNumber: '66812345678',
          idNumber: '',
          taxId: '0123456789012',
        })
      );
    });

    it('should NOT call API when taxId is not provided for company', async () => {
      renderHook(() =>
        useFetchPolicies(
          createMockLead({
            policyHolderType: PurchasingPurposes.companyIsPolicyHolder,
            customerPolicyAddress: [],
          })
        )
      );

      await waitFor(() =>
        expect(mockGetAccountPolicies).not.toHaveBeenCalled()
      );
    });
  });

  describe('individual policy holder', () => {
    it('should use nationalId', async () => {
      renderHook(() =>
        useFetchPolicies(
          createMockLead({ policyHolderNationalId: '9876543210987' })
        )
      );

      await waitFor(() =>
        expect(mockGetAccountPolicies).toHaveBeenCalledWith(
          expect.objectContaining({ idNumber: '9876543210987', taxId: '' })
        )
      );
    });

    it('should NOT call API when nationalId is not provided for individual', async () => {
      renderHook(() =>
        useFetchPolicies(createMockLead({ policyHolderNationalId: undefined }))
      );

      await waitFor(() =>
        expect(mockGetAccountPolicies).not.toHaveBeenCalled()
      );
    });
  });

  describe('single identifier cases', () => {
    it.each([
      [
        'idNumber',
        { customerPhoneNumber: [], policyHolderNationalId: '1111111111111' },
        { phoneNumber: '', idNumber: '1111111111111', taxId: '' },
      ],
      [
        'taxId',
        {
          customerPhoneNumber: [],
          policyHolderType: PurchasingPurposes.companyIsPolicyHolder,
          customerPolicyAddress: [{ taxId: '5555555555555' } as any],
        },
        { phoneNumber: '', idNumber: '', taxId: '5555555555555' },
      ],
    ])(
      'should call API when only %s exists',
      async (_, overrides, expected) => {
        renderHook(() => useFetchPolicies(createMockLead(overrides as any)));
        await waitFor(() =>
          expect(mockGetAccountPolicies).toHaveBeenCalledWith(expected)
        );
      }
    );

    it('should NOT call API when only phoneNumber exists without nationalId', async () => {
      renderHook(() =>
        useFetchPolicies(
          createMockLead({
            customerPhoneNumber: [
              { phone: '+66999999999', status: 'verified' },
            ],
            policyHolderNationalId: undefined,
          } as any)
        )
      );
      await waitFor(() =>
        expect(mockGetAccountPolicies).not.toHaveBeenCalled()
      );
    });
  });
});
