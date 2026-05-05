import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';
import FormikRadioField from 'presentation/components/common/FormikFields/FormikRadioField';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import AutoComplete from 'presentation/components/common/FormikFields/LeadAutocomplete';
import { constructConfig } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import { getString } from 'presentation/theme/localization';
import { isValidNameInput } from 'utils/customerInfo';

import { RadioGroup } from '@alphafounders/ui';
import { isNumber } from 'lodash';
import RadioGroupRow from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/RadioGroupRow';
import validateEmailWithoutSpecialChars from 'shared/validators/email';

export enum HEALTH_CUSTOMER_ROWS {
  firstName = 'customer/firstName',
  lastName = 'customer/lastName',
  gender = 'customer/gender',
  dob = 'customer/dob',
  language = 'customer/isThaiNational',
  age = 'customer/age',
  nationalId = 'customer/nationalId',
  weight = 'customer/weight',
  height = 'customer/height',
  title = 'customer/title',
  occupation = 'customer/occupation',
  workAddress = 'customer/workAddress',
}

export enum HEALTH_POLICYHOLDER_ROWS {
  policyHolderType = 'policyHolder/type',
  policyHolderTitle = 'policyHolder/title',
  policyHolderFirstName = 'policyHolder/firstName',
  policyHolderLastName = 'policyHolder/lastName',
  policyHolderNationalId = 'policyHolder/nationalId',
  policyHolderDob = 'policyHolder/dob',
  policyHolderAge = 'policyHolder/age',
  policyJobDescription = 'policyHolder/jobDescription',
  policyHolderLocale = 'policyHolder/locale',
  policyHolderOccupation = 'policyHolder/occupation',
  policyHolderPassport = 'policyHolder/passport',
  policyHolderRace = 'policyHolder/race',
  policyHolderGender = 'policyHolder/gender',
  policyHolderWeight = 'policyHolder/weight',
  policyHolderHeight = 'policyHolder/height',
}

export enum HEALTH_INSURER_ROWS {
  CURRENT_INSURER = 'currentInsurer',
  PREFERRED_INSURER = 'preferredInsurer',
  PREFERRED_PRODUCT_CATEGORY = '/insurance/category',
  PREFERRED_PRODUCT_COVERAGES = '/insurance/coverages',
  PREFERRED_PRODUCT_SUB_CATEGORY = '/insurance/subCategory',
  PREFERRED_PRODUCT_TYPE = '/insurance/type',
  POLICY_START_DATE = 'policyStartDate',
  DELIVERY_OPTION = 'checkout/deliveryOption',
  UNDERWRITING_STATUS = 'underwritingStatus',
  IS_INSURER_MONTHLY_PREMIUM = '/insurance/isInsurerMonthlyPremium',
  NEED_TAX_EXEMPTION = '/insurance/needTaxExemption',
}

