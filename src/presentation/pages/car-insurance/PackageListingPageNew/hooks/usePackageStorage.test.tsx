import { renderHook } from '__tests__/rtl-test-utils';

import usePackageStorage from './usePackageStorage';

var mockState: any;
var mockSetState: jest.Mock;

jest.mock('usehooks-ts', () => {
  mockState = [{ name: 'name/123' }];
  mockSetState = jest.fn();
  return {
    ...jest.requireActual('usehooks-ts'),
    useSessionStorage: jest.fn().mockReturnValue([mockState, mockSetState]),
  };
});

jest.mock('data/slices/packageListing/helper', () => ({
  getMaximumPackageLimit: jest.fn().mockReturnValue(3),
}));

describe('usePackageStorage', () => {
  it('should reset the session storage if called', () => {
    const { result } = renderHook(() => usePackageStorage());
    (result.current as any).resetComparedPackags();
    expect(mockSetState).toHaveBeenCalledWith([]);
  });
  it('should remove package', () => {
    const { result } = renderHook(() => usePackageStorage());
    (result.current as any).removeFromComparison('name/123');
    expect(mockSetState).toHaveBeenCalledWith([]);
  });
  it('should add package', () => {
    const { result } = renderHook(() => usePackageStorage());
    (result.current as any).addToComparison({ name: 'name/456' });
    expect(mockSetState).toHaveBeenCalledWith([
      { name: 'name/123' },
      { name: 'name/456' },
    ]);
  });
  it('should replace last package if already at compare limit', () => {
    mockState.push({ name: 'name/456' }, { name: 'name/789' });
    const { result } = renderHook(() => usePackageStorage());
    (result.current as any).addToComparison({ name: 'name/new' });
    expect(mockSetState).toHaveBeenCalledWith([
      { name: 'name/123' },
      { name: 'name/456' },
      { name: 'name/new' },
    ]);
  });
});
