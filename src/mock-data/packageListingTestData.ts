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

export const mockPremium: PremiumToPackage = {
  id: 'test-id',
  packageName: 'Test Package',
  insuranceType: 'type 1',
  insuranceCategory: 'Test Category',
  repairType: 'Test Repair',
  subModel: 'Test SubModel',
  carCoverage: 1000000,
  deductible: 5000,
  price: 15000,
  insuranceCompany: {
    name: 'Test Insurance',
    displayName: 'Test Insurance Co.',
    logo: 'test-logo.png',
  },
  oicCode: 'OIC123',
  startDate: '2024-01-01',
  expiryDate: '2024-12-31',
  mandatoryPricePerYear: 2000,
  premium: 12000,
  coverageDetails: {
    theftAndFireCoverage: 500000,
    floodCoverage: 300000,
    personalInjury: 100000,
    medicalExpense: 50000,
    maximumDeath: 2000000,
    deathPerPerson: 1000000,
    propertyDamage: 500000,
    bailBond: 10000,
  },
  termsAndConditions: 'Test terms',
  applicableProvinces: ['Bangkok', 'Chiang Mai'],
};

export const minimalPremium: PremiumToPackage = {
  id: 'minimal-id',
  packageName: 'Minimal Package',
  insuranceType: 'mandatory',
  insuranceCategory: '',
  repairType: '',
  subModel: '',
  carCoverage: 0,
  deductible: 0,
  price: 0,
  insuranceCompany: { name: '', displayName: '', logo: '' },
  oicCode: '',
  startDate: '',
  expiryDate: '',
  mandatoryPricePerYear: 0,
  premium: 0,
  coverageDetails: {},
  termsAndConditions: '',
  applicableProvinces: [],
};

export const premiumWithAllProvinces: PremiumToPackage = {
  ...mockPremium,
  applicableProvinces: ['All provinces'],
};

export const mandatoryPremium: PremiumToPackage = {
  ...mockPremium,
  insuranceType: 'type 1 mandatory',
};
