import { validateMotorPolicyHolderName } from '@careos/utils';

import { getString } from 'presentation/theme/localization';

export const isValidNameInput = (value: string) => {
  const result = validateMotorPolicyHolderName(value);
  if (!result.isValid) {
    if (result.errorCode === 'max') {
      return getString('errors.exceedCharacters', {
        maxLength: result.params?.max,
      });
    }
    return getString('errors.invalidData');
  }
  return '';
};

export const isValidNationalId = (value: string) => {
  if (!value.match(/^[0-9A-Za-z\u0E00-\u0E7F-]+$/g)) {
    return getString('errors.invalidID');
  }

  if (value.length < 5) {
    return getString('errors.minCharacters', { minLength: 5 });
  }

  if (value.length > 13) {
    return getString('errors.exceedCharacters', { maxLength: 13 });
  }

  return '';
};
