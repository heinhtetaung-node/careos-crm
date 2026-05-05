import { LANGUAGES } from 'presentation/theme/localization';
import { Package } from 'shared/types/packages';

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

const mockPackageData: Package = {
  bailBondCoverage: 1000,
  canBuy: true,
  carDiscountAmount: '1000',
  carDiscountPercentage: 5,
  carInsuranceType: 'Type 1',
  carRepairType: 'Garage',
  couponDiscountAmount: 1000,
  createTime: 'time',
  deductibleAmount: 10000,
  displayName: 'package',
  expireTime: '9999-01-01T00:00:00Z',
  fireTheftCoverage: 10000,
  floodCoverage: 10000,
  grossMandatoryPremium: '50000',
  grossVoluntaryPremium: '100000',
  hasCctvDiscount: true,
  insuranceCategory: 'mandatory',
  insuranceCompany: {
    displayName: 'En name',
    displayNameTh: 'Th name',
    name: 'insurer/22',
    order: 22,
    rating: 44,
    logo: 'logo url',
    shortnameEn: 'name en',
    shortnameTh: 'name th',
  },
  invoicePrice: '1000000',
  isLowCost: false,
  liabilityPerAccidentCoverage: 100,
  liabilityPerPersonCoverage: 100,
  liabilityPropertyCoverage: 100,
  medicalExpensesCoverage: 100,
  name: 'name',
  originalPrice: 999,
  packageSource: 'manual',
  personalAccidentCoverage: 5000,
  product: 'products/car-insurance',
  sumCoverage: 100,
  sumCoverageMax: 1000,
  sumCoverageMin: 100,
  sumInsuredDefault: 100,
  sumInsuredMax: 100,
  sumInsuredMin: 10000,
  sumInsuredSource: 'source',
  termsEn: 'term',
  termsTh: 'term th',
  priceSummary: {
    interestRate: 0,
    interestAmount: '0',
    processingFeeRate: 0,
    processingFeeAmount: '0',
    feeRate: 0,
    feeAmount: '0',
    discountRate: 0,
    discountAmount: '0',
    netDiscountRate: 0,
    netDiscountAmount: '0',
    packagePriceAfterDiscount: '490000',
    netPremiumAmount: '490000',
    initialAmount: '163333',
    subsequentAmount: '163333',
  },
  installmentDetails: [
    {
      period: 1,
      paymentAmount: '163343',
      principal: '163333',
      addOns: '10',
      interest: '0',
      processingFee: '0',
      principalBalance: '326667',
      interestBalance: '0',
      processingFeeBalance: '0',
      totalBalance: '326667',
    },
    {
      period: 2,
      paymentAmount: '163333',
      principal: '163333',
      addOns: '0',
      interest: '0',
      processingFee: '0',
      principalBalance: '326667',
      interestBalance: '0',
      processingFeeBalance: '0',
      totalBalance: '326667',
    },
  ],
};

const mockFilterValues: FilterInterface = {
  insuranceCategory: 'mandatory',
  insuranceType: {
    'Type 1': true,
    'Type 2': false,
    'Type 3': false,
    'Type 2+': false,
    'Type 3+': false,
  },
  sortBy: 'brand',
  repairType: 'Dealer',
  deductible: 'all_packages',
  price: {
    min: 0,
    max: 100000,
  },
  sumInsured: {
    min: 0,
    max: 100000,
  },
  insurer: { 'insurer/1': true },
  isDefaultSumInsured: false,
  orderBy: undefined,
  brand: undefined,
  year: undefined,
  model: undefined,
  subModel: undefined,
  dashCam: false,
  modification: false,
  drivingPurpose: undefined,
  province: undefined,
};

