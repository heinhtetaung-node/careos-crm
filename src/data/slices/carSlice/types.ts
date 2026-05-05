export interface SubCarModalPayload {
  subModelYear: number;
  registeredProvince: number;
}
export interface SubCarModelResponse {
  year: number;
  brand: string;
  model: string;
  subModel: string;
  engineSize: number;
  transmissionType: string;
  sumInsuredMax: number;
  carProvince: string;
  carProvinceOIC: {
    responseTimes: number;
    value: string;
  };
  noOfDoor: number;
  cabType: string;
  isCurated: boolean;
  isVan: boolean;
  fuelType: string;
}
export interface ISubCarModal {
  name: string;
  year: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  fuelType: string;
  month: number;
  redbookId: string;
  migratedAsCurated: boolean;
  price: string;
  displayName: string;
  engineSize: number;
  isEnabled: boolean;
}
export interface SubCarModalResponse {
  years: ISubCarModal[];
}

export type CarQuery = {
  resourceType: 'brands' | 'models' | 'submodels' | 'years';
  brands?: string;
  models?: string;
  submodels?: string;
  years?: string;
};
