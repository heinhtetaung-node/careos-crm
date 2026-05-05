import { IInputProps } from 'shared/interfaces/common/lead/package';

import {
  carAgeCollection,
  createSchema,
  voluntaryInsuranceTypes,
  numberOfPersonCollection,
  OICCollection,
  selectCollection,
} from './packageStaticData';

export const packageFields = {
  // INFO: Renewal Package
  chassisNo: {
    name: 'chassisNo',
    title: 'Chassis No<asterisk>*</asterisk>',
  },
  lastPolicyNumber: {
    name: 'lastPolicyNumber',
    title: 'Last policy number',
  },
  claimNumber: {
    name: 'claimNumber',
    title: 'Claim number',
  },
  claimValue: {
    name: 'claimValue',
    title: 'Claim value',
  },
  noClaimBonus: {
    name: 'noClaimBonus',
    title: 'No claim bonus',
  },
  // INFO: Package
  name: {
    name: 'name',
    title: 'Package Name*',
  },
  type: {
    name: 'package_type',
  },
  startDate: {
    name: 'start_date',
    title: 'Start Date*',
  },
  expirationDate: {
    name: 'expiration_date',
    title: 'Expirations*',
  },
  insuranceCompanyId: {
    name: 'insurance_company_id',
    title: 'Insurance Company*',
  },
  carInsuranceType: {
    name: 'car_insurance_type',
    title: 'Insurance Type*',
  },
  oicCode: {
    name: 'oic_code',
    title: 'OIC Code*',
  },
  carRepairType: {
    name: 'car_repair_type',
    title: 'Repair*',
  },
  modifiedCarAccepted: {
    name: 'modified_car_accepted',
    title: 'Car Modification Accepted?*',
  },
  hasCctvDiscount: {
    name: 'has_cctv_discount',
    title: 'Is CCTV discount included?*',
  },
  // INFO: Car And Sum Insured
  carAge: {
    name: 'car_age',
    title: 'Car age(year)*',
  },
  sumCoverage: {
    name: 'carAndSumInsured',
    title: 'Sum Insured*',
  },
  sumCoverageMin: {
    name: 'sum_coverage_min',
    title: 'Min',
  },
  sumCoverageMax: {
    name: 'sum_coverage_max',
    title: 'Max',
  },
  deductibleAmount: {
    name: 'deductible_amount',
    title: 'Deductible (THB)*',
  },
  price: {
    name: 'price',
    title: 'Gross premium/price without mandatory (THB)*',
  },
  fireTheftCoverage: {
    name: 'fire_theft_coverage',
    title: 'Theft & fire coverage?*',
  },
  fireTheftCoverageValue: {
    name: 'fire_theft_coverage_value',
    title: 'Value',
  },
  floodCoverage: {
    name: 'flood_coverage',
    title: 'Flood coverage?*',
  },
  floodCoverageValue: {
    name: 'flood_coverage_value',
    title: 'Value',
  },
  carSubmodels: {
    name: 'car_submodels',
    title: 'Car Submodels*',
  },

  // INFO: Coverage
  liabilityPerPersonCoverage: {
    name: 'liability_per_person_coverage',
    title: 'Liability for damage per person (THB)*',
  },
  liabilityPerAccidentCoverage: {
    name: 'liability_per_accident_coverage',
    title: 'Liability for damage per time (THB)*',
  },
  liabilityPropertyCoverage: {
    name: 'liability_property_coverage',
    title: 'Liability for property damage (THB)*',
  },
  personalAccidentCoverage: {
    name: 'personal_accident_coverage',
    title: 'Personal Accident (THB)*',
  },
  personalAccidentCoverageNo: {
    name: 'personal_accident_coverage_no',
    title: 'No. of persons PA*',
  },
  medicalExpensesCoverage: {
    name: 'medical_expenses_coverage',
    title: 'Medical Expenses (THB)*',
  },
  medicalExpensesCoverageNo: {
    name: 'medical_expenses_coverage_no',
    title: 'No. of persons ME*',
  },
  bailBondCoverage: {
    name: 'bail_bond_coverage',
    title: 'Bail Bond (THB)*',
  },
};

export interface PackageSchemaOptions {
  includeE11OicCode?: boolean;
}

export const packageSchema = (
  options?: PackageSchemaOptions
): IInputProps[] => [
  createSchema({
    title: packageFields.name.title,
    name: packageFields.name.name,
    type: 'TextField',
  }),
  createSchema({
    title: packageFields.startDate.title,
    name: packageFields.startDate.name,
    type: 'DateTime',
  }),
  createSchema({
    title: packageFields.expirationDate.title,
    name: packageFields.expirationDate.name,
    type: 'DateTime',
  }),
  createSchema({
    title: packageFields.insuranceCompanyId.title,
    name: packageFields.insuranceCompanyId.name,
    type: 'SelectCustomDropdown',
  }),
  createSchema({
    title: packageFields.carInsuranceType.title,
    name: packageFields.carInsuranceType.name,
    type: 'Select',
    options: voluntaryInsuranceTypes(),
  }),
  createSchema({
    title: packageFields.oicCode.title,
    name: packageFields.oicCode.name,
    type: 'Select',
    options: OICCollection(options?.includeE11OicCode),
  }),
  createSchema({
    title: packageFields.carRepairType.title,
    name: packageFields.carRepairType.name,
    type: 'Radio',
  }),
  createSchema({
    title: packageFields.modifiedCarAccepted.title,
    name: packageFields.modifiedCarAccepted.name,
    type: 'Radio',
  }),
  createSchema({
    title: packageFields.hasCctvDiscount.title,
    name: packageFields.hasCctvDiscount.name,
    type: 'Radio',
  }),
];