const expectedPackageDetail = [
  {
    hasData: false,
    title: 'packageListing.titles.renewalPackage',
    items: [
      expect.objectContaining({
        label: 'packageListing.labels.noClaimBonus',
        text: '-',
      }),
      expect.objectContaining({
        label: 'packageListing.labels.claimNumber',
        text: '-',
      }),
      expect.objectContaining({
        label: 'packageListing.labels.claimValue',
        text: '-',
      }),
    ],
  },
  {
    hasData: true,
    items: [
      {
        label: 'packageListing.labels.voluntaryPrice',
        text: 'packageListing.templates.notIncludedPrice',
        textValues: {},
      },
      {
        label: 'packageListing.labels.mandatoryPrice',
        text: 'packageListing.templates.includedPrice',
        textValues: { value: '500' },
      },
      {
        label: 'packageListing.labels.processingFee',
        text: '-',
        textValues: {
          value: '0',
        },
      },
      {
        label: 'packageListing.labels.discount',
        text: '0 healthPackage.thb',
        textValues: {
          value: '0',
        },
      },
      {
        label: 'packageListing.labels.deliveryFee',
        text: '0 healthPackage.thb',
        textValues: {
          value: '0',
        },
      },
      {
        label: 'packageListing.labels.totalPrice',
        text: 'packageListing.templates.price',
        textValues: { value: '10,000' },
      },
    ],
    title: 'packageListing.titles.packagePrice',
  },
  {
    hasData: true,
    items: [
      {
        label: 'packageListing.labels.insuranceType',
        text: 'packageListing.templates.insuranceType 1',
      },
      {
        label: 'packageListing.labels.deductible',
        text: 'packageListing.templates.deductibleValue',
        textValues: { value: '100' },
      },
      {
        label: 'packageListing.labels.dashCam',
        text: 'packageListing.values.dashcamRequired',
      },
    ],
    title: 'packageListing.titles.package',
  },
  {
    hasData: true,
    items: [
      {
        label: 'packageListing.labels.ownCarDamage',
        text: 'packageListing.templates.moneyHighlight',
        textValues: { value: '1' },
      },
      {
        label: 'packageListing.labels.fireAndTheft',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '1' },
      },
      {
        label: 'packageListing.labels.flood',
        text: 'packageListing.values.included',
      },
    ],
    title: 'packageListing.titles.ownCarDamage',
  },
  {
    hasData: true,
    items: [
      {
        label: 'packageListing.labels.personalInjury',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '50' },
      },
      {
        label: 'packageListing.labels.medicalExpense',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '1' },
      },
      {
        label: 'packageListing.labels.bailBond',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '10' },
      },
    ],
    title: 'packageListing.titles.personal',
  },
  {
    hasData: true,
    items: [
      {
        label: 'packageListing.labels.propertyDamage',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '1' },
      },
      {
        label: 'packageListing.labels.deathPerPerson',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '1' },
      },
      {
        label: 'packageListing.labels.maxDeath',
        text: 'packageListing.templates.moneyNormal',
        textValues: { value: '1' },
      },
    ],
    title: 'packageListing.titles.thirdParty',
  },
  {
    hasData: true,
    items: [{ text: 'term' }],
    title: 'packageListing.titles.termsConditions',
  },
];

