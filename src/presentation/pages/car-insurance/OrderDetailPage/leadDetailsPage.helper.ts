import { PRODUCTS } from 'config/TypeFilter';
import { camelCase, get } from 'lodash';
import _omit from 'lodash/omit';

import { getString } from 'presentation/theme/localization';
import {
  NewShippingMethods,
  ShipmentProviders,
  ShippingMethods,
} from 'shared/constants/orderType';

export const genderOptions = () => [
  {
    id: 1,
    name: 'm',
    value: 'm',
    title: getString('text.male'),
  },
  {
    id: 2,
    name: 'f',
    value: 'f',
    title: getString('text.female'),
  },
];

export const paymentStatusOptions = () => [
  {
    id: 1,
    name: 'fullyPaid',
    title: getString('tableListing.fullyPaid'),
    value: true,
  },
  {
    id: 2,
    name: 'notFullyPaid',
    title: getString('tableListing.notFullyPaid'),
    value: false,
  },
];

export enum Genders {
  male = 'm',
  female = 'f',
  gender_unspecified = 'gender_unspecified',
}

export enum Titles {
  KHUN = 'KHUN',
  MR = 'MR',
  MISS = 'MISS',
  MRS = 'MRS',
  MSTR = 'MSTR',
  MS = 'MS',
  M_L = 'M L',
  SAMANERA = 'SAMANERA',
  PHRA_ATHIKAN = 'PHRA ATHIKAN',
  PHRAPALAD = 'PHRAPALAD',
  PHRABAIDIKA = 'PHRABAIDIKA',
  PHRAKHU_SAMU = 'PHRAKHU SAMU',
  PHRAMAHA = 'PHRAMAHA',
  PHRAKHU_VINAIDHORN = 'PHRAKHU VINAIDHORN',
  REV = 'REV',
  Mom_Rajawongse = 'M R',
  PHRA = 'PHRA',
  CHAO_ATHIKAN = 'CHAO ATHIKAN',
  PHRASAMU = 'PHRASAMU',
  PHRAKHU_PALAD = 'PHRAKHU PALAD',
  PHRAKHU_BAIDIKA = 'PHRAKHU BAIDIKA',
  PHRAKHU_DHAMMADHORN = 'PHRAKHU DHAMMADHORN',
  GEN = 'GEN',
  MAJ_GEN = 'MAJ GEN',
  LT_COL = 'LT COL',
  CAPT_ARMY = 'CAPT (Army)',
  SUB_LT_ARMY = 'SUB LT (Army)',
  S_M_2 = 'S M 2',
  SGT_ARMY = 'SGT (Army)',
  LT_GEN = 'LT GEN',
  COL = 'COL',
  MAJ = 'MAJ',
  LT_ARMY = 'LT (Army)',
  S_M_1 = 'S M 1',
  S_M_3 = 'S M 3',
  CPL_ARMY = 'CPL (Army)',
  PVT = 'PVT',
  V_ADM = 'V ADM',
  CAPT_NAVY = 'CAPT (Navy)',
  L_CDR = 'L CDR',
  LT_JG = 'LT JG',
  CPO1 = 'CPO 1',
  CPO3 = 'CPO 3',
  PO2 = 'PO 2',
  SEA_MAN = 'SEA-MAN',
  PFC = 'PFC',
  ADM = 'ADM',
  R_ADM = 'R ADM',
  CDR = 'CDR',
  LT_NAVY = 'LT (Navy)',
  SUB_LT_NAVY = 'SUB LT (Navy)',
  CPO2 = 'CPO 2',
  PO1 = 'PO 1',
  PO3 = 'PO 3',
  AM = 'AM',
  GP_CAPT = 'GP CAPT',
  SQN_LDR = 'SQN LDR',
  FLG_OFF = 'FLG OFF',
  FS1 = 'FS 1',
  FS3 = 'FS 3',
  CPL_AIR_FORCE = 'CPL (Air Force)',
  AMN = 'AMN',
  ACM = 'ACM',
  AVM = 'AVM',
  WG_CDR = 'WG CDR',
  FLT_LT = 'FLT LT',
  PLT_OFF = 'PLT OFF',
  FS2 = 'FS 2',
  SGT_AIR_FORCE = 'SGT (Air Force)',
  LAC = 'LAC',
  POL_GEN = 'POL GEN',
  POL_MAJ_GEN = 'POL MAJ GEN',
  POL_LT_COL = 'POL LT COL',
  POL_CAPT = 'POL CAPT',
  POL_SUB_LT = 'POL SUB LT',
  POL_SGT_MAJ = 'POL SGT MAJ',
  POL_CPL = 'POL CPL',
  POL_CONST = 'POL CONST',
  POL_LT_GEN = 'POL LT GEN',
  POL_COL = 'POL COL',
  POL_MAJ = 'POL MAJ',
  POL_LT = 'POL LT',
  POL_SEN_SGT_MAJ = 'POL SEN SGT MAJ',
  POL_SGT = 'POL SGT',
  POL_L_C = 'POL L/C',
  Professor = 'Professor',
  Associate_Professor = 'Associate Professor',
  Assistant_Professor = 'Assistant Professor',
}

export const isGender = (value: any) => Object.values(Genders).includes(value);

export const getGender = (value: Genders) => {
  if (value === Genders.male) {
    return getString('text.male');
  }
  if (value === Genders.female) {
    return getString('text.female');
  }
  return '';
};

