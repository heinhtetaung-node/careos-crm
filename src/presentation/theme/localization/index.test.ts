import i18n from 'i18next';
import { getI18n } from 'react-i18next';

import LocalStorage, {
  LOCALSTORAGE_KEY,
} from '../../../shared/helper/LocalStorage';
import {
  LANGUAGES,
  isValidLanguage,
  getLanguage,
  getString,
  initialLanguage,
  getUrlLanguage,
  setLanguageToStorage,
  changeLanguage,
  checkKeyExist,
} from './index';

// Unmock the localization module to test it directly
jest.unmock('presentation/theme/localization');

jest.mock('i18next', () => {
  const mockI18n = {
    isInitialized: true,
    language: 'en',
    changeLanguage: jest.fn().mockResolvedValue('en'),
    t: jest.fn((key: string, options?: any) => {
      if (options?.lng) {
        return `${options.lng}:${key}`;
      }
      return `en:${key}`;
    }),
    exists: jest.fn((key: string) => key.includes('test')),
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockI18n,
  };
});

jest.mock('react-i18next', () => {
  const mockI18n = {
    isInitialized: true,
    language: 'en',
    changeLanguage: jest.fn().mockResolvedValue('en'),
    t: jest.fn((key: string, options?: any) => {
      if (options?.lng) {
        return `${options.lng}:${key}`;
      }
      return `en:${key}`;
    }),
    exists: jest.fn((key: string) => key.includes('test')),
  };
  return {
    __esModule: true,
    getI18n: jest.fn(() => mockI18n),
    initReactI18next: jest.fn(),
  };
});

const mockStorage: any = {};

jest.mock('../../../shared/helper/LocalStorage', () => {
  const storage: any = {};
  const mockGetItemByKey = jest.fn((key: string) => storage[key] || null);
  const mockSetItemByKey = jest.fn((key: string, value: string) => {
    storage[key] = value;
  });
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getItemByKey: mockGetItemByKey,
      setItemByKey: mockSetItemByKey,
    })),
    LOCALSTORAGE_KEY: {
      LOCALE: 'LOCALE',
    },
  };
});

