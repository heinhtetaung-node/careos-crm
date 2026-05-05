import InsuranceCompanies from 'careos-constants/constants/Insurer.json';
import groupBy from 'lodash/groupBy';

import { FilterInterface, Package } from 'interface';

import omissionFilter from './omissionFilter';
import filterInvoicePrice from './price';

export const TYPE_1_INSURANCE_ORDER = [
  InsuranceCompanies.BangkokInsurance,
  InsuranceCompanies.ThanachartInsurance,
  InsuranceCompanies.ViriyahInsurance,
  InsuranceCompanies.AXAInsurance,
  InsuranceCompanies.TokioMarineSafetyInsurance,
  InsuranceCompanies.ERGOInsurance,
  InsuranceCompanies.RoojaiInsurance,
  InsuranceCompanies.LMGInsurance,
];

export const TYPE_232P3P_INSURANCE_ORDER = [
  InsuranceCompanies.BangkokInsurance,
  InsuranceCompanies.ThanachartInsurance,
  InsuranceCompanies.ViriyahInsurance,
  InsuranceCompanies.AXAInsurance,
  InsuranceCompanies.TokioMarineSafetyInsurance,
  InsuranceCompanies.ERGOInsurance,
  InsuranceCompanies.RoojaiInsurance,
  InsuranceCompanies.LMGInsurance,
];

export const SORT_INSURANCE_BRAND_ORDER = [
  InsuranceCompanies.BangkokInsurance,
  InsuranceCompanies.ThanachartInsurance,
  InsuranceCompanies.ViriyahInsurance,
  InsuranceCompanies.AXAInsurance,
  InsuranceCompanies.TokioMarineSafetyInsurance,
  InsuranceCompanies.ERGOInsurance,
  InsuranceCompanies.RoojaiInsurance,
  InsuranceCompanies.LMGInsurance,
];

/**
 * Descending Sorts packages by package date
 * @param {array} packages
 * @param {string} key
 */
export const sortByDate = (packages: Package[], key: string) =>
  packages.sort((pack1: any, pack2: any) => {
    const time1 = new Date(pack1[key]).getTime();
    const time2 = new Date(pack2[key]).getTime();
    if (time1 < time2) return 1;
    if (time1 > time2) return -1;
    return 0;
  });

/**
 * Sorts packages by custom package
 * @param {array} packages
 */
export const sortByPackageType = (packages: any[]) => {
  if (packages && !packages.length) return [];

  const renewalPackages: any[] = [];
  const manualPackages: any[] = [];
  const customPackages: any[] = [];

  packages.forEach((pack: any) => {
    if (pack.packageSource === 'renewal_manual_quote') {
      renewalPackages.push(pack);
    }
    if (pack.packageSource === 'manual') {
      manualPackages.push(pack);
    }
    if (pack.packageSource === 'custom') {
      customPackages.push(pack);
    }
  });

  return [
    ...sortByDate(customPackages, 'createTime'),
    ...sortByDate(renewalPackages, 'createTime'),
    ...sortByDate(manualPackages, 'createTime'),
  ];
};

/**
 * Sort the items with insurance order
 * @param {array} items
 * @param {array} insuranceOrder
 */
const getSortedPackages = (
  items: Package[],
  insuranceOrder: any,
  locale: string
) => {
  const fixedInsuranceOrder = insuranceOrder.map(
    (insurance: any) => insurance.id
  );
  const alphabeticalInsurers: Package[] = [];
  const fixedInsurers = items.filter((item: Package) => {
    if (!fixedInsuranceOrder.includes(item.insuranceCompany.name)) {
      alphabeticalInsurers.push(item);
      return false;
    }
    return true;
  });

  const sortedFixedInsurers = [...fixedInsurers].sort(
    (a: Package, b: Package) =>
      fixedInsuranceOrder.indexOf(a.insuranceCompany.name) -
      fixedInsuranceOrder.indexOf(b.insuranceCompany.name)
  );

  const sortedAlphabeticalInsueres = [...alphabeticalInsurers].sort(
    (a: Package, b: Package) => {
      if (locale === 'en') {
        return a.insuranceCompany.shortnameEn.localeCompare(
          b.insuranceCompany.shortnameEn
        );
      }
      return a.insuranceCompany.shortnameTh.localeCompare(
        b.insuranceCompany.shortnameTh
      );
    }
  );

  return [...sortedFixedInsurers, ...sortedAlphabeticalInsueres];
};

/**
 * Sorts packages by brand or price
 * @param {array} packages
 * @param {object} config
 * @param {string} locale
 */
