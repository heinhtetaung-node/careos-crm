import * as Yup from 'yup';

import { getString } from '../../presentation/theme/localization';

export default () => {
  return Yup.string()
    .matches(
      /((^(02|03|04|05|07)\d{7}$)|(^(08|09|06)\d{8}$))/g,
      getString('text.validatePhone')
    )
    .trim()
    .required(getString('text.requiredPhone'));
};