describe('tests for transformations', () => {
  test('should transform logo url', () => {
    const result = transformLogo(mockPackageData);
    expect(result).toBe('logo url');
  });

  test('should transform title to en name', () => {
    const result = transformTitle(mockPackageData, LANGUAGES.ENGLISH);
    expect(result).toBe('name en');
  });

  test('should transform title to th name', () => {
    const result = transformTitle(mockPackageData, LANGUAGES.THAI);
    expect(result).toBe('name th');
  });

  test('should transform subtitle for mandatory', () => {
    const result = transformSubtitle(mockPackageData);
    expect(result).toBe('packageListing.values.insuranceType.mandatory');
  });

  test('should transform subtitle for other insurance Category', () => {
    const result = transformSubtitle({
      ...mockPackageData,
      insuranceCategory: 'voluntary',
    });
    expect(result).toBe('packageListing.values.insuranceType.Type 1');
  });

  test('should transform premium for non voluntary kind', () => {
    const result = transformPremium(mockPackageData, mockFilterValues);
    expect(result).toBe('1000000');
  });

  test('should transform premium for voluntary kind when compute is not both (no voluntary gross line)', () => {
    const result = transformPremium(
      {
        ...mockPackageData,
        grossVoluntaryPremium: '0',
        grossMandatoryPremium: '50000',
      },
      {
        ...mockFilterValues,
        insuranceCategory: 'voluntary',
      }
    );
    expect(result).toBe(950000);
  });

  test('should use full invoice when :compute has both gross premiums (both)', () => {
    const result = transformPremium(mockPackageData, {
      ...mockFilterValues,
      insuranceCategory: 'voluntary',
    });
    expect(result).toBe('1000000');
  });

  test('should transform original price for non voluntary kind', () => {
    const result = transformOriginalPrice(mockPackageData, mockFilterValues);
    expect(result).toBe(999);
  });

  test('should transform original price for voluntary kind when compute is not both', () => {
    const result = transformOriginalPrice(
      {
        ...mockPackageData,
        grossVoluntaryPremium: '950000',
        grossMandatoryPremium: '0',
      },
      {
        ...mockFilterValues,
        insuranceCategory: 'voluntary',
      }
    );
    expect(result).toBe('950000');
  });

  test('should transform discount even when discount is 1 percent', () => {
    const result = transformDiscount({
      ...mockPackageData,
      carDiscountPercentage: 1,
    });
    expect(result).toStrictEqual({ amount: '1000', percent: 1 });
  });

  test('should transform discount for discount presentage does pass threshold', () => {
    const result = transformDiscount(mockPackageData);
    expect(result).toStrictEqual({ amount: '1000', percent: 5 });
  });

  test('should transform rating', () => {
    const result = transformRating(mockPackageData);
    expect(result).toBe(4.4);
  });

  test('should check whether package has discount or not', () => {
    const result = transformHasDiscount(mockPackageData);
    expect(result).toBe(false);
  });

  test('should check whether package has discount or not', () => {
    const result = transformHasDiscount({
      ...mockPackageData,
      priceSummary: {
        ...mockPackageData.priceSummary,
        netDiscountAmount: '-10',
      } as any,
      carDiscountAmount: '0',
      couponDiscountAmount: 0,
    });
    expect(result).toBe(true);
  });

  test('should transform header Type', () => {
    const result = transformHeaderType(mockPackageData.packageSource);
    expect(result).toBe('info');
  });

  test('should transform header Type for renewal_manual_quote package', () => {
    const result = transformHeaderType('renewal_manual_quote');
    expect(result).toBe('secondary');
  });

  test('should transform header Type for custom package', () => {
    const result = transformHeaderType('custom');
    expect(result).toBe('primary');
  });

  test('should transform header Type for normal import package', () => {
    const result = transformHeaderType('import');
    expect(result).toBe(undefined);
  });

  test.skip('should transform details without renewal section if package is not renewal', () => {
    const result = transformDetails(
      mockPackageData,
      LANGUAGES.ENGLISH,
      mockFilterValues
    );
    expect(result).toEqual(expectedPackageDetail);
  });

  test.skip('should transform details correctly if satang to baht conversion is on', () => {
    const result = transformDetails(
      mockPackageData,
      LANGUAGES.ENGLISH,
      mockFilterValues
    );
    expect(result).toEqual(expectedPackageDetail);
  });

  test('should transform details renewal section if package is renewal', () => {
    const newMockPackage = {
      ...mockPackageData,
      packageSource: 'renewal_manual_quote' as any,
      noClaimBonusAmount: 100000,
      numberOfClaims: 1,
      claimValue: 100000,
    };
    const result = transformDetails(
      newMockPackage,
      LANGUAGES.ENGLISH,
      mockFilterValues
    );
    expect(result[0]).toEqual({
      hasData: true,
      title: 'packageListing.titles.renewalPackage',
      items: [
        {
          label: 'packageListing.labels.noClaimBonus',
          text: 'packageListing.templates.moneyNormal',
          textValues: { value: '1,000' },
        },
        {
          label: 'packageListing.labels.claimNumber',
          text: '{{value}}',
          textValues: { value: 1 },
        },
        {
          label: 'packageListing.labels.claimValue',
          text: 'packageListing.templates.moneyNormal',
          textValues: { value: '1,000' },
        },
      ],
    });
  });

  test('should display date', () => {
    const result = transformExpiryDate(mockPackageData);
    expect(result).toBe('9999-01-01');
  });

  test('should display - if invalid', () => {
    const result = transformExpiryDate({ ...mockPackageData, expireTime: '' });
    expect(result).toBe('-');
  });

  test('should transform terms and conditions', () => {
    const result = transformTermAndCondition(
      mockPackageData,
      LANGUAGES.ENGLISH
    );
    expect(result).toBe('term');
  });

  test('should transform terms and conditions', () => {
    const result = transformTermAndCondition(mockPackageData, LANGUAGES.THAI);
    expect(result).toBe('term th');
  });

  test('should get Translation string', () => {
    const result = getTranslationString('value', 'i18nprefix');
    expect(result).toBe('packageListing.i18nprefix.value');
  });
});

