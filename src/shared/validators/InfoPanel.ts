import { isMatch, format, parse, isValid, differenceInYears } from 'date-fns';
import * as Yup from 'yup';

import { getString } from 'presentation/theme/localization';

export const formatDate = (value?: string) => {
  if (!value) return '';
  if (
    isMatch(value, 'dd/MM/yyyy') ||
    isMatch(value, 'dd-MM-yyyy') ||
    isMatch(value, 'yyyy-MM-dd') ||
    isMatch(value, 'yyyy/MM/dd')
  ) {
    if (isValid(new Date(value))) {
      return format(new Date(value), 'yyyy-MM-dd');
    }
    return format(
      new Date(parse(value, 'dd/MM/yyyy', new Date())),
      'yyyy-MM-dd'
    );
  }
  return '';
};

export const validateName = (invalidValueField = '', maxLength = 255) =>
  Yup.string()
    .matches(/^[A-Za-z\u0E00-\u0E7F. ]*$/, getString('errors.invalidValue'))
    .trim()
    .max(maxLength, getString('errors.exceedCharacters', { maxLength }))
    .required(
      getString('errors.invalidValueField', { field: invalidValueField })
    );

export const validateShippingName = (invalidValueField = '', maxLength = 255) =>
  Yup.string()
    .matches(
      /^[A-Za-z\u0E00-\u0E7F ]*$/,
      getString('errors.invalidFieldValue', { field: invalidValueField })
    )
    .trim()
    .max(maxLength, getString('errors.exceedCharacters', { maxLength }))
    .required(
      getString('errors.invalidFieldValue', { field: invalidValueField })
    );

export const validateLicense = () =>
  Yup.string()
    .required(getString('errors.requiredFormField'))
    .test('Validate License', getString('errors.invalidValue'), (value) => {
      const regex = /^[a-zA-Z\u0E00-\u0E7F0-9]{1,3}-[0-9]{1,4}$/;
      return regex.test(String(value?.split(' ')[0]).toLowerCase());
    })
    .trim();

export const validateAlphaNumericals = (
  maxLength = 255,
  invalidValueField = ''
) =>
  Yup.string()
    .matches(
      /^[a-zA-Z0-9]+$/g,
      getString('errors.invalidValueField', { field: invalidValueField })
    )
    .trim()
    .max(maxLength, getString('errors.exceedCharacters', { maxLength }));

export const validateAlphaNumericalsRequired = (
  maxLength = 255,
  invalidValueField = ''
) =>
  Yup.string()
    .required(getString('errors.requiredFormField'))
    .matches(
      /^[a-zA-Z0-9]+$/g,
      getString('errors.invalidValueField', { field: invalidValueField })
    )
    .trim()
    .max(maxLength, getString('errors.exceedCharacters', { maxLength }));

export const validateAge = () =>
  Yup.string()
    .required(getString('errors.requiredDate'))
    .test('DOB', getString('errors.invalidAgeUnder'), (value) => {
      const dateFormat = formatDate(value);
      if (dateFormat === '') return false;
      return differenceInYears(new Date(), new Date(dateFormat)) >= 18;
    })
    .test('DOB', getString('errors.invalidAgeOver'), (value) => {
      const dateFormat = formatDate(value);
      if (dateFormat === '') return false;
      return differenceInYears(new Date(), new Date(dateFormat)) <= 100;
    });

export const validatePhoneNumber = (
  requiredErrMsg = 'errorMessage.inputInvalid'
) =>
  Yup.string()
    .matches(
      /((^(02)\d{7,8}$)|(^(08|09|06)\d{8}$))/g,
      getString('errors.invalidValue')
    )
    .trim()
    .required(getString(requiredErrMsg))
    .max(10);

// Validation schema for policy holder section
// TODO: move text transform to component level
export const personalValidation = Yup.object().shape({
  title: Yup.string().required(getString('errorMessage.selectInvalid')),
  firstName: validateName(getString('text.firstName').toLocaleLowerCase()),
  lastName: validateName(getString('text.lastName').toLocaleLowerCase()),
  dateOfBirth: validateAge(),
  idNumber: Yup.string().required(
    getString('errors.invalidValueField', {
      field: getString('leadDetailFields.documentId').toLocaleLowerCase(),
    })
  ),
});

export const companyValidation = Yup.object().shape({
  companyName: Yup.string().required(getString('errors.requiredFormField')),
  taxId: Yup.string().required(
    getString('errors.invalidValueField', {
      field: getString('leadDetailFields.tax').toLocaleLowerCase(),
    })
  ),
});

// Validation schema for shipping info section
export const validationShippingPerson = Yup.object().shape({
  address: Yup.string().when(['province', 'district', 'subDistrict'], {
    is: (province: any, district: any, subDistrict: any) =>
      !province && !district && !subDistrict,
    then: (schema) =>
      schema.required(
        'Please select Province, District and Sub-district first!'
      ),
    otherwise: () =>
      Yup.string().required(
        getString('errors.invalidFieldValue', {
          field: getString('text.address').toLocaleLowerCase(),
        })
      ),
  }),
  province: Yup.string().required(getString('errorMessage.selectInvalid')),
  district: Yup.string().required(getString('errorMessage.selectInvalid')),
});

export const validationShippingCompany = Yup.object().shape({
  address: Yup.string().required(
    getString('errors.invalidFieldValue', {
      field: getString('text.address').toLocaleLowerCase(),
    })
  ),
  province: Yup.string().required(getString('errorMessage.selectInvalid')),
  district: Yup.string().required(getString('errorMessage.selectInvalid')),
  subDistrict: Yup.string().required(getString('errorMessage.selectInvalid')),
});
