import { object, string, number } from 'yup';

import { getString } from 'presentation/theme/localization';
import { validNameRegex } from 'shared/validators/name';

import { AddressType } from './helper';

const nameSchema = (required: boolean) => {
  if (required) {
    return string()
      .required(getString('errors.requiredField'))
      .max(40, getString('errors.exceedCharacters', { maxLength: 40 }));
  }

  return string().max(
    40,
    getString('errors.exceedCharacters', { maxLength: 40 })
  );
};

export const validationSchemaInfo = (isNameRequired: boolean) =>
  object().shape({
    addressType: string().required(
      getString('errors.required', { field: 'Address type' })
    ),
    firstName: string()
      .matches(validNameRegex, getString('errors.invalidValue'))
      .when('addressType', {
        is: (value: AddressType) => value === AddressType.COMPANY,
        then: () => string().notRequired(),
        otherwise: () => nameSchema(isNameRequired),
      }),
    lastName: string()
      .matches(validNameRegex, getString('errors.invalidValue'))
      .max(40, getString('errors.exceedCharacters'))
      .when('addressType', {
        is: AddressType.COMPANY,
        then: () => string().notRequired(),
        otherwise: () => nameSchema(isNameRequired),
      }),
    companyName: string().when('addressType', {
      is: AddressType.COMPANY,
      then: () => string().required(getString('errors.requiredField')).trim(),
      otherwise: () => string().notRequired(),
    }),
    taxId: string().when('addressType', {
      is: AddressType.COMPANY,
      then: () => string().required(getString('errors.requiredField')).trim(),
      otherwise: () => string().notRequired(),
    }),
    address: string()
      .required(getString('errors.required', { field: 'Address' }))
      .trim(),
    province: number().required(
      getString('errors.required', { field: 'Province' })
    ),
    district: number().required(
      getString('errors.required', { field: 'District' })
    ),
    subDistrict: number().required(
      getString('errors.required', { field: 'Sub District' })
    ),
    postCode: number().required(
      getString('errors.required', { field: 'Postcode' })
    ),
  });

/*
  const policy = validationSchemaInfo();
  const shipping = validationSchemaInfo();
  const billing = validationSchemaInfo();
*/

export const validationSchema = (isNameRequired = true) =>
  object().shape({
    policy: validationSchemaInfo(isNameRequired),
    shipping: object().when('shipmentAddressIsSame', {
      is: false,
      then: () => validationSchemaInfo(isNameRequired),
    }),
    billing: object().when('billingAddressIsSame', {
      is: false,
      then: () => validationSchemaInfo(isNameRequired),
    }),
  });
