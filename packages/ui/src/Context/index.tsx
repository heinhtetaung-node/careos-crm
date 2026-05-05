/* eslint-disable react-hooks/exhaustive-deps */
import type { i18n } from 'i18next';
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';

import en from 'translations/en';
import th from 'translations/th';

const initialContextData = {
  t: (str: string) => str,
};

export const Context = createContext(initialContextData);

interface Props {
  i18nInstance?: i18n;
}

/* Improvement
 * Create own I18n provider if i18nInstance is empty
 */
function UIContext({ children, i18nInstance }: PropsWithChildren<Props>) {
  useEffect(() => {
    i18nInstance?.addResourceBundle('en', 'alphafoundersUi', en);
    i18nInstance?.addResourceBundle('th', 'alphafoundersUi', th);
  }, []);

  const translate = useMemo(
    () => ({
      t: (str: string) =>
        i18nInstance ? i18nInstance.t(`alphafoundersUi:${str}`) : str,
    }),
    []
  );

  return <Context.Provider value={translate}>{children}</Context.Provider>;
}

export default UIContext;
