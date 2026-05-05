import { InsurancePackageDetailResponse } from 'data/slices/genericPackageSlice';
import { Package } from 'shared/types/packages';

export default function transformPackageFromGenericToNormal(
  from?: InsurancePackageDetailResponse
): Package {
  if (!from) return {} as Package;

  const { package: pkg, insurer } = from;

  // helper to normalize enums
  const normalizeCarInsuranceType = (type: string) => {
    switch (type) {
      case 'TYPE_1':
        return 'Type 1';
      case 'TYPE_2':
        return 'Type 2';
      case 'TYPE_3':
        return 'Type 3';
      default:
        return type;
    }
  };

  const normalizeRepairType = (type: string) => {
    switch (type) {
      case 'GARAGE':
        return 'Garage';
      case 'DEALER':
        return 'Dealer';
      default:
        return type;
    }
  };

  return {
    name: pkg.name,
    displayName: pkg.displayName || '',
    product: 'products/car-insurance',
    canBuy: false,
    createTime: pkg.createTime,
    expireTime: '9999-01-01T00:00:00Z', // static default
    originalPrice: pkg.price,
    insuranceCategory: (pkg.insuranceCategory || '').toLowerCase(),
    carInsuranceType: normalizeCarInsuranceType(pkg.carInsuranceType),
    carDiscountAmount: '0',
    carDiscountPercentage: 0,
    carRepairType: normalizeRepairType(pkg.carRepairType),
    sumCoverage: pkg.sumCoverageMin,
    sumInsuredSource: 'sum_coverage_min',
    sumCoverageMin: pkg.sumCoverageMin,
    sumCoverageMax: pkg.sumCoverageMax,
    deductibleAmount: pkg.deductibleAmount,
    fireTheftCoverage: pkg.fireTheftCoverage,
    floodCoverage: pkg.floodCoverage,
    personalAccidentCoverage: pkg.personalAccidentCoverage,
    medicalExpensesCoverage: pkg.medicalExpensesCoverage,
    liabilityPerAccidentCoverage: pkg.liabilityPerAccidentCoverage,
    liabilityPerPersonCoverage: pkg.liabilityPerPersonCoverage,
    liabilityPropertyCoverage: pkg.liabilityPropertyCoverage,
    invoicePrice: from.invoicePrice,
    grossMandatoryPremium: from.grossMandatoryPremium,
    grossVoluntaryPremium: from.grossVoluntaryPremium,
    sumInsuredDefault: from.sumInsuredDefault,
    sumInsuredMin: from.sumInsuredMin,
    sumInsuredMax: from.sumInsuredMax,
    hasCctvDiscount: pkg.hasCctvDiscount,
    packageSource: 'import',
    bailBondCoverage: pkg.bailBondCoverage,
    termsEn: pkg.termsEn,
    termsTh: pkg.termsTh,
    isLowCost: pkg.isLowCost,
    couponDiscountAmount: '0',
    insuranceCompany: {
      name: insurer.name,
      displayName: insurer.displayName,
      displayNameTh: insurer.displayNameTh,
      shortnameEn: insurer.shortnameEn,
      shortnameTh: insurer.shortnameTh,
      rating: insurer.rating,
      order: insurer.order,
      logo: insurer.logo,
      phone: insurer.phone,
      website: insurer.website,
      taxId: insurer.taxId,
      ticker: insurer.ticker,
      fax: insurer.fax,
      addressEn: insurer.addressEn,
      addressTh: insurer.addressTh,
      contactEmail: insurer.contactEmail,
      contactPersonName: insurer.contactPersonName,
      infoEn: insurer.infoEn,
      infoTh: insurer.infoTh,
      carPicturesRequired: insurer.carPicturesRequired,
      brokerCode: insurer.brokerCode,
    },
    noClaimBonusAmount: pkg.noClaimBonusAmount,
    claimValue: pkg.claimValue,
    numberOfClaims: pkg.numberOfClaims,
    installmentApplied: false,
    priceSummary: null,
    installmentDetails: [],
    personalAccidentCoverageNo: pkg.personalAccidentCoverageNo,
    customQuoteDetails: null,
    customPackageStatus: pkg.customPackageStatus,
    oicCode: pkg.oicCode,
    provinces: [],
  } as unknown as Package;
}
