import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './resources/en';
import th from './resources/th';

import LocalStorage, {
  LOCALSTORAGE_KEY,
} from '../../../shared/helper/LocalStorage';

const localStorage = new LocalStorage();

export enum LANGUAGES {
  ENGLISH = 'en',
  THAI = 'th',
}

export const isValidLanguage = (language: string) => {
  if (language) {
    return Object.values(LANGUAGES).includes(language as LANGUAGES);
  }
  return false;
};

// Get initial language from localStorage if available
const getInitialLanguage = () => {
  try {
    const storedLanguage = localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE);
    return storedLanguage && isValidLanguage(storedLanguage)
      ? storedLanguage
      : 'en';
  } catch {
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: 'en',

  resources: {
    en: {
      translation: en,
    },
    th: {
      translation: th,
    },
  },

  debug: false,

  cache: {
    enabled: true,
  },

  interpolation: {
    escapeValue: false, // not needed for react as it does escape per default to prevent xss!
  },
  react: {
    defaultTransParent: 'div',
    transEmptyNodeValue: '',
    transKeepBasicHtmlNodesFor: ['b'],
  },
});

export const getLanguage = (): string =>
  localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE) || LANGUAGES.ENGLISH;

// Translation key prefixes that show '-' when missing. More prefixes can be added here later.
const fallbackKeys = new Set(['packageListing.values.repairType']);

export const getString = (key: string, params?: any): string => {
  if (!i18n?.isInitialized) {
    return typeof key === 'string' ? key : String(key);
  }

  const storedLanguage = getLanguage();
  const normalizedKey = typeof key === 'string' ? key : String(key);

  const options =
    storedLanguage && i18n.language !== storedLanguage
      ? { lng: storedLanguage }
      : undefined;

  const exists = i18n.exists(normalizedKey, options);

  const shouldFallback = [...fallbackKeys].some((prefix) =>
    normalizedKey.startsWith(`${prefix}.`)
  );

  if (shouldFallback && !exists) {
    return '-';
  }

  return i18n.t(
    normalizedKey,
    options ? { ...params, ...options } : params
  ) as string;
};

export const initialLanguage = () => {
  const language = localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE);
  if (!isValidLanguage(language)) {
    localStorage.setItemByKey(LOCALSTORAGE_KEY.LOCALE, LANGUAGES.ENGLISH);
  }
};

export const getUrlLanguage = () => {
  const splitPathName = window.location.pathname
    .split('/')
    .filter((item) => !!item);
  const localesString = '/:locale(th|en)?';
  if (localesString.match(splitPathName?.[0])) {
    return splitPathName[0];
  }
  return null;
};

export const setLanguageToStorage = () => {
  const language = getUrlLanguage();
  const authPathNameCollection = ['/auth/sign-in', '/auth/404', '/auth/500'];
  const isAuth = authPathNameCollection.find(
    (item) => window.location.pathname.indexOf(item) !== -1
  );
  if (isAuth && language) {
    localStorage.setItemByKey(LOCALSTORAGE_KEY.LOCALE, language);
  }
};

export const changeLanguage = (language: string): Promise<string> => {
  if (isValidLanguage(language)) {
    return i18n.changeLanguage(language).catch((error) => error.toString());
  }
  return Promise.reject();
};

export const checkKeyExist = (key: string) => i18n.exists(key);
