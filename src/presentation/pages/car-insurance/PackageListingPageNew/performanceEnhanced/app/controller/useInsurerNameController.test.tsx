import { renderHook } from '@testing-library/react';
import useInsurerNameController from './useInsurerNameController';

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: (selector) =>
    selector({
      leadsDetailReducer: {
        getListInsurerReducer: {
          data: {
            listInsurer: {
              insurers: [
                {
                  name: 'insurers/insurer-1',
                  shortnameEn: 'Insurer One',
                  shortnameTh: 'บริษัทหนึ่ง',
                },
                {
                  name: 'insurers/insurer-2',
                  shortnameEn: 'Insurer Two',
                  shortnameTh: 'บริษัทสอง',
                },
              ],
            },
          },
        },
      },
    }),
}));

let mockLanguage = 'en';
jest.mock('react-i18next', () => ({
  getI18n: () => ({ language: mockLanguage }),
}));

describe('useInsurerNameController', () => {
  beforeEach(() => {
    mockLanguage = 'en';
  });

  it('returns getInsurerName function', () => {
    const { result } = renderHook(() => useInsurerNameController());
    expect(result.current).toHaveProperty('getInsurerName');
    expect(typeof result.current.getInsurerName).toBe('function');
  });

  it('getInsurerName returns shortnameEn when language is en', () => {
    mockLanguage = 'en';
    const { result } = renderHook(() => useInsurerNameController());
    expect(result.current.getInsurerName('insurer-1')).toBe('Insurer One');
    expect(result.current.getInsurerName('insurer-2')).toBe('Insurer Two');
  });

  it('getInsurerName returns shortnameTh when language is th', () => {
    mockLanguage = 'th';
    const { result } = renderHook(() => useInsurerNameController());
    expect(result.current.getInsurerName('insurer-1')).toBe('บริษัทหนึ่ง');
    expect(result.current.getInsurerName('insurer-2')).toBe('บริษัทสอง');
  });

  it('getInsurerName returns fallback when insurer not in map', () => {
    const { result } = renderHook(() => useInsurerNameController());
    expect(result.current.getInsurerName('unknown-id')).toBe(
      'Insurer unknown-id'
    );
  });

  it('getInsurerName prefers shortnameTh when language is th and both exist', () => {
    mockLanguage = 'th';
    const { result } = renderHook(() => useInsurerNameController());
    expect(result.current.getInsurerName('insurer-1')).toBe('บริษัทหนึ่ง');
  });
});
