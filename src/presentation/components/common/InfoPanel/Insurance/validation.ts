import { format, isValid } from 'date-fns';
import * as Yup from 'yup';

import { getString } from 'presentation/theme/localization';

export default Yup.object().shape({
  policyDate: Yup.string()
    .transform((value: string) => {
      const date = isValid(new Date(value))
        ? format(new Date(value), 'dd/MM/yyyy')
        : null;
      // check to see if the previous transform already parsed the date
      if (!date) {
        return new Yup.ValidationError(
          'ErrorOnDateValidation',
          getString('errors.requiredDate'),
          ''
        );
      }
      return date;
    })
    .typeError(getString('errors.requiredDate'))
    .required(getString('errors.requiredDate')),
  adjustedPremium: Yup.string()
    .trim()
    .required(getString('errors.invalidValue'))
    .max(13, getString('errors.invalidValue')),
  policyNumber: Yup.string().trim().required(getString('errors.invalidValue')),
  applicationNumber: Yup.string().trim(),
});
