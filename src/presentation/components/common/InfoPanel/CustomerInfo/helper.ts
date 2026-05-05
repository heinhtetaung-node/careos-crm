import { getString } from 'presentation/theme/localization';

export const genderConvert = (genderKey: string) => {
  return genderKey === 'M' ? getString('text.male') : getString('text.female');
};

export const languageConvert = (lang = 'th-th') => {
  return lang === 'th-th' ? getString('text.thai') : getString('text.english');
};
