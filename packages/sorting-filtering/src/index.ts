import { FilterInterface, Package as PkgInterface } from './interface';
import motorSortAndFilter from './motor';
import type { CarInsuranceType as InsuranceType } from './interface';

function sortAndFilter(
  type: string,
  apiPackages: PkgInterface[],
  filterValues: FilterInterface,
  showAllPackages = false,
  applyOmissionLogic = false,
  locale = 'en'
) {
  if (type === 'motor') {
    return motorSortAndFilter(
      apiPackages,
      filterValues,
      showAllPackages,
      applyOmissionLogic,
      locale
    );
  }
  return {
    normalPackages: apiPackages,
    customPackages: [],
  };
}

export type CarInsuranceType = InsuranceType;

export type Package = PkgInterface;

export type InsurerOrder = {
  id: string;
};

export {
  TYPE_1_INSURANCE_ORDER,
  TYPE_232P3P_INSURANCE_ORDER,
  SORT_INSURANCE_BRAND_ORDER,
} from './motor';

export default sortAndFilter;
