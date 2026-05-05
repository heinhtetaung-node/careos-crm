import _camelCase from 'lodash';

import { getString, LANGUAGES } from 'presentation/theme/localization';
import { Package, PackageSource } from 'shared/types/packages';
import { formatSatangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';

import { DiscountType } from '../DiscountAndPayment/Discount/helper';
import { FilterInterface } from '../PackageFilter/interface';

const i18nPrefix = 'packageListing';

const dateFormat = 'yyyy-MM-dd';

/** Non-custom: :compute includes both gross lines → quote is voluntary + compulsory (both). */
function isBothFromComputePremium(
  pkg: Pick<
    Package,
    'packageSource' | 'grossVoluntaryPremium' | 'grossMandatoryPremium'
  >
): boolean {
  if (pkg.packageSource === 'custom') return false;
  const v = Number.parseFloat(String(pkg.grossVoluntaryPremium ?? '0')) || 0;
  const m = Number.parseFloat(String(pkg.grossMandatoryPremium ?? '0')) || 0;
  return v > 0 && m > 0;
}

export function transformLogo(insurancePackage: Package) {
  return insurancePackage.insuranceCompany.logo;
}

export function getTranslationString(value: string, i18nT: string) {
  return `${i18nPrefix}.${i18nT}.${value}`;
}

export function transformTitle(insurancePackage: Package, lang: LANGUAGES) {
  switch (lang) {
    case LANGUAGES.ENGLISH:
      return insurancePackage.insuranceCompany.shortnameEn;
    case LANGUAGES.THAI:
      return insurancePackage.insuranceCompany.shortnameTh;
    default:
      return '';
  }
}

export function transformSubtitle({
  insuranceCategory,
  carInsuranceType,
}: Package) {
  if (insuranceCategory === 'mandatory') {
    return `${i18nPrefix}.values.insuranceType.mandatory`;
  }
  return `${i18nPrefix}.values.insuranceType.${_camelCase(carInsuranceType)}`;
}

export function transformPremium(
  {
    invoicePrice,
    grossMandatoryPremium,
    grossVoluntaryPremium,
    packageSource,
  }: Package,
  filterValues: FilterInterface
) {
  if (packageSource === 'custom') {
    return invoicePrice;
  }
  if (
    isBothFromComputePremium({
      packageSource,
      grossVoluntaryPremium,
      grossMandatoryPremium,
    })
  ) {
    return invoicePrice;
  }
  const category = (filterValues.insuranceCategory ?? '')
    .toString()
    .toLowerCase();
  return category === 'voluntary'
    ? Math.ceil(
        Number.parseFloat(invoicePrice) -
          Number.parseFloat(grossMandatoryPremium)
      )
    : invoicePrice;
}

export function transformOriginalPrice(
  {
    originalPrice,
    grossVoluntaryPremium,
    grossMandatoryPremium,
    packageSource,
  }: Package,
  filterValues: FilterInterface
) {
  if (packageSource === 'custom') {
    return originalPrice;
  }
  if (
    isBothFromComputePremium({
      packageSource,
      grossVoluntaryPremium,
      grossMandatoryPremium,
    })
  ) {
    return originalPrice;
  }
  const category = (filterValues.insuranceCategory ?? '')
    .toString()
    .toLowerCase();
  return category === 'voluntary' ? grossVoluntaryPremium : originalPrice;
}

export function transformDiscount(insurancePackage: Package) {
  const priceSummary = insurancePackage?.priceSummary;

  // initial logic
  if (
    insurancePackage.carDiscountAmount &&
    insurancePackage.carDiscountAmount !== '0' &&
    insurancePackage.carDiscountPercentage
  ) {
    return {
      amount: insurancePackage.carDiscountAmount ?? null,
      percent: insurancePackage.carDiscountPercentage ?? null,
    };
  }

  if (priceSummary?.discountAmount) {
    return {
      amount: (insurancePackage.priceSummary as any)?.discountAmount,
    };
  }
  return null;
}

export function transformRating({ insuranceCompany }: Package) {
  return (insuranceCompany?.rating ?? 0) / 10;
}

export function transformHasDiscount({
  carDiscountAmount,
  couponDiscountAmount,
  priceSummary,
}: Package) {
  return priceSummary?.netDiscountAmount
    ? Number.parseFloat(priceSummary.netDiscountAmount) !== 0
    : Number.parseFloat(carDiscountAmount) > 0 || couponDiscountAmount > 0;
}

export function transformHeaderType(
  packageSource: PackageSource
): 'info' | 'secondary' | 'primary' | undefined {
  switch (packageSource) {
    case 'manual':
      return 'info';
    case 'custom':
      return 'primary';
    case 'renewal_manual_quote':
      return 'secondary';
    default:
      return undefined;
  }
}

export function transformExpiryDate({ expireTime }: Package) {
  const date = new Date(expireTime);
  return date.toString() !== 'Invalid Date' ? format(date, dateFormat) : '-';
}

// remove with this flag
export function transformInstallment(
  IPackage: Package,
  { insuranceCategory }: FilterInterface
) {
  const [firstMonth, nextMonth] = IPackage.installmentDetails ?? [];
  const category = (insuranceCategory ?? '').toString().toLowerCase();
  const useVoluntaryInstallmentBreakdown =
    category === 'voluntary' && !isBothFromComputePremium(IPackage);
  if (
    IPackage.priceSummary &&
    firstMonth &&
    nextMonth &&
    IPackage.installmentDetails?.length
  ) {
    return {
      firstMonth: formatSatangToBaht(
        useVoluntaryInstallmentBreakdown
          ? BigInt(firstMonth.paymentAmount) - BigInt(firstMonth.addOns)
          : firstMonth.paymentAmount
      ),
      nextMonth: formatSatangToBaht(
        useVoluntaryInstallmentBreakdown
          ? BigInt(nextMonth.paymentAmount) - BigInt(nextMonth.addOns)
          : nextMonth.paymentAmount
      ),
      numberOfMonths: IPackage.installmentDetails.length,
      feeAmount:
        Number.parseFloat(IPackage.priceSummary?.netDiscountAmount) > 0
          ? formatSatangToBaht(IPackage.priceSummary?.netDiscountAmount)
          : undefined,
    };
  }
  return null;
}

export function transformTermAndCondition(
  { termsEn, termsTh }: Package,
  lang: LANGUAGES
) {
  return lang === LANGUAGES.THAI ? termsTh : termsEn;
}

export type DetailType = {
  hasData: boolean;
  title: string;
  items: {
    label?: string;
    text: string;
    textValues?: Record<string, any>;
  }[];
};

export function transformDetails(
  insurancePackage: Package,
  lang: LANGUAGES,
  filterValues: FilterInterface
) {
  const {
    customQuoteDetails,
    carInsuranceType,
    carRepairType: repairType,
    sumCoverage: ownCarCoverage,
    deductibleAmount: deductible,
    fireTheftCoverage,
    floodCoverage,
    liabilityPerAccidentCoverage: maxDeath,
    liabilityPerPersonCoverage: deathPerPerson,
    liabilityPropertyCoverage: propertyDamage,
    hasCctvDiscount: requireDashCam,
    personalAccidentCoverage: personalInjury,
    medicalExpensesCoverage: medicalExpense,
    bailBondCoverage: bailBond,
    grossMandatoryPremium: mandatoryPrice,
    grossVoluntaryPremium,
    invoicePrice,
    termsEn,
    termsTh,
    packageSource,
    noClaimBonusAmount,
    claimValue,
    numberOfClaims,
  } = insurancePackage;

  const category = (filterValues.insuranceCategory ?? '')
    .toString()
    .toLowerCase();
  const isMandatory = category === 'mandatory';
  const isVoluntary = category === 'voluntary';
  const isRenewal = packageSource === 'renewal_manual_quote';
  const isCustom = packageSource === 'custom';
  const premium = transformPremium(insurancePackage, filterValues);

  const mandatorySatang = Number.parseFloat(String(mandatoryPrice ?? '0')) || 0;
  const voluntarySatang =
    Number.parseFloat(String(grossVoluntaryPremium ?? '0')) || 0;

  const {
    voluntaryPrice: customQuoteVoluntaryPrice,
    compulsoryPrice: customQuoteCompulsoryPrice,
  } = customQuoteDetails?.packageResource?.packagePrice ?? {};

  // - Claim Info
  const claimInfo: DetailType = {
    hasData: isRenewal,
    title: `${i18nPrefix}.titles.renewalPackage`,
    items: [
      {
        label: `${i18nPrefix}.labels.noClaimBonus`,
        text:
          noClaimBonusAmount !== undefined
            ? `${i18nPrefix}.templates.moneyNormal`
            : `0 ${getString('healthPackage.thb')}`,
        textValues: {
          value: formatSatangToBaht(noClaimBonusAmount ?? 0),
        },
      },
      {
        label: `${i18nPrefix}.labels.claimNumber`,
        text: numberOfClaims !== undefined ? `{{value}}` : '-',
        textValues: { value: numberOfClaims },
      },
      {
        label: `${i18nPrefix}.labels.claimValue`,
        text:
          claimValue !== undefined
            ? `${i18nPrefix}.templates.moneyNormal`
            : `0 ${getString('healthPackage.thb')}`,
        textValues: {
          value: formatSatangToBaht(claimValue ?? 0),
        },
      },
    ],
  };

  // - Price Details
  const packagePrice: DetailType = {
    hasData: true,
    title: `${i18nPrefix}.titles.packagePrice`,
    items: [],
  };

  packagePrice.items.push(
    isCustom
      ? {
          label: `${i18nPrefix}.labels.voluntaryPrice`,
          text: `${i18nPrefix}.templates.${
            Number.parseFloat(customQuoteVoluntaryPrice ?? '0') > 0
              ? 'includedPrice'
              : 'notIncludedPrice'
          }`,
          textValues: {
            value: formatSatangToBaht(customQuoteVoluntaryPrice),
          },
        }
      : {
          label: `${i18nPrefix}.labels.voluntaryPrice`,
          text: `${i18nPrefix}.templates.${
            isMandatory ? 'notIncludedPrice' : 'includedPrice'
          }`,
          textValues: isMandatory
            ? {}
            : {
                value: formatSatangToBaht(
                  voluntarySatang > 0
                    ? voluntarySatang
                    : Math.max(
                        0,
                        Number.parseFloat(invoicePrice) -
                          Number.parseFloat(mandatoryPrice)
                      )
                ),
              },
        }
  );

  packagePrice.items.push(
    isCustom
      ? {
          label: `${i18nPrefix}.labels.mandatoryPrice`,
          text: `${i18nPrefix}.templates.${
            Number.parseFloat(customQuoteCompulsoryPrice ?? '0') > 0
              ? 'includedPrice'
              : 'notIncludedPrice'
          }`,
          textValues: { value: formatSatangToBaht(customQuoteCompulsoryPrice) },
        }
      : {
          label: `${i18nPrefix}.labels.mandatoryPrice`,
          text: `${i18nPrefix}.templates.${
            mandatorySatang > 0 ? 'includedPrice' : 'notIncludedPrice'
          }`,
          textValues:
            mandatorySatang > 0
              ? { value: formatSatangToBaht(mandatoryPrice) }
              : {},
        }
  );

  packagePrice.items.push({
    label: `${i18nPrefix}.labels.processingFee`,
    text:
      Number.parseFloat(
        customQuoteDetails?.priceDetail.priceSummary?.processingFeeAmount ?? '0'
      ) > 0
        ? `${i18nPrefix}.templates.moneyNormal`
        : `0 ${getString('healthPackage.thb')}`,
    textValues: {
      value: formatSatangToBaht(
        customQuoteDetails?.priceDetail.priceSummary?.processingFeeAmount,
        { removeSign: true }
      ),
    },
  });

  // should be taken out from customQuoteDetails?.priceDetail.priceSummary?.discountAmount
  packagePrice.items.push({
    label: `${i18nPrefix}.labels.discount`,
    text: transformDiscount(insurancePackage)?.amount
      ? `${i18nPrefix}.templates.moneyNormal`
      : `0 ${getString('healthPackage.thb')}`,
    textValues: {
      value: formatSatangToBaht(transformDiscount(insurancePackage)?.amount, {
        removeSign: true,
      }),
    },
  });

  // Delivery Fee
  packagePrice.items.push({
    label: customQuoteDetails?.deliveryOption?.includes('dashcam')
      ? `${i18nPrefix}.labels.deliveryFeeIncludedDashcam`
      : `${i18nPrefix}.labels.deliveryFee`,
    text:
      Number.parseFloat(
        customQuoteDetails?.priceDetail.priceSummary?.shipmentFee ?? '0'
      ) > 0
        ? `${i18nPrefix}.templates.moneyNormal`
        : `0 ${getString('healthPackage.thb')}`,
    textValues: {
      value: formatSatangToBaht(
        customQuoteDetails?.priceDetail.priceSummary?.shipmentFee,
        { removeSign: true }
      ),
    },
  });

  packagePrice.items.push({
    label: `${i18nPrefix}.labels.totalPrice`,
    text: `${i18nPrefix}.templates.price`,
    textValues: {
      value: formatSatangToBaht(isVoluntary ? premium : invoicePrice),
    },
  });

  // - Package Details
  const packageDetails: DetailType = {
    hasData: Boolean(
      carInsuranceType || repairType || deductible || requireDashCam
    ),
    title: `${i18nPrefix}.titles.package`,
    items: [],
  };

  // Insurance Type
  if (carInsuranceType) {
    packageDetails.items.push({
      label: `${i18nPrefix}.labels.insuranceType`,
      text: `${i18nPrefix}.templates.insurance${_camelCase(carInsuranceType)}`,
    });
  }

  // Repair Type
  if (!isMandatory && repairType) {
    packageDetails.items.push({
      label: `${i18nPrefix}.labels.repairType`,
      text: `${i18nPrefix}.templates.repairType`,
      textValues: {
        value: `${i18nPrefix}.values.repairType.${_camelCase(repairType)}`,
      },
    });
  }

  // Deductible
  packageDetails.items.push({
    label: `${i18nPrefix}.labels.deductible`,
    text:
      deductible > 0
        ? `${i18nPrefix}.templates.deductibleValue`
        : `${i18nPrefix}.templates.deductibleNone`,
    textValues: {
      value: formatSatangToBaht(deductible),
    },
  });
  // Dash Cam
  packageDetails.items.push({
    label: `${i18nPrefix}.labels.dashCam`,
    text: requireDashCam
      ? `${i18nPrefix}.values.dashcamRequired`
      : `${i18nPrefix}.values.dashcamNotRequired`,
  });

  //  Own Car Damage
  const ownCarDamage: DetailType = {
    hasData: !!(ownCarCoverage || fireTheftCoverage || floodCoverage),
    title: `${i18nPrefix}.titles.ownCarDamage`,
    items: [
      {
        label: `${i18nPrefix}.labels.ownCarDamage`,
        text:
          ownCarCoverage > 0
            ? `${i18nPrefix}.templates.moneyHighlight`
            : `0 ${getString('healthPackage.thb')}`,
        textValues: {
          value: formatSatangToBaht(ownCarCoverage),
        },
      },
      {
        label: `${i18nPrefix}.labels.fireAndTheft`,
        text:
          fireTheftCoverage > 0
            ? `${i18nPrefix}.templates.moneyNormal`
            : `${i18nPrefix}.values.excluded`,
        textValues: {
          value: formatSatangToBaht(fireTheftCoverage),
        },
      },
      {
        label: `${i18nPrefix}.labels.flood`,
        text:
          floodCoverage > 0
            ? `${i18nPrefix}.values.included`
            : `${i18nPrefix}.values.excluded`,
      },
    ],
  };

  // Personal Coverage
  const personalCoverage: DetailType = {
    hasData: !!(personalInjury || medicalExpense || bailBond),
    title: `${i18nPrefix}.titles.personal`,
    items: [
      {
        label: `${i18nPrefix}.labels.personalInjury`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(personalInjury),
        },
      },
      {
        label: `${i18nPrefix}.labels.medicalExpense`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(medicalExpense),
        },
      },
      {
        label: `${i18nPrefix}.labels.bailBond`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(bailBond),
        },
      },
    ],
  };

  // Third Party Coverage
  const thirdPartyCoverage: DetailType = {
    hasData: !!(propertyDamage || deathPerPerson || maxDeath),
    title: `${i18nPrefix}.titles.thirdParty`,
    items: [
      {
        label: `${i18nPrefix}.labels.propertyDamage`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(propertyDamage),
        },
      },
      {
        label: `${i18nPrefix}.labels.deathPerPerson`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(deathPerPerson),
        },
      },
      {
        label: `${i18nPrefix}.labels.maxDeath`,
        text: `${i18nPrefix}.templates.moneyNormal`,
        textValues: {
          value: formatSatangToBaht(maxDeath),
        },
      },
    ],
  };

  // Terms and Conditions
  const termsAndConditions: DetailType = {
    hasData: !!(termsTh || termsEn),
    title: `${i18nPrefix}.titles.termsConditions`,
    items: [{ text: lang === LANGUAGES.THAI ? termsTh : termsEn }],
  };

  return [
    claimInfo,
    packagePrice,
    packageDetails,
    ownCarDamage,
    personalCoverage,
    thirdPartyCoverage,
    termsAndConditions,
  ];
}

