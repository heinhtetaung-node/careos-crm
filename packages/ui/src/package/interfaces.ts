import React from 'react';

type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

export interface DetailSectionList {
  hasData: boolean;
  key: string | number;
  title: string;
  packages: string[];
  items: DetailSectionItem[];
}

export interface DetailSectionItem {
  isEmpty?: boolean;
  label: string;
  values: ObjectFromList<DetailSectionList['packages'], Values>;
}

export interface Values {
  component: React.ReactNode;
}

export interface CarDetails {
  name: string;
  year: number;
  submodelName: string;
  engineSize: number;
  engineDescription: number;
  transmissionType: string;
  cabType: string;
  doors: number;
  sumInsuredMin: number;
  sumInsuredMax: number;
  fuelType: string;
  month: number;
  migratedAsCurated: boolean;
  price: string;
  displayName: string;
  isEnabled: boolean;
  isCurated: boolean;
  isVan: boolean;
  carBadge: string;
  secondaryBadgeDescription: string;
  type: string;
  brand: string;
  model: string;
  description: string;
}
