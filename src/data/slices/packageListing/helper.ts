import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import flagsmith from 'flagsmith';

import FeatureFlags from 'config/flagsmithConfig';

import { GetPackagesRequest } from './interfaces';

const PaymentMethodMapper = {
  FULL_PAYMENT: 'QR_CODE',
  RABBIT_CARE_INSTALLMENT: 'QR_CODE',
  CREDIT_CARD_INSTALLMENT: 'ONLINECARD',
};

export const getPaymentMethod = (
  paymentOption: string | undefined
): string | undefined =>
  _get(PaymentMethodMapper, paymentOption ?? '', undefined);

type GenerateParamsProps = Omit<
  GetPackagesRequest,
  'leadId' | 'includeCustomQuote'
>;

export const getMaximumPackageLimit = (): number => {
  const flags = flagsmith.getAllFlags();
  const is3PackageEnabled =
    flags[FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP]
      ?.enabled ?? false;
  return is3PackageEnabled ? 3 : 2;
};

export const generateParams = ({
  productType,
  sumInsuredMax,
  sumInsuredMin,
  paymentOption,
  installment,
  year,
  model,
  brand,
  province,
  drivingPurpose,
  hasCarDashcam,
  doors,
  engineSize,
  newSearch,
  insuranceKind,
}: GenerateParamsProps) => ({
  product: productType,
  'packageFilter.insuranceKind': insuranceKind?.toString().toUpperCase(),
  'packageFilter.sumInsuredMin': sumInsuredMin,
  'packageFilter.sumInsuredMax': sumInsuredMax,
  'packageFilter.paymentOption': _isEmpty(paymentOption)
    ? undefined
    : paymentOption,
  'packageFilter.paymentMethod': getPaymentMethod(paymentOption),
  'packageFilter.installmentPlan': installment,
  includeCustomQuote: true,
  ...(newSearch
    ? {
        'packageFilter.newSearch': newSearch,
        'packageFilter.carYear': year,
        'packageFilter.modelId': model,
        'packageFilter.brandId': brand,
        'packageFilter.province': province,
        'packageFilter.drivingPurpose': (drivingPurpose as any)?.toUpperCase(),
        'packageFilter.hasCarDashcam': hasCarDashcam,
        'packageFilter.doors': doors,
        'packageFilter.engineSize': engineSize,
      }
    : null),
});
