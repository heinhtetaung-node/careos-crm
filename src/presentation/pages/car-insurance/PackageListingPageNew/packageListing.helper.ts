import { getPaymentMethod } from 'data/slices/packageListing/helper';
import { getString } from 'presentation/theme/localization';
import { InsuranceKind } from 'shared/types/insurers';
import { Lead } from 'shared/types/lead';
import { Package, PackageSource } from 'shared/types/packages';
import { satangToBaht } from 'utils/currency';

import { TransformedPackageType } from './hooks/useTransformedPackages';
import { formatCurrency } from 'shared/helper/utilities';

export const NON_APPLICABLE_DEFAULT_INSTALLMENT = 1;
export const NON_APPLICABLE_DEFAULT_PAYMENT_OPTION = 'FULL_PAYMENT';

export function searchPackage(
  packageIds: string[],
  packages: Package[] | undefined
) {
  return (
    packages
      ?.filter((pkg) => packageIds.includes(pkg.name))
      .sort(
        (pkg1, pkg2) =>
          packageIds.indexOf(pkg1.name) - packageIds.indexOf(pkg2.name)
      ) ?? []
  );
}

/**
 * One row per comparison id in order. Generic (`premiums/`) rows prefer `comparedPackages`
 * (fetched detail) and fall back to `rawPackages` until the detail is loaded; other ids
 * resolve from `rawPackages`. Prevents double-counting when the same premium id also exists
 * in `rawPackages` (fixes Compare badge vs visible cards).
 */
export function mergePackagesForCompareBar(
  packageIds: string[],
  comparedPackages: Package[] | undefined,
  rawPackages: Package[] | undefined
): Package[] {
  return packageIds
    .map((id) => {
      if (id.startsWith('premiums/')) {
        return (
          comparedPackages?.find((p) => p.name === id) ??
          searchPackage([id], rawPackages)[0]
        );
      }
      return searchPackage([id], rawPackages)[0];
    })
    .filter((pkg): pkg is Package => pkg != null);
}

/**
 * Compare page: one column per id. Prefer generic detail (`premiumPackages`) for `premiums/`
 * when loaded; fall back to listing rows until then. Avoids duplicate columns when both exist.
 */
export function mergeTransformedPackagesForComparePage<
  T extends { name: string },
>(orderedIds: string[], listingPackages: T[], premiumPackages: T[]): T[] {
  const uniqueIds = [...new Set(orderedIds)];
  return uniqueIds
    .map((id) => {
      if (id.startsWith('premiums/')) {
        return (
          premiumPackages.find((p) => p.name === id) ??
          listingPackages.find((p) => p.name === id)
        );
      }
      return listingPackages.find((p) => p.name === id);
    })
    .filter((p): p is T => p != null);
}

export function isValidLead(lead: Lead | undefined) {
  return lead?.status !== 'LEAD_STATUS_PURCHASED';
}

export const getHeaderTitleByPackageSource = (packageSource: PackageSource) => {
  if (packageSource === 'custom') {
    return getString('packageListing.customQuote');
  }
  if (packageSource === 'manual') {
    return getString('packageListing.manualQuote');
  }
  if (packageSource === 'renewal_manual_quote') {
    return getString('packageListing.renewalPackage');
  }
  return '';
};

/** i18n key for standalone mandatory-only line (พ.ร.บ. / "Mandatory") */
export const PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY =
  'packageListing.values.insuranceType.mandatory';

export type InsuranceTypeSubtitleInput = Pick<
  TransformedPackageType,
  'subtitle' | 'insuranceKind'
>;

/**
 * For "both" (voluntary + compulsory) packages, append the compulsory label when the main
 * subtitle is not already the mandatory-only key (avoids "Mandatory Mandatory").
 */
export function shouldAppendCompulsoryMandatorySubtitle(
  pkg: InsuranceTypeSubtitleInput
): boolean {
  return (
    pkg.subtitle !== PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY &&
    pkg.insuranceKind === 'both'
  );
}

/**
 * Localized insurance-type subtitle for headers/cards: main type + optional compulsory label.
 * Uses a non-breaking space between parts when both are shown (same as `&nbsp;` between spans).
 */
