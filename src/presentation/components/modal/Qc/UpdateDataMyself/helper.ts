import {
  DocTypes,
  Titles,
  leadTitleOptions,
} from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

export enum ExtraTitle {
  KHUN = 'KHUN',
}

export enum LicensePlateType {
  redPlate = 'redplate',
  validLength = 6,
  licenseCodeLength = 3,
  divider = '-',
}

export const titleOptionsFull = (product?: string) => [
  ...leadTitleOptions(product).map((option) => ({
    ...option,
    payload: {
      title: option.value,
    },
  })),
];

export const titleOptions = [
  {
    title: getString('text.mr'),
    label: getString('text.mr'),
    value: Titles.MR,
    payload: {
      title: Titles.MR,
    },
  },
  {
    title: getString('text.miss'),
    label: getString('text.miss'),
    value: Titles.MISS,
    payload: {
      title: Titles.MISS,
    },
  },
  {
    title: getString('text.mrs'),
    label: getString('text.mrs'),
    value: Titles.MRS,
    payload: {
      title: Titles.MRS,
    },
  },
  {
    title: getString('text.khun'),
    label: getString('text.khun'),
    value: ExtraTitle.KHUN,
    payload: {
      title: ExtraTitle.KHUN,
    },
  },
];

export const documentType = [
  {
    title: getString('leadDetailFields.drivingLicense'),
    label: getString('leadDetailFields.drivingLicense'),
    value: DocTypes.DrivingLicense,
    payload: {
      title: DocTypes.DrivingLicense,
    },
  },
  {
    title: getString('leadDetailFields.nationalId'),
    label: getString('leadDetailFields.nationalId'),
    value: DocTypes.NationalID,
    payload: {
      title: DocTypes.NationalID,
    },
  },
  {
    title: getString('leadDetailFields.passport'),
    label: getString('leadDetailFields.passport'),
    value: DocTypes.Passport,
    payload: {
      title: DocTypes.Passport,
    },
  },
];

export const policyholderOptions = [
  {
    title: getString('qc.customerIsInsuredPerson'),
    label: getString('qc.customerIsInsuredPerson'),
    value: 'isPolicyholder',
    payload: {
      isCustomer: true,
      isCompany: false,
    },
  },
  {
    title: getString('qc.customerIsNotInsuredPerson'),
    label: getString('qc.customerIsNotInsuredPerson'),
    value: 'isNotPolicyholder',
    payload: {
      isCustomer: false,
      isCompany: false,
    },
  },
  {
    title: getString('qc.policyHolderIsCompany'),
    label: getString('qc.policyHolderIsCompany'),
    value: 'isCompany',
    payload: {
      isCustomer: false,
      isCompany: true,
    },
  },
];

export function optionsMapping<T extends any[], K extends keyof T[number]>(
  list: T,
  titleLookFor: K,
  valLookFor: K
) {
  return list?.map((l) => ({ title: l[titleLookFor], value: l[valLookFor] }));
}

export const formatValue = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((i: any) => i.value);
  }
  return value?.value ?? value;
};

/*
 * @description This function will take in string while typing and return a license plate with standardize formatted
 */
export const licensePlateStandardize = (
  licensePlateRaw: string,
  divider = LicensePlateType.divider as string
) => {
  if (!licensePlateRaw || licensePlateRaw.length <= 0) return '';
  const licensePlate = licensePlateRaw.trim();
  const lastChar = licensePlate.at(-1) ?? '';
  const leftChar = licensePlate.at(-2) ?? '';
  const firstTwoChar = licensePlate.slice(0, 2);
  const withoutLastChar = licensePlate.slice(0, -1);
  const lastCharIsNumber = Number.isInteger(+lastChar);
  const firstTwoCharIsNumber =
    licensePlate.length === 3 && Number.isInteger(+firstTwoChar);
  const leftCharIsNumber =
    licensePlate.length > 1 && !Number.isInteger(+leftChar);

  if (firstTwoCharIsNumber && lastCharIsNumber) {
    return `${firstTwoChar}${divider}${lastChar}`;
  }
  if (lastCharIsNumber && leftCharIsNumber && !licensePlate.includes(divider)) {
    return `${withoutLastChar}${divider}${lastChar}`;
  }
  return licensePlate;
};
