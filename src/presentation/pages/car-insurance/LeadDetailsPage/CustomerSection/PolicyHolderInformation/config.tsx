import { LabelWithIcon, RadioGroup } from '@alphafounders/ui';
import React from 'react';

import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import AutoComplete from 'presentation/components/common/FormikFields/LeadAutocomplete';
import { constructConfig } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import { OpenIcon } from 'presentation/components/icons';
import { getString } from 'presentation/theme/localization';
import { isValidNameInput, isValidNationalId } from 'utils/customerInfo';

import RadioGroupRow from './RadioGroupRow';

import { getDOBError } from '../helper';

export enum POLICYHOLDER_ROWS {
  policyHolderType = 'policyHolderType',
  policyHolderTitle = 'policyTitle',
  policyHolderFirstName = 'policyHolderFirstName',
  policyHolderLastName = 'policyHolderLastName',
  policyHolderNationalId = 'policyHolderNationalId',
  policyHolderPassport = 'policyHolderPassport',
  policyHolderDob = 'policyHolderDOB',
  policyHolderAge = 'policyHolderAge',
  noOfFixedDriver = 'numberOfFixedDriver',
  firstDriverDOB = 'firstDriverDOB',
  secondDriverDOB = 'secondDriverDOB',
  policyHolderCompanyName = 'customerPolicyAddress/0/companyName',
  policyHolderTaxId = 'customerPolicyAddress/0/taxId',

  firstDriverName = 'firstDriverName',
  secondDriverName = 'secondDriverName',
}

export const getPolicyHolderSectionConfig = () => ({
  [POLICYHOLDER_ROWS.policyHolderType]: constructConfig(
    RadioGroup,
    {
      name: POLICYHOLDER_ROWS.policyHolderType,
      title: 'policyHolderType',
      options: [],
      value: '',
      orientation: 'vertical',
      field: 'policyHolderType',
      className: 'py-3 px-2',
      radioType: 'tick',
    },
    RadioGroupRow
  ),
  [POLICYHOLDER_ROWS.policyHolderTitle]: constructConfig(AutoComplete, {
    name: POLICYHOLDER_ROWS.policyHolderTitle,
    dataTestId: 'policyTitle',
    title: getString('leadDetailFields.title'),
    showAsterisk: true,
    disableClearable: true,
    options: [],
    handleUpdate: () => null,
  }),
  [POLICYHOLDER_ROWS.policyHolderFirstName]: constructConfig(
    DetailViewTextField,
    {
      name: POLICYHOLDER_ROWS.policyHolderFirstName,
      dataTestId: 'policyHolderFirstName',
      title: getString('leadDetailFields.firstName'),
      showAsterisk: true,
      validationFn: isValidNameInput,
      textFieldError: false,
    }
  ),
  [POLICYHOLDER_ROWS.policyHolderLastName]: constructConfig(
    DetailViewTextField,
    {
      name: POLICYHOLDER_ROWS.policyHolderLastName,
      dataTestId: 'policyHolderLastName',
      title: getString('leadDetailFields.lastName'),
      showAsterisk: true,
      validationFn: isValidNameInput,
      textFieldError: false,
    }
  ),
  [POLICYHOLDER_ROWS.policyHolderCompanyName]: constructConfig(
    DetailViewTextField,
    {
      name: POLICYHOLDER_ROWS.policyHolderCompanyName,
      dataTestId: 'policyHolderCompanyName',
      title: getString('leadDetailFields.companyName'),
      showAsterisk: true,
      textFieldError: false,
    }
  ),
  [POLICYHOLDER_ROWS.policyHolderTaxId]: constructConfig(DetailViewTextField, {
    name: POLICYHOLDER_ROWS.policyHolderTaxId,
    dataTestId: 'policyHolderTaxId',
    title: getString('leadDetailFields.taxId'),
    showAsterisk: true,
    validationFn: isValidNationalId,
    textFieldError: false,
  }),
  [POLICYHOLDER_ROWS.policyHolderNationalId]: constructConfig(
    DetailViewTextField,
    {
      name: POLICYHOLDER_ROWS.policyHolderNationalId,
      dataTestId: 'policyHolderNationalId',
      title: getString('leadDetailFields.nationalIdPassport'),
      showAsterisk: true,
      validationFn: isValidNationalId,
      textFieldError: false,
    }
  ),
  [POLICYHOLDER_ROWS.policyHolderDob]: constructConfig(
    DatePickerWithThaiYear,
    {
      name: POLICYHOLDER_ROWS.policyHolderDob,
      title: getString('leadDetailFields.dob'),
      onChangeDate: () => null,
      value: '',
      validateFn: getDOBError,
      textFieldError: false,
    },
    InputContainer
  ),
  [POLICYHOLDER_ROWS.policyHolderAge]: constructConfig(DetailViewTextField, {
    name: POLICYHOLDER_ROWS.policyHolderAge,
    title: getString('leadDetailFields.age'),
    isReadOnly: true,
    textFieldError: false,
  }),
  [POLICYHOLDER_ROWS.noOfFixedDriver]: constructConfig(AutoComplete, {
    options: [],
    dataTestId: 'policyNumberOfFixedDriver',
    name: POLICYHOLDER_ROWS.noOfFixedDriver,
    title: getString('leadDetailFields.fixedDriver'),
    showAsterisk: true,
    disableClearable: true,
    handleUpdate: () => null,
  }),
  [POLICYHOLDER_ROWS.firstDriverName]: constructConfig(
    LabelWithIcon,
    {
      name: POLICYHOLDER_ROWS.firstDriverName,
      dataTestId: 'firstFixedDriverFullName',
      title: getString('leadDetailFields.firstDriverName'),
      value: '',
      placeholder: getString('leadDetailFields.pleaseAdd'),
      icon: <OpenIcon />,
      showAsterisk: true,
    },
    InputContainer
  ),
  [POLICYHOLDER_ROWS.secondDriverName]: constructConfig(
    LabelWithIcon,
    {
      name: POLICYHOLDER_ROWS.secondDriverName,
      dataTestId: 'secondFixedDriverFullName',
      title: getString('leadDetailFields.secondDriverName'),
      value: '',
      placeholder: getString('leadDetailFields.pleaseAdd'),
      icon: <OpenIcon />,
      showAsterisk: true,
    },
    InputContainer
  ),
});
