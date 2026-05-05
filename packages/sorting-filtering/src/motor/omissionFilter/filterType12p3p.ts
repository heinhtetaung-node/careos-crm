import groupBy from 'lodash/groupBy';

import { Package } from 'interface';

const getfilteredPackagesByRepairType = (packagesData: any) => {
  const filteredPackages = [];

  const lowestInvoicePrice = groupBy(packagesData, 'invoicePrice');
  const priceKeys = Object.keys(lowestInvoicePrice).sort(
    (a: any, b: any) => a - b
  );
  const lowestPricePackages = lowestInvoicePrice[priceKeys[0]];

  if (lowestPricePackages.length && lowestPricePackages.length > 1) {
    const groupedByCreatedDate = groupBy(lowestPricePackages, 'createdTime');

    // Get the date keys
    const dateKeys = Object.keys(groupedByCreatedDate).sort((a, b) => {
      const dateA = new Date(a) as any;
      const dateB = new Date(b) as any;
      return dateB - dateA;
    });

    // Get the package with latest date.
    const firstDate = groupedByCreatedDate[dateKeys[0]];
    filteredPackages.push(firstDate[0]);
  } else if (lowestPricePackages.length === 1) {
    filteredPackages.push(lowestPricePackages[0]);
  }
  return filteredPackages;
};

const getLowestLatestPackage = (packageData: any) => {
  let filteredGaragePackages = [];
  let filteredDealerPackages = [];

  const garagePackages: any = [];
  const dealerPackages = packageData.filter((item: any) => {
    if (item.car_repair_type === 'Garage') {
      garagePackages.push(item);
    }
    return item.car_repair_type === 'Dealer';
  });

  if (garagePackages.length) {
    filteredGaragePackages = getfilteredPackagesByRepairType(garagePackages);
  }
  if (dealerPackages.length) {
    filteredDealerPackages = getfilteredPackagesByRepairType(dealerPackages);
  }

  return [...filteredGaragePackages, ...filteredDealerPackages];
};

/**
 * Apply omission logic to packageData per insurance type
 * @param {Object[]} packagesData
 */
const getPackagesPerType = (packagesData: any) => {
  let filteredPackages: any = [];

  // Filter only the packages that overlap
  const overlapPackages = packagesData.filter(
    (pack: any) =>
      pack.sum_coverage_min >= pack.sum_insured_min &&
      pack.sum_coverage_min <= pack.sum_insured_default
  );

  // Group packages by insurance company.
  const companyPackages = groupBy(overlapPackages, 'insuranceCompany.name');

  Object.entries(companyPackages).forEach(([, items]) => {
    const sortedCoverageMinPackages = groupBy(items, 'sumCoverageMin');

    // Get the lowest price keys
    const priceKeys = Object.keys(sortedCoverageMinPackages).sort(
      (a: any, b: any) => a - b
    );

    if (priceKeys.length > 1) {
      // Get the packages with lowest price.
      const lowestPricePackages = sortedCoverageMinPackages[priceKeys[0]];
      const highestPricePackages =
        sortedCoverageMinPackages[priceKeys[priceKeys.length - 1]];

      const lowPricePackages = getLowestLatestPackage(lowestPricePackages);
      const highPricePackages = getLowestLatestPackage(highestPricePackages);

      filteredPackages = [
        ...filteredPackages,
        ...lowPricePackages,
        ...highPricePackages,
      ];
    } else if (priceKeys.length === 1) {
      const pricePackage = getLowestLatestPackage(
        sortedCoverageMinPackages[priceKeys[0]]
      );

      filteredPackages = [...filteredPackages, ...pricePackage];
    }
  });

  return filteredPackages;
};

/**
 * Apply omission logic to type 1 low cost, type 2+ and type 3+ packages
 * @param {Object[]} packages
 * @param {boolean} isDeductible
 */
const filterType12p3p = (packages: Package[]) => {
  // Filter Type 1 Packages which is low cost
  const type1Packages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 1' && pack.is_low_cost
  );

  // Filter Type 2+ Packages
  const type2pPackages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 2+'
  );

  // Filter Type 3+ Packages which is low cost
  const type3pPackages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 3+'
  );

  const typeOneFilteredPackages = getPackagesPerType(type1Packages);
  const typeTwoPFilteredPackages = getPackagesPerType(type2pPackages);
  const typeThreePFilteredPackages = getPackagesPerType(type3pPackages);

  return [
    ...typeOneFilteredPackages,
    ...typeTwoPFilteredPackages,
    ...typeThreePFilteredPackages,
  ];
};

export default filterType12p3p;