test('should return installment if insurance kind is not voluntary', () => {
  const result = transformInstallment(mockPackageData, mockFilterValues);
  expect(result).toEqual({
    firstMonth: '1,633.43',
    nextMonth: '1,633.33',
    numberOfMonths: 2,
    discountAmount: undefined,
  });
});

test('should return installment if insurance kind is voluntary', () => {
  const result = transformInstallment(
    {
      ...mockPackageData,
      grossVoluntaryPremium: '100000',
      grossMandatoryPremium: '0',
      priceSummary: {
        ...mockPackageData.priceSummary,
        netDiscountAmount: 10,
        feeAmount: 100,
      } as any,
    },
    {
      ...mockFilterValues,
      insuranceCategory: 'voluntary',
    }
  );
  expect(result).toEqual({
    firstMonth: '1,633.33',
    nextMonth: '1,633.33',
    numberOfMonths: 2,
    feeAmount: '0.10',
  });
});

const mockCustomPackage = {
  customQuoteDetails: {
    name: 'prices/c36f9d5e-9660-4e22-a5ea-0e9f88afad5f',
    priceDetail: {
      resourceName: '',
      priceSummary: {
        discount: {
          percentage: 0,
          type: 'DISCOUNT_TYPE_RCL',
        },
        processingFeeAmount: '15259',
        feeAmount: '32641',
        netDiscountRate: -2,
        netDiscountAmount: '-35359',
        initialAmount: '619402',
        subsequentAmount: '554880',
        shipmentFee: '0',
      },
      installmentDetails: [
        {
          period: 1,
          paymentAmount: '619402',
          addOns: '64521',
          totalBalance: '1109760',
        },
        {
          period: 2,
          paymentAmount: '554880',
          addOns: '0',
          totalBalance: '554880',
        },
        {
          period: 3,
          paymentAmount: '554880',
          addOns: '0',
          totalBalance: '0',
        },
      ],
    },
    paymentOption: 'RABBIT_CARE_INSTALLMENT',
    paymentMethod: 'QR_CODE',
    numberOfInstallments: 3,
    cardProvider: '',
    discountType: 'DISCOUNT_TYPE_RCL',
    packageResource: {
      packagePrice: {
        discount: {},
      },
    },
  },
  packageSource: 'custom',
  customPackageStatus: 'APPROVAL_NOT_REQUIRED',
};

test('should transform mandatory/voluntary price correctly for custom quote(voluntary)', () => {
  const newMockPackage = {
    ...mockCustomPackage,
    customQuoteDetails: {
      ...mockCustomPackage.customQuoteDetails,
      packageResource: {
        packagePrice: { voluntaryPrice: '1000', compulsoryPrice: '0' },
      },
      priceDetail: {
        ...mockCustomPackage.customQuoteDetails.priceDetail,
        priceSummary: {
          ...mockCustomPackage.customQuoteDetails.priceDetail.priceSummary,
          shipmentFee: '5000',
        },
      },
    },
  };
  const result = transformDetails(
    newMockPackage as any,
    LANGUAGES.ENGLISH,
    mockFilterValues
  );
  expect(
    result.filter((x) => x.title === 'packageListing.titles.packagePrice')
  ).toStrictEqual([
    {
      hasData: true,
      items: [
        {
          label: 'packageListing.labels.voluntaryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: { value: '10' },
        },
        {
          label: 'packageListing.labels.mandatoryPrice',
          text: 'packageListing.templates.notIncludedPrice',
          textValues: { value: '0' },
        },
        {
          label: 'packageListing.labels.processingFee',
          text: 'packageListing.templates.moneyNormal',
          textValues: {
            value: '152.59',
          },
        },
        {
          label: 'packageListing.labels.discount',
          text: '0 healthPackage.thb',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.deliveryFee',
          text: 'packageListing.templates.moneyNormal',
          textValues: {
            value: '50',
          },
        },
        {
          label: 'packageListing.labels.totalPrice',
          text: 'packageListing.templates.price',
          textValues: {
            value: '0',
          },
        },
      ],
      title: 'packageListing.titles.packagePrice',
    },
  ]);
});

