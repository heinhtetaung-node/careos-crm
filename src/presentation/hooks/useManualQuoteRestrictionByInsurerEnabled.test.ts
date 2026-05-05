import { renderHook } from '__tests__/rtl-test-utils';
import FeatureFlags from 'config/flagsmithConfig';
import useManualQuoteRestrictionByInsurerEnabled from './useManualQuoteRestrictionByInsurerEnabled';

let isFlagEnabled = false;

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: () => ({
    [FeatureFlags.BROK_4736_MANUAL_QUOTE_RESTRICTION_BY_INSURER_20260225_TEMP]:
      {
        enabled: isFlagEnabled,
      },
  }),
}));

describe('useManualQuoteRestrictionByInsurerEnabled', () => {
  it('returns false when the feature flag is disabled', () => {
    isFlagEnabled = false;
    const { result } = renderHook(() =>
      useManualQuoteRestrictionByInsurerEnabled()
    );
    expect(result.current).toBe(false);
  });

  it('returns true when the feature flag is enabled', () => {
    isFlagEnabled = true;
    const { result } = renderHook(() =>
      useManualQuoteRestrictionByInsurerEnabled()
    );
    expect(result.current).toBe(true);
  });
});
