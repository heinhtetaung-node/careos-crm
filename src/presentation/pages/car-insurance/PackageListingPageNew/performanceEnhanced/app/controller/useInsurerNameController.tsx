import { useCallback, useMemo } from 'react';
import _keyBy from 'lodash/keyBy';
import { getI18n } from 'react-i18next';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

/**
 * Provides a localized insurer name resolver based on insurer id.
 * @returns Object containing `getInsurerName` to resolve insurer display names.
 */
function useInsurerNameController() {
  const listInsurer = useAppSelector(
    (state) =>
      state.leadsDetailReducer?.getListInsurerReducer?.data?.listInsurer
  );

  /**
   * Memoized map of insurer data keyed by `insurers/{id}` for efficient lookup.
   * Recomputes only when the list of insurers changes.
   * @returns Record mapping `insurers/{id}` to insurer details.
   */
  const insurersMap = useMemo(() => {
    const insurersForNameMap = listInsurer?.insurers ?? [];
    if (!insurersForNameMap.length) return {};
    return _keyBy(insurersForNameMap, 'name');
  }, [listInsurer?.insurers]);

  const language = getI18n()?.language || 'en';

  /**
   * Resolves the display name of an insurer given its ID, with localization support.
   * Falls back to a generic name if insurer details are missing.
   * @param insurerId The ID of the insurer to resolve.
   * @returns The localized display name of the insurer or a fallback string.
   */
  const getInsurerName = useCallback(
    (insurerId: string): string => {
      const insurerKey = `insurers/${insurerId}`;
      const insurer = (insurersMap as any)[insurerKey];
      return language === 'th'
        ? insurer?.shortnameTh || insurer?.shortnameEn || `Insurer ${insurerId}`
        : insurer?.shortnameEn || `Insurer ${insurerId}`;
    },
    [insurersMap, language]
  );

  return {
    getInsurerName,
    isLoading: listInsurer?.insurers?.length === undefined,
  };
}

export default useInsurerNameController;
