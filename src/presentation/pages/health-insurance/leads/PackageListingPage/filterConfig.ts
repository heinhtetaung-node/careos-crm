import _ from 'lodash';
import { getString } from 'presentation/theme/localization';

export const getProductFeatures = (packages: any[]) => {
  const uniqueFeatures = _.uniqBy(
    _.flatMap(packages ?? [], (item) => item?.package?.features),
    'code'
  );
  return uniqueFeatures.map((feature) => ({
    key: feature.code,
    label: feature.displayName,
  }));
};

export const productCategory = () => [
  {
    id: 0,
    title: getString('text.pleaseSelect'),
    disabled: true,
    value: '',
  },
  {
    id: 1,
    title: getString('healthPackageFilter.productCategory.ipdOpd'),
    value: 'ipdOpd',
  },
  {
    id: 2,
    title: getString('healthPackageFilter.productCategory.specificDisease'),
    value: 'disease',
  },
  {
    id: 3,
    title: getString('healthPackageFilter.productCategory.personalAccident'),
    value: 'pa',
  },
  {
    id: 4,
    title: getString('healthPackageFilter.productCategory.home'),
    value: 'home',
  },
  {
    id: 5,
    title: getString('healthPackageFilter.productCategory.life'),
    value: 'life',
  },
];

const formatItemsToOptions = (opt: string[], id: string) => [
  { id: 0, value: '', title: getString('text.select'), disabled: true }, // First item
  ...opt.map((type, index) => ({
    id: index + 1,
    title: getString(`healthPackageFilter.${id}.${type}`),
    value: type,
  })), // Remaining items
];

// sub category
const getIpdOpdCategoryAndPlan = () => ({
  types: formatItemsToOptions(['type_1', 'type_2'], 'possibleValue.plan'),
  subCategory: formatItemsToOptions(
    ['individuals', 'kidSeasonalDisease'],
    'productSubCategory'
  ),
  coverages: formatItemsToOptions(
    [
      'opdcov',
      'eropd',
      'ipdopdhap',
      'BDMS',
      'ci',
      'palossoflife',
      'kidSeasonalDisease',
    ],
    'possibleValue.coverageType'
  ),
});
const getDiseaseCategoryAndPlan = () => ({
  subCategory: formatItemsToOptions(['cancer'], 'productSubCategory'),
  coverages: formatItemsToOptions(
    ['increase', 'payOnDiagnosis', 'compensation'],
    'possibleValue.coverageType'
  ),
});
const getPACategoryAndPlan = () => ({
  subCategory: formatItemsToOptions(
    [
      'medicalExpense',
      'extremeSportAccidents',
      'highRiskOccupation',
      'lostOfLife',
    ],
    'productSubCategory'
  ),
  coverages: formatItemsToOptions(
    ['pahap', 'funeral'],
    'possibleValue.coverageType'
  ),
});

export const getProductCategoryAndPlan: (
  type: string
) => { coverages: any[]; types?: any[]; subCategory: any[] } | null = (
  type
) => {
  switch (type) {
    case 'ipdOpd':
      return getIpdOpdCategoryAndPlan();
    case 'disease':
      return getDiseaseCategoryAndPlan();
    case 'pa':
      return getPACategoryAndPlan();
    default:
      return null;
  }
};

