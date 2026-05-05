import _getValue from 'lodash/get';

import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import {
  titleOptions,
  languageOptions,
  genderOptions,
  documentTypeOptions,
} from 'shared/helper/selectOptions';
import { countingAgeToPresent } from 'shared/helper/utilities';
import { format, isValid } from 'utils/datetime';

// Items for policy holder section
const personItems: IFormikControllerProps[] = [
  {
    title: 'qc.customerIsInsuredPerson',
    name: 'customerIsInsuredPerson',
    fieldType: 'textContent',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-customer-is-insured-person',
  },
  {
    title: 'qc.customerIsNotInsuredPerson',
    name: 'customerIsNotInsuredPerson',
    fieldType: 'textContent',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-customer-insured-person',
  },
  {
    title: 'leadDetailFields.title',
    name: 'title',
    fieldType: 'select',
    display: true,
    options: titleOptions,
    dataTestId: 'policy-title',
    placeholder: 'text.select',
  },
  {
    name: 'firstName',
    title: 'text.firstName',
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-first-name',
    placeholder: 'text.enterPlaceholder',
  },
  {
    name: 'lastName',
    title: 'text.lastName',
    placeholder: 'text.enterPlaceholder',
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-last-name',
  },
  {
    name: 'dateOfBirth',
    title: 'leadDetailFields.dob',
    fieldType: 'datefield',
    display: true,
    isDob: true,
    dataTestId: 'policy-dob',
    placeholder: 'text.enterAppointmentDate',
  },
  {
    name: 'age',
    title: 'leadDetailFields.age',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'policy-age',
  },
  {
    title: 'leadDetailFields.documentType',
    name: 'idType',
    fieldType: 'select',
    display: true,
    options: documentTypeOptions,
    dataTestId: 'policy-document-type',
    placeholder: 'text.select',
  },
  {
    title: 'leadDetailFields.documentId',
    name: 'idNumber',
    fieldType: 'text',
    isReadOnly: false,
    display: true,
    dataTestId: 'policy-document-id',
  },
];

const companyItems: IFormikControllerProps[] = [
  {
    name: 'policyCompanyHeader',
    title: 'qc.policyHolderIsCompany',
    fieldType: 'textContent',
    display: true,
    dataTestId: 'policy-company-header',
  },
  {
    name: 'companyName',
    title: 'text.companyName',
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-company-name',
  },
  {
    name: 'taxId',
    title: 'text.taxId',
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-tax-id',
  },
];

const readOnlyPersonItems: IFormikControllerProps[] = [
  {
    title: 'qc.customerIsInsuredPerson',
    name: 'customerIsInsuredPerson',
    fieldType: 'textContent',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-customer-is-insured-person',
  },
  {
    title: 'qc.customerIsNotInsuredPerson',
    name: 'customerIsNotInsuredPerson',
    fieldType: 'textContent',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-customer-insured-person',
  },
  {
    title: 'leadDetailFields.title',
    name: 'title',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-title',
  },
  {
    title: 'text.firstName',
    name: 'firstName',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-first-name',
  },
  {
    title: 'text.lastName',
    name: 'lastName',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-last-name',
  },
  {
    title: 'leadDetailFields.dob',
    name: 'dateOfBirth',
    fieldType: 'datefield',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-dob',
  },
  {
    title: 'leadDetailFields.age',
    name: 'age',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-age',
  },
];

const readOnlyItems: IFormikControllerProps[] = [
  {
    title: 'leadDetailFields.documentType',
    name: 'idType',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-document-type',
  },
  {
    title: 'leadDetailFields.documentId',
    name: 'idNumber',
    fieldType: 'text',
    isReadOnly: true,
    display: true,
    dataTestId: 'policy-document-id',
  },
];

const getAge = (dateOfBirth: Date | string | null | undefined) => {
  if (dateOfBirth) {
    return countingAgeToPresent(
      isValid(new Date(dateOfBirth))
        ? format(new Date(dateOfBirth), 'MM/dd/yyyy')
        : ''
    );
  }
  return '';
};

const getGender = (gender: string | null, isEditable: boolean) => {
  if (gender) {
    const match = genderOptions.find((item) => item.val === gender);
    return isEditable ? _getValue(match, 'val') : _getValue(match, 'title');
  }
  return '';
};

const getDocumentType = (idType: string, isEditable: boolean) => {
  if (isEditable) return idType;
  switch (idType) {
    case 'DrivingLicense':
      return getString('leadDetailFields.drivingLicense');
    case 'NationalID':
      return getString('leadDetailFields.nationalId');
    case 'Passport':
      return getString('leadDetailFields.passport');
    default:
      return idType;
  }
};

const getLanguage = (
  communicationLanguage: string | null,
  isEditable?: boolean
) => {
  if (communicationLanguage) {
    const match = languageOptions.find(
      (item) => item.val === communicationLanguage
    );
    return isEditable ? _getValue(match, 'val') : _getValue(match, 'title');
  }
  return '';
};

export default {
  personItems,
  companyItems,
  readOnlyPersonItems,
  readOnlyItems,
  getAge,
  getGender,
  getLanguage,
  getDocumentType,
};
