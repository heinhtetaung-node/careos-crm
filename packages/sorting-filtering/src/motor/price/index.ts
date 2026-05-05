import groupBy from 'lodash/groupBy';
import { Range } from '../../interface';

/**
 * Returns if the number is inside the provided range or not.
 * @param {object} range
 * @param {number} number
 */
export const isInRange = (range: Range, number: bigint) => {
  const { min, max } = range;
  return number >= min && number <= max;
};

/**
 * Returns unique package.
 * Returns the recently created package if price, sum_coverage are same.
 * @param {array} packagesData
 */
export const removeDuplicatePackages = (packagesData: any) => {
  const uniquePackages: any = [];

  const groupedByCalculatedSumInsuredPackages = groupBy(
    packagesData,
    'sumInsured'
  );

  Object.entries(groupedByCalculatedSumInsuredPackages).forEach(([, items]) => {
    if (items.length > 1) {
      const groupedByPricePackages = groupBy(items, 'invoicePrice');

      Object.entries(groupedByPricePackages).forEach(([, sumCoverageItems]) => {
        if (sumCoverageItems.length === 1) {
          uniquePackages.push(sumCoverageItems[0]);
        }
        if (sumCoverageItems.length > 1) {
          const groupedByCreatedDate = groupBy(sumCoverageItems, 'createdTime');
          const dateKeys = Object.keys(groupedByCreatedDate).sort((a, b) => {
            const dateA = new Date(a) as any;
            const dateB = new Date(b) as any;
            return dateB - dateA;
          });
          const firstDate = groupedByCreatedDate[dateKeys[0]];
          uniquePackages.push(firstDate[0]);
        }
      });
    }
    if (items.length === 1) {
      uniquePackages.push(items[0]);
    }
  });

  return uniquePackages;
};

const type1NonLowCostLogic = (packages: any, price: any) => {
  let type1NonLowCostPackages: any = [];

  // Check for packages with invoice_price inside the user selected range.
  const overlappingPackages = packages.filter((pack: any) => {
    return isInRange(price, BigInt(pack.invoice_price));
  });

  const companyPackages = groupBy(overlappingPackages, 'insuranceCompany.name');
  Object.entries(companyPackages).forEach(([, items]) => {
    const garagePackages: any = [];
    const dealerPackages = items.filter((item: any) => {
      if (item.car_repair_type === 'Garage') {
        garagePackages.push(item);
      }
      return item.car_repair_type === 'Dealer';
    });

    const type1GaragePackages = removeDuplicatePackages(garagePackages);
    const type1DealerPackages = removeDuplicatePackages(dealerPackages);

    type1NonLowCostPackages = [
      ...type1NonLowCostPackages,
      ...type1GaragePackages,
      ...type1DealerPackages,
    ];
  });

  return type1NonLowCostPackages;
};

const type1LowCost2p3pLogic = (packages: any, price: any) => {
  let type1LowCost2p3pPackages: any = [];

  const overlappingPackages = packages.filter((pack: any) => {
    return isInRange(price, BigInt(pack.invoicePrice));
  });

  overlappingPackages.forEach((item: any) => {
    // eslint-disable-next-line no-param-reassign
    item.sumInsured = item.sumCoverageMin;
  });

  const companyPackages = groupBy(overlappingPackages, 'insuranceCompany.name');

  Object.entries(companyPackages).forEach(([, items]) => {
    const garagePackages: any = [];
    const dealerPackages = items.filter((item: any) => {
      if (item.carRepairType === 'Garage') {
        garagePackages.push(item);
      }
      return item.carRepairType === 'Dealer';
    });

    const type1LowCost2p3pGaragePackages =
      removeDuplicatePackages(garagePackages);
    const type1LowCost2p3pDealerPackages =
      removeDuplicatePackages(dealerPackages);

    type1LowCost2p3pPackages = [
      ...type1LowCost2p3pPackages,
      ...type1LowCost2p3pGaragePackages,
      ...type1LowCost2p3pDealerPackages,
    ];
  });

  return type1LowCost2p3pPackages;
};

const filterPriceType1 = (packages: any, price: any) => {
  const type1NonLowCost: any = [];
  const type1LowCost = packages.filter((item: any) => {
    if (!item.isLowCost) {
      type1NonLowCost.push(item);
    }
    return item.isLowCost;
  });

  const type1NLC = type1NonLowCostLogic(type1NonLowCost, price);
  const type1LC = type1LowCost2p3pLogic(type1LowCost, price);

  return [...type1NLC, ...type1LC];
};

const filterPriceType23 = (packages: any, price: any) => {
  return packages.filter((pack: any) =>
    isInRange(price, BigInt(pack.invoicePrice))
  );
};

const filterPriceType2p3p = (packages: any, price: any) => {
  return type1LowCost2p3pLogic(packages, price);
};

/**
 * Filter packages by price logic
 * @param {array} packages
 * @param {object} config
 */
const filterPrice = (packages: any, config: any) => {
  let priceFilteredPackages: any = [];

  const groupedCarInsuranceType = groupBy(packages, 'carInsuranceType');

  Object.entries(groupedCarInsuranceType).forEach(([type, items]) => {
    switch (type) {
      case 'Type 1':
        priceFilteredPackages = [
          ...priceFilteredPackages,
          ...filterPriceType1(items, config.price),
        ];
        break;
      case 'Type 2':
      case 'Type 3':
        priceFilteredPackages = [
          ...priceFilteredPackages,
          ...filterPriceType23(items, config.price),
        ];
        break;
      case 'Type 2+':
      case 'Type 3+':
        priceFilteredPackages = [
          ...priceFilteredPackages,
          ...filterPriceType2p3p(items, config.price),
        ];
        break;
      default:
        break;
    }
  });

  return priceFilteredPackages;
};

export default filterPrice;