export const productSubCategory = () => [
  {
    id: 0,
    title: getString('text.pleaseSelect'),
    disabled: true,
    value: '',
  },
  {
    id: 1,
    title: getString('healthPackageFilter.productSubCategory.elite'),
    value: 'elite',
    category: 'ipdOpd',
  },
  {
    id: 2,
    title: getString('healthPackageFilter.productSubCategory.individual'),
    value: 'individuals',
    category: 'ipdOpd',
  },
  {
    id: 3,
    title: getString('healthPackageFilter.productSubCategory.expats'),
    value: 'expats',
    category: 'ipdOpd',
  },
  {
    id: 4,
    title: getString('healthPackageFilter.productSubCategory.cancer'),
    value: 'cancer',
    category: 'disease',
  },
  {
    id: 5,
    title: getString('healthPackageFilter.productSubCategory.seasonalDiseases'),
    value: 'seasonalDiseases',
    category: 'disease',
  },
  {
    id: 6,
    title: getString('healthPackageFilter.productSubCategory.diabetesHbp'),
    value: 'diabetesHbp',
    category: 'disease',
  },
  {
    id: 7,
    title: getString('healthPackageFilter.productSubCategory.officialSyndrome'),
    value: 'officialSyndrome',
    category: 'disease',
  },
  {
    id: 8,
    title: getString('healthPackageFilter.productSubCategory.viralDiseases'),
    value: 'viralDiseases',
    category: 'disease',
  },
  {
    id: 9,
    title: getString('healthPackageFilter.productSubCategory.heartAttack'),
    value: 'heartAttack',
    category: 'disease',
  },
  {
    id: 10,
    title: getString(
      'healthPackageFilter.productSubCategory.kidSeasonalDisease'
    ),
    value: 'kidSeasonalDisease',
    category: 'pa',
  },
  {
    id: 11,
    title: getString('healthPackageFilter.productSubCategory.medicalExpense'),
    value: 'medicalExpense',
    category: 'pa',
  },
  {
    id: 12,
    title: getString(
      'healthPackageFilter.productSubCategory.highRiskOccupation'
    ),
    value: 'highRiskOccupation',
    category: 'pa',
  },
  {
    id: 13,
    title: getString('healthPackageFilter.productSubCategory.lostOfLife'),
    value: 'lostOfLife',
    category: 'pa',
  },
  {
    id: 14,
    title: getString(
      'healthPackageFilter.productSubCategory.extremeSportAccidents'
    ),
    value: 'extremeSportAccidents',
    category: 'pa',
  },
];

export const productPlan = [
  {
    id: 0,
    title: getString('text.pleaseSelect'),
    disabled: true,
    value: '',
  },
  {
    id: 1,
    title: 'Type 1',
    value: 'type_1',
  },
  {
    id: 2,
    title: 'Type 2',
    value: 'type_2',
  },
];

export const insurerList = [
  {
    key: 'insurers/27',
    label: 'healthPackageFilter.possibleValue.insurers.viriyahInsurance',
    logo: '',
    value: 27,
  },
  {
    key: 'insurers/7',
    label: 'healthPackageFilter.possibleValue.insurers.bangkokInsurance',
    logo: '',
    value: 7,
  },
  {
    key: 'insurers/33',
    label: 'healthPackageFilter.possibleValue.insurers.LMGInsurance',
    logo: '',
    value: 33,
  },
  {
    key: 'insurers/17',
    label: 'healthPackageFilter.possibleValue.insurers.muangThaiInsurance',
    logo: '',
    value: 17,
  },
  {
    key: 'insurers/30',
    label: 'healthPackageFilter.possibleValue.insurers.generalInsurance',
    logo: '',
    value: 30,
  },
];

