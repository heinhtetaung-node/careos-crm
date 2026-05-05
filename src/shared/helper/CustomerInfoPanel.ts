import * as Yup from 'yup';

import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import { validateAge, validateName } from 'shared/validators/InfoPanel';

export const items: IFormikControllerProps[] = [
  {
    name: 'firstName',
    title: 'leadDetailFields.firstName',
    fieldType: 'text',
    display: true,
    dataTestId: 'customer-first-name',
  },
  {
    name: 'lastName',
    title: 'leadDetailFields.lastName',
    fieldType: 'text',
    display: true,
    dataTestId: 'customer-last-name',
  },
  {
    name: 'gender',
    title: 'text.gender',
    fieldType: 'select',
    options: [
      {
        id: 0,
        val: 'F',
        title: 'text.female',
      },
      {
        id: 1,
        val: 'M',
        title: 'text.male',
      },
    ],
    display: true,
    dataTestId: 'customer-gender',
  },
  {
    name: 'dateOfBirth',
    title: 'text.dateOfBirth',
    fieldType: 'datefield',
    isDob: true,
    display: true,
    placeholder: getString('text.dateOfBirth'),
    dataTestId: 'customer-date-of-birth',
  },
  {
    name: 'communicationLanguage',
    title: 'leadDetailFields.communicationLanguage',
    fieldType: 'select',
    options: [
      {
        id: 0,
        val: 'th-th',
        title: 'text.thai',
      },
      {
        id: 1,
        val: 'th-en',
        title: 'text.english',
      },
    ],
    display: true,
    dataTestId: 'customer-communication-language',
  },
];

export const emailPhoneFields: IFormikControllerProps[] = [
  {
    name: 'email',
    title: 'text.email',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-email',
  },
  {
    name: 'phone',
    title: 'text.phone',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-phone',
  },
];

export const readOnlyItems: IFormikControllerProps[] = [
  {
    name: 'firstName',
    title: 'leadDetailFields.firstName',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-first-name',
  },
  {
    name: 'lastName',
    title: 'leadDetailFields.lastName',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-last-name',
  },
  {
    name: 'gender',
    title: 'text.gender',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-gender',
  },
  {
    name: 'dateOfBirth',
    title: 'text.dateOfBirth',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-date-of-birth',
  },
  {
    name: 'communicationLanguage',
    title: 'leadDetailFields.communicationLanguage',
    fieldType: 'text',
    display: true,
    isReadOnly: true,
    dataTestId: 'customer-communication-language',
  },
];

export const validationSchema = Yup.object().shape({
  firstName: validateName(
    getString('leadDetailFields.firstName').toLocaleLowerCase()
  ),
  lastName: validateName(
    getString('leadDetailFields.lastName').toLocaleLowerCase()
  ),
});
