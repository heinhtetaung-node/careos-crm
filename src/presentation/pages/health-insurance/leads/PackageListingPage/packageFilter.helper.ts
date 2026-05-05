import _upperFirst from 'lodash/upperFirst';

import { getString } from 'presentation/theme/localization';
import { HealthLead } from 'shared/types/lead';

import defaultFilterConfig, {
  getProductCoverages,
  getProductFeatures,
} from './filterConfig';

import { Deductible, FilterInterface } from './interface';

export const defaultFiltervalue: FilterInterface = {
  sortBy: 'default',
  coverageType: {
    'OPD Outpatient': false,
    Maternity: false,
    'Health Check Up': false,
    'Dental Treatment': false,
    'Eyes Treatment': false,
    'Covid-19': false,
    'Emergency Accident': false,
    'Daily Compensation': false,
    BDMS: false,
    Cancer: false,
    'Critical illness': false,
    'PA Loss Of Life': false,
  },
  deductible: 'no_deductible',
  price: {
    min: 0,
    max: 100000,
  },
  sumInsured: {
    min: 0,
    max: 0,
  },
  insurer: {
    'insurers/17': false,
    'insurers/1': false,
    'insurers/10': false,
    'insurers/9': false,
    'insurers/30': false,
  },
  premium: {
    min: 0,
    max: 0,
  },
  ipdCoverage: {
    min: 0,
    max: 0,
  },
  opdCoverage: {
    min: 0,
    max: 0,
  },
  features: {
    'Pay on diagnosis': false,
    'Eligible for foreigner': false,
    Installment: false,
    Deductible: false,
    Worldwide: false,
    'Longstay VISA': false,
    'Co-pay': false,
    'Lump sum': false,
    'Daily Compensation': false,
  },
};

type Insurer = {
  id: string;
  name: string;
  logo: string;
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

export const convertInsuranceType = (type: string) =>
  _upperFirst(type.replace('_', ' '));

export function getFilterConfig(insurancePackages: any[]) {
  const config = defaultFilterConfig;

  const insurers: Insurer[] = [];

  insurancePackages.forEach(({ package: pkg }) => {
    if (!insurers.some((insurer) => insurer.id === pkg?.insurer)) {
      insurers.push({
        id: pkg?.insurer,
        name:
          getString('text.yes') === 'Yes'
            ? pkg.insurerDetails?.localisedName?.nameEn
            : pkg.insurerDetails?.localisedName?.nameTh,
        logo: '',
      });
    }
  });

  if (insurers.length > 0) {
    config.insurer.values = getInsurers(insurers) as any;
  }

  const productCoverages = getProductCoverages(insurancePackages);
  if (productCoverages.length) {
    config.coverageType.values = productCoverages;
  }

  return { config };
}

export function getDefaultValues(
  config: typeof defaultFilterConfig,
  lead: HealthLead
) {
  const { insurance } = lead?.data ?? {};

  const defaultValues: FilterInterface = {
    ...defaultFiltervalue,
    price: {
      min: config.price.config.min,
      max: config.price.config.max,
    },
    insurer: config.insurer.values.reduce(
      (p, ins) => ({
        ...p,
        [ins.key]: true,
      }),
      {}
    ),
    coverageType: ((insurance?.coverages as any) ?? []).reduce(
      (p: any, v: any) => ({ ...p, [v]: true }),
      {}
    ),
    premium: {
      min: config.premium.config.min,
      max: config.premium.config.min,
    },
    features: config.features.values.reduce(
      (p, ins) => ({
        ...p,
        [ins.key]: true,
      }),
      {}
    ),
  };

  return { defaultValues };
}

export const getTrueValues = (obj: Record<string, boolean>) => {
  if (obj) {
    return Object.keys(obj).filter((key) => obj[key]);
  }
  return [];
};

export const decodeDeductible = (type: FilterInterface['deductible']) =>
  type === 'all_packages' ? ['only_deductible', 'no_deductible'] : [type];

export const encodeDeductible = (typeArr: string[]) =>
  typeArr.length === 1 ? (typeArr[0] as Deductible) : 'all_packages';