export const mockPackageSchema: IInputProps[] = [
  createSchema({
    title: 'Package Name*',
    name: 'packageName',
    type: 'TextField',
  }),
  createSchema({
    title: 'Start Date*',
    name: 'packageStartDate',
    type: 'DateTime',
  }),
  createSchema({
    title: 'Expirations*',
    name: 'packageExpiration',
    type: 'DateTime',
  }),
  createSchema({
    title: 'Insurance Company*',
    name: 'packageInsuranceCompany',
    type: 'Select',
    options: selectCollection(),
  }),
  createSchema({
    title: 'Insurance Type*',
    name: 'packageInsuranceType',
    type: 'Select',
    options: voluntaryInsuranceTypes(),
  }),
  createSchema({
    title: 'OIC Code*',
    name: 'packageOICCode',
    type: 'Select',
    options: OICCollection(false),
  }),
  createSchema({
    title: 'Repair*',
    name: 'packageRepair',
    type: 'Radio',
  }),
  createSchema({
    title: 'Car Modification Accepted?*',
    name: 'packageCarModification',
    type: 'Radio',
  }),
  createSchema({
    title: 'Is CCTV discount included?*',
    name: 'packageCCTV',
    type: 'Radio',
  }),
];

export const carAndSumInsuredSchema: IInputProps[] = [
  createSchema({
    title: packageFields.carAge.title,
    name: packageFields.carAge.name,
    type: 'TextField',
    options: carAgeCollection(),
    childs: [],
    disable: true,
  }),
  createSchema({
    title: packageFields.sumCoverageMax.title,
    name: packageFields.sumCoverageMax.name,
    type: 'NumberInput',
    placeholder: 'Max',
  }),
  createSchema({
    title: packageFields.deductibleAmount.title,
    name: packageFields.deductibleAmount.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.price.title,
    name: packageFields.price.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.fireTheftCoverage.title,
    name: packageFields.fireTheftCoverage.name,
    type: 'Radio',
  }),
  createSchema({
    title: packageFields.fireTheftCoverageValue.title,
    name: packageFields.fireTheftCoverageValue.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.floodCoverage.title,
    name: packageFields.floodCoverage.name,
    type: 'Radio',
  }),
  createSchema({
    title: packageFields.floodCoverageValue.title,
    name: packageFields.floodCoverageValue.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.carSubmodels.title,
    name: packageFields.carSubmodels.name,
    type: 'TextField',
    disable: true,
  }),
];

export const coverageSchema = (): IInputProps[] => [
  createSchema({
    title: packageFields.liabilityPerPersonCoverage.title,
    name: packageFields.liabilityPerPersonCoverage.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.liabilityPerAccidentCoverage.title,
    name: packageFields.liabilityPerAccidentCoverage.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.liabilityPropertyCoverage.title,
    name: packageFields.liabilityPropertyCoverage.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.personalAccidentCoverage.title,
    name: packageFields.personalAccidentCoverage.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.personalAccidentCoverageNo.title,
    name: packageFields.personalAccidentCoverageNo.name,
    type: 'Select',
    options: numberOfPersonCollection(),
  }),
  createSchema({
    title: packageFields.medicalExpensesCoverage.title,
    name: packageFields.medicalExpensesCoverage.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.medicalExpensesCoverageNo.title,
    name: packageFields.medicalExpensesCoverageNo.name,
    type: 'Select',
    options: numberOfPersonCollection(),
  }),
  createSchema({
    title: packageFields.bailBondCoverage.title,
    name: packageFields.bailBondCoverage.name,
    type: 'NumberInput',
  }),
];

export const renewalPackageSchema = (): IInputProps[] => [
  createSchema({
    title: packageFields.chassisNo.title,
    name: packageFields.chassisNo.name,
    type: 'TextField',
    disable: true,
  }),
  createSchema({
    title: packageFields.lastPolicyNumber.title,
    name: packageFields.lastPolicyNumber.name,
    type: 'TextField',
  }),
  createSchema({
    title: packageFields.claimNumber.title,
    name: packageFields.claimNumber.name,
    type: 'NumberInput',
    inputProps: { isCurrency: false },
  }),
  createSchema({
    title: packageFields.claimValue.title,
    name: packageFields.claimValue.name,
    type: 'NumberInput',
  }),
  createSchema({
    title: packageFields.noClaimBonus.title,
    name: packageFields.noClaimBonus.name,
    type: 'NumberInput',
    inputProps: { isCurrency: true },
  }),
];