test('should transform mandatory/voluntary price correctly for custom quote(mandatory)', () => {
  const newMockPackage = {
    ...mockCustomPackage,
    customQuoteDetails: {
      ...mockCustomPackage.customQuoteDetails,
      packageResource: {
        packagePrice: { voluntaryPrice: '0', compulsoryPrice: '1000' },
      },
    },
  };
  const result = transformDetails(
    newMockPackage as any,
    LANGUAGES.ENGLISH,
    mockFilterValues
  );
  expect(
    result.filter((x) => x.title === 'packageListing.titles.packagePrice')
  ).toStrictEqual([
    {
      hasData: true,
      items: [
        {
          label: 'packageListing.labels.voluntaryPrice',
          text: 'packageListing.templates.notIncludedPrice',
          textValues: { value: '0' },
        },
        {
          label: 'packageListing.labels.mandatoryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: { value: '10' },
        },
        {
          label: 'packageListing.labels.processingFee',
          text: 'packageListing.templates.moneyNormal',
          textValues: {
            value: '152.59',
          },
        },
        {
          label: 'packageListing.labels.discount',
          text: '0 healthPackage.thb',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.deliveryFee',
          text: '0 healthPackage.thb',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.totalPrice',
          text: 'packageListing.templates.price',
          textValues: {
            value: '0',
          },
        },
      ],
      title: 'packageListing.titles.packagePrice',
    },
  ]);
});

test('should transform mandatory/voluntary price correctly for custom quote(both)', () => {
  const newMockPackage = {
    ...mockCustomPackage,
    customQuoteDetails: {
      ...mockCustomPackage.customQuoteDetails,
      packageResource: {
        packagePrice: { voluntaryPrice: '1000', compulsoryPrice: '1000' },
      },
    },
  };
  const result = transformDetails(
    newMockPackage as any,
    LANGUAGES.ENGLISH,
    mockFilterValues
  );
  expect(
    result.filter((x) => x.title === 'packageListing.titles.packagePrice')
  ).toStrictEqual([
    {
      hasData: true,
      items: [
        {
          label: 'packageListing.labels.voluntaryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: { value: '10' },
        },
        {
          label: 'packageListing.labels.mandatoryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: { value: '10' },
        },
        {
          label: 'packageListing.labels.processingFee',
          text: 'packageListing.templates.moneyNormal',
          textValues: {
            value: '152.59',
          },
        },
        {
          label: 'packageListing.labels.discount',
          text: '0 healthPackage.thb',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.deliveryFee',
          text: '0 healthPackage.thb',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.totalPrice',
          text: 'packageListing.templates.price',
          textValues: {
            value: '0',
          },
        },
      ],
      title: 'packageListing.titles.packagePrice',
    },
  ]);
});