export const transformCustomQuoteInfo = (
  { customQuoteDetails, customPackageStatus }: Package,
  { insuranceCategory }: FilterInterface
) => {
  if (customQuoteDetails) {
    const [firstMonth, nextMonth] =
      customQuoteDetails.priceDetail.installmentDetails ?? [];
    return {
      approvalStatus: customPackageStatus,
      paymentMethod: customQuoteDetails.paymentMethod,
      paymentOption: customQuoteDetails.paymentOption,
      numberOfInstallments: customQuoteDetails.numberOfInstallments,
      discountType: customQuoteDetails.discountType,
      discount: customQuoteDetails.priceDetail.priceSummary?.discount,
      cardProvider: customQuoteDetails.cardProvider,
      deliveryOption: customQuoteDetails.deliveryOption,
      originalPackageName: customQuoteDetails.priceDetail.resourceName,
      // custom quote price details
      discountRequest: {
        approver: customQuoteDetails.approver,
        approverRemark: customQuoteDetails.approverRemark,
        source: customQuoteDetails.discountSource,
        discountAmount:
          customQuoteDetails.discountType === DiscountType.carDiscount
            ? (customQuoteDetails?.packageResource?.packagePrice?.discount
                ?.amount ?? '0')
            : (customQuoteDetails.priceDetail.priceSummary?.discount?.amount ??
              '0'),
        discountPercentage:
          customQuoteDetails.discountType === DiscountType.carDiscount
            ? (customQuoteDetails?.packageResource?.packagePrice?.discount
                ?.percentage ?? 0)
            : (customQuoteDetails.priceDetail.priceSummary?.discount
                ?.percentage ?? 0),
      },
      priceBreakDown:
        firstMonth && nextMonth
          ? {
              firstMonth:
                insuranceCategory === 'voluntary'
                  ? (
                      BigInt(firstMonth.paymentAmount) -
                      BigInt(firstMonth.addOns)
                    ).toString(10)
                  : firstMonth.paymentAmount,
              nextMonth:
                insuranceCategory === 'voluntary'
                  ? (
                      BigInt(nextMonth.paymentAmount) - BigInt(nextMonth.addOns)
                    ).toString(10)
                  : nextMonth.paymentAmount,
              numberOfMonths:
                customQuoteDetails.priceDetail.installmentDetails?.length ?? 0,
              feeAmount:
                Number.parseFloat(
                  customQuoteDetails.priceDetail.priceSummary
                    ?.netDiscountAmount ?? '0'
                ) > 0
                  ? customQuoteDetails.priceDetail.priceSummary
                      ?.netDiscountAmount
                  : undefined,
            }
          : null,
    } as any;
  }
  return undefined;
};