describe('localization/index.ts', () => {
  let mockLocalStorage: LocalStorage;
  let originalLocation: Location;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock storage by clearing the object
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

    mockLocalStorage = new LocalStorage();
    originalLocation = window.location;

    // Reset i18n mocks
    (i18n.isInitialized as any) = true;
    (i18n.language as any) = 'en';
    (i18n.t as unknown as jest.Mock).mockImplementation(
      (key: string, options?: any) => {
        if (options?.lng) {
          return `${options.lng}:${key}`;
        }
        return `${i18n.language}:${key}`;
      }
    );
    (i18n.changeLanguage as jest.Mock).mockResolvedValue('en');
    (i18n.exists as jest.Mock).mockImplementation((key: string) =>
      key.includes('test')
    );

    // Reset getI18n mock
    (getI18n as jest.Mock).mockReturnValue({
      isInitialized: true,
      language: 'en',
      t: jest.fn((key: string, options?: any) => {
        if (options?.lng) {
          return `${options.lng}:${key}`;
        }
        return `en:${key}`;
      }),
      changeLanguage: jest.fn().mockResolvedValue('en'),
      exists: jest.fn((key: string) => key.includes('test')),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    // Clear mock storage
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  describe('LANGUAGES enum', () => {
    it('should have ENGLISH and THAI values', () => {
      expect(LANGUAGES.ENGLISH).toBe('en');
      expect(LANGUAGES.THAI).toBe('th');
    });
  });

  describe('isValidLanguage', () => {
    it('should return true for valid languages', () => {
      expect(isValidLanguage('en')).toBe(true);
      expect(isValidLanguage('th')).toBe(true);
    });

    it('should return false for invalid languages', () => {
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidLanguage(null as any)).toBe(false);
      expect(isValidLanguage(undefined as any)).toBe(false);
    });
  });

  describe('getLanguage', () => {
    it('should return language from localStorage', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('th');
      expect(getLanguage()).toBe('th');
      expect(mockLocalStorage.getItemByKey).toHaveBeenCalledWith('LOCALE');
    });

    it('should return ENGLISH as default when localStorage is empty', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue(null);
      expect(getLanguage()).toBe(LANGUAGES.ENGLISH);
    });

    it('should return ENGLISH as default when localStorage returns empty string', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('');
      expect(getLanguage()).toBe(LANGUAGES.ENGLISH);
    });
  });

  describe('getString', () => {
    it('should return translated string when i18n is initialized and language matches', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('en');
      (i18n.language as any) = 'en';
      (i18n.t as unknown as jest.Mock).mockReturnValue('en:test.key');

      const result = getString('test.key');
      expect(result).toBe('en:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', undefined);
    });

    it('should use lng option when i18n language does not match stored language', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('th');
      (i18n.language as any) = 'en';
      (i18n.t as unknown as jest.Mock).mockReturnValue('th:test.key');

      const result = getString('test.key');
      expect(result).toBe('th:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', { lng: 'th' });
    });

    it('should merge params with lng option when language mismatch', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('th');
      (i18n.language as any) = 'en';
      (i18n.t as unknown as jest.Mock).mockReturnValue('th:test.key');

      const result = getString('test.key', { count: 5 });
      expect(result).toBe('th:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', { count: 5, lng: 'th' });
    });

    it('should return key when i18n is not initialized', () => {
      (i18n.isInitialized as any) = false;
      const result = getString('test.key');
      expect(result).toBe('test.key');
      expect(i18n.t).not.toHaveBeenCalled();
    });

    it('should handle params correctly when language matches', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('en');
      (i18n.language as any) = 'en';
      (i18n.t as unknown as jest.Mock).mockReturnValue('en:test.key');

      const result = getString('test.key', { name: 'John' });
      expect(result).toBe('en:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', { name: 'John' });
    });

    it('should handle Thai language correctly', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('th');
      (i18n.language as any) = 'th';
      (i18n.t as unknown as jest.Mock).mockReturnValue('th:test.key');

      const result = getString('test.key');
      expect(result).toBe('th:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', undefined);
    });

    it('should handle empty params object', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('en');
      (i18n.language as any) = 'en';
      (i18n.t as unknown as jest.Mock).mockReturnValue('en:test.key');

      const result = getString('test.key', {});
      expect(result).toBe('en:test.key');
      expect(i18n.t).toHaveBeenCalledWith('test.key', {});
    });

    it('should return "-" for missing repair type translation', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('en');
      (i18n.language as any) = 'en';
      (i18n.exists as jest.Mock).mockReturnValue(false);

      const result = getString(
        'packageListing.values.repairType.CAR_REPAIR_TYPES_UNSPECIFIED'
      );

      expect(result).toBe('-');
      expect(i18n.t).not.toHaveBeenCalled();
    });
  });

  describe('initialLanguage', () => {
    it('should set ENGLISH as default when localStorage has invalid language', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('invalid');
      initialLanguage();
      expect(mockLocalStorage.setItemByKey).toHaveBeenCalledWith(
        LOCALSTORAGE_KEY.LOCALE,
        LANGUAGES.ENGLISH
      );
    });

    it('should set ENGLISH as default when localStorage is empty', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue(null);
      initialLanguage();
      expect(mockLocalStorage.setItemByKey).toHaveBeenCalledWith(
        LOCALSTORAGE_KEY.LOCALE,
        LANGUAGES.ENGLISH
      );
    });

    it('should not set language when localStorage has valid language', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('th');
      initialLanguage();
      expect(mockLocalStorage.setItemByKey).not.toHaveBeenCalled();
    });

    it('should not set language when localStorage has ENGLISH', () => {
      (mockLocalStorage.getItemByKey as jest.Mock).mockReturnValue('en');
      initialLanguage();
      expect(mockLocalStorage.setItemByKey).not.toHaveBeenCalled();
    });
  });

  describe('getUrlLanguage', () => {
    it('should return "th" when pathname starts with /th', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/th/some/path' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBe('th');
    });

    it('should return "en" when pathname starts with /en', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/en/some/path' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBe('en');
    });

    it('should return null when pathname does not start with locale', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/some/path' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBeNull();
    });

    it('should return null when pathname is root', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
        configurable: true,
      });
      const result = getUrlLanguage();
      // getUrlLanguage filters out empty strings, so '/' becomes [] and returns null
      expect(result).toBeFalsy();
    });

    it('should return null when pathname has other locale', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/fr/some/path' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBeNull();
    });

    it('should return "th" when pathname is exactly /th', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/th' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBe('th');
    });

    it('should return "en" when pathname is exactly /en', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/en' },
        writable: true,
        configurable: true,
      });
      expect(getUrlLanguage()).toBe('en');
    });
  });

  describe('setLanguageToStorage', () => {
    it('should set language to storage when on /auth/sign-in with /th locale', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/th/auth/sign-in' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).toHaveBeenCalledWith(
        LOCALSTORAGE_KEY.LOCALE,
        'th'
      );
    });

    it('should set language to storage when on /auth/404 with /en locale', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/en/auth/404' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).toHaveBeenCalledWith(
        LOCALSTORAGE_KEY.LOCALE,
        'en'
      );
    });

    it('should not set language when not on auth page', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/health/leads' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).not.toHaveBeenCalled();
    });

    it('should not set language when getUrlLanguage returns null', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/auth/sign-in' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).not.toHaveBeenCalled();
    });

    it('should handle /auth/500 path with locale', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/en/auth/500' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).toHaveBeenCalledWith(
        LOCALSTORAGE_KEY.LOCALE,
        'en'
      );
    });

    it('should handle /auth/sign-in without locale prefix', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/auth/sign-in' },
        writable: true,
        configurable: true,
      });

      setLanguageToStorage();
      expect(mockLocalStorage.setItemByKey).not.toHaveBeenCalled();
    });
  });

  describe('changeLanguage', () => {
    it('should change language successfully for valid language', async () => {
      (i18n.changeLanguage as jest.Mock).mockResolvedValue('th');
      const result = await changeLanguage('th');
      expect(result).toBe('th');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('th');
    });

    it('should change language successfully for ENGLISH', async () => {
      (i18n.changeLanguage as jest.Mock).mockResolvedValue('en');
      const result = await changeLanguage('en');
      expect(result).toBe('en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('should reject for invalid language', async () => {
      let rejected = false;
      try {
        await changeLanguage('fr');
      } catch {
        rejected = true;
      }
      expect(rejected).toBe(true);
      expect(i18n.changeLanguage).not.toHaveBeenCalled();
    });

    it('should reject for empty string', async () => {
      let rejected = false;
      try {
        await changeLanguage('');
      } catch {
        rejected = true;
      }
      expect(rejected).toBe(true);
      expect(i18n.changeLanguage).not.toHaveBeenCalled();
    });

    it('should handle error and return error string', async () => {
      const error = new Error('Change language failed');
      (i18n.changeLanguage as jest.Mock).mockRejectedValue(error);
      const result = await changeLanguage('th');
      expect(result).toBe('Error: Change language failed');
    });

    it('should handle error with string message', async () => {
      (i18n.changeLanguage as jest.Mock).mockRejectedValue('Network error');
      const result = await changeLanguage('th');
      expect(result).toBe('Network error');
    });
  });

  describe('checkKeyExist', () => {
    it('should return true when key exists', () => {
      (i18n.exists as jest.Mock).mockReturnValue(true);
      expect(checkKeyExist('test.key')).toBe(true);
      expect(i18n.exists).toHaveBeenCalledWith('test.key');
    });

    it('should return false when key does not exist', () => {
      (i18n.exists as jest.Mock).mockReturnValue(false);
      expect(checkKeyExist('nonexistent.key')).toBe(false);
      expect(i18n.exists).toHaveBeenCalledWith('nonexistent.key');
    });
  });
});
