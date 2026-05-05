import { act, renderHook } from '@testing-library/react-hooks';
import { format } from 'date-fns';

import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useUpdateOrderByIdMutation } from 'data/slices/orderSlice';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import {
  getPurchasingPurposeOptions,
  PurchasingPurposes,
} from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { getAgeByDOB } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { POLICYHOLDER_ROWS } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/config';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { HealthLead } from 'shared/types/lead';
import { HEALTH_POLICYHOLDER_ROWS } from '../../config';

import usePolicyHolderInformation from './usePolicyHolderInformation';

// Mock error reducer before any imports that might use it
jest.mock('data/slices/errorSlice/leadDetailError', () => ({
  useLeadDetailError: jest.fn(() => ({ errors: {}, setFieldTouch: jest.fn() })),
  reducer: (state = {}) => state,
  errorSelectorFn: () => ({}),
  actions: {
    setFieldError: jest.fn(),
  },
}));

jest.mock('data/slices/errorSlice/errorsReducer', () => ({
  errorReducer: (state = { leadDetailErrors: {} }) => state,
  errorReducerKey: 'pageErrorReducer',
}));

// Create mock functions that will be used in the orderSlice mock
const mockUpdateOrderByIdFn = jest.fn();
const mockGetOrderByOrderIdFn = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue({
    orders: [
      {
        name: 'orders/456',
        data: {
          policyHolder: {
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
          },
        },
      },
    ],
  }),
}));

jest.mock('data/slices/orderSlice', () => ({
  useUpdateOrderByIdMutation: jest.fn(() => [
    mockUpdateOrderByIdFn,
    { isLoading: false, isError: false },
  ]),
  useLazyGetOrderByLeadIdQuery: jest.fn(() => [
    mockGetOrderByOrderIdFn,
    { isLoading: false, isError: false },
  ]),
}));

// Mock dependencies
jest.mock('presentation/redux/selectors/lead');
jest.mock('presentation/redux/hooks/typedHooks');
jest.mock('presentation/pages/car-insurance/LeadDetailsPage/leadUpdater');
jest.mock('data/slices/orderSlice', () => ({
  useUpdateOrderByIdMutation: jest.fn(() => [
    mockUpdateOrderByIdFn,
    { isLoading: false, isError: false },
  ]),
  useLazyGetOrderByLeadIdQuery: jest.fn(() => [
    mockGetOrderByOrderIdFn,
    { isLoading: false, isError: false },
  ]),
}));
jest.mock('presentation/components/common/FormikFields/SectionRenderer/helper');
jest.mock(
  'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper'
);
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper'
);
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper'
);

jest.mock('../../config', () => {
  const mockConfig = {
    'policyHolder/type': {
      name: 'policyHolder/type',
      patches: {},
    },
    'policyHolder/title': {
      name: 'policyHolder/title',
      patches: {},
    },
    'policyHolder/firstName': {
      name: 'policyHolder/firstName',
      patches: {},
    },
    'policyHolder/lastName': {
      name: 'policyHolder/lastName',
      patches: {},
    },
    'policyHolder/nationalId': {
      name: 'policyHolder/nationalId',
      patches: {},
    },
    'policyHolder/dob': {
      name: 'policyHolder/dob',
      patches: {},
    },
    'policyHolder/age': {
      name: 'policyHolder/age',
      patches: {},
    },
    'policyHolder/passport': {
      name: 'policyHolder/passport',
      patches: {},
    },
    'policyHolder/race': {
      name: 'policyHolder/race',
      patches: {},
    },
    'policyHolder/occupation': {
      name: 'policyHolder/occupation',
      patches: {},
    },
    'policyHolder/locale': {
      name: 'policyHolder/locale',
      patches: {},
    },
    'policyHolder/gender': {
      name: 'policyHolder/gender',
      patches: {},
    },
    'policyHolder/weight': {
      name: 'policyHolder/weight',
      patches: {},
    },
    'policyHolder/height': {
      name: 'policyHolder/height',
      patches: {},
    },
    'policyHolder/jobDescription': {
      name: 'policyHolder/jobDescription',
      patches: {},
    },
  };

  return {
    getPolicyHolderSectionConfig: jest.fn(() => mockConfig),
    HEALTH_POLICYHOLDER_ROWS: {
      policyHolderType: 'policyHolder/type',
      policyHolderTitle: 'policyHolder/title',
      policyHolderFirstName: 'policyHolder/firstName',
      policyHolderLastName: 'policyHolder/lastName',
      policyHolderNationalId: 'policyHolder/nationalId',
      policyHolderDob: 'policyHolder/dob',
      policyHolderAge: 'policyHolder/age',
      policyHolderPassport: 'policyHolder/passport',
      policyHolderRace: 'policyHolder/race',
      policyHolderOccupation: 'policyHolder/occupation',
      policyHolderLocale: 'policyHolder/locale',
      policyHolderGender: 'policyHolder/gender',
      policyHolderWeight: 'policyHolder/weight',
      policyHolderHeight: 'policyHolder/height',
      policyJobDescription: 'policyHolder/jobDescription',
    },
  };
});