export function getInsuranceTypeSubtitleDisplayText(
  pkg: InsuranceTypeSubtitleInput
): string {
  const main = getString(pkg.subtitle);
  if (!shouldAppendCompulsoryMandatorySubtitle(pkg)) {
    return main;
  }
  return `${main}\u00A0${getString(PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY)}`;
}

export const getPackageTypeLabel = (packageSource?: PackageSource | string) => {
  switch (packageSource) {
    case 'custom':
      return getString('packageListing.packageType.standard');

    case 'manual':
      return getString('packageListing.packageType.manual');

    case 'renewal_manual_quote':
      return getString('packageListing.packageType.renewal');

    default:
      return getString('packageListing.packageType.standard');
  }
};

export const createPackageSourceMap = (
  packages: Pick<TransformedPackageType, 'name' | 'packageSource'>[]
) => new Map(packages.map((p) => [p.name, p.packageSource]));

export const getOriginalPackageSource = (
  name: string | undefined,
  map: Map<string, string | undefined>
) => (name ? map.get(name) : undefined);

export const getPackageTypeLabelFromOrderData = (
  packageType?: string,
  source?: string
): string | null => {
  switch (packageType) {
    case 'RENEWAL':
      return getPackageTypeLabel('renewal_manual_quote');
    case 'CUSTOM':
      return getPackageTypeLabel('custom');
    case 'STANDARD':
      return getPackageTypeLabel(
        source?.toLowerCase().includes('manual') ? 'manual' : 'standard'
      );
    default:
      return getPackageTypeLabel('standard');
  }
};

export const CUSTOM_PACKAGE_SOURCES: PackageSource[] = [
  'custom',
  'manual',
  'renewal_manual_quote',
];

export const getApprovalStatus = (
  status?: 'APPROVED' | 'REJECTED' | 'PENDING' | 'APPROVAL_NOT_REQUIRED'
) => {
  switch (status) {
    case 'APPROVED':
      return {
        text: getString('text.approved'),
        variant: 'success',
      };
    case 'REJECTED':
      return {
        text: getString('text.rejected'),
        variant: 'muted',
      };
    case 'PENDING':
      return {
        text: getString('text.waitingApproval'),
        variant: 'warning',
      };
    case 'APPROVAL_NOT_REQUIRED':
    default:
      return {
        text: getString('text.noApprovalRequired'),
        variant: 'success',
      };
  }
};

interface PackageSelectParams {
  insuranceKind: InsuranceKind;
  sumInsuredMax?: number | string | undefined;
  sumInsuredMin?: number | string | undefined;
  paymentOption?: string;
  paymentMethod?: string;
  installment?: number;
}
interface SinglePackage extends PackageSelectParams {
  packages?: never;
  package?: string;
}

interface MultiPackage extends PackageSelectParams {
  package?: never;
  packages?: string[];
}

export function generateLendingApiPayload<
  T extends SinglePackage | MultiPackage,
>(rawPayload: T) {
  const packageId = {
    ...(Boolean(rawPayload.packages as T['packages']) && {
      packages: rawPayload.packages as T['packages'],
    }),
    ...(Boolean(rawPayload.package as T['package']) && {
      package: rawPayload.package as T['package'],
    }),
  } as { package: T['package']; packages: T['packages'] };

  return {
    ...packageId,
    insuranceKind: rawPayload.insuranceKind?.toUpperCase(),
    ...(Boolean(rawPayload?.sumInsuredMin) && {
      sumInsuredMin: rawPayload?.sumInsuredMin,
    }),
    ...(Boolean(rawPayload?.sumInsuredMax) && {
      sumInsuredMax: rawPayload?.sumInsuredMax,
    }),
    ...(Boolean(rawPayload.paymentOption && rawPayload.installment) && {
      paymentOption: rawPayload.paymentOption,
      paymentMethod:
        rawPayload.paymentMethod ?? getPaymentMethod(rawPayload.paymentOption),
      installmentPlan: rawPayload.installment,
    }),
  };
}

export interface CommonPayload extends PackageSelectParams {
  package: string;
}

