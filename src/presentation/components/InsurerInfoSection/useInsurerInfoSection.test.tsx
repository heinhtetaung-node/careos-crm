import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import { INSURER_ROWS } from './config';
import useInsurerInfoSection from './useInsurerInfoSection';

import FeatureFlags from 'config/flagsmithConfig';

const mockUpdateLead = jest.fn();
const capturedPatchBatches: any[] = [];

jest.mock('data/slices/deliveryOptionSlice', () => ({
  useGetDeliveryOptionsQuery: jest.fn(() => ({ data: undefined })),
}));

jest.mock('data/slices/errorSlice/leadDetailError', () => ({
  useLeadDetailError: jest.fn(() => ({
    errors: {},
    setFieldTouch: jest.fn(),
  })),
}));

jest.mock('data/slices/packageListing/api', () => ({
  useGetSelectedPackageQuery: jest.fn(() => ({ data: undefined })),
}));

jest.mock('presentation/pages/car-insurance/LeadDetailsPage/leadUpdater', () =>
  jest.fn(() => ({
    updateLead: mockUpdateLead,
  }))
);

jest.mock(
  'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper',
  () => ({
    insurerTypeOptions: [],
  })
);

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(() => ({
    name: 'leads/test-lead',
    type: 'LEAD_TYPE_NEW',
    annotations: {},
    data: {
      insuranceKind: 'voluntary',
      voluntaryInsuranceType: [],
      policyStartDate: '',
      compulsoryPolicyStartDate: '',
      checkout: {},
    },
  })),
}));

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() => ({
    [FeatureFlags.BROK_5710_SHOW_CURRENT_POLICY_EXPIRY_DATE_CAR_LEAD_DETAIL_20260429_TEMP]:
      { enabled: true },
  })),
}));

jest.mock('../common/FormikFields/SectionRenderer/helper', () => ({
  setValuesToDataSchema: jest.fn((prev: any, patches: any[]) => {
    capturedPatchBatches.push(patches);
    return prev;
  }),
}));

describe('useInsurerInfoSection expiry date patch', () => {
  beforeEach(() => {
    mockUpdateLead.mockClear();
    capturedPatchBatches.length = 0;
  });

  const getExpiryOnChangeDate = async () => {
    renderHook(() => useInsurerInfoSection([], false, false));

    await waitFor(() => {
      expect(capturedPatchBatches.length).toBeGreaterThan(0);
    });

    const expiryPatch = capturedPatchBatches
      .flat()
      .find((patch: any) => patch.name === INSURER_ROWS.EXPIRY_DATE);

    expect(expiryPatch?.patches?.onChangeDate).toBeDefined();
    return expiryPatch.patches.onChangeDate as (value: unknown) => void;
  };

  it('removes policyExpiryDate when date is empty/invalid', async () => {
    const onChangeDate = await getExpiryOnChangeDate();

    onChangeDate(null);

    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/policyExpiryDate',
      undefined,
      'remove'
    );
  });

  it('updates policyExpiryDate when date is valid', async () => {
    const onChangeDate = await getExpiryOnChangeDate();

    onChangeDate(new Date('2026-04-27T00:00:00.000Z'));

    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/policyExpiryDate',
      '2026-04-27'
    );
  });
});