const mockUseGetLeadSelector = useGetLeadSelector as jest.MockedFunction<
  typeof useGetLeadSelector
>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;
const mockUseLeadUpdater = useLeadUpdater as jest.MockedFunction<
  typeof useLeadUpdater
>;
const mockUseLeadDetailError = useLeadDetailError as jest.MockedFunction<
  typeof useLeadDetailError
>;
const mockUseUpdateOrderByIdMutation =
  useUpdateOrderByIdMutation as jest.MockedFunction<
    typeof useUpdateOrderByIdMutation
  >;
const mockUpdateOrderById = mockUpdateOrderByIdFn;
const mockSetValuesToDataSchema = setValuesToDataSchema as jest.MockedFunction<
  typeof setValuesToDataSchema
>;
const mockGetOptionData = getOptionData as jest.MockedFunction<
  typeof getOptionData
>;
const mockGetPurchasingPurposeOptions =
  getPurchasingPurposeOptions as jest.MockedFunction<
    typeof getPurchasingPurposeOptions
  >;
const mockGetAgeByDOB = getAgeByDOB as jest.MockedFunction<typeof getAgeByDOB>;

describe('usePolicyHolderInformation', () => {
  const mockUpdateLead = jest.fn();
  const mockSetFieldTouch = jest.fn();

  const baseLead: HealthLead = {
    name: 'leads/123',
    humanId: '123',
    status: 'LEAD_STATUS_CREATED',
    data: {
      policyHolder: {
        type: PurchasingPurposes.customerIsNotPolicyHolder,
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        nationalId: '1234567890123',
        dob: '1990-01-01',
        gender: 'MALE',
        weight: 70,
        height: 175,
        locale: 'th',
        jobDescription: 'Engineer',
      },
      policyHolderRace: 'Thai',
      policyHolderOccupation: 'Engineer',
    },
  } as any;

  const baseOrderDetail = {
    name: 'orders/456',
    data: {
      policyHolder: {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-15',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetLeadSelector.mockReturnValue(baseLead);
    mockUseAppSelector.mockReturnValue(baseOrderDetail);
    mockUseLeadUpdater.mockReturnValue({
      updateLead: mockUpdateLead,
      resetCheckout: jest.fn(),
      jsonUpdater: jest.fn(),
    } as any);
    mockUseLeadDetailError.mockReturnValue({
      errors: {},
      setFieldTouch: mockSetFieldTouch,
    });
    mockUseUpdateOrderByIdMutation.mockReturnValue([
      mockUpdateOrderByIdFn,
      { isLoading: false, isError: false },
    ] as any);
    mockSetValuesToDataSchema.mockImplementation((prev, updates) => {
      const result = { ...prev };
      updates.forEach((update: any) => {
        if (result[update.name]) {
          result[update.name] = {
            ...result[update.name],
            patches: {
              ...result[update.name].patches,
              ...update.patches,
            },
          };
        }
      });
      return result;
    });
    mockGetOptionData.mockReturnValue([
      { value: 'Mr', label: 'Mr' },
      { value: 'Mrs', label: 'Mrs' },
    ]);
    mockGetPurchasingPurposeOptions.mockReturnValue([
      {
        name: PurchasingPurposes.customerIsPolicyHolder,
        value: PurchasingPurposes.customerIsPolicyHolder,
        key: PurchasingPurposes.customerIsPolicyHolder,
      },
      {
        name: PurchasingPurposes.customerIsNotPolicyHolder,
        value: PurchasingPurposes.customerIsNotPolicyHolder,
        key: PurchasingPurposes.customerIsNotPolicyHolder,
      },
    ]);
    mockGetAgeByDOB.mockReturnValue('33');
  });

  describe('Initialization', () => {
    it('should initialize with correct data schema', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      expect(result.current.dataSchema).toBeDefined();
    });

    it('should set correct disabled state when isDisabled is true', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: true,
          isPartiallyDisabled: false,
        })
      );

      const titleField = result.current.dataSchema[
        HEALTH_POLICYHOLDER_ROWS.policyHolderTitle
      ] as any;
      expect(titleField.patches.isDisabled).toBe(true);
    });

    it('should set correct disabled state when isPartiallyDisabled is true', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: true,
          isPartiallyDisabled: true,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];
      expect(titleField.patches.isDisabled).toBe(false);
    });
  });

  describe('Policy Holder Type', () => {
    it('should handle policy holder type change', () => {
      const mockSetPolicyHolderTypeUpdated = jest.fn();
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          setPolicyHolderTypeUpdated: mockSetPolicyHolderTypeUpdated,
        })
      );

      const typeField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderType];

      act(() => {
        typeField.patches.onChange?.(
          {},
          PurchasingPurposes.customerIsPolicyHolder
        );
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderType
      );
      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderTitle
      );
      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderFirstName
      );
      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderLastName
      );
      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderNationalId
      );
      expect(mockSetFieldTouch).toHaveBeenCalledWith('policyHolderRace');
      expect(mockSetFieldTouch).toHaveBeenCalledWith('policyHolderOccupation');
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderType}`,
        PurchasingPurposes.customerIsPolicyHolder
      );
      expect(mockSetPolicyHolderTypeUpdated).toHaveBeenCalledWith(
        PurchasingPurposes.customerIsPolicyHolder
      );
    });

    it('should filter out companyIsPolicyHolder option', () => {
      mockGetPurchasingPurposeOptions.mockReturnValue([
        {
          name: PurchasingPurposes.customerIsPolicyHolder,
          value: PurchasingPurposes.customerIsPolicyHolder,
          key: PurchasingPurposes.customerIsPolicyHolder,
        },
        {
          name: PurchasingPurposes.companyIsPolicyHolder,
          value: PurchasingPurposes.companyIsPolicyHolder,
          key: PurchasingPurposes.companyIsPolicyHolder,
        },
      ]);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const typeField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderType];
      expect(typeField.patches.options).not.toContainEqual(
        expect.objectContaining({
          value: PurchasingPurposes.companyIsPolicyHolder,
        })
      );
    });
  });

  describe('Title Field', () => {
    it('should handle title update', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];

      await act(async () => {
        await titleField.patches.handleUpdate?.({
          selections: { value: 'Mr' },
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderTitle
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderTitle}`,
        'Mr'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            policyHolder: {
              firstName: 'Jane',
              lastName: 'Smith',
              dateOfBirth: '1985-05-15',
              title: 'Mr',
            },
          },
        },
      });
    });
  });

  describe('Name Fields', () => {
    it('should handle first name update', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];

      await act(async () => {
        await firstNameField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName]: 'Jane',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderFirstName
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName}`,
        'Jane'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            policyHolder: {
              firstName: 'Jane',
              lastName: 'Smith',
              dateOfBirth: '1985-05-15',
            },
          },
        },
      });
    });

    it('should handle last name update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      act(() => {
        lastNameField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderLastName]: 'Smith',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderLastName
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderLastName}`,
        'Smith'
      );
    });

    it('should disable name fields when isDisabled and not isPartiallyDisabled', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: true,
          isPartiallyDisabled: false,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(firstNameField.patches.isDisabled).toBe(true);
      expect(lastNameField.patches.isDisabled).toBe(true);
    });

    it('should disable name fields when isHealthOrder and customerIsPolicyHolder', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          isHealthOrder: true,
          customerIsPolicyHolder: true,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(firstNameField.patches.isDisabled).toBe(true);
      expect(lastNameField.patches.isDisabled).toBe(true);
    });

    it('should show pen icon when isHealthOrder and name is not disabled', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          isHealthOrder: true,
          customerIsPolicyHolder: false,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(firstNameField.patches.showPenIcon).toBe(true);
      expect(lastNameField.patches.showPenIcon).toBe(true);
    });
  });

  describe('National ID Field', () => {
    it('should handle national ID update', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const nationalIdField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId
        ];

      await act(async () => {
        await nationalIdField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId]: '9876543210987',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderNationalId
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId}`,
        '9876543210987'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            ...baseOrderDetail.data,
            idNumber: '9876543210987',
          },
        },
      });
    });

    it('should merge latest order data when updating national ID', async () => {
      const latestOrderData = {
        policyHolder: {
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1985-05-15',
        },
        docsShipmentMethod: 'Courier',
      };
      mockGetOrderByOrderIdFn.mockReturnValueOnce({
        unwrap: jest.fn().mockResolvedValue({
          orders: [
            {
              name: 'orders/456',
              data: latestOrderData,
            },
          ],
        }),
      });

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const nationalIdField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId
        ];

      await act(async () => {
        await nationalIdField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId]: '9876543210987',
        });
      });

      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            ...latestOrderData,
            idNumber: '9876543210987',
          },
        },
      });
    });

    it('should show pen icon when isHealthOrder and not disabled', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          isHealthOrder: true,
        })
      );

      const nationalIdField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId
        ];

      expect(nationalIdField.patches.showPenIcon).toBe(true);
    });
  });

  describe('Date of Birth Field', () => {
    it('should handle DOB update with add operation', async () => {
      const testDate = new Date('1990-01-01');
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const dobField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderDob];

      await act(async () => {
        await dobField.patches.onChangeDate?.(testDate);
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderDob
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderDob}`,
        format(testDate, 'yyyy-MM-dd'),
        'add'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            policyHolder: {
              firstName: 'Jane',
              lastName: 'Smith',
              dateOfBirth: format(testDate, 'yyyy-MM-dd'),
            },
          },
        },
      });
    });

    it('should handle DOB removal with remove operation', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const dobField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderDob];

      act(() => {
        dobField.patches.onChangeDate?.(null);
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderDob}`,
        '',
        'remove'
      );
    });

    it('should disable DOB when isDisabled is true', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: true,
          isPartiallyDisabled: false,
        })
      );

      const dobField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderDob];

      expect(dobField.patches.isDisabled).toBe(true);
    });

    it('should disable DOB when isHealthOrder and customerIsPolicyHolder', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          isHealthOrder: true,
          customerIsPolicyHolder: true,
        })
      );

      const dobField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderDob];

      expect(dobField.patches.isDisabled).toBe(true);
    });
  });

  describe('Passport Field', () => {
    it('should handle passport update', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const passportField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderPassport
        ];

      await act(async () => {
        await passportField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderPassport]: 'AB123456',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith(
        POLICYHOLDER_ROWS.policyHolderPassport
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderPassport}`,
        'AB123456'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            ...baseOrderDetail.data,
            idNumber: 'AB123456',
          },
        },
      });
    });

    it('should disable passport when isDisabled and not isPartiallyDisabled', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: true,
          isPartiallyDisabled: false,
        })
      );

      const passportField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderPassport
        ];

      expect(passportField.patches.isDisabled).toBe(true);
    });
  });

  describe('Race Field', () => {
    it('should handle race update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const raceField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderRace];

      act(() => {
        raceField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderRace]: 'Chinese',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith('policyHolderRace');
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderRace}`,
        'Chinese'
      );
      expect(mockUpdateOrderById).not.toHaveBeenCalled();
    });
  });

  describe('Occupation Field', () => {
    it('should handle occupation update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const occupationField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation
        ];

      act(() => {
        occupationField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation]: 'Doctor',
        });
      });

      expect(mockSetFieldTouch).toHaveBeenCalledWith('policyHolderOccupation');
      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation}`,
        'Doctor'
      );
      expect(mockUpdateOrderById).not.toHaveBeenCalled();
    });
  });

  describe('Locale Field', () => {
    it('should handle locale change', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const localeField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderLocale];

      act(() => {
        localeField.patches.handleChange?.({
          target: { value: 'en' },
        });
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderLocale}`,
        'en'
      );
    });
  });

  describe('Gender Field', () => {
    it('should handle gender update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const genderField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderGender];

      act(() => {
        genderField.patches.handleUpdate?.({
          selections: { value: 'FEMALE' },
        });
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderGender}`,
        'FEMALE'
      );
    });
  });

  describe('Weight Field', () => {
    it('should handle weight update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const weightField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderWeight];

      act(() => {
        weightField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderWeight]: '75',
        });
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderWeight}`,
        75
      );
    });
  });

  describe('Height Field', () => {
    it('should handle height update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const heightField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderHeight];

      act(() => {
        heightField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderHeight]: '180',
        });
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyHolderHeight}`,
        180
      );
    });
  });

  describe('Job Description Field', () => {
    it('should handle job description update', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const jobDescriptionField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyJobDescription
        ];

      act(() => {
        jobDescriptionField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyJobDescription]: 'Software Engineer',
        });
      });

      expect(mockUpdateLead).toHaveBeenCalledWith(
        `/${HEALTH_POLICYHOLDER_ROWS.policyJobDescription}`,
        'Software Engineer'
      );
    });
  });

  describe('Order Update Logic', () => {
    it('should update order when orderId exists', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];

      await act(async () => {
        await titleField.patches.handleUpdate?.({
          selections: { value: 'Mrs' },
        });
      });

      expect(mockUpdateOrderById).toHaveBeenCalled();
    });

    it('uses latest order data for nested order fields', async () => {
      mockGetOrderByOrderIdFn.mockReturnValueOnce({
        unwrap: jest.fn().mockResolvedValue({
          data: {},
          orders: [
            {
              name: 'orders/456',
              data: {
                policyHolder: {
                  firstName: 'Latest',
                  lastName: 'Order',
                  dateOfBirth: '2000-01-01',
                },
              },
            },
          ],
        }),
      });

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];

      await act(async () => {
        await titleField.patches.handleUpdate?.({
          selections: { value: 'Ms' },
        });
      });

      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            policyHolder: {
              firstName: 'Latest',
              lastName: 'Order',
              dateOfBirth: '2000-01-01',
              title: 'Ms',
            },
          },
        },
      });
    });

    it('should not update order when orderId does not exist', () => {
      mockUseAppSelector.mockReturnValue({
        name: 'orders',
        data: {},
      });

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];

      act(() => {
        titleField.patches.handleUpdate?.({
          selections: { value: 'Mrs' },
        });
      });

      expect(mockUpdateOrderById).not.toHaveBeenCalled();
    });

    it('should handle nested order field updates', async () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];

      await act(async () => {
        await firstNameField.patches.handleUpdate?.({
          [HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName]: 'Updated',
        });
      });

      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: '456',
        payload: {
          data: {
            policyHolder: {
              firstName: 'Updated',
              lastName: 'Smith',
              dateOfBirth: '1985-05-15',
            },
          },
        },
      });
    });
  });

  describe('Data Loading from Lead Schema', () => {
    it('should load values from lead data', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const typeField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderType];
      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(typeField.patches.value).toBe(
        PurchasingPurposes.customerIsNotPolicyHolder
      );
      expect(firstNameField.patches.value).toBe('John');
      expect(lastNameField.patches.value).toBe('Doe');
    });

    it('should use order data when isHealthOrder is true', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
          isHealthOrder: true,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(firstNameField.patches.value).toBe('Jane');
      expect(lastNameField.patches.value).toBe('Smith');
    });

    it('should calculate age from DOB', () => {
      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const ageField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderAge];

      expect(mockGetAgeByDOB).toHaveBeenCalledWith('1990-01-01');
      expect(ageField.patches.value).toBe('33');
    });

    it('should show empty age when DOB is empty', () => {
      const leadWithoutDob = {
        ...baseLead,
        data: {
          ...baseLead.data,
          policyHolder: {
            ...baseLead.data.policyHolder,
            dob: '',
          },
        },
      };
      mockUseGetLeadSelector.mockReturnValue(leadWithoutDob);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const ageField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderAge];

      expect(ageField.patches.value).toBe('');
    });

    it('should load error messages from errors', () => {
      mockUseLeadDetailError.mockReturnValue({
        errors: {
          policyHolderType: 'Type is required',
          policyTitle: 'Title is required',
          policyHolderFirstName: 'First name is required',
        },
        setFieldTouch: mockSetFieldTouch,
      });

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const typeField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderType];
      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];
      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];

      expect(typeField.patches.error).toBe('Type is required');
      expect(titleField.patches.error).toBe('Title is required');
      expect(firstNameField.patches.error).toBe('First name is required');
    });
  });

  describe('Customer is Policy Holder Scenarios', () => {
    it('should set isReadOnly when customer is policy holder', () => {
      const leadWithCustomerAsPolicyHolder = {
        ...baseLead,
        data: {
          ...baseLead.data,
          policyHolder: {
            ...baseLead.data.policyHolder,
            type: PurchasingPurposes.customerIsPolicyHolder,
          },
        },
      };
      mockUseGetLeadSelector.mockReturnValue(leadWithCustomerAsPolicyHolder);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const titleField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderTitle];
      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      const lastNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderLastName
        ];

      expect(titleField.patches.isReadOnly).toBe(true);
      expect(firstNameField.patches.isReadOnly).toBe(true);
      expect(lastNameField.patches.isReadOnly).toBe(true);
    });

    it('should hide DOB when customer is policy holder', () => {
      const leadWithCustomerAsPolicyHolder = {
        ...baseLead,
        data: {
          ...baseLead.data,
          policyHolder: {
            ...baseLead.data.policyHolder,
            type: PurchasingPurposes.customerIsPolicyHolder,
          },
        },
      };
      mockUseGetLeadSelector.mockReturnValue(leadWithCustomerAsPolicyHolder);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const dobField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderDob];

      expect(dobField.patches.hidden).toBe(true);
    });

    it('should set isReadOnly for age when customer is policy holder', () => {
      const leadWithCustomerAsPolicyHolder = {
        ...baseLead,
        data: {
          ...baseLead.data,
          policyHolder: {
            ...baseLead.data.policyHolder,
            type: PurchasingPurposes.customerIsPolicyHolder,
          },
        },
      };
      mockUseGetLeadSelector.mockReturnValue(leadWithCustomerAsPolicyHolder);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const ageField =
        result.current.dataSchema[HEALTH_POLICYHOLDER_ROWS.policyHolderAge];

      expect(ageField.patches.isReadOnly).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing order detail data', () => {
      mockUseAppSelector.mockReturnValue(null);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      expect(result.current.dataSchema).toBeDefined();
    });

    it('should handle missing lead data', () => {
      mockUseGetLeadSelector.mockReturnValue({
        name: 'leads/123',
        data: {},
      } as any);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      expect(result.current.dataSchema).toBeDefined();
    });

    it('should handle null values gracefully', () => {
      const leadWithNulls = {
        ...baseLead,
        data: {
          ...baseLead.data,
          policyHolder: {
            ...baseLead.data.policyHolder,
            firstName: null,
            lastName: null,
            dob: null,
          },
        },
      };
      mockUseGetLeadSelector.mockReturnValue(leadWithNulls);

      const { result } = renderHook(() =>
        usePolicyHolderInformation({
          isDisabled: false,
          isPartiallyDisabled: false,
        })
      );

      const firstNameField =
        result.current.dataSchema[
          HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName
        ];
      expect(firstNameField.patches.value).toBe('');
    });
  });
});