export function generateDiscountPricingApiPayload<T extends CommonPayload[]>(
  rawPayload: T
) {
  return {
    filters: rawPayload.map(
      ({
        package: packageData,
        insuranceKind,
        sumInsuredMin,
        sumInsuredMax,
        paymentOption,
        installment,
        paymentMethod,
      }) => ({
        package: packageData,
        insuranceKind: insuranceKind?.toUpperCase(),
        ...(Boolean(sumInsuredMin) && {
          sumInsuredMin,
        }),
        ...(Boolean(sumInsuredMax) && {
          sumInsuredMax,
        }),
        ...(Boolean(paymentOption && installment) && {
          paymentOption,
          paymentMethod: paymentMethod ?? getPaymentMethod(paymentOption),
          installmentPlan: installment,
        }),
      })
    ),
  };
}

export type FilterData = ReturnType<
  typeof generateLendingApiPayload<PackageSelectParams>
>;

export type GeneratedApiReponse = ReturnType<
  typeof generateDiscountPricingApiPayload<CommonPayload[]>
>;

export const isPackageSelected = (
  packageData: TransformedPackageType | undefined,
  selectedPackage: string
) => Boolean(selectedPackage === packageData?.id);

export const getApplicablePaymentInfo = ({
  isApplicablePackage,
  selectedPaymentOption,
  selectedInstallment,
}: {
  isApplicablePackage: boolean;
  selectedPaymentOption?: string;
  selectedInstallment?: number;
}) => {
  if (!isApplicablePackage) {
    return {
      installment: NON_APPLICABLE_DEFAULT_INSTALLMENT,
      paymentOption: NON_APPLICABLE_DEFAULT_PAYMENT_OPTION,
    };
  }
  return {
    installment: selectedInstallment,
    paymentOption: selectedPaymentOption,
  };
};

export interface PremiumToPackage {
  id: string;
  packageName: string;
  insuranceType: string;
  insuranceCategory: string;
  repairType: string;
  subModel: string;
  carCoverage: number;
  deductible: number;
  price: number;
  insuranceCompany: {
    name: string;
    displayName: string;
    logo: string;
  };
  oicCode: string;
  startDate: string;
  expiryDate: string;
  mandatoryPricePerYear: number;
  premium: number;
  coverageDetails: any;
  termsAndConditions: string;
  applicableProvinces: string[];
}

/**
 * @param insuranceType Type 1 = voluntary
 * Type 2 = voluntary
 * Type 3 = voluntary
 * Type 2+ = voluntary
 * Type 3+ = voluntary
 * mandatory = mandatory
 * Type 1 Mandatory = both
 * Type 2 Mandatory = both
 * Type 3 Mandatory = both
 * Type 2+ Mandatory = both
 * Type 3+ Mandatory = both
 */
export function getInsuranceKind(insuranceType: string) {
  switch (insuranceType?.toLowerCase()) {
    case 'type 1':
      return 'voluntary';
    case 'type 2':
      return 'voluntary';
    case 'type 3':
      return 'voluntary';
    case 'type 2+':
      return 'voluntary';
    case 'type 3+':
      return 'voluntary';
    case 'mandatory':
      return 'mandatory';
    case 'type 1 mandatory':
      return 'both';
    case 'type 2 mandatory':
      return 'both';
    case 'type 3 mandatory':
      return 'both';
    case 'type 2+ mandatory':
      return 'both';
    case 'type 3+ mandatory':
      return 'both';
    default:
      return 'both';
  }
}

function getProvincesValue(applicableProvinces: string | string[] | undefined) {
  if (applicableProvinces?.includes('All provinces')) {
    return ['provinces/all'];
  }
  if (typeof applicableProvinces === 'string') {
    return applicableProvinces;
  }
  return (applicableProvinces ?? []).map((p: string) => `provinces/${p}`);
}

