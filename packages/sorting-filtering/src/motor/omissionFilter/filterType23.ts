import { Package } from 'interface';
import groupBy from 'lodash/groupBy';

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

  // Group packages by insurance company.
  const companyPackages = groupBy(packagesData, 'insuranceCompany.name');

  Object.entries(companyPackages).forEach(([, items]) => {
    const invoicePriceSortedData = groupBy(items, 'invoicePrice');

    // Get the lowest price keys
    const priceKeys = Object.keys(invoicePriceSortedData).sort(
      (a: any, b: any) => a - b
    );

    if (priceKeys.length > 1) {
      // Get the packages with lowest price.
      const lowestPricePackages = invoicePriceSortedData[priceKeys[0]];
      const highestPricePackages =
        invoicePriceSortedData[priceKeys[priceKeys.length - 1]];

      const lowPricePackages = getLowestLatestPackage(lowestPricePackages);
      const highPricePackages = getLowestLatestPackage(highestPricePackages);

      filteredPackages = [
        ...filteredPackages,
        ...lowPricePackages,
        ...highPricePackages,
      ];
    } else if (priceKeys.length === 1) {
      const pricePackage = getLowestLatestPackage(
        invoicePriceSortedData[priceKeys[0]]
      );

      filteredPackages = [...filteredPackages, ...pricePackage];
    }
  });

  return filteredPackages;
};

/**
 * Apply omission logic to type 2 and type 3 packages
 * @param {Object[]} packages
 * @param {boolean} isDeductible
 */
const filterType23 = (packages: Package[]) => {
  // Filter Type 2 Packages
  const type2Packages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 2'
  );

  // Filter Type 3 Packages
  const type3Packages = packages.filter(
    (pack: any) => pack.car_insurance_type === 'Type 3'
  );

  const type2FilteredPackages = getPackagesPerType(type2Packages);
  const type3FilteredPackages = getPackagesPerType(type3Packages);

  return [...type2FilteredPackages, ...type3FilteredPackages];
};

export default filterType23;
