import * as Yup from 'yup';

import { getString } from 'presentation/theme/localization';

export const validateEmailWithoutSpecialChars = () =>
  Yup.string()
    .email(getString('text.invalidEmail2'))
    .trim()
    .test(
      'Validate non-ASCII chars',
      getString('text.invalidEmail2'),
      (email) => {
        if (!email) return false;
        const nonASCIIChars = /[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/g;
        return !nonASCIIChars.test(email);
      }
    );

export default validateEmailWithoutSpecialChars;
