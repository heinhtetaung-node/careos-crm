export type CarBrand = {
  displayName: string;
  name: string;
  order: number;
};

export type CarModel = {
  displayName: string;
  isCurated: boolean;
  isVan: boolean;
  name: string;
  order: number;
};

export type Option = {
  id: string;
  title: string;
  value: string;
};
