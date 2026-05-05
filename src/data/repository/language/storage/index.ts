import { TokenType } from 'data/constants';
import StorageGateway from 'data/gateway/storage';

const changeLanguageStorage = (lang: string) => {
  return StorageGateway.doUpdate(TokenType.Locale, lang);
};

export default {
  changeLanguageStorage,
};
