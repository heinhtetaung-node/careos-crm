import _upperFirst from 'lodash/upperFirst';

import { INSURANCE_KIND } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { getFilterValueFromStorage } from 'presentation/pages/car-insurance/PackageDetailPage/useGetPackageData';
import { getLanguage, LANGUAGES } from 'presentation/theme/localization';
import { InsuranceKind } from 'shared/types/insurers';
import { Lead } from 'shared/types/lead';
import {
  CarInsuranceType,
  CarRepairType,
  Package,
} from 'shared/types/packages';
import { formatSatangToBaht, satangToBahtNumber } from 'utils/currency';

import defaultFilterConfig from './filterConfig';
import {
  Deductible,
  FilterInterface,
  InsurerSumInsuranceRange,
} from './interface';

import { transformTitle } from '../packageTransformation/transformations';
import { ICarInfo } from '../../LeadDetailsPage/leadDetailsPage.helper';

export const defaultFiltervalue: FilterInterface = {
  sortBy: 'default',
  orderBy: 'asc',
  insuranceCategory: 'both',
  insuranceType: {
    'Type 1': false,
    'Type 2': false,
    'Type 3': false,
    'Type 2+': false,
    'Type 3+': false,
  },
  repairType: 'both',
  deductible: 'no_deductible',
  price: {
    min: 0,
    max: 100000,
  },
  sumInsured: {
    min: 0,
    max: 0,
  },
  insurer: {},
  isDefaultSumInsured: true,
  year: {},
  brand: {},
  model: {},
  subModel: {},
  province: {},
  dashCam: false,
  drivingPurpose: 'personal',
  modification: false,
};

type Insurer = {
  id: string;
  name: string;
  logo: string;
};

type SumInsured = {
  sumInsuredMin: number;
  sumInsuredMax: number;
};

