import { TInsuranceType } from '../../../constants/packageStaticData';

export interface IPackageFormValue {
  status: string;
  insurer: Record<string, string | number>[];
  insuranceType: TInsuranceType[];
  searchInput: string;
}
export enum SEARCH_TYPE {
  MATCH = 'match',
  IN = 'in',
  CONTAIN = 'contain',
}
