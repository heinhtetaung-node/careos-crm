import React from 'react';

export const mockPackageIds = {
  generic: ['premiums/123', 'premiums/456'],
  mixed: ['premiums/123', 'packages/456', 'premiums/789'],
  empty: [] as string[],
};

export const mockLeadData = {
  withData: {
    data: { carSubModelYear: 2023, insuranceKind: 'voluntary' },
  },
  withoutData: null,
};

export const mockApiResponse = {
  voluntary: {
    data: {
      package: { name: 'Test Package', insuranceCategory: 'voluntary' },
      insurer: { name: 'Test Insurer' },
    },
  },
  compulsory: {
    data: {
      package: { name: 'Test Package 2', insuranceCategory: 'compulsory' },
      insurer: { name: 'Test Insurer 2' },
    },
  },
  package1: {
    data: {
      package: { name: 'Test Package 1', insuranceCategory: 'voluntary' },
      insurer: { name: 'Test Insurer 1' },
    },
  },
};

export const mockTransformedPackage = {
  voluntary: {
    name: 'Test Package',
    insuranceCategory: 'voluntary',
    price: '1000',
    insurer: { name: 'Test Insurer' },
    package: { insuranceCategory: 'voluntary' },
  },
  compulsory: {
    name: 'Test Package 2',
    insuranceCategory: 'compulsory',
    package: { insuranceCategory: 'compulsory' },
  },
  package1: {
    name: 'Test Package 1',
    insuranceCategory: 'voluntary',
    package: { insuranceCategory: 'voluntary' },
  },
};

export const mockTransformPackagesResult = [
  { id: 'premiums/123', name: 'Package 1' },
  { id: 'premiums/456', name: 'Package 2' },
];

export const mockApiCallParams = {
  premium123: {
    id: 'premiums/123',
    carSubModelYear: 2023,
    insuranceKind: 'VOLUNTARY',
  },
  premium456: {
    id: 'premiums/456',
    carSubModelYear: 2023,
    insuranceKind: 'VOLUNTARY',
  },
  premium789: {
    id: 'premiums/789',
    carSubModelYear: 2023,
    insuranceKind: 'VOLUNTARY',
  },
  package456: {
    id: 'packages/456',
    carSubModelYear: 2023,
    insuranceKind: 'VOLUNTARY',
  },
  nullLead: {
    id: 'premiums/123',
    carSubModelYear: 0,
    insuranceKind: undefined,
  },
  nullLead456: {
    id: 'premiums/456',
    carSubModelYear: 0,
    insuranceKind: undefined,
  },
};

export const mockDownloadQuotationParams = {
  carInsuranceQuotationFilter: {
    filters: [
      {
        insuranceKind: 'BOTH',
        package: 'premiums/123',
      },
    ],
  },
  includeCustomQuote: true,
  includeShipmentFee: true,
  lead: 'leads/leadId',
  product: 'products/car-insurance',
};

export const mockPropsForTest = {
  id: 'test-id',
  packages: [
    {
      id: 'pkg-1',
      name: 'Test Package 1',
      displayName: 'Test Display Name',
      carInsuranceType: 'TYPE_1',
      repairType: 'GARAGE',
      sumCoverage: '1000000',
      deductibleAmount: '5000',
      premium: '50000',
      originalPrice: '60000',
      hasDiscount: false,
      insuranceKind: 'voluntary',
      oicCode: 'TYPE_1',
      packageSource: 'import',
      customQuoteDetail: { approvalStatus: 'approved' },
    },
  ],
  renderPackageCard: jest.fn(() =>
    React.createElement('div', { 'data-testid': 'package-card' })
  ),
  setExpendedPackage: jest.fn(),
  expendedPackage: '',
  packageType: 'normal' as const,
  scrollableHeight: '400px',
  carSubModelYear: '2020',
  handleCompare: jest.fn(),
  leadId: 'lead-1',
  selectedPackage: null,
  selectPackage: jest.fn(),
  currentScroll: 0,
  setCurrentScroll: jest.fn(),
  openPopUpId: null,
  previousCarInformation: null,
  subModels: [],
  filterValues: {
    insuranceCategory: 'voluntary',
    isDefaultSumInsured: false,
    sumInsured: { min: 1000, max: 5000 },
    brand: 'Toyota',
    year: '2020',
    model: 'Camry',
    engineSize: '2.0',
    noOfDoors: '4',
  },
  updateLeadAlongWithSubModel: jest.fn(),
  voluntryInsuranceTypes: ['voluntary'],
  setOpenPopupId: jest.fn(),
  openedPackages: [],
  setOpenedPackages: jest.fn(),
  noOfDoors: '4',
  initialCar: null,
  setForceRefreshingTable: jest.fn(),
};