export const getInsurerInfoDataSchema = () => ({
  [HEALTH_INSURER_ROWS.CURRENT_INSURER]: constructConfig(AutoComplete, {
    name: HEALTH_INSURER_ROWS.CURRENT_INSURER,
    title: getString('healthLead.currentInsurer'),
    handleUpdate: () => null,
    options: [],
    value: '',
    dataTestId: 'currentInsurer',
    isReadOnly: false,
    multiple: false,
    showAsterisk: false,
    disableClearable: true,
    isDisabled: false,
    placeholder: getString('text.pleaseSelect'),
  }),
  [HEALTH_INSURER_ROWS.PREFERRED_INSURER]: constructConfig(AutoComplete, {
    name: HEALTH_INSURER_ROWS.PREFERRED_INSURER,
    title: getString('healthLead.preferredInsurer'),
    value: '',
    handleUpdate: () => null,
    dataTestId: 'preferredInsurer',
    isReadOnly: false,
    options: [],
    multiple: false,
    showAsterisk: false,
    disableClearable: true,
    isDisabled: false,
    placeholder: getString('text.pleaseSelect'),
  }),
  [HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY]: constructConfig(
    AutoComplete,
    {
      dataTestId: 'customerLastName',
      name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
      title: getString('healthLead.preferredProductCategory'),
      showAsterisk: false,
      options: [],
      value: '',
      disableClearable: true,
      isDisabled: false,
      placeholder: getString('text.pleaseSelect'),
      handleUpdate: () => null,
    }
  ),
  [HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY]: constructConfig(
    AutoComplete,
    {
      name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY,
      title: getString('healthLead.subCategory'),
      dataTestId: 'subCategory',
      showAsterisk: false,
      options: [],
      value: '',
      disableClearable: true,
      isDisabled: false,
      placeholder: getString('text.pleaseSelect'),
      handleUpdate: () => null,
    }
  ),
  [HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE]: constructConfig(AutoComplete, {
    name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE,
    title: getString('healthLead.coverageType'),
    dataTestId: 'preferredProductType',
    showAsterisk: false,
    value: '',
    options: [],
    disableClearable: true,
    isDisabled: false,
    placeholder: getString('text.pleaseSelect'),
    handleUpdate: () => null,
  }),
  [HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES]: constructConfig(
    AutoComplete,
    {
      name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES,
      title: getString('healthLead.preferredCoverageItems'),
      dataTestId: 'preferredType',
      showAsterisk: false,
      options: [],
      multiple: true,
      disableClearable: true,
      isDisabled: false,
      placeholder: getString('text.pleaseSelect'),
      handleUpdate: () => null,
    }
  ),
  [HEALTH_INSURER_ROWS.POLICY_START_DATE]: constructConfig(
    DatePickerWithThaiYear,
    {
      name: HEALTH_INSURER_ROWS.POLICY_START_DATE,
      title: getString('healthLead.preferredPolicyStartDate'),
      onChangeDate: () => null,
      showAsterisk: true,
      value: '',
      textFieldError: false,
      isDisabled: true,
    },
    InputContainer
  ),
  [HEALTH_INSURER_ROWS.DELIVERY_OPTION]: constructConfig(DetailViewTextField, {
    name: HEALTH_INSURER_ROWS.DELIVERY_OPTION,
    title: getString('healthLead.deliveryOption'),
    isReadOnly: true,
    dataTestId: 'deliveryOption-readOnly',
  }),
  [HEALTH_INSURER_ROWS.IS_INSURER_MONTHLY_PREMIUM]: constructConfig(
    FormikRadioField,
    {
      name: HEALTH_INSURER_ROWS.IS_INSURER_MONTHLY_PREMIUM,
      title: getString('healthLead.isInsurerMonthlyPremium'),
      value: '',
      row: true,
    }
  ),
  [HEALTH_INSURER_ROWS.NEED_TAX_EXEMPTION]: constructConfig(FormikRadioField, {
    name: HEALTH_INSURER_ROWS.NEED_TAX_EXEMPTION,
    title: getString('healthLead.needTaxExemption'),
    value: '',
    row: true,
  }),
});

export const HealthCustomerSectionConfig = {
  [HEALTH_CUSTOMER_ROWS.title]: constructConfig(AutoComplete, {
    dataTestId: 'customerTitle',
    name: HEALTH_CUSTOMER_ROWS.title,
    title: getString('leadDetailFields.title'),
    showAsterisk: false,
    disableClearable: true,
    options: [],
    handleUpdate: () => null,
  }),
  [HEALTH_CUSTOMER_ROWS.firstName]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerFirstName',
    name: HEALTH_CUSTOMER_ROWS.firstName,
    title: getString('leadDetailFields.firstName'),
    showAsterisk: true,
    validationFn: isValidNameInput,
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.lastName]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerLastName',
    name: HEALTH_CUSTOMER_ROWS.lastName,
    title: getString('leadDetailFields.lastName'),
    showAsterisk: true,
    validationFn: isValidNameInput,
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.nationalId]: constructConfig(DetailViewTextField, {
    name: HEALTH_CUSTOMER_ROWS.nationalId,
    dataTestId: 'customerNationalId',
    title: getString('leadDetailFields.nationalIdPassport'),
    showAsterisk: false,
    validationFn: (id) => {
      if (id.length > 13) {
        return getString('errors.exceedCharacters', {
          maxLength: 13,
        });
      }

      return '';
    },
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.gender]: constructConfig(AutoComplete, {
    dataTestId: 'customerGender',
    options: [],
    name: HEALTH_CUSTOMER_ROWS.gender,
    title: getString('leadDetailFields.gender'),
    disableClearable: true,
    showAsterisk: true,
    handleUpdate: () => null,
  }),
  [HEALTH_CUSTOMER_ROWS.weight]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerWeight',
    name: HEALTH_CUSTOMER_ROWS.weight,
    title: getString('leadDetailFields.weight'),
    showAsterisk: false,
    validationFn: (value) =>
      isNumber(+value) && +value > 0 ? '' : 'Invalid input',
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.height]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerHeight',
    name: HEALTH_CUSTOMER_ROWS.height,
    title: getString('leadDetailFields.height'),
    showAsterisk: false,
    validationFn: (value) =>
      isNumber(+value) && +value > 0 ? '' : 'Invalid input',
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.dob]: constructConfig(
    DatePickerWithThaiYear,
    {
      name: HEALTH_CUSTOMER_ROWS.dob,
      title: getString('leadDetailFields.dob'),
      onChangeDate: () => null,
      value: '',
      textFieldError: false,
    },
    InputContainer
  ),
  [HEALTH_CUSTOMER_ROWS.age]: constructConfig(DetailViewTextField, {
    name: HEALTH_CUSTOMER_ROWS.age,
    title: getString('leadDetailFields.age'),
    isReadOnly: true,
  }),
  [HEALTH_CUSTOMER_ROWS.language]: constructConfig(FormikRadioField, {
    name: HEALTH_CUSTOMER_ROWS.language,
    title: getString('leadDetailFields.language'),
    value: '',
    row: true,
  }),
  [HEALTH_CUSTOMER_ROWS.occupation]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerOccupation',
    name: HEALTH_CUSTOMER_ROWS.occupation,
    title: getString('leadDetailFields.occupation'),
    showAsterisk: false,
    textFieldError: false,
  }),
  [HEALTH_CUSTOMER_ROWS.workAddress]: constructConfig(DetailViewTextField, {
    dataTestId: 'customerWorkAddress',
    name: HEALTH_CUSTOMER_ROWS.workAddress,
    title: getString('leadDetailFields.workAddress'),
    showAsterisk: false,
    textFieldError: false,
  }),
};