export const sortItems = (
  packages: Package[],
  config: FilterInterface,
  locale: string
) => {
  const sortedByPrice = packages
    .slice()
    .sort((a, b) => Number(BigInt(a.invoicePrice ?? 0) - BigInt(b.invoicePrice ?? 0)));

  if (config.sortBy === 'price') {
    return sortedByPrice;
  }

  if (config.sortBy === 'sumInsured') {
    return packages
      .slice()
      .sort((a, b) => Number(BigInt(a.sumCoverage ?? 0) - BigInt(b.sumCoverage ?? 0)));
  }

  if (config.sortBy === 'brand') {
    let type1Packages: Package[] = [];
    let type2Packages: Package[] = [];
    let type2pPackages: Package[] = [];
    let type3Packages: Package[] = [];
    let type3pPackages: Package[] = [];
    const groupedCarInsuranceType = groupBy(sortedByPrice, 'carInsuranceType');

    Object.entries(groupedCarInsuranceType).forEach(([type, items]) => {
      switch (type) {
        case 'Type 2+':
          type2pPackages = items;
          break;
        case 'Type 3+':
          type3pPackages = items;
          break;
        case 'Type 2':
          type2Packages = items;
          break;
        case 'Type 3':
          type3Packages = items;
          break;
        default:
          type1Packages = items;
          break;
      }
    });

    return getSortedPackages(
      [
        ...type1Packages,
        ...type2pPackages,
        ...type3pPackages,
        ...type2Packages,
        ...type3Packages,
      ],
      SORT_INSURANCE_BRAND_ORDER,
      locale
    );
  }

  return packages;
};

const defaultSortType1Packages = (items: any, locale: string) => {
  const type1NoDeductionPackages: any = [];
  const type1DeductionPackages = items.filter((item: any) => {
    const ded = item.deductibleAmount ?? 0;
    if (BigInt(ded) === BigInt(0)) {
      type1NoDeductionPackages.push(item);
    }
    return BigInt(ded) > BigInt(0);
  });

  const type1NoDeductionSortedPackages = getSortedPackages(
    type1NoDeductionPackages,
    TYPE_1_INSURANCE_ORDER,
    locale
  );

  const type1DeductionSortedPackages = getSortedPackages(
    type1DeductionPackages,
    TYPE_1_INSURANCE_ORDER,
    locale
  );

  return [...type1NoDeductionSortedPackages, ...type1DeductionSortedPackages];
};

const defaultSortOtherPackages = (items: any, locale: string) => {
  const descPriceSortedPackages = items.sort((a: any, b: any) =>
    Number(BigInt(b.invoicePrice ?? 0) - BigInt(a.invoicePrice ?? 0))
  );

  return getSortedPackages(
    descPriceSortedPackages,
    TYPE_232P3P_INSURANCE_ORDER,
    locale
  );
};

/**
 * Sorts packages by default logic
 * @param {array} packages
 */
export const defaultSortLogic = (packages: Package[], locale: string) => {
  let type1SortedPackages: any = [];
  let type2SortedPackages: any = [];
  let type2pSortedPackages: any = [];
  let type3SortedPackages: any = [];
  let type3pSortedPackages: any = [];

  const priceFilteredPackage = packages.sort((a: any, b: any) =>
    Number(BigInt(a.invoicePrice ?? 0) - BigInt(b.invoicePrice ?? 0))
  );
  const groupedCarInsuranceType = groupBy(
    priceFilteredPackage,
    'carInsuranceType'
  );

  Object.entries(groupedCarInsuranceType).forEach(([type, items]) => {
    switch (type) {
      case 'Type 2+':
        type2pSortedPackages = defaultSortOtherPackages(items, locale);
        break;
      case 'Type 3+':
        type3pSortedPackages = defaultSortOtherPackages(items, locale);
        break;
      case 'Type 2':
        type2SortedPackages = defaultSortOtherPackages(items, locale);
        break;
      case 'Type 3':
        type3SortedPackages = defaultSortOtherPackages(items, locale);
        break;
      default:
        type1SortedPackages = defaultSortType1Packages(items, locale);
        break;
    }
  });

  return [
    ...type1SortedPackages,
    ...type2pSortedPackages,
    ...type3pSortedPackages,
    ...type2SortedPackages,
    ...type3SortedPackages,
  ];
};

/**
 * Filter packages by insurance type
 * @param {array} packages
 * @param {object} config
 */
const filterInsuranceType = (packages: any, config: any) => {
  const selectedTypes: any = [];
  // convert hash to array
  Object.entries(config.insuranceType).forEach(
    ([name, value]) => value && selectedTypes.push(name)
  );

  return packages.filter((item: any) =>
    selectedTypes.includes(item.carInsuranceType)
  );
};

/**
 * Filter packages by insurance category
 * @param {array} packages
 * @param {object} config
 */