export function transformPremiumToPackage(premium: PremiumToPackage) {
  const {
    id,
    packageName,
    insuranceType,
    insuranceCategory,
    repairType,
    subModel,
    carCoverage,
    deductible,
    price,
    insuranceCompany,
    oicCode,
    startDate,
    expiryDate,
    mandatoryPricePerYear,
    premium: premiumPrice,
    coverageDetails = {},
    termsAndConditions,
    applicableProvinces,
  } = premium;
  const insuranceKind = getInsuranceKind(insuranceType);
  const safeSubModel = subModel || 'undefined';

  const displayNameParts = [
    packageName,
    `OIC ${oicCode}`,
    insuranceType,
    repairType,
    safeSubModel,
  ].filter((part) => part && part !== 'undefined');

  const displayName = displayNameParts.join('_');

  return {
    name: id,
    id,
    displayName,
    product: 'products/car-insurance',
    canBuy: true,
    createTime: startDate || undefined,
    expireTime: expiryDate || undefined,
    originalPrice: String(satangToBaht(price ?? 0)),
    insuranceCategory: insuranceCategory || 'Unknown',
    carInsuranceType: insuranceType || undefined,
    carDiscountAmount: '0',
    carDiscountPercentage: 0,
    repairType: repairType || undefined,
    sumCoverage: formatCurrency(satangToBaht(carCoverage ?? 0)),
    sumInsuredSource: undefined,
    sumCoverageMin: String(satangToBaht(carCoverage ?? 0)),
    sumCoverageMax: String(satangToBaht(carCoverage ?? 0)),
    deductibleAmount: String(satangToBaht(deductible ?? 0)),
    fireTheftCoverage: String(
      satangToBaht(coverageDetails.theftAndFireCoverage ?? 0)
    ),
    floodCoverage: String(satangToBaht(coverageDetails.floodCoverage ?? 0)),
    personalAccidentCoverage: String(
      satangToBaht(coverageDetails.personalInjury ?? 0)
    ),
    medicalExpensesCoverage: String(
      satangToBaht(coverageDetails.medicalExpense ?? 0)
    ),
    liabilityPerAccidentCoverage: String(
      satangToBaht(coverageDetails.maximumDeath ?? 0)
    ),
    liabilityPerPersonCoverage: String(
      satangToBaht(coverageDetails.deathPerPerson ?? 0)
    ),
    liabilityPropertyCoverage: String(
      satangToBaht(coverageDetails.propertyDamage ?? 0)
    ),
    invoicePrice: String(satangToBaht(price ?? 0)),
    premium: formatCurrency(satangToBaht(premiumPrice ?? 0)),
    grossMandatoryPremium: String(satangToBaht(mandatoryPricePerYear ?? 0)),
    grossVoluntaryPremium: String(satangToBaht(premiumPrice ?? 0)),
    sumInsuredDefault: String(satangToBaht(carCoverage ?? 0)),
    sumInsuredMin: String(satangToBaht(carCoverage ?? 0)),
    sumInsuredMax: String(satangToBaht(carCoverage ?? 0)),
    hasCctvDiscount: false,
    packageSource: 'import',
    bailBondCoverage: String(satangToBaht(coverageDetails.bailBond ?? 0)),
    termsEn: termsAndConditions || '',
    termsTh: termsAndConditions || '',
    isLowCost: false,
    couponDiscountAmount: '0',
    logo: insuranceCompany?.logo || undefined,
    title: insuranceCompany?.displayName || undefined,
    insuranceKind,
    subtitle: insuranceType?.replace(' Mandatory', ''), // remove Mandatory because it's already in the insuranceKind
    insuranceCompany: {
      name: insuranceCompany?.name || undefined,
      displayName: insuranceCompany?.displayName || undefined,
      displayNameTh: undefined,
      shortnameEn: undefined,
      shortnameTh: undefined,
      rating: undefined,
      order: undefined,
      logo: insuranceCompany?.logo || undefined,
      phone: '',
      website: '',
      taxId: '',
      ticker: '',
      fax: '',
      addressEn: '',
      addressTh: '',
      contactEmail: '',
      contactPersonName: '',
      infoEn: '',
      infoTh: '',
      carPicturesRequired: false,
      brokerCode: '',
    },
    noClaimBonusAmount: '0',
    claimValue: '0',
    numberOfClaims: 0,
    installmentApplied: false,
    priceSummary: null,
    installmentDetails: [],
    personalAccidentCoverageNo: undefined,
    customQuoteDetails: null,
    customPackageStatus: '',
    oicCode: String(oicCode ?? ''),
    provinces: getProvincesValue(applicableProvinces),
  };
}
