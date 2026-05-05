import AutoComplete from 'presentation/components/common/FormikFields/LeadAutocomplete';
import { getString } from 'presentation/theme/localization';

import { errorMessage } from './InsurerInfoSection.helper';
import PreferredType from './PreferredType';

import DetailViewNumberInput from '../common/FormikFields/DetailViewNumberInput';
import DetailViewTextField from '../common/FormikFields/DetailViewTextField';
import InputContainer from '../common/FormikFields/InputContainer';
import {
  constructConfig,
  DataSchema,
} from '../common/FormikFields/SectionRenderer/interface';
import DatePickerWithThaiYear from '../controls/DatePickerWithThaiYear';

export enum INSURER_ROWS {
  CURRENT_INSURER = 'currentInsurer',
  PREFERRED_INSURER = 'preferredInsurer',
  PREFERRED_TYPE = 'voluntaryInsuranceType',
  PREFERRED_SUM_INSURED = 'preferredSumInsured',
  INSURANCE_KIND = 'insuranceKind',
  EXPIRY_DATE = 'policyExpiryDate',
  POLICY_START_DATE = 'policyStartDate',
  COMPULSORY_POLICY_START_DATE = 'compulsoryPolicyStartDate',
  DELIVERY_OPTION = 'checkout/deliveryOption',
  LAST_INVOICE_PRICE = 'lastInvoicePrice',
  LAST_PACKAGE_PRICE = 'lastPackagePrice',
  LAST_DISCOUNT = 'lastDiscount',
}

export const getInsurerInfoDataSchema = () =>
  ({
    [INSURER_ROWS.CURRENT_INSURER]: constructConfig(AutoComplete, {
      name: INSURER_ROWS.CURRENT_INSURER,
      title: getString('text.currentInsurer'),
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
    [INSURER_ROWS.EXPIRY_DATE]: constructConfig(
      DatePickerWithThaiYear,
      {
        name: INSURER_ROWS.EXPIRY_DATE,
        title: getString('text.expiryDateOfCurrentPolicy'),
        onChangeDate: () => null,
        value: '',
        textFieldError: false,
      },
      InputContainer
    ),
    [INSURER_ROWS.PREFERRED_INSURER]: constructConfig(AutoComplete, {
      name: INSURER_ROWS.PREFERRED_INSURER,
      title: getString('text.preferredInsurer'),
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
    [INSURER_ROWS.PREFERRED_SUM_INSURED]: constructConfig(
      DetailViewNumberInput,
      {
        name: INSURER_ROWS.PREFERRED_SUM_INSURED,
        title: getString('text.sumInsured'),
        value: 0,
        handleUpdate: () => null,
        thousandSeparator: true,
        placeholder: 'Sum insured',
        dataTestId: 'preferredSumInsured',
        error: '',
        isReadOnly: false,
        isDisabled: false,
        showAsterisk: false,
      }
    ),
    [INSURER_ROWS.INSURANCE_KIND]: constructConfig(AutoComplete, {
      name: INSURER_ROWS.INSURANCE_KIND,
      title: getString('leadDetailFields.insuranceKind'),
      value: '',
      dataTestId: 'insuranceKind',
      isReadOnly: false,
      options: [],
      multiple: false,
      showAsterisk: false,
      disableClearable: true,
      isDisabled: false,
      handleUpdate: () => null,
      placeholder: 'Select insurance kind',
    }),
    [INSURER_ROWS.PREFERRED_TYPE]: constructConfig(
      PreferredType,
      {
        handleSelectChange: () => null,
        title: getString('text.preferredType'),
        value: '',
        dataTestId: 'preferredType',
        isReadOnly: false,
        showAsterisk: true,
        isDisabled: false,
      },
      InputContainer
    ),
    [INSURER_ROWS.POLICY_START_DATE]: constructConfig(
      DatePickerWithThaiYear,
      {
        name: INSURER_ROWS.POLICY_START_DATE,
        title: getString('leadDetailFields.voluntaryPolicyStartDate'),
        onChangeDate: () => null,
        value: '',
        validateFn: (val) => errorMessage(val),
        textFieldError: false,
      },
      InputContainer
    ),
    [INSURER_ROWS.COMPULSORY_POLICY_START_DATE]: constructConfig(
      DatePickerWithThaiYear,
      {
        name: INSURER_ROWS.COMPULSORY_POLICY_START_DATE,
        title: getString('leadDetailFields.compulsoryPolicyStartDate'),
        onChangeDate: () => null,
        value: '',
        validateFn: (val) => errorMessage(val),
        textFieldError: false,
      },
      InputContainer
    ),
    [INSURER_ROWS.DELIVERY_OPTION]: constructConfig(DetailViewTextField, {
      name: INSURER_ROWS.DELIVERY_OPTION,
      title: getString('text.deliveryOptions'),
      isReadOnly: true,
      dataTestId: 'deliveryOption-readOnly',
    }),
    [INSURER_ROWS.LAST_PACKAGE_PRICE]: constructConfig(DetailViewTextField, {
      name: INSURER_ROWS.LAST_PACKAGE_PRICE,
      title: getString('text.lastPackagePrice'),
      isReadOnly: true,
    }),
    [INSURER_ROWS.LAST_INVOICE_PRICE]: constructConfig(DetailViewTextField, {
      name: INSURER_ROWS.LAST_INVOICE_PRICE,
      title: getString('text.lastInvoicePrice'),
      isReadOnly: true,
    }),
    [INSURER_ROWS.LAST_DISCOUNT]: constructConfig(DetailViewTextField, {
      name: INSURER_ROWS.LAST_DISCOUNT,
      title: getString('text.lastDiscount'),
      isReadOnly: true,
    }),
  }) as DataSchema;