const getInsurers = (insurers: Insurer[]) => {
  const defaultInsurerOrder = [
    'insurers/7',
    'insurers/27',
    'insurers/28',
    'insurers/35',
    'insurers/24',
    'insurers/19',
    'insurers/5',
    'insurers/11',
  ];

  const alphabeticalInsurers: Insurer[] = [];

  const fixedInsurers = insurers
    .filter((insurer) => {
      if (!defaultInsurerOrder.includes(insurer.id)) {
        alphabeticalInsurers.push(insurer);
        return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        defaultInsurerOrder.indexOf(a.id) - defaultInsurerOrder.indexOf(b.id)
    );

  alphabeticalInsurers.sort((a, b) => a.name.localeCompare(b.name));

  return [...fixedInsurers, ...alphabeticalInsurers].map((insurer) => ({
    key: insurer.id,
    label: insurer.name,
    logo: insurer.logo,
  }));
};

export const isUsableDefaultValue = (value: unknown) => {
  if (value == null) return false;
  if (typeof value === 'string') return value !== '';
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

export const mergeStoredFilterWithLeadDefaults = (
  defaultValues: FilterInterface,
  existingValues?: FilterInterface
) => {
  if (!existingValues) return defaultValues;

  const mergedValues = {
    ...defaultValues,
    ...existingValues,
  };
  const leadBackedFields: (keyof FilterInterface)[] = [
    'brand',
    'model',
    'year',
    'carSubModelYear',
    'province',
    'drivingPurpose',
    'dashCam',
    'modification',
    'engineSize',
    'noOfDoors',
  ];

  leadBackedFields.forEach(<K extends keyof FilterInterface>(field: K) => {
    if (
      isUsableDefaultValue(defaultValues[field]) &&
      !isUsableDefaultValue(existingValues[field])
    ) {
      mergedValues[field] = defaultValues[field];
    }
  });

  return mergedValues;
};

export const convertInsuranceType = (type: string) =>
  _upperFirst(type.replace('_', ' '));

const formatFilterConfigData = (data: any[]) =>
  data.map((_data) => ({
    ..._data,
    key: _data.value || '0',
    label: _data.title || 'Please Select',
  }));

export function getFilterConfig(
  insurancePackages: Package[],
  extra: {
    lead?: Lead;
    sumInsuredMinMax?: SumInsured;
    provinces?: any[];
    years?: any[];
    models?: any[];
    subModels?: any[];
    brands?: any[];
    noOfDoors?: any[];
    engineSizes?: any[];
  },
  isNewFilter = false
) {
  const {
    sumInsuredMinMax,
    provinces,
    years,
    models,
    brands,
    subModels,
    noOfDoors,
    engineSizes,
  } = extra;

  const config = defaultFilterConfig;

  const insurers: Insurer[] = [];
  const invoicePrices: number[] = [];

  insurancePackages.forEach((pkg) => {
    if (!insurers.some((insurer) => insurer.id === pkg.insuranceCompany.name)) {
      insurers.push({
        id: pkg.insuranceCompany.name,
        name: transformTitle(pkg, getLanguage() as LANGUAGES),
        logo: pkg.insuranceCompany.logo,
      });
    }
    invoicePrices.push(parseFloat(pkg.invoicePrice));
  });

  if (sumInsuredMinMax) {
    config.sumInsured.config.max = sumInsuredMinMax.sumInsuredMax;
    config.sumInsured.config.min = 0;
    config.sumInsured.config.step = 10000;
  }

  if (invoicePrices.length > 0) {
    const sortedInvoicePrices = invoicePrices
      .map((x) => BigInt(x))
      .sort((a, b) => Number(a - b));
    config.price.config.max = satangToBahtNumber(
      sortedInvoicePrices[sortedInvoicePrices.length - 1],
      'ceil'
    );
    config.price.config.min = satangToBahtNumber(
      sortedInvoicePrices[0],
      'floor'
    );
  }

  if (insurers.length > 0) {
    config.insurer.values = getInsurers(insurers);
  }

  if (!isNewFilter) return { config };

  if (provinces?.length) {
    config.province.options = formatFilterConfigData([
      defaultFilterConfig.province.options[0],
      ...provinces,
    ]);
  }
  if (years?.length) {
    config.year.options = formatFilterConfigData([
      defaultFilterConfig.year.options[0],
      ...years,
    ]);
  }
  if (models?.length) {
    config.model.options = formatFilterConfigData([
      defaultFilterConfig.model.options[0],
      ...models,
    ]);
  }
  if (brands?.length) {
    config.brand.options = formatFilterConfigData([
      defaultFilterConfig.brand.options[0],
      ...brands,
    ]);
  }
  if (subModels?.length) {
    config.subModel.options = formatFilterConfigData([
      defaultFilterConfig.subModel.options[0],
      ...subModels,
    ]);
  }
  if (noOfDoors?.length) {
    config.noOfDoors.options = [
      defaultFilterConfig.noOfDoors.options[0],
      ...noOfDoors,
    ];
  }

  if (engineSizes?.length) {
    config.engineSize.options = [
      defaultFilterConfig.engineSize.options[0],
      ...engineSizes,
    ];
  }

  config.sort.values = [
    { key: 'default', label: 'text.select' },
    { key: 'insurer', label: 'newPackageListing.insurer' },
    { key: 'package_name', label: 'newPackageListing.displayName' },
    { key: 'insurer_type', label: 'newPackageListing.insuranceType' },
    { key: 'repair_type', label: 'newPackageListing.repairType' },
    { key: 'car_coverage', label: 'newPackageListing.carCoverage' },
    { key: 'deductible', label: 'newPackageListing.deductible' },
    { key: 'price', label: 'newPackageListing.price' },
    { key: 'paymentPlan', label: 'newPackageListing.paymentPlan' },
    { key: 'shippingFee', label: 'newPackageListing.shippingFee' },
    { key: 'discount', label: 'newPackageListing.discount' },
    { key: 'processingFee', label: 'newPackageListing.processingFee' },
    { key: 'premium', label: 'newPackageListing.invoicedAmount' },
  ];

  config.order.values = [
    { key: 'default', label: 'text.select' },
    { key: 'asc', label: 'asc' },
    { key: 'desc', label: 'desc' },
  ];

  return { config };
}

export const isPackageSelectedIsInstallmentApplicable = (
  lead: Lead | undefined
) => {
  const isValid = !(
    lead?.data?.checkout?.paymentOption !== 'FULL_PAYMENT' &&
    lead?.data?.checkout?.installments === 1
  );
  return isValid;
};

export const getDefaultPaymentOption = (
  lead: Lead,
  paymentOptions?: string[]
) => {
  if (lead?.data?.checkout?.paymentOption) {
    return lead.data.checkout.paymentOption;
  }

  if (paymentOptions?.length) {
    return paymentOptions[0];
  }

  return 'FULL_PAYMENT';
};

export function getDefaultValues(
  config: typeof defaultFilterConfig,
  lead: Lead,
  extra: {
    sumInsuredMinMax?: SumInsured;
    carInfo?: ICarInfo; // contains all car related initial data
  } = {}
) {
  const { sumInsuredMinMax, carInfo } = extra;
  const existingValues = getFilterValueFromStorage();
  const { insuranceKind, voluntaryInsuranceType } = lead?.data ?? {
    voluntaryInsruanceType: [],
  };

  let defaultValues: FilterInterface = {
    ...defaultFiltervalue,
    sumInsured: {
      min: 0,
      max: sumInsuredMinMax?.sumInsuredMax ?? defaultFiltervalue.sumInsured.max,
    },
    price: {
      min: config.price.config.min,
      max: config.price.config.max,
    },
    insurer: config.insurer.values.reduce(
      (p, ins) => ({ ...p, [ins.key]: true }),
      {}
    ),
    insuranceCategory: insuranceKind,
    insuranceType: (voluntaryInsuranceType ?? []).reduce(
      (p, v) => ({ ...p, [convertInsuranceType(v) as CarInsuranceType]: true }),
      { ...defaultFiltervalue.insuranceType }
    ),
  };
  if (carInfo) {
    defaultValues = {
      ...defaultValues,
      brand: carInfo?.brand,
      model: carInfo?.model,
      year: carInfo?.year,
      dashCam: carInfo?.carDashCam ?? false,
      engineSize: carInfo?.engineSize ?? undefined,
      noOfDoors: carInfo?.noOfDoors ?? undefined,
      modification: carInfo?.carModified ?? false,
      carSubModelYear: carInfo?.carSubModelYear ?? undefined,
      drivingPurpose: carInfo?.carUsageType ?? 'personal',
      province: carInfo?.registeredProvince,
    };
  }

  return {
    defaultValues: mergeStoredFilterWithLeadDefaults(
      defaultValues,
      existingValues
    ),
  };
}

export const getTrueValues = (obj: Record<string, boolean>) => {
  if (obj) {
    return Object.keys(obj).filter((key) => obj[key]);
  }
  return [];
};

export const getInsuranceCategory = (
  includeVoluntary: boolean,
  includeCompulsory: boolean
) => {
  if (includeVoluntary && includeCompulsory) {
    return INSURANCE_KIND.BOTH;
  }
  if (includeCompulsory) {
    return INSURANCE_KIND.MANDATORY;
  }
  if (includeVoluntary) {
    return INSURANCE_KIND.VOLUNTARY;
  }
  return '' as INSURANCE_KIND;
};

export const decodeDeductible = (type: FilterInterface['deductible']) =>
  type === 'all_packages' ? ['only_deductible', 'no_deductible'] : [type];

export const encodeDeductible = (typeArr: string[]) =>
  typeArr.length === 1 ? (typeArr[0] as Deductible) : 'all_packages';

export const decodeRepairType = (type: FilterInterface['repairType']) =>
  type === 'both' ? ['Dealer', 'Garage'] : [type];

export const encodeRepairType = (typeArr: string[]) =>
  (typeArr.length === 1 ? typeArr[0] : 'both') as CarRepairType;

export const decodeInsuranceType = (
  types: Record<string, boolean>,
  insuranceKind: InsuranceKind
) => {
  const returnArr: string[] = [];
  if (insuranceKind === 'both' || insuranceKind === 'voluntary') {
    returnArr.push(...getTrueValues(types));
  }
  if (insuranceKind === 'both' || insuranceKind === 'mandatory') {
    returnArr.push('mandatory');
  }
  return returnArr;
};

export const encodeInsuranceType = (typeArr: string[]) => {
  let includeMandatory = false;
  let includeVoluntary = false;
  const initialValue = {
    'Type 1': false,
    'Type 2': false,
    'Type 3': false,
    'Type 2+': false,
    'Type 3+': false,
  };
  typeArr.forEach((type) => {
    if (type === 'mandatory') {
      includeMandatory = true;
    } else {
      includeVoluntary = true;
      initialValue[type as CarInsuranceType] = true;
    }
  });
  return [
    getInsuranceCategory(includeVoluntary, includeMandatory),
    initialValue,
  ] as [INSURANCE_KIND, typeof initialValue];
};

export const getInsuranceKind = (kind: string) => {
  switch (kind) {
    case 'voluntary':
      return 'VOLUNTARY';
    case 'mandatory':
      return 'MANDATORY';
    case 'both':
    default:
      return 'BOTH';
  }
};

export const injectSumInsuredRangeToInsurer = (
  insurers: { key: string; label: string; logo: string }[],
  insurerInsuranceRange: InsurerSumInsuranceRange
) =>
  insurers.map((insurer) => {
    const range = insurerInsuranceRange.find(
      (sir) => sir.insurer === insurer.key
    );
    return {
      ...insurer,
      adornment:
        range &&
        `${formatSatangToBaht(range?.sumInsuredMin)} - ${formatSatangToBaht(
          range?.sumInsuredMax
        )}`,
    };
  });
