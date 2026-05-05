import { LocalizedDisplayname } from './basic';

export enum Addons {
  ASSET = 'addonPackages/bki-asset',
  ROADSIDE_ASSISTANCE = 'addonPackages/axa-roadside',
  CAR_REPLACEMENT = 'addonPackages/replacement',
}

export type Addon = {
  name: string;
  displayName: string;
  price: string;
  addonType: string;
  scopes?: (LocalizedDisplayname & {
    term: string;
  })[];
  coverages?: {
    coverage?: (LocalizedDisplayname & {
      price: string;
    })[];
  };
  termsAndConditions: {
    en: string[];
    th: string[];
  };
  provider: LocalizedDisplayname;
};

export default Addons;
