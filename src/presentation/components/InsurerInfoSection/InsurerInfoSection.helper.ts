import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';
import { formatSatangToBaht } from 'utils/currency';
import { format, add, isAfter, differenceInDays } from 'utils/datetime';

export enum POLICY_TYPE {
  'POLICY_START_DATE' = 'POLICY_START_DATE',
  'COMPULSORY_POLICY_START_DATE' = 'COMPULSORY_POLICY_START_DATE',
}

export enum INSURANCE_KIND {
  VOLUNTARY = 'voluntary',
  MANDATORY = 'mandatory',
  BOTH = 'both',
}

/**
 * @deprecated This enum valus are no longer maintained.
 */
export enum InsurerSectionUpdateKeys {
  currentInsurer = '/currentInsurer',
  preferredInsurer = '/preferredInsurer',
  preferredSumInsured = '/preferredSumInsured',
  insuranceKind = '/insuranceKind',
  voluntaryInsuranceType = '/voluntaryInsuranceType',
  installments = '/checkout/installments',
  shippingOption = '/shippingOption',
}

export const getInsuranceKindTranslation = (
  insuranceKind: string | undefined
) => {
  switch (insuranceKind) {
    case INSURANCE_KIND.VOLUNTARY:
      return getString('leadDetailFields.insuranceKinds.voluntary');
    case INSURANCE_KIND.MANDATORY:
      return getString('leadDetailFields.insuranceKinds.compulsory');
    case INSURANCE_KIND.BOTH:
      return getString('leadDetailFields.insuranceKinds.both');
    default:
      return '';
  }
};

export const getInsuranceKindOptions = () =>
  (Object.keys(INSURANCE_KIND) as (keyof typeof INSURANCE_KIND)[]).map(
    (insuranceKind) => ({
      key: INSURANCE_KIND[insuranceKind],
      value: INSURANCE_KIND[insuranceKind],
      title: getInsuranceKindTranslation(INSURANCE_KIND[insuranceKind]),
    })
  );

export const isAfterCurrent = (date: string) =>
  differenceInDays(new Date(date), new Date()) < 0;

export const isAfterSixMonth = (date: string) => {
  const sixMonthLater = add(new Date(), { months: 6 });
  return isAfter(new Date(date), sixMonthLater);
};

export const errorMessage = (date: string) => {
  if (differenceInDays(new Date(date), new Date()) < 0) {
    return getString('text.invalidDateWithCurrent');
  }

  if (isAfterSixMonth(date)) {
    const dateAfterSixMonths = format(
      add(new Date(), { days: 1, months: 6 }),
      'dd/MM/yyyy'
    );

    return getString('text.invalidDateFromCurrent', { dateAfterSixMonths });
  }
  return '';
};

export const getPayloadForPolicyHolder = (
  policyType: POLICY_TYPE,
  value: string
) => [
  {
    op: 'add',
    path:
      policyType === POLICY_TYPE.POLICY_START_DATE
        ? '/policyStartDate'
        : '/compulsoryPolicyStartDate',
    value: value ? format(new Date(value), 'yyyy-MM-dd') : '',
  },
];

export const isDisabled = (
  insuranceKind: INSURANCE_KIND,
  policyType: POLICY_TYPE
) => {
  if (!insuranceKind) return false;
  if (policyType === POLICY_TYPE.POLICY_START_DATE) {
    return !(
      insuranceKind === INSURANCE_KIND.BOTH ||
      insuranceKind === INSURANCE_KIND.VOLUNTARY
    );
  }
  if (policyType === POLICY_TYPE.COMPULSORY_POLICY_START_DATE) {
    return !(
      insuranceKind === INSURANCE_KIND.BOTH ||
      insuranceKind === INSURANCE_KIND.MANDATORY
    );
  }
  return false;
};

export const getLastInvoicePrice = (annotations: Lead['annotations']) =>
  annotations?.['@immutable/product-car/original-order']?.includes(
    '/car-insurance/orders/read-only/'
  )
    ? annotations?.['@immutable/product-car/last-invoice-price']
    : formatSatangToBaht(
        annotations?.['@immutable/product-car/last-invoice-price'] ?? ''
      );

export const getLastPackagePrice = (annotations: Lead['annotations']) =>
  annotations?.['@immutable/product-car/original-order']?.includes(
    '/car-insurance/orders/read-only/'
  )
    ? annotations?.['@immutable/product-car/last-package-price']
    : formatSatangToBaht(
        annotations?.['@immutable/product-car/last-package-price'] ?? ''
      );

export const getLastDiscount = (annotations: Lead['annotations']) =>
  annotations?.['@immutable/product-car/original-order']?.includes(
    '/car-insurance/orders/read-only/'
  )
    ? annotations?.['@immutable/product-car/last-discount']
    : formatSatangToBaht(
        annotations?.['@immutable/product-car/last-discount'] ?? ''
      );

export const isValidDate = (val: unknown): val is Date | string => {
  if (!val) return false;
  const d = val instanceof Date ? val : new Date(val as string);
  return !Number.isNaN(d.getTime());
};
