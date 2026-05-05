import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';
import FormikRadioField from 'presentation/components/common/FormikFields/FormikRadioField';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import AutoComplete from 'presentation/components/common/FormikFields/LeadAutocomplete';
import { constructConfig } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import { getString } from 'presentation/theme/localization';
import { isValidNameInput } from 'utils/customerInfo';

import { getDOBError } from '../helper';

export enum CUSTOMER_ROWS {
  firstName = 'customerFirstName',
  lastName = 'customerLastName',
  gender = 'customerGender',
  dob = 'customerDOB',
  language = 'locale',
  age = 'age',
}

export const CustomerSectionConfig = {
  [CUSTOMER_ROWS.firstName]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerFirstName',
    name: CUSTOMER_ROWS.firstName,
    title: getString('leadDetailFields.firstName'),
    showAsterisk: true,
    validationFn: isValidNameInput,
    textFieldError: false,
  }),
  [CUSTOMER_ROWS.lastName]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerLastName',
    name: CUSTOMER_ROWS.lastName,
    title: getString('leadDetailFields.lastName'),
    showAsterisk: true,
    validationFn: isValidNameInput,
    textFieldError: false,
  }),
  [CUSTOMER_ROWS.gender]: constructConfig(AutoComplete, {
    dataTestId: 'customerGender',
    options: [],
    name: CUSTOMER_ROWS.gender,
    title: getString('leadDetailFields.gender'),
    disableClearable: true,
    showAsterisk: true,
    handleUpdate: () => null,
  }),
  [CUSTOMER_ROWS.dob]: constructConfig(
    DatePickerWithThaiYear,
    {
      name: CUSTOMER_ROWS.dob,
      title: getString('leadDetailFields.dob'),
      onChangeDate: () => null,
      value: '',
      validateFn: getDOBError,
      textFieldError: false,
    },
    InputContainer
  ),
  [CUSTOMER_ROWS.age]: constructConfig(DetailViewTextField, {
    name: CUSTOMER_ROWS.age,
    title: getString('leadDetailFields.age'),
    isReadOnly: true,
  }),
  [CUSTOMER_ROWS.language]: constructConfig(FormikRadioField, {
    name: CUSTOMER_ROWS.language,
    title: getString('leadDetailFields.language'),
    value: '',
    row: true,
  }),
};
