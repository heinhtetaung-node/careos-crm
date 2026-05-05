import {
  PackageGroup,
  InsurancePackage,
} from 'presentation/pages/car-insurance/PackageListingPageNew/types';

export const mockInsurancePackage: InsurancePackage = {
  uploadPackageName: 'Test Package',
  packageName: 'Comprehensive Insurance Package',
  insuranceType: 'Comprehensive',
  insuranceCategory: 'mandatory',
  repairType: 'Authorized Workshop',
  subModel: 'Sedan',
  carCoverage: 1000000,
  deductible: 1000,
  price: 15000,
  insuranceCompany: 'Test Insurance Co.',
  includeDashCamDiscount: true,
  oicCode: 'OIC001',
  startDate: new Date('2024-01-01'),
  expiryDate: new Date('2025-01-01'),
  mandatoryPricePerYear: 2000,
  premium: 12000,
  coverageDetails: {
    ownCarDamage: 1000000,
    personalInjury: 500000,
    medicalExpense: 50000,
    bailBond: 100000,
    propertyDamage: 1000000,
    deathPerPerson: 1000000,
    maximumDeath: 2000000,
    floodCoverage: 500000,
    theftAndFireCoverage: 1000000,
    maximumAnnualCoverage: 1000000,
  },
  termsAndConditions: 'Standard terms apply',
  applicableProvinces: ['Bangkok', 'Chiang Mai', 'Phuket'],
  id: '',
  insuranceCompanyData: {
    name: '',
    displayName: '',
    logo: '',
  },
};

export const mockPackageGroup: PackageGroup = {
  name: 'Test Group',
  insuranceCompany: {
    name: 'Test Insurance Co.',
    displayName: 'Test Insurance Company',
    logo: '/logo.png',
  },
  carCoverageRange: { min: 500000, max: 2000000, highlighted: 1000000 },
  priceRange: { min: 5000, max: 25000, highlighted: 15000 },
  packages: [mockInsurancePackage],
  total: 15, // More than 10 to show fetchMore button
};

export const mockPackageGroupWithFewPackages: PackageGroup = {
  ...mockPackageGroup,
  total: 5, // Less than 10 to hide fetchMore button
};

export const mockTranslations: Record<string, string> = {
  'text.loading': 'Loading...',
  'timeSlotCallBack.viewMoreButton': 'View More',
  'newPackageListing.errors.no_matching_products_found':
    'No matching products found',
  'newPackageListing.errors.unexpected_error_during_search_processing':
    'Unexpected error during search processing',
  'newPackageListing.errors.please_select_brand': 'Please select brand',
};