describe('customQuote', () => {
  it('should transform custom quote detail', () => {
    const result = transformCustomQuoteInfo(
      mockCustomPackage as any,
      { insuranceCategory: 'both' } as any
    );
    expect(result).toEqual({
      approvalStatus: 'APPROVAL_NOT_REQUIRED',
      paymentMethod: 'QR_CODE',
      cardProvider: '',
      discount: { percentage: 0, type: 'DISCOUNT_TYPE_RCL' },
      discountType: 'DISCOUNT_TYPE_RCL',
      numberOfInstallments: 3,
      deliveryOption: undefined,
      originalPackageName: '',
      paymentOption: 'RABBIT_CARE_INSTALLMENT',
      discountRequest: {
        approver: undefined,
        approverRemark: undefined,
        discountAmount: '0',
        discountPercentage: 0,
        source: undefined,
      },
      priceBreakDown: {
        feeAmount: undefined,
        firstMonth: '619402',
        nextMonth: '554880',
        numberOfMonths: 3,
      },
    });
  });
  it('should transform custom quote detail(approval status with request)', () => {
    const newMock = {
      customQuoteDetails: {
        ...mockCustomPackage.customQuoteDetails,
        request: {
          name: 'discount/1234',
          status: 'PENDING',
        },
      },
      customPackageStatus: 'PENDING',
    };
    const result = transformCustomQuoteInfo(
      newMock as any,
      { insuranceCategory: 'both' } as any
    );
    expect(result).toEqual({
      approvalStatus: 'PENDING',
      paymentMethod: 'QR_CODE',
      deliveryOption: undefined,
      cardProvider: '',
      discount: { percentage: 0, type: 'DISCOUNT_TYPE_RCL' },
      discountType: 'DISCOUNT_TYPE_RCL',
      numberOfInstallments: 3,
      originalPackageName: '',
      paymentOption: 'RABBIT_CARE_INSTALLMENT',
      discountRequest: {
        approver: undefined,
        approverRemark: undefined,
        discountAmount: '0',
        discountPercentage: 0,
        source: undefined,
      },
      priceBreakDown: {
        feeAmount: undefined,
        firstMonth: '619402',
        nextMonth: '554880',
        numberOfMonths: 3,
      },
    });
  });
  it('should remove add on if voluntary only', () => {
    mockCustomPackage.customQuoteDetails.priceDetail.priceSummary.netDiscountAmount =
      '35359';
    const result = transformCustomQuoteInfo(
      mockCustomPackage as any,
      { insuranceCategory: 'voluntary' } as any
    );
    expect(result?.priceBreakDown).toEqual({
      feeAmount: '35359',
      firstMonth: '554881',
      nextMonth: '554880',
      numberOfMonths: 3,
    });
  });
  it('should not break down price if installmentDetail is empty', () => {
    mockCustomPackage.customQuoteDetails.priceDetail.installmentDetails = [];
    const result = transformCustomQuoteInfo(
      mockCustomPackage as any,
      { insuranceCategory: 'voluntary' } as any
    );
    expect(result?.priceBreakDown).toEqual(null);
    const emptyResult = transformCustomQuoteInfo({} as any, {} as any);
    expect(emptyResult).toBe(undefined);
  });

  it('should transform package with carDiscount', () => {
    mockCustomPackage.customQuoteDetails.priceDetail.installmentDetails = [];
    mockCustomPackage.customQuoteDetails.discountType = 'car_discount';
    mockCustomPackage.customQuoteDetails.packageResource.packagePrice.discount =
      {
        percentage: 200,
        amount: '1000',
      };

    const result = transformCustomQuoteInfo(
      mockCustomPackage as any,
      { insuranceCategory: 'voluntary' } as any
    );
    expect(result?.discountRequest).toEqual({
      approver: undefined,
      discountAmount: '1000',
      discountPercentage: 200,
      source: undefined,
    });
  });
});

describe('transformInsuranceKind', () => {
  it('should return value from filter for manual packages', () => {
    const result = transformInsuranceKind(
      {
        packageSource: 'manual',
        grossVoluntaryPremium: '1000000',
        grossMandatoryPremium: '0',
      } as any,
      {
        insuranceCategory: 'both',
      } as any
    );
    expect(result).toBe('both');
  });

  it('should return value from filter for renewal manual packages', () => {
    const result = transformInsuranceKind(
      {
        packageSource: 'renewal_manual_quote',
        grossVoluntaryPremium: '1000000',
        grossMandatoryPremium: '0',
      } as any,
      {
        insuranceCategory: 'mandatory',
      } as any
    );
    expect(result).toBe('mandatory');
  });

  it('import package: both gross premiums from :compute → both (overrides voluntary filter)', () => {
    const result = transformInsuranceKind(
      {
        packageSource: 'import',
        grossVoluntaryPremium: '780030',
        grossMandatoryPremium: '64521',
      } as any,
      { insuranceCategory: 'voluntary' } as any
    );
    expect(result).toBe('both');
  });

  it('custom package with both insuranceKind', () => {
    const result = transformInsuranceKind(
      {
        customQuoteDetails: {
          packageResource: {
            packagePrice: {
              voluntaryPrice: '100',
              compulsoryPrice: '100',
            },
          },
        },
        packageSource: 'custom',
      } as Package,
      { insuranceCategory: 'mandatory' } as any
    );
    expect(result).toBe('both');
  });

  it('custom package with mandatory insuranceKind', () => {
    const result = transformInsuranceKind(
      {
        customQuoteDetails: {
          packageResource: {
            packagePrice: {
              voluntaryPrice: '0',
              compulsoryPrice: '100',
            },
          },
        },
        packageSource: 'custom',
      } as Package,
      { insuranceCategory: 'mandatory' } as any
    );
    expect(result).toBe('mandatory');
  });

  it('custom package with voluntary insuranceKind', () => {
    const result = transformInsuranceKind(
      {
        customQuoteDetails: {
          packageResource: {
            packagePrice: {
              voluntaryPrice: '100',
              compulsoryPrice: '0',
            },
          },
        },
        packageSource: 'custom',
      } as Package,
      { insuranceCategory: 'mandatory' } as any
    );
    expect(result).toBe('voluntary');
  });
});
