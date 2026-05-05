import { getLanguage, LANGUAGES } from 'presentation/theme/localization';
import { Package } from 'shared/types/packages';
import { formatSatangToBaht } from 'utils/currency';

import {
  getTranslationString,
  transformCustomQuoteInfo,
  transformDetails,
  transformDiscount,
  transformExpiryDate,
  transformHasDiscount,
  transformHeaderType,
  transformInstallment,
  transformInsuranceKind,
  transformLogo,
  transformOriginalPrice,
  transformPremium,
  transformRating,
  transformSubtitle,
  transformTermAndCondition,
  transformTitle,
} from './transformations';

import { FilterInterface } from '../PackageFilter/interface';

function transform(insurancePackage: Package, filterValues: FilterInterface) {
  const lang = getLanguage();
  const { packageSource } = insurancePackage;

  return {
    ...insurancePackage,
    name: insurancePackage.name,
    id: insurancePackage.name,
    displayName: insurancePackage.displayName,
    expiryDate: transformExpiryDate(insurancePackage),
    disablePackage:
      !insurancePackage.canBuy ||
      insurancePackage.customPackageStatus === 'REJECTED',
    isRecommended: insurancePackage.carInsuranceType === 'Type 1',
    carInsuranceType:
      (insurancePackage.carInsuranceType as any) === ''
        ? 'mandatory'
        : insurancePackage.carInsuranceType,
    insuranceKind: transformInsuranceKind(insurancePackage, filterValues),
    logo: transformLogo(insurancePackage),
    title: transformTitle(insurancePackage, lang as LANGUAGES),
    subtitle: transformSubtitle(insurancePackage),
    sumCoverage: formatSatangToBaht(insurancePackage.sumCoverage),
    deductibleAmount: formatSatangToBaht(insurancePackage.deductibleAmount),
    repairType: insurancePackage.carRepairType
      ? getTranslationString(
          insurancePackage.carRepairType,
          'values.repairType'
        )
      : '-',
    premium: formatSatangToBaht(
      transformPremium(insurancePackage, filterValues)
    ) as any,
    grossVoluntaryPremium: formatSatangToBaht(
      insurancePackage.grossVoluntaryPremium
    ),
    originalPrice: formatSatangToBaht(
      transformOriginalPrice(insurancePackage, filterValues)
    ),
    hasDiscount: transformHasDiscount(insurancePackage),
    headerType: transformHeaderType(insurancePackage.packageSource),
    discount: transformDiscount(insurancePackage),
    installments: transformInstallment(insurancePackage, filterValues), // should be remove with lead-2144_integrate-discount-and-pricing-engine_20230324_temp
    rating: transformRating(insurancePackage),
    details: transformDetails(
      insurancePackage,
      lang as LANGUAGES,
      filterValues
    ),
    termsAndConditions: transformTermAndCondition(
      insurancePackage,
      lang as LANGUAGES
    ),
    packageSource,
    customQuoteDetail: transformCustomQuoteInfo(insurancePackage, filterValues),
    customPackageResourceName: '',
    displayNameEn: '',
    displayNameTh: '',
    insurer: '',
    price: (insurancePackage as any)?.hasDiscount
      ? insurancePackage.originalPrice
      : (formatSatangToBaht(
          transformPremium(insurancePackage, filterValues)
        ) as any),
    paymentPlan: insurancePackage?.customQuoteDetails?.paymentMethod,
    shippingFee:
      insurancePackage?.customQuoteDetails?.priceDetail?.priceSummary
        ?.shipmentFee,
    processingFee:
      insurancePackage?.customQuoteDetails?.priceDetail?.priceSummary
        ?.processingFeeAmount,
  };
}

export default function transformPackages(
  packages: Package[],
  filterValues: FilterInterface
) {
  return packages.map((pkg) => transform(pkg, filterValues));
}