const sortExcludedPolicyTitle = [
  Titles.KHUN,
  Titles.MR,
  Titles.MISS,
  Titles.MRS,
  Titles.MSTR,
  Titles.MS,
];

const SORTED_TITLE_START_INDEX = 5;

export const leadTitleOptions = (product?: string) => {
  const baseOptions = [
    {
      name: Titles.KHUN,
      id: 1,
      title: getString('text.khun'),
      value: Titles.KHUN,
    },
    {
      name: Titles.MR,
      id: 2,
      title: getString('text.mr'),
      value: Titles.MR,
    },
    {
      name: Titles.MISS,
      id: 3,
      title: getString('text.miss'),
      value: Titles.MISS,
    },
    {
      name: Titles.MRS,
      id: 4,
      title: getString('text.mrs'),
      value: Titles.MRS,
    },
  ];

  if (product === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
    baseOptions.push(
      {
        name: Titles.MSTR,
        id: 5,
        title: getString('text.mstr'),
        value: Titles.MSTR,
      },
      {
        name: Titles.MS,
        id: 6,
        title: getString('text.ms'),
        value: Titles.MS,
      }
    );
  }

  return [
    ...baseOptions,
    ...Object.keys(Titles)
      .filter(
        (titleKey) => !sortExcludedPolicyTitle.includes(get(Titles, titleKey))
      )
      .map((policyTitleKey, idx) => ({
        id: idx + SORTED_TITLE_START_INDEX,
        name: policyTitleKey,
        title: getString(`policyholderTitle.${camelCase(policyTitleKey)}`),
        value: get(Titles, policyTitleKey),
      }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  ];
};

export const orderTitleOptions = (product?: string) => [
  ...leadTitleOptions(product).map((option) => ({
    name: option.value, // this is using for update payload
    title: option.title,
  })),
];

export const languageOptions = [
  {
    name: 'English',
    title: 'English',
  },
  {
    name: 'Thailand',
    title: 'Thailand',
  },
];

export const insurerTypeOptions = [
  {
    title: 'Type 1',
    value: 'type_1',
  },
  {
    title: 'Type 2',
    value: 'type_2',
  },
  {
    title: 'Type 2+',
    value: 'type_2+',
  },
  {
    title: 'Type 3',
    value: 'type_3',
  },
  {
    title: 'Type 3+',
    value: 'type_3+',
  },
];

export const localeOptions = [
  {
    id: 1,
    title: 'TH',
    val: 'th-th',
    value: 'th-th',
  },
  {
    id: 2,
    title: 'EN',
    val: 'th-en',
    value: 'th-en',
  },
];

export enum DocTypes {
  NationalID = 'NationalID',
  Passport = 'Passport',
  DrivingLicense = 'DrivingLicense',
}

export const policyHolderDocTypes = () => [
  {
    name: DocTypes.NationalID,
    title: getString('leadDetailFields.nationalId'),
  },
  {
    name: DocTypes.DrivingLicense,
    title: getString('leadDetailFields.drivingLicense'),
  },
  {
    name: DocTypes.Passport,
    title: getString('leadDetailFields.passport'),
  },
];

const orderLanguageOptions = () => [
  {
    id: 0,
    name: 'th-th',
    title: getString('text.thai'),
  },
  {
    id: 1,
    name: 'th-en',
    title: getString('text.english'),
  },
];

const shipmentMethodOptions = () => [
  {
    id: 0,
    name: ShippingMethods.COURIER,
    title: getString('qc.kerry'),
  },
  {
    id: 1,
    name: ShippingMethods.EMAIL,
    title: getString('qc.email'),
  },
];

export const newShipmentMethodOptions = () => [
  {
    id: 0,
    name: NewShippingMethods.DIGITAL_DELIVERY,
    title: getString('qc.digitalDelivery'),
    method: ShipmentProviders.EMAIL,
  },
  {
    id: 1,
    name: NewShippingMethods.STANDARD_DELIVERY,
    title: getString('qc.standardDelivery'),
    method: ShipmentProviders.COURIER_PROVIDER_KERRY,
  },
  {
    id: 2,
    name: NewShippingMethods.EXPRESS_DELIVERY,
    title: getString('qc.expressDelivery'),
    method: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
  },
  {
    id: 3,
    name: NewShippingMethods.EXPRESS_DELIVERY_DASHCAM,
    title: getString('qc.expressDeliveryDashcam'),
    method: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS_DASHCAM,
  },
];

export const getOptionData = (value: string | undefined, product?: string) => {
  switch (value) {
    case 'Gender':
      return genderOptions();
    case 'Title':
      return orderTitleOptions(product);
    case 'LeadTitle':
      return leadTitleOptions(product);
    case 'Language':
      return languageOptions;
    case 'CommunicationLanguage':
      return orderLanguageOptions();
    case 'Type':
      return insurerTypeOptions;
    case 'Locale':
      return localeOptions;
    case 'DocumentType':
      return policyHolderDocTypes();
    case 'preferredDeliveryOptions':
      return shipmentMethodOptions();
    case 'newPreferredDeliveryOptions':
      return newShipmentMethodOptions().map((option) =>
        _omit(option, 'method')
      );
    case 'paymentStatus':
      return paymentStatusOptions();
    default:
      return [];
  }
};
