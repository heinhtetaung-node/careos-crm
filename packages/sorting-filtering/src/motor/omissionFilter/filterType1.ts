import { Package } from 'interface';
import groupBy from 'lodash/groupBy';

/**
 * Apply omission logic to type 1 and type1 low cost
 * @param {Object[]} packagesData
 */
const getType1PackagesByRepairType = (packagesData: any) => {
  const type1Packages = [];
  const groupedPackages = groupBy(packagesData, 'invoicePrice');
  // Get the lowest price keys
  const priceKeys = Object.keys(groupedPackages).sort(
    (a: any, b: any) => a - b
  );
  // Get the packages with lowest price.
  const lowestPricePackages = groupedPackages[priceKeys[0]];

  // If more than 1 package with same insurance company, price and car_repair_type
  if (lowestPricePackages?.length > 1) {
    // Group the packages with created date.
    const groupedByCreatedDate = groupBy(lowestPricePackages, 'createdTime');
    // Get the date keys
    const dateKeys = Object.keys(groupedByCreatedDate).sort((a, b) => {
      const dateA = new Date(a) as any;
      const dateB = new Date(b) as any;
      return dateB - dateA;
    });
    // Get the package with latest date.
    const firstDate = groupedByCreatedDate[dateKeys[0]];

    // If more than 1 package created on same day with same insurance company, price and car_repair_type
    if (firstDate?.length > 1) {
      // Check the source of sum_coverage_type and filter only 'sum_insured_default'
      const filteredPackageSumCoverageType = firstDate.filter(
        (packageDate: any) =>
          packageDate.sumCoverageType === 'sumInsuredDefault'
      );

      // if there is still more than 1 package add the 1st one.
      if (filteredPackageSumCoverageType.length) {
        type1Packages.push(filteredPackageSumCoverageType[0]);
      }
    } else if (lowestPricePackages?.length === 1) {
      // if there is only 1 package
      type1Packages.push(firstDate[0]);
    }
  } else if (lowestPricePackages?.length === 1) {
    // if there is only 1 package
    type1Packages.push(lowestPricePackages[0]);
  }

  return type1Packages;
};

/**
 * Apply omission logic to type 1 and type1 low cost
 * @param {Object[]} packages
 * @param {boolean} isDeductible
 */
const filterType1 = (packages: Package[], isDeductible = false) => {
  // Filter Type 1 Packages which is not low cost
  const type1Packages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 1' && !pack.is_low_cost
  );

  // Filter according to the isDeductible
  const deductibleFilteredPackages = type1Packages.filter((pack: any) => {
    if (isDeductible) {
      return pack.deductible_amount > 0;
    }
    return pack.deductible_amount === 0;
  });

  // Filter according to 3.1.1
  const overlapPackages = deductibleFilteredPackages.filter(
    (pack: any) =>
      pack.sum_insured_default >= pack.sum_coverage_min &&
      pack.sum_insured_default <= pack.sum_coverage_max
  );

  // Group packages by insurance company.
  const companyPackages = groupBy(overlapPackages, 'insuranceCompany.name');

  let uniquePriceCompanyPackage: any = [];
  Object.entries(companyPackages).forEach(([, items]) => {
    // Filter package according to car_repair_type
    const garagePackages: any = [];
    const dealerPackages = items.filter((item: any) => {
      if (item.car_repair_type === 'Garage') {
        garagePackages.push(item);
      }
      return item.car_repair_type === 'Dealer';
    });

    const type1GaragePackages = getType1PackagesByRepairType(garagePackages);
    const type1DealerPackages = getType1PackagesByRepairType(dealerPackages);

    uniquePriceCompanyPackage = [
      ...uniquePriceCompanyPackage,
      ...type1GaragePackages,
      ...type1DealerPackages,
    ];
  });

  return uniquePriceCompanyPackage;
};

export default filterType1;