export const getBeneficiaryFieldKeys = (index: number) => ({
  beneficiaryTitle: `beneficiaries/${index}/title`,
  beneficiaryEmail: `beneficiaries/${index}/email`,
  beneficiaryAddress: `beneficiaries/${index}/address`,
  beneficiaryFirstName: `beneficiaries/${index}/firstName`,
  beneficiaryLastName: `beneficiaries/${index}/lastName`,
  beneficiaryGender: `beneficiaries/${index}/gender`,
  beneficiaryPhone: `beneficiaries/${index}/phone`,
  beneficiaryRelationship: `beneficiaries/${index}/relationship`,
});

// Create a function to generate beneficiary section config
export const generateBeneficiarySectionConfig = (index: number) => {
  const fieldKeys = getBeneficiaryFieldKeys(index);

  return {
    [fieldKeys.beneficiaryTitle]: constructConfig(AutoComplete, {
      dataTestId: 'customerTitle',
      name: fieldKeys.beneficiaryTitle,
      title: getString('leadDetailFields.title'),
      showAsterisk: false,
      disableClearable: true,
      options: [],
      handleUpdate: () => null,
    }),
    [fieldKeys.beneficiaryFirstName]: constructConfig(DetailViewTextField, {
      dataTestId: 'customerFirstName',
      name: fieldKeys.beneficiaryFirstName,
      title: getString('leadDetailFields.firstName'),
      showAsterisk: false,
      validationFn: isValidNameInput,
      textFieldError: false,
    }),
    [fieldKeys.beneficiaryLastName]: constructConfig(DetailViewTextField, {
      dataTestId: 'customerLastName',
      name: fieldKeys.beneficiaryLastName,
      title: getString('leadDetailFields.lastName'),
      showAsterisk: false,
      validationFn: isValidNameInput,
      textFieldError: false,
    }),
    [fieldKeys.beneficiaryGender]: constructConfig(AutoComplete, {
      dataTestId: 'customerGender',
      options: [],
      name: fieldKeys.beneficiaryGender,
      title: getString('leadDetailFields.gender'),
      showAsterisk: false,
      handleUpdate: () => null,
    }),
    [fieldKeys.beneficiaryEmail]: constructConfig(DetailViewTextField, {
      dataTestId: 'customerEmail',
      name: fieldKeys.beneficiaryEmail,
      title: getString('leadDetailFields.email'),
      showAsterisk: false,
      validationFn: (email) => {
        const isValid = validateEmailWithoutSpecialChars().isValidSync(email);
        if (!isValid) {
          return getString('errors.invalidData');
        }
        return '';
      },
      textFieldError: false,
    }),
    [fieldKeys.beneficiaryPhone]: constructConfig(DetailViewTextField, {
      dataTestId: 'customerPhone',
      name: fieldKeys.beneficiaryPhone,
      title: getString('leadDetailFields.phone'),
      showAsterisk: false,
      validationFn: (phone) => {
        const regex = /^(\+[1-9]\d{1,3}\d{8,11}|0\d{9})$/;
        if (!regex.test(phone)) {
          return getString('errors.invalidValue');
        }
        return '';
      },
      textFieldError: false,
    }),
    [fieldKeys.beneficiaryRelationship]: constructConfig(DetailViewTextField, {
      dataTestId: 'customerRelationship',
      name: fieldKeys.beneficiaryRelationship,
      title: getString('text.relationship'),
      showAsterisk: false,
      validationFn: isValidNameInput,
      textFieldError: false,
    }),
    [fieldKeys.beneficiaryAddress]: constructConfig(DetailViewTextField, {
      dataTestId: 'beneficiaryAddress',
      name: fieldKeys.beneficiaryAddress,
      title: getString('text.address'),
      showAsterisk: false,
      textFieldError: false,
    }),
  };
};

