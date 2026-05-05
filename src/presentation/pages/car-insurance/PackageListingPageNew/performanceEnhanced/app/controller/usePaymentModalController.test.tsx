import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePaymentModalController } from './usePaymentModalController';

const mockDispatch = jest.fn();
const mockSelectPackage = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('data/slices/packageListing/api', () => ({
  useSelectPackageMutation: () => [mockSelectPackage],
}));

jest.mock('presentation/redux/actions/leadDetail/getLeadByName', () => ({
  getLead: jest.fn(() => ({ type: 'getLead' })),
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageCard',
  () => ({
    __esModule: true,
    // Using a string element avoids out-of-scope references in mock factory.
    default: 'div',
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    isPackageSelected: jest.fn(() => false),
  })
);

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

describe('usePaymentModalController', () => {
  const defaultArgs = {
    refetchCustomPackage: jest.fn().mockResolvedValue(undefined),
    showErrorSnackbar: jest.fn(),
    setExpendedPackage: jest.fn(),
    selectedPackage: null,
    packagesForComparison: [],
    filterValues: {},
    addForComparison: jest.fn(),
    removeFromComparison: jest.fn(),
    expendedPackage: '',
    lead: { data: { insuranceKind: 'voluntary' } },
    voluntryInsuranceTypes: ['type1'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectPackage.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('returns expected shape', () => {
    const { result } = renderHook(() => usePaymentModalController(defaultArgs));

    expect(result.current).toHaveProperty('openedPackages');
    expect(result.current).toHaveProperty('setOpenedPackages');
    expect(result.current).toHaveProperty('handleCloseModal');
    expect(result.current).toHaveProperty('handleSelectPackage');
    expect(result.current).toHaveProperty('handleOpenPackage');
    expect(result.current).toHaveProperty('renderPackageCard');
    expect(result.current).toHaveProperty('modalProps');
    expect(result.current.modalProps).toMatchObject({
      show: false,
      openedPackage: [],
      handleCloseModal: expect.any(Function),
      setOpenedPackage: expect.any(Function),
      renderPackageCard: expect.any(Function),
    });
  });

  it('modalProps.show is false when no package opened', () => {
    const { result } = renderHook(() => usePaymentModalController(defaultArgs));
    expect(result.current.modalProps.show).toBe(false);
  });

  it('handleCloseModal clears openedPackage', async () => {
    const { result } = renderHook(() => usePaymentModalController(defaultArgs));

    await act(async () => {
      result.current.handleOpenPackage({ id: 'pkg-1', name: 'packages/pkg-1' });
    });
    expect(result.current.modalProps.show).toBe(true);
    expect(result.current.modalProps.openedPackage).toHaveLength(1);

    act(() => {
      result.current.handleCloseModal();
    });
    expect(result.current.modalProps.openedPackage).toHaveLength(0);
    expect(result.current.modalProps.show).toBe(false);
  });

  it('handleOpenPackage adds to openedPackage when valid', async () => {
    const setExpendedPackage = jest.fn();
    const { result } = renderHook(() =>
      usePaymentModalController({ ...defaultArgs, setExpendedPackage })
    );

    await act(async () => {
      result.current.handleOpenPackage({ id: 'pkg-1', name: 'packages/pkg-1' });
    });

    expect(setExpendedPackage).toHaveBeenCalledWith('pkg-1');
    expect(result.current.modalProps.openedPackage).toHaveLength(1);
    expect(result.current.modalProps.openedPackage[0]).toEqual({
      id: 'pkg-1',
      name: 'packages/pkg-1',
    });
    expect(result.current.modalProps.show).toBe(true);
  });

  it('handleOpenPackage shows error and does not open when voluntry types empty, not mandatory, and not custom package', async () => {
    const { getString } = require('presentation/theme/localization');
    const showErrorSnackbar = jest.fn();
    const { result } = renderHook(() =>
      usePaymentModalController({
        ...defaultArgs,
        voluntryInsuranceTypes: [],
        lead: { data: { insuranceKind: 'voluntary' } },
        showErrorSnackbar,
      })
    );

    await act(async () => {
      result.current.handleOpenPackage({ id: 'pkg-1', name: 'packages/pkg-1' });
    });

    expect(showErrorSnackbar).toHaveBeenCalledWith(
      getString('newPackageListing.selectInsuranceType')
    );
    expect(result.current.modalProps.openedPackage).toHaveLength(0);
    expect(result.current.modalProps.show).toBe(false);
  });

  it('handleOpenPackage opens when name starts with customPackages even if voluntry types empty', async () => {
    const showErrorSnackbar = jest.fn();
    const { result } = renderHook(() =>
      usePaymentModalController({
        ...defaultArgs,
        voluntryInsuranceTypes: [],
        lead: { data: { insuranceKind: 'voluntary' } },
        showErrorSnackbar,
      })
    );

    await act(async () => {
      result.current.handleOpenPackage({
        id: 'cp-1',
        name: 'customPackages/some',
      });
    });

    expect(showErrorSnackbar).not.toHaveBeenCalled();
    expect(result.current.modalProps.openedPackage).toHaveLength(1);
    expect(result.current.modalProps.openedPackage[0].name).toBe(
      'customPackages/some'
    );
  });

  it('renderPackageCard returns a React element', () => {
    const { result } = renderHook(() => usePaymentModalController(defaultArgs));
    const el = result.current.renderPackageCard({ id: 'pkg-1', name: 'pkg-1' });
    expect(React.isValidElement(el)).toBe(true);
  });
});
