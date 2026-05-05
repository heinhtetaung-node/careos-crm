import LanguageStorage from './storage';

export default class LanguageRepository {
  setLanguageStorage = (lang: string) => {
    return LanguageStorage.changeLanguageStorage(lang);
  };
}