export const getPolicyHolderSectionConfig = () => ({
  [HEALTH_POLICYHOLDER_ROWS.policyHolderType]: constructConfig(
    RadioGroup,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderType,
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
  [HEALTH_POLICYHOLDER_ROWS.policyHolderTitle]: constructConfig(AutoComplete, {
    name: HEALTH_POLICYHOLDER_ROWS.policyHolderTitle,
    dataTestId: 'policyTitle',
    title: getString('leadDetailFields.title'),
    showAsterisk: true,
    disableClearable: true,
    options: [],
    handleUpdate: () => null,
  }),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName,
      dataTestId: 'policyHolderFirstName',
      title: getString('leadDetailFields.firstName'),
      showAsterisk: true,
      validationFn: isValidNameInput,
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderLastName]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderLastName,
      dataTestId: 'policyHolderLastName',
      title: getString('leadDetailFields.lastName'),
      showAsterisk: true,
      validationFn: isValidNameInput,
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId,
      dataTestId: 'policyHolderNationalId',
      title: getString('leadDetailFields.nationalIdPassport'),
      showAsterisk: true,
      validationFn: (id) => {
        if (id.length > 13) {
          return getString('errors.exceedCharacters', {
            maxLength: 13,
          });
        }

        return '';
      },
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderGender]: constructConfig(AutoComplete, {
    dataTestId: 'policyHolderGender',
    options: [],
    name: HEALTH_POLICYHOLDER_ROWS.policyHolderGender,
    title: getString('leadDetailFields.gender'),
    disableClearable: true,
    showAsterisk: false,
    handleUpdate: () => null,
  }),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderWeight]: constructConfig(
    DetailViewTextField,
    {
      dataTestId: 'policyHolderWeight',
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderWeight,
      title: getString('leadDetailFields.weight'),
      showAsterisk: false,
      validationFn: (value) =>
        isNumber(+value) && +value > 0 ? '' : 'Invalid input',
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderHeight]: constructConfig(
    DetailViewTextField,
    {
      dataTestId: 'policyHolderHeight',
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderHeight,
      title: getString('leadDetailFields.height'),
      showAsterisk: false,
      validationFn: (value) =>
        isNumber(+value) && +value > 0 ? '' : 'Invalid input',
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderDob]: constructConfig(
    DatePickerWithThaiYear,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderDob,
      title: getString('leadDetailFields.dob'),
      onChangeDate: () => null,
      value: '',
      textFieldError: false,
    },
    InputContainer
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderAge]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderAge,
      title: getString('leadDetailFields.age'),
      isReadOnly: true,
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderRace]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderRace,
      title: getString('leadDetailFields.race'),
      showAsterisk: false,
      isReadOnly: false,
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation]: constructConfig(
    DetailViewTextField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation,
      title: getString('leadDetailFields.occupation'),
      isReadOnly: false,
      showAsterisk: true,
      textFieldError: false,
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyHolderLocale]: constructConfig(
    FormikRadioField,
    {
      name: HEALTH_POLICYHOLDER_ROWS.policyHolderLocale,
      title: getString('leadDetailFields.language'),
      isReadOnly: false,
      row: true,
      value: '',
    }
  ),
  [HEALTH_POLICYHOLDER_ROWS.policyJobDescription]: constructConfig(
    DetailViewTextField,
    {
      dataTestId: 'policyJobDescription',
      name: HEALTH_POLICYHOLDER_ROWS.policyJobDescription,
      title: getString('leadDetailFields.jobDescription'),
      showAsterisk: false,
      validationFn: isValidNameInput,
      textFieldError: false,
    }
  ),
});