export function transformInsuranceKind(
  insurancePackage: Package,
  filterValues: FilterInterface
): 'mandatory' | 'voluntary' | 'both' {
  const { packageSource, customQuoteDetails } = insurancePackage;
  const filterInsuranceKind =
    filterValues.insuranceCategory === 'both'
      ? 'both'
      : filterValues.insuranceCategory;

  if (packageSource === 'custom' && customQuoteDetails) {
    const { voluntaryPrice, compulsoryPrice } =
      customQuoteDetails?.packageResource?.packagePrice || {};
    if (
      Number.parseFloat(voluntaryPrice) &&
      Number.parseFloat(compulsoryPrice)
    ) {
      return 'both';
    }
    if (Number.parseFloat(voluntaryPrice)) {
      return 'voluntary';
    }
    if (Number.parseFloat(compulsoryPrice)) {
      return 'mandatory';
    }
  }

  if (packageSource === 'manual' || packageSource === 'renewal_manual_quote') {
    return filterInsuranceKind;
  }

  if (packageSource !== 'custom') {
    const voluntarySatang =
      Number.parseFloat(
        String(insurancePackage.grossVoluntaryPremium ?? '0')
      ) || 0;
    const mandatorySatang =
      Number.parseFloat(
        String(insurancePackage.grossMandatoryPremium ?? '0')
      ) || 0;
    if (voluntarySatang > 0 && mandatorySatang > 0) {
      return 'both';
    }
    if (voluntarySatang > 0) {
      return 'voluntary';
    }
    if (mandatorySatang > 0) {
      return 'mandatory';
    }
  }

  return filterInsuranceKind;
}