export default {
  sort: {
    title: 'leadPackageFilter.sortBy',
    tooltip: 'leadPackageFilter.tooltip.sortBy',
    type: 'selectbox',
    values: [
      { key: 'default', label: 'text.select' },
      {
        key: 'premiumLowest',
        label: 'healthPackageFilter.sortByOptions.premiumLowest',
      },
      {
        key: 'premiumHighest',
        label: 'healthPackageFilter.sortByOptions.premiumHighest',
      },
      {
        key: 'maxLowest',
        label: 'healthPackageFilter.sortByOptions.maxLowest',
      },
      {
        key: 'maxHighest',
        label: 'healthPackageFilter.sortByOptions.maxHighest',
      },
      {
        key: 'hospitalLowest',
        label: 'healthPackageFilter.sortByOptions.hospitalLowest',
      },
      {
        key: 'hospitalHighest',
        label: 'healthPackageFilter.sortByOptions.hospitalHighest',
      },
    ],
  },
  coverageType: {
    title: 'healthPackageFilter.coverageType',
    tooltip: 'healthPackageFilter.tooltip.coverageType',
    type: 'checkbox',
    values: [
      {
        key: 'opdcov',
        label: 'healthPackageFilter.possibleValue.coverageType.opdcov',
        category: 'ipdOpd',
      },
      {
        key: 'eropd',
        label: 'healthPackageFilter.possibleValue.coverageType.eropd',
        category: 'ipdOpd',
      },
      {
        key: 'ipdopdhap',
        label: 'healthPackageFilter.possibleValue.coverageType.ipdopdhap',
        category: 'ipdOpd',
      },
      {
        key: 'BDMS',
        label: 'healthPackageFilter.possibleValue.coverageType.BDMS',
        category: 'ipdOpd',
      },
      {
        key: 'ci',
        label: 'healthPackageFilter.possibleValue.coverageType.ci',
        category: 'ipdOpd',
      },
      {
        key: 'palossoflife',
        label: 'healthPackageFilter.possibleValue.coverageType.palossoflife',
        category: 'ipdOpd',
      },
      {
        key: 'kidSeasonalDisease',
        label:
          'healthPackageFilter.possibleValue.coverageType.kidSeasonalDisease',
        category: 'ipdOpd',
      },
      {
        key: 'increase',
        label: 'healthPackageFilter.possibleValue.coverageType.increase',
        category: 'disease',
      },
      {
        key: 'payOnDiagnosis',
        label: 'healthPackageFilter.possibleValue.coverageType.payOnDiagnosis',
        category: 'disease',
      },
      {
        key: 'compensation',
        label: 'healthPackageFilter.possibleValue.coverageType.compensation',
        category: 'disease',
      },
      {
        key: 'pahap',
        label: 'healthPackageFilter.possibleValue.coverageType.pahap',
        category: 'pa',
      },
      {
        key: 'funeral',
        label: 'healthPackageFilter.possibleValue.coverageType.funeral',
        category: 'pa',
      },
    ],
  },
  insurer: {
    title: 'leadPackageFilter.insurer',
    tooltip: 'leadPackageFilter.tooltip.insurer',
    type: 'checkbox',
    values: insurerList,
  },
  features: {
    title: 'healthPackageFilter.features',
    tooltip: 'healthPackageFilter.tooltip.features',
    type: 'checkbox',
    values: [
      {
        key: 'payOnDiagnosisFeature',
        label: 'healthPackageFilter.possibleValue.features.payOnDiagnosis',
      },
      {
        key: 'eligibleForForeigner',
        label:
          'healthPackageFilter.possibleValue.features.eligibleForForeigner',
      },
      {
        key: 'installment',
        label: 'healthPackageFilter.possibleValue.features.installment',
      },
      {
        key: 'deductible',
        label: 'healthPackageFilter.possibleValue.features.deductible',
      },
      {
        key: 'wwCoverage',
        label: 'healthPackageFilter.possibleValue.features.worldwide',
      },
      {
        key: 'longStay',
        label: 'healthPackageFilter.possibleValue.features.longstayVisa',
      },
      {
        key: 'coPay',
        label: 'healthPackageFilter.possibleValue.features.coPay',
      },
      {
        key: 'lumpsum',
        label: 'healthPackageFilter.possibleValue.features.lumpSum',
      },
      {
        key: 'hap',
        label: 'healthPackageFilter.possibleValue.features.dailyCompensation',
      },
      {
        key: 'taxDeduction',
        label: 'healthPackageFilter.possibleValue.features.taxDeduction',
      },
      {
        label: 'healthPackageFilter.possibleValue.features.fixedPremium', // Lifetime fixed premium
        key: 'fixedPremium',
      },
    ],
  },
  premium: {
    title: 'healthPackageFilter.premium',
    tooltip: 'healthPackageFilter.tooltip.premium',
    type: 'slidebar',
    config: {
      min: 2320,
      max: 93000,
      step: 1,
    },
  },
  ipdCoverage: {
    title: 'healthPackageFilter.ipdCoverage',
    tooltip: 'healthPackageFilter.tooltip.ipdCoverage',
    type: 'slidebar',
    config: {
      min: 0,
      max: 20000000,
      step: 1,
    },
  },
  opdCoverage: {
    title: 'healthPackageFilter.opdCoverage',
    tooltip: 'healthPackageFilter.tooltip.opdCoverage',
    type: 'slidebar',
    config: {
      min: 0,
      max: 10000,
      step: 1,
    },
  },
  price: {
    title: 'leadPackageFilter.price',
    tooltip: 'leadPackageFilter.tooltip.price',
    type: 'slidebar',
    config: {
      min: 0,
      max: 0,
      step: 1,
    },
  },
};

export const getProductCoverages = (packages: any[]) => {
  const uniqueCategories = _.uniq(
    _.flatMap(packages ?? [], (item) => item?.package?.category)
  );

  let categories: { key: string; label: string; category: string }[] = [];

  uniqueCategories.forEach((type) => {
    categories =
      getProductCategoryAndPlan(type)
        ?.coverages?.filter((a) => a.value)
        .map((coverage: any) => ({
          key: coverage.value,
          label: coverage.title,
          category: coverage.value,
        })) ?? [];
  });
  return categories;
};
