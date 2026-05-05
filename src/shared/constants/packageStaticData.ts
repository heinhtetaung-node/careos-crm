import { getString } from 'presentation/theme/localization';
import {
  ICollection,
  IInputProps,
} from 'shared/interfaces/common/lead/package';

export const selectCollection = () => [
  { id: '1', value: '1', title: 'Car Insurance' },
  { id: '2', value: '2', title: 'Health Insurance' },
  { id: '3', value: '3', title: 'Life Insurance' },
];

export const statusCollection = () => [
  {
    id: 'ACTIVE',
    title: getString('statusCollection.active'),
    value: 'active',
  },
  {
    id: 'INACTIVE',
    title: getString('statusCollection.inactive'),
    value: 'inactive',
  },
];

export const StatusLeadAll = [
  { id: 1, title: 'New', value: 'LEAD_STATUS_NEW' },
  { id: 2, title: 'Valid', value: 'LEAD_STATUS_VALID' },
  { id: 3, title: 'Contacted', value: 'LEAD_STATUS_CONTACTED' },
  { id: 4, title: 'Interested', value: 'LEAD_STATUS_INTERESTED' },
  { id: 5, title: 'Prospect', value: 'LEAD_STATUS_PROSPECT' },
  { id: 6, title: 'Pending Payment', value: 'LEAD_STATUS_PENDING_PAYMENT' },
  { id: 6, title: 'Purchased', value: 'LEAD_STATUS_PURCHASED' },
  { id: 6, title: 'Cancelled', value: 'LEAD_STATUS_CANCELLED' },
];

export const SearchPackageAll = () => [
  {
    id: 1,
    title: getString('package.importFileName'),
    value: 'PACKAGE_IMPORT_FILE_NAME',
  },
];

export const radioCollection = () => [
  { id: 1, value: 'Yes', title: getString('package.yes') },
  { id: 2, value: 'No', title: getString('package.no') },
];

export const garageDealerCollection = () => [
  { id: '1', value: 'Garage', title: getString('package.garage') },
  { id: '2', value: 'Dealer', title: getString('package.dealer') },
];
export type TInsuranceType = Record<string, string>;

export const voluntaryInsuranceTypes = (): TInsuranceType[] => [
  {
    id: 'Type 1',
    value: 'Type 1',
    title: getString('insuranceTypes.type1'),
    packageValue: 'TYPE_1',
    displayValue: '1',
  },
  {
    id: 'Type 2',
    value: 'Type 2',
    title: getString('insuranceTypes.type2'),
    packageValue: 'TYPE_2',
    displayValue: '2',
  },
  {
    id: 'Type 2+',
    value: 'Type 2+',
    title: getString('insuranceTypes.type2Plus'),
    packageValue: 'TYPE_2_PLUS',
    displayValue: '2+',
  },
  {
    id: 'Type 3',
    value: 'Type 3',
    title: getString('insuranceTypes.type3'),
    packageValue: 'TYPE_3',
    displayValue: '3',
  },
  {
    id: 'Type 3+',
    value: 'Type 3+',
    title: getString('insuranceTypes.type3Plus'),
    packageValue: 'TYPE_3_PLUS',
    displayValue: '3+',
  },
];

export const insuranceTypeCollection = (): TInsuranceType[] => [
  ...voluntaryInsuranceTypes(),
  {
    id: 'Mandatory',
    value: 'Mandatory',
    title: getString('insuranceTypes.mandatory'),
    packageValue: 'MANDATORY',
    displayValue: 'Mandatory',
  },
];

export const voluntaryMotorInsuranceTypes = (): TInsuranceType[] => [
  {
    id: 'Type 1',
    value: 'Type 1',
    title: getString('insuranceTypes.type1'),
    packageValue: 'MOTOR_TYPE_1',
    displayValue: '1',
  },
  {
    id: 'Type 2',
    value: 'Type 2',
    title: getString('insuranceTypes.type2'),
    packageValue: 'MOTOR_TYPE_2',
    displayValue: '2',
  },
  {
    id: 'Type 2+',
    value: 'Type 2+',
    title: getString('insuranceTypes.type2Plus'),
    packageValue: 'MOTOR_TYPE_2_PLUS',
    displayValue: '2+',
  },
  {
    id: 'Type 3',
    value: 'Type 3',
    title: getString('insuranceTypes.type3'),
    packageValue: 'MOTOR_TYPE_3',
    displayValue: '3',
  },
  {
    id: 'Type 3+',
    value: 'Type 3+',
    title: getString('insuranceTypes.type3Plus'),
    packageValue: 'MOTOR_TYPE_3_PLUS',
    displayValue: '3+',
  },
];

export const motorInsuranceTypeCollection = (): TInsuranceType[] => [
  ...voluntaryMotorInsuranceTypes(),
  {
    id: 'Mandatory',
    value: 'Mandatory',
    title: getString('insuranceTypes.mandatory'),
    packageValue: 'MOTOR_TYPE_COMPULSORY',
    displayValue: 'Mandatory',
  },
];

const OIC_CODES_BASE = [
  { id: '110', value: '110', title: '110' },
  { id: '120', value: '120', title: '120' },
  { id: '210', value: '210', title: '210' },
  { id: '220', value: '220', title: '220' },
  { id: '230', value: '230', title: '230' },
  { id: '320', value: '320', title: '320' },
  { id: '730', value: '730', title: '730' },
  { id: '801', value: '801', title: '801' },
  { id: '610', value: '610', title: '610' },
  { id: '620', value: '620', title: '620' },
];

const OIC_E11_ITEM = { id: 'E11', value: 'E11', title: 'E11' };

/** OIC code options. Pass includeE11 true when BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP flag is enabled. */
export const OICCollection = (includeE11 = false) =>
  includeE11 ? [OIC_E11_ITEM, ...OIC_CODES_BASE] : OIC_CODES_BASE;
export const numberOfPersonCollection = (): ICollection[] =>
  Array.from({ length: 16 }, (_, index) => ({
    id: `${index}`,
    value: `${index}`,
    title: `${index}`,
  }));

export const carAgeCollection = (): ICollection[] =>
  Array.from({ length: 31 }, (_, index) => ({
    id: `${index}`,
    value: `${index + 1}`,
    title: `${new Date().getFullYear() - index}`,
  }));

export const createSchema = ({
  title,
  name,
  type,
  value = '',
  options = undefined,
  childs = undefined,
  placeholder = '',
  disable = false,
  column = undefined,
  inputProps,
}: IInputProps) => ({
  title,
  name,
  type,
  value,
  options,
  childs,
  placeholder,
  disable,
  column,
  inputProps,
});
