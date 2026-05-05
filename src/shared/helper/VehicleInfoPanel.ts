import * as Yup from 'yup';

import { fields, readOnlyFields } from './vehicle.config';
import {
  validateAge,
  validateLicense,
  validateAlphaNumericalsRequired,
  validateName,
} from 'shared/validators/InfoPanel';

export const items = fields;

export const readOnlyItems = readOnlyFields;

export const validationSchema = Yup.object().shape({
  carLicensePlate: validateLicense(),
  chassisNumber: validateAlphaNumericalsRequired(17, 'chassis number'),
  engineNumber: validateAlphaNumericalsRequired(17, 'engine number'),
  firstDriverName: validateName(),
  firstDriverDOB: validateAge(),
  secondDriverName: validateName(),
  secondDriverDOB: validateAge(),
});
