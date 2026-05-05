import { act, renderHook } from '@testing-library/react-hooks';
import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import { InsurerSectionUpdateKeys } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';
import { HEALTH_INSURER_ROWS } from '../../config';
import useInsurerInfo from './useInsurerInfo';

jest.mock('presentation/redux/selectors/lead');
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);
jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    showErrorSnackbar: jest.fn(),
    showSuccessSnackbar: jest.fn(),
  })),
}));
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((k: string) => k),
}));
jest.mock('data/slices/deliveryOptionSlice', () => ({
  useGetDeliveryOptionsQuery: jest.fn(() => ({ data: null })),
}));
jest.mock('data/slices/packageListing/api', () => ({
  useGetSelectedPackageQuery: jest.fn(() => ({ data: null })),
}));
jest.mock('shared/helper/selectOptions', () => ({
  yesNoOptions: ['Yes', 'No'],
}));
jest.mock('data/slices/errorSlice/leadDetailError', () => ({
  useLeadDetailError: jest.fn(() => ({ errors: {}, setFieldTouch: jest.fn() })),
}));
jest.mock('./useUpdateUnderwriting', () => ({
  useUpdateUnderwritingStatus: jest.fn(() => ({
    updateStatus: jest.fn(),
    status: '',
    isOrder: false,
    isSuccess: false,
    isError: false,
  })),
}));
jest.mock('../../helper', () => ({
  getDeliveryOptionName: (n: string) => n,
  UnderwritingStatusOption: () => [],
}));
jest.mock('../../../PackageListingPage/filterConfig', () => ({
  getProductCategoryAndPlan: () => ({
    subCategory: [],
    types: [],
    coverages: [],
  }),
  productCategory: () => [
    { id: 'ipd', value: 'ipd', title: 'IPD' },
    { id: 'ipdOpd', value: 'ipdOpd', title: 'IPD/OPD' },
  ],
}));
jest.mock(
  'presentation/components/common/FormikFields/SectionRenderer/helper',
  () => ({
    setValuesToDataSchema: (prev: any, updates: any[]) => {
      if (!updates || !Array.isArray(updates) || !prev) return prev;
      updates.forEach((u) => {
        const target = prev[u.name];
        if (target) {
          target.patches = { ...(target.patches || {}), ...u.patches };
        }
      });
      return prev;
    },
  })
);

const mockUseGetLeadSelector = useGetLeadSelector as jest.MockedFunction<
  typeof useGetLeadSelector
>;
const mockUseLeadUpdater = useLeadUpdater as unknown as jest.MockedFunction<
  typeof useLeadUpdater
>;
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;
const mockGetString = getString as jest.MockedFunction<typeof getString>;
const mockUseGetDeliveryOptionsQuery =
  useGetDeliveryOptionsQuery as unknown as jest.MockedFunction<
    typeof useGetDeliveryOptionsQuery
  >;
const mockUseGetSelectedPackageQuery =
  useGetSelectedPackageQuery as unknown as jest.MockedFunction<
    typeof useGetSelectedPackageQuery
  >;
const mockUseLeadDetailError =
  useLeadDetailError as unknown as jest.MockedFunction<
    typeof useLeadDetailError
  >;

describe('useInsurerInfo - insurer info interactions', () => {
  const jsonUpdater = jest.fn();
  const updateLead = jest.fn();
  const showErrorSnackbar = jest.fn();
  const showSuccessSnackbar = jest.fn();

  const baseLead = {
    name: 'leads/123',
    status: 'LEAD_STATUS_CREATED',
    data: {
      checkout: {},
      insurance: {},
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockUseGetLeadSelector.mockReturnValue(baseLead);
    (mockUseLeadUpdater as any).mockReturnValue({ updateLead, jsonUpdater });
    mockUseSnackbar.mockReturnValue({
      showErrorSnackbar,
      showSuccessSnackbar,
    } as any);
    mockGetString.mockImplementation((k: string) => k);
    (mockUseGetDeliveryOptionsQuery as any).mockReturnValue({ data: null });
    (mockUseGetSelectedPackageQuery as any).mockReturnValue({ data: null });
    (mockUseLeadDetailError as any).mockReturnValue({
      errors: {},
      setFieldTouch: jest.fn(),
    });
  });

  it('updates category and removes dependent fields, shows success on ok response', async () => {
    const leadWithDeps = {
      ...baseLead,
      data: {
        ...baseLead.data,
        insurance: {
          category: 'ipd',
          subCategory: 'plan-a',
          type: 'type-a',
          coverages: ['cov1'],
        },
      },
    } as any;
    mockUseGetLeadSelector.mockReturnValue(leadWithDeps);
    jsonUpdater.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() =>
      useInsurerInfo([{ id: '1', title: 'Insurer 1' }], jest.fn(), false)
    );

    const categoryField =
      result.current.dataSchema[HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY];
    expect(categoryField).toBeTruthy();

    await act(async () => {
      await categoryField.patches.handleUpdate({
        selections: { value: 'ipdOpd' },
      });
    });

    expect(jsonUpdater).toHaveBeenCalledTimes(1);
    expect(jsonUpdater).toHaveBeenCalledWith([
      {
        path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
        value: 'ipdOpd',
        op: 'add',
      },
      {
        path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY,
        op: 'remove',
      },
      { path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE, op: 'remove' },
      { path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES, op: 'remove' },
    ]);
    expect(showErrorSnackbar).not.toHaveBeenCalled();
    expect(showSuccessSnackbar).toHaveBeenCalledWith('text.updateLeadSuccess');
  });

  it('shows error snackbar if category update fails', async () => {
    const leadWithDeps = {
      ...baseLead,
      data: {
        ...baseLead.data,
        insurance: {
          subCategory: 'plan-a',
          type: 'type-a',
          coverages: ['cov1'],
        },
      },
    } as any;
    mockUseGetLeadSelector.mockReturnValue(leadWithDeps);
    jsonUpdater.mockResolvedValueOnce({ error: 'failed' });

    const { result } = renderHook(() => useInsurerInfo([], jest.fn(), false));

    const categoryField =
      result.current.dataSchema[HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY];

    await act(async () => {
      await categoryField.patches.handleUpdate({
        selections: { value: 'ipd' },
      });
    });

    expect(jsonUpdater).toHaveBeenCalled();
    expect(showErrorSnackbar).toHaveBeenCalledWith('text.updateLeadFail');
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('removes currentInsurer when value is 0', () => {
    const { result } = renderHook(() => useInsurerInfo([], jest.fn(), false));

    const currentInsurerField =
      result.current.dataSchema[HEALTH_INSURER_ROWS.CURRENT_INSURER];

    act(() => {
      currentInsurerField.patches.handleUpdate({
        name: InsurerSectionUpdateKeys.currentInsurer.replace('/', ''),
        selections: { value: 0 },
      });
    });

    expect(updateLead).toHaveBeenCalledWith(
      InsurerSectionUpdateKeys.currentInsurer,
      undefined,
      'remove'
    );
  });

  it('updates preferredInsurer when value is non-zero', () => {
    const { result } = renderHook(() => useInsurerInfo([], jest.fn(), false));

    const preferredInsurerField =
      result.current.dataSchema[HEALTH_INSURER_ROWS.PREFERRED_INSURER];

    act(() => {
      preferredInsurerField.patches.handleUpdate({
        name: InsurerSectionUpdateKeys.preferredInsurer.replace('/', ''),
        selections: { value: 'insurers/1' },
      });
    });

    expect(updateLead).toHaveBeenCalledWith(
      InsurerSectionUpdateKeys.preferredInsurer,
      'insurers/1'
    );
  });
});
