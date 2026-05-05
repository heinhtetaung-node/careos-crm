import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

/**
 * Custom hook to get the manual quote restriction by insurer flag status.
 * @returns {boolean} isManualQuoteRestrictionByInsurerEnabled
 */
export default function useManualQuoteRestrictionByInsurerEnabled(): boolean {
  const featureFlags = useFlags([
    FeatureFlags.BROK_4736_MANUAL_QUOTE_RESTRICTION_BY_INSURER_20260225_TEMP,
  ]);
  return (
    featureFlags[
      FeatureFlags.BROK_4736_MANUAL_QUOTE_RESTRICTION_BY_INSURER_20260225_TEMP
    ]?.enabled ?? false
  );
}