export const filterInsuranceCategory = (packages: any, config: any) => {
  if (config.insuranceCategory === 'both') {
    return packages;
  }
  return packages.filter(
    (item: any) => item.insuranceCategory === config.insuranceCategory
  );
};

/**
 * Filter packages by insurance repair type
 * @param {array} packages
 * @param {object} config
 */
const filterRepairType = (packages: any, config: any) => {
  if (config.repairType === 'both') {
    return packages;
  }

  return packages.filter(
    (item: any) => item.carRepairType === config.repairType
  );
};

/**
 * Filter packages by deductible
 * @param {array} packages
 * @param {object} config
 */
export const filterDeductible = (packages: any, config: any) => {
  if (config.deductible === 'all_packages') {
    return packages;
  }

  if (config.deductible === 'only_deductible') {
    return packages.filter(
      (pack: any) => BigInt(pack.deductibleAmount) > BigInt(0)
    );
  }

  if (config.deductible === 'no_deductible') {
    return packages.filter(
      (pack: any) => BigInt(pack.deductibleAmount) <= BigInt(0)
    );
  }

  return packages;
};

/**
 * Filter packages by modification
 * @param {array} packages
 * @param {object} config
 */
export const filterModification = (packages: any, config: any) => {
  if (!config.modification) {
    return packages;
  }

  if (config.modification === 'true') {
    return packages.filter((pack: any) => pack.modifiedCarAccepted);
  }

  if (config.modification === 'false') {
    return packages.filter((pack: any) => !pack.modifiedCarAccepted);
  }

  return packages;
};

/**
 * Filter packages by insurer
 * @param {array} packages
 * @param {object} config
 */
const filterInsurer = (packages: any, config: any) => {
  const selectedInsurer: any = [];
  // convert hash to array
  Object.entries(config.insurer).forEach(
    ([name, value]) => value && selectedInsurer.push(name)
  );

  return packages.filter((pack: any) =>
    selectedInsurer.includes(pack.insuranceCompany.name)
  );
};

/**
 * Sorts and filter packages for given config
 * @param {array} packages
 * @param {object} config - Current filter values
 */
const curatedSortAndFilter = (
  packages: Package[],
  config: FilterInterface,
  showAllPackages: boolean,
  applyOmissionLogic: boolean,
  locale: string
) => {
  const allPackages = JSON.parse(JSON.stringify(packages));
  let normalPackages: any = [];
  const compulsoryPackages: any = [];
  const customPackage = allPackages.filter((item: any) => {
    const isCustom =
      item.packageSource === 'renewal_manual_quote' ||
      item.packageSource === 'manual' ||
      item.packageSource === 'custom';

    if (!isCustom) {
      if (item.insuranceCategory === 'mandatory') {
        compulsoryPackages.push(item);
      } else {
        normalPackages.push(item);
      }
    }

    return isCustom;
  });

  // Omission logic
  if (
    applyOmissionLogic &&
    config &&
    !config.price &&
    !config.sumInsured &&
    !showAllPackages
  ) {
    normalPackages = omissionFilter(normalPackages);
  }

  if (!config.sortBy || config.sortBy === 'default') {
    normalPackages = defaultSortLogic(normalPackages, locale);
  }

  if (config.sortBy && config.sortBy !== 'default') {
    normalPackages = sortItems(normalPackages, config, locale);
  }

  normalPackages = [...normalPackages, ...compulsoryPackages];

  if (config.insuranceCategory) {
    normalPackages = filterInsuranceCategory(normalPackages, config);
  }

  if (config.insuranceCategory !== 'mandatory' && config.insuranceType) {
    normalPackages = filterInsuranceType(normalPackages, config);
  }

  if (config.repairType) {
    normalPackages = filterRepairType(normalPackages, config);
  }

  if (config.deductible) {
    normalPackages = filterDeductible(normalPackages, config);
  }

  if (config.insurer) {
    normalPackages = filterInsurer(normalPackages, config);
  }

  if (config.modification) {
    normalPackages = filterModification(normalPackages, config);
  }

  if (config.sumInsured) {
    if (config.price) {
      // Why are we returning here?
      return {
        normalPackages: normalPackages.filter(
          (item: any) =>
            BigInt(item.invoicePrice) >= (config.price?.min as bigint) &&
            BigInt(item.invoicePrice) <= (config.price?.max as bigint)
        ),
        customPackages: sortByPackageType(customPackage),
      };
    }
  }

  if (config.price && !config.sumInsured) {
    normalPackages = filterInvoicePrice(normalPackages, config);
  }

  return {
    normalPackages,
    customPackages: sortByPackageType(customPackage),
  };
};

export default curatedSortAndFilter;
