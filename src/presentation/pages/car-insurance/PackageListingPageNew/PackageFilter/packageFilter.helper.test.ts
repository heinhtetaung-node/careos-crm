import mockPackages from '@alphafounders/mock-data/json/packages.json';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { Lead } from 'shared/types/lead';

import {
  getDefaultValues,
  getFilterConfig,
  getInsuranceKind,
  injectSumInsuredRangeToInsurer,
  getDefaultPaymentOption,
  defaultFiltervalue,
  isUsableDefaultValue,
  mergeStoredFilterWithLeadDefaults,
} from './packageFilter.helper';
import filterConfig from './filterConfig';

mockUseFlags();

describe('getInsuranceKind', () => {
  it('should return "VOLUNTARY" when passed voluntary', async () => {
    expect(getInsuranceKind('voluntary')).toBe('VOLUNTARY');
  });

  it('should return "MANDATORY" when passed voluntary', async () => {
    expect(getInsuranceKind('mandatory')).toBe('MANDATORY');
  });

  it('should return "BOTH" when passed both or any text', async () => {
    expect(getInsuranceKind('both')).toBe('BOTH');
    expect(getInsuranceKind('anything')).toBe('BOTH');
  });
});

describe('injectSumInsurerRangeToInsurer', () => {
  it('should add insurance range as adornment', () => {
    const insurer = [
      { key: 'insurers/1', label: 'insurer', logo: 'logo' },
      { key: 'insurers/2', label: 'insurer', logo: 'logo' },
    ];
    const rangeResponse = [
      {
        insurer: 'insurers/1',
        sumInsuredMin: '10000',
        sumInsuredMax: '1000000',
      },
    ];
    const result = injectSumInsuredRangeToInsurer(insurer, rangeResponse);
    expect(result).toStrictEqual([
      {
        key: 'insurers/1',
        label: 'insurer',
        logo: 'logo',
        adornment: '100 - 10,000',
      },
      {
        key: 'insurers/2',
        label: 'insurer',
        logo: 'logo',
        adornment: undefined,
      },
    ]);
  });
});

describe('getFilterConfig', () => {
  it('should return config and default value for filter', () => {
    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    const { defaultValues } = getDefaultValues(config, {} as Lead, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    expect(config).toStrictEqual({
      ...filterConfig,
      sort: {
        title: 'leadPackageFilter.sortBy',
        tooltip: 'leadPackageFilter.tooltip.sortBy',
        type: 'selectbox',
        values: [
          { key: 'default', label: 'text.select' },
          { key: 'brand', label: 'leadPackageFilter.sortByOptions.brand' },
          { key: 'price', label: 'leadPackageFilter.sortByOptions.price' },
          {
            key: 'sumInsured',
            label: 'leadPackageFilter.sortByOptions.sumInsured',
          },
        ],
      },
      paymentOption: {
        title: 'leadPackageFilter.paymentOption',
        tooltip: 'leadPackageFilter.tooltip.paymentOption',
        type: 'selectbox',
        options: [],
      },
      installment: {
        title: 'leadPackageFilter.numberOfInstallment',
        tooltip: 'leadPackageFilter.tooltip.installmentOption',
        type: 'selectbox',
        options: [],
      },
      insuranceType: {
        title: 'leadPackageFilter.insuranceType',
        tooltip: 'leadPackageFilter.tooltip.insuranceType',
        type: 'checkbox',
        values: [
          {
            key: 'Type 1',
            label: 'leadPackageFilter.possibleValue.insuranceType.type1',
          },
          {
            key: 'Type 2+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2+',
          },
          {
            key: 'Type 3+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3+',
          },
          {
            key: 'Type 2',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2',
          },
          {
            key: 'Type 3',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3',
          },
          {
            key: 'mandatory',
            label: 'leadPackageFilter.possibleValue.insuranceType.compulsory',
          },
        ],
      },
      insurer: {
        title: 'leadPackageFilter.insurer',
        tooltip: 'leadPackageFilter.tooltip.insurer',
        type: 'checkbox',
        values: [
          {
            key: 'insurer/5',
            label: 'Assets Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/11',
            label: 'Dhipaya Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/33',
            label: 'LMG Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/27',
            label: 'The Viriyah Insurance Company Limited',
            logo: undefined,
          },
        ],
      },
      repairType: {
        title: 'leadPackageFilter.repairType',
        tooltip: 'leadPackageFilter.tooltip.repairType',
        type: 'checkbox',
        values: [
          {
            key: 'Dealer',
            label: 'leadPackageFilter.possibleValue.repairType.dealer',
          },
          {
            key: 'Garage',
            label: 'leadPackageFilter.possibleValue.repairType.garage',
          },
        ],
      },
      sumInsured: {
        title: 'leadPackageFilter.sumInsured',
        tooltip: 'leadPackageFilter.tooltip.sumInsured',
        type: 'slidebar',
        config: {
          max: 200,
          min: 0,
          step: 10000,
        },
      },
      price: {
        title: 'leadPackageFilter.price',
        tooltip: 'leadPackageFilter.tooltip.price',
        type: 'slidebar',
        config: {
          max: 19838,
          min: 5,
          step: 1,
        },
      },
      deductible: {
        title: 'leadPackageFilter.deductible',
        tooltip: 'leadPackageFilter.tooltip.deductible',
        type: 'checkbox',
        values: [
          {
            key: 'no_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.noDeductible',
          },
          {
            key: 'only_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.onlyDeductible',
          },
        ],
      },
    });
    expect(defaultValues).toStrictEqual({
      ...defaultFiltervalue,
      sortBy: 'default',
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: { min: 5, max: 19838 },
      sumInsured: { min: 0, max: 200 },
      insurer: {
        'insurer/5': true,
        'insurer/11': true,
        'insurer/33': true,
        'insurer/27': true,
      },
      isDefaultSumInsured: true,
      insuranceCategory: undefined,
    });
  });

  it('should return config and default value for filter(payment option without installment)', () => {
    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    const { defaultValues } = getDefaultValues(config, {} as Lead, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    expect(config).toStrictEqual({
      ...filterConfig,
      sort: {
        title: 'leadPackageFilter.sortBy',
        tooltip: 'leadPackageFilter.tooltip.sortBy',
        type: 'selectbox',
        values: [
          { key: 'default', label: 'text.select' },
          { key: 'brand', label: 'leadPackageFilter.sortByOptions.brand' },
          { key: 'price', label: 'leadPackageFilter.sortByOptions.price' },
          {
            key: 'sumInsured',
            label: 'leadPackageFilter.sortByOptions.sumInsured',
          },
        ],
      },
      paymentOption: {
        title: 'leadPackageFilter.paymentOption',
        tooltip: 'leadPackageFilter.tooltip.paymentOption',
        type: 'selectbox',
        options: [],
      },
      installment: {
        title: 'leadPackageFilter.numberOfInstallment',
        tooltip: 'leadPackageFilter.tooltip.installmentOption',
        type: 'selectbox',
        options: [],
      },
      insuranceType: {
        title: 'leadPackageFilter.insuranceType',
        tooltip: 'leadPackageFilter.tooltip.insuranceType',
        type: 'checkbox',
        values: [
          {
            key: 'Type 1',
            label: 'leadPackageFilter.possibleValue.insuranceType.type1',
          },
          {
            key: 'Type 2+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2+',
          },
          {
            key: 'Type 3+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3+',
          },
          {
            key: 'Type 2',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2',
          },
          {
            key: 'Type 3',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3',
          },
          {
            key: 'mandatory',
            label: 'leadPackageFilter.possibleValue.insuranceType.compulsory',
          },
        ],
      },
      insurer: {
        title: 'leadPackageFilter.insurer',
        tooltip: 'leadPackageFilter.tooltip.insurer',
        type: 'checkbox',
        values: [
          {
            key: 'insurer/5',
            label: 'Assets Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/11',
            label: 'Dhipaya Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/33',
            label: 'LMG Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/27',
            label: 'The Viriyah Insurance Company Limited',
            logo: undefined,
          },
        ],
      },
      repairType: {
        title: 'leadPackageFilter.repairType',
        tooltip: 'leadPackageFilter.tooltip.repairType',
        type: 'checkbox',
        values: [
          {
            key: 'Dealer',
            label: 'leadPackageFilter.possibleValue.repairType.dealer',
          },
          {
            key: 'Garage',
            label: 'leadPackageFilter.possibleValue.repairType.garage',
          },
        ],
      },
      sumInsured: {
        title: 'leadPackageFilter.sumInsured',
        tooltip: 'leadPackageFilter.tooltip.sumInsured',
        type: 'slidebar',
        config: {
          max: 200,
          min: 0,
          step: 10000,
        },
      },
      price: {
        title: 'leadPackageFilter.price',
        tooltip: 'leadPackageFilter.tooltip.price',
        type: 'slidebar',
        config: {
          max: 19838,
          min: 5,
          step: 1,
        },
      },
      deductible: {
        title: 'leadPackageFilter.deductible',
        tooltip: 'leadPackageFilter.tooltip.deductible',
        type: 'checkbox',
        values: [
          {
            key: 'no_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.noDeductible',
          },
          {
            key: 'only_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.onlyDeductible',
          },
        ],
      },
    });
    expect(defaultValues).toStrictEqual({
      ...defaultFiltervalue,
      sortBy: 'default',
      insuranceCategory: undefined,
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: { min: 5, max: 19838 },
      sumInsured: { min: 0, max: 200 },
      insurer: {
        'insurer/5': true,
        'insurer/11': true,
        'insurer/33': true,
        'insurer/27': true,
      },
      isDefaultSumInsured: true,
    });
  });

  it('should return config and default value for filter(payment option with installment)', () => {
    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    const { defaultValues } = getDefaultValues(config, {} as Lead, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    expect(config).toStrictEqual({
      ...filterConfig,
      sort: {
        title: 'leadPackageFilter.sortBy',
        tooltip: 'leadPackageFilter.tooltip.sortBy',
        type: 'selectbox',
        values: [
          { key: 'default', label: 'text.select' },
          { key: 'brand', label: 'leadPackageFilter.sortByOptions.brand' },
          { key: 'price', label: 'leadPackageFilter.sortByOptions.price' },
          {
            key: 'sumInsured',
            label: 'leadPackageFilter.sortByOptions.sumInsured',
          },
        ],
      },
      paymentOption: {
        title: 'leadPackageFilter.paymentOption',
        tooltip: 'leadPackageFilter.tooltip.paymentOption',
        type: 'selectbox',
        options: [],
      },
      installment: {
        title: 'leadPackageFilter.numberOfInstallment',
        tooltip: 'leadPackageFilter.tooltip.installmentOption',
        type: 'selectbox',
        options: [],
      },
      insuranceType: {
        title: 'leadPackageFilter.insuranceType',
        tooltip: 'leadPackageFilter.tooltip.insuranceType',
        type: 'checkbox',
        values: [
          {
            key: 'Type 1',
            label: 'leadPackageFilter.possibleValue.insuranceType.type1',
          },
          {
            key: 'Type 2+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2+',
          },
          {
            key: 'Type 3+',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3+',
          },
          {
            key: 'Type 2',
            label: 'leadPackageFilter.possibleValue.insuranceType.type2',
          },
          {
            key: 'Type 3',
            label: 'leadPackageFilter.possibleValue.insuranceType.type3',
          },
          {
            key: 'mandatory',
            label: 'leadPackageFilter.possibleValue.insuranceType.compulsory',
          },
        ],
      },
      insurer: {
        title: 'leadPackageFilter.insurer',
        tooltip: 'leadPackageFilter.tooltip.insurer',
        type: 'checkbox',
        values: [
          {
            key: 'insurer/5',
            label: 'Assets Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/11',
            label: 'Dhipaya Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/33',
            label: 'LMG Insurance',
            logo: undefined,
          },
          {
            key: 'insurer/27',
            label: 'The Viriyah Insurance Company Limited',
            logo: undefined,
          },
        ],
      },
      repairType: {
        title: 'leadPackageFilter.repairType',
        tooltip: 'leadPackageFilter.tooltip.repairType',
        type: 'checkbox',
        values: [
          {
            key: 'Dealer',
            label: 'leadPackageFilter.possibleValue.repairType.dealer',
          },
          {
            key: 'Garage',
            label: 'leadPackageFilter.possibleValue.repairType.garage',
          },
        ],
      },
      sumInsured: {
        title: 'leadPackageFilter.sumInsured',
        tooltip: 'leadPackageFilter.tooltip.sumInsured',
        type: 'slidebar',
        config: {
          max: 200,
          min: 0,
          step: 10000,
        },
      },
      price: {
        title: 'leadPackageFilter.price',
        tooltip: 'leadPackageFilter.tooltip.price',
        type: 'slidebar',
        config: {
          max: 19838,
          min: 5,
          step: 1,
        },
      },
      deductible: {
        title: 'leadPackageFilter.deductible',
        tooltip: 'leadPackageFilter.tooltip.deductible',
        type: 'checkbox',
        values: [
          {
            key: 'no_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.noDeductible',
          },
          {
            key: 'only_deductible',
            label: 'leadPackageFilter.possibleValue.deductible.onlyDeductible',
          },
        ],
      },
    });
    expect(defaultValues).toStrictEqual({
      ...defaultFiltervalue,
      sortBy: 'default',
      insuranceCategory: undefined,
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: { min: 5, max: 19838 },
      sumInsured: { min: 0, max: 200 },
      insurer: {
        'insurer/5': true,
        'insurer/11': true,
        'insurer/33': true,
        'insurer/27': true,
      },
      isDefaultSumInsured: true,
    });
  });

  it('should return lead data as default paymentOption and installment', () => {
    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    const { defaultValues } = getDefaultValues(
      config,
      {
        data: {
          checkout: {
            paymentOption: 'CREDIT_CARD_INSTALLMENT',
            installments: 6,
          },
        },
      } as Lead,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
      }
    );
    expect(defaultValues).toStrictEqual({
      ...defaultFiltervalue,
      sortBy: 'default',
      insuranceCategory: undefined,
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: { min: 5, max: 19838 },
      sumInsured: { min: 0, max: 200 },
      insurer: {
        'insurer/5': true,
        'insurer/11': true,
        'insurer/33': true,
        'insurer/27': true,
      },
      isDefaultSumInsured: true,
    });
  });

  it('should return default installment if lead checkout has invalid installment', () => {
    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });
    const { defaultValues } = getDefaultValues(
      config,
      {
        data: {
          checkout: {
            paymentOption: 'CREDIT_CARD_INSTALLMENT',
            installments: 1,
          },
        },
      } as Lead,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
      }
    );
    expect(defaultValues).toStrictEqual({
      ...defaultFiltervalue,
      sortBy: 'default',
      insuranceCategory: undefined,
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: { min: 5, max: 19838 },
      sumInsured: { min: 0, max: 200 },
      insurer: {
        'insurer/5': true,
        'insurer/11': true,
        'insurer/33': true,
        'insurer/27': true,
      },
      isDefaultSumInsured: true,
    });
  });

  it('should return config with new filter sort values when isNewFilter is true', () => {
    const { config } = getFilterConfig(
      mockPackages as any,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
      },
      true
    ); // isNewFilter = true

    expect(config.sort.values).toStrictEqual([
      { key: 'default', label: 'text.select' },
      { key: 'insurer', label: 'newPackageListing.insurer' },
      { key: 'package_name', label: 'newPackageListing.displayName' },
      { key: 'insurer_type', label: 'newPackageListing.insuranceType' },
      { key: 'repair_type', label: 'newPackageListing.repairType' },
      { key: 'car_coverage', label: 'newPackageListing.carCoverage' },
      { key: 'deductible', label: 'newPackageListing.deductible' },
      { key: 'price', label: 'newPackageListing.price' },
      { key: 'paymentPlan', label: 'newPackageListing.paymentPlan' },
      { key: 'shippingFee', label: 'newPackageListing.shippingFee' },
      { key: 'discount', label: 'newPackageListing.discount' },
      { key: 'processingFee', label: 'newPackageListing.processingFee' },
      { key: 'premium', label: 'newPackageListing.invoicedAmount' },
    ]);

    expect(config.order.values).toStrictEqual([
      { key: 'default', label: 'text.select' },
      { key: 'asc', label: 'asc' },
      { key: 'desc', label: 'desc' },
    ]);
  });

  it('should return config with default filter sort values when isNewFilter is false', () => {
    const { config } = getFilterConfig(
      mockPackages as any,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
      },
      false
    ); // isNewFilter = false
    expect(config.sort.values).toStrictEqual([
      { key: 'default', label: 'text.select' },
      { key: 'insurer', label: 'newPackageListing.insurer' },
      { key: 'package_name', label: 'newPackageListing.displayName' },
      { key: 'insurer_type', label: 'newPackageListing.insuranceType' },
      { key: 'repair_type', label: 'newPackageListing.repairType' },
      { key: 'car_coverage', label: 'newPackageListing.carCoverage' },
      { key: 'deductible', label: 'newPackageListing.deductible' },
      { key: 'price', label: 'newPackageListing.price' },
      { key: 'paymentPlan', label: 'newPackageListing.paymentPlan' },
      { key: 'shippingFee', label: 'newPackageListing.shippingFee' },
      { key: 'discount', label: 'newPackageListing.discount' },
      { key: 'processingFee', label: 'newPackageListing.processingFee' },
      { key: 'premium', label: 'newPackageListing.invoicedAmount' },
    ]);
  });

  it('should properly set config.sort.values array structure on line 209', () => {
    const { config } = getFilterConfig(
      mockPackages as any,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
        subModels: [
          {
            id: '1',
            name: 'Sub Model 1',
          },
        ],
      } as any,
      true
    ); // Explicitly set isNewFilter = true

    expect(config.sort.values).toStrictEqual([
      { key: 'default', label: 'text.select' },
      { key: 'insurer', label: 'newPackageListing.insurer' },
      { key: 'package_name', label: 'newPackageListing.displayName' },
      { key: 'insurer_type', label: 'newPackageListing.insuranceType' },
      { key: 'repair_type', label: 'newPackageListing.repairType' },
      { key: 'car_coverage', label: 'newPackageListing.carCoverage' },
      { key: 'deductible', label: 'newPackageListing.deductible' },
      { key: 'price', label: 'newPackageListing.price' },
      { key: 'paymentPlan', label: 'newPackageListing.paymentPlan' },
      { key: 'shippingFee', label: 'newPackageListing.shippingFee' },
      { key: 'discount', label: 'newPackageListing.discount' },
      { key: 'processingFee', label: 'newPackageListing.processingFee' },
      { key: 'premium', label: 'newPackageListing.invoicedAmount' },
    ]);
  });

  it('should execute line 209 when isNewFilter is true', () => {
    const result = getFilterConfig(
      mockPackages as any,
      {
        sumInsuredMinMax: {
          sumInsuredMax: 200,
          sumInsuredMin: 100,
        },
      },
      true
    ); // isNewFilter = true

    expect(result.config.sort.values).toHaveLength(13);
    expect(result.config.sort.values[0]).toEqual({
      key: 'default',
      label: 'text.select',
    });
    expect(result.config.sort.values[1]).toEqual({
      key: 'insurer',
      label: 'newPackageListing.insurer',
    });
  });
});

describe('getDefaultValues storage merge', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.pushState({}, '', '/leads/lead-123/packages');
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('keeps lead car defaults when stored filter has empty car fields', () => {
    window.sessionStorage.setItem(
      'PACKAGE_FILTER-lead-123',
      JSON.stringify({
        insuranceCategory: 'mandatory',
        brand: '',
        model: {},
        year: 0,
        province: {},
        drivingPurpose: '',
        dashCam: false,
      })
    );

    const { config } = getFilterConfig(mockPackages as any, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
    });

    const { defaultValues } = getDefaultValues(config, {} as Lead, {
      sumInsuredMinMax: {
        sumInsuredMax: 200,
        sumInsuredMin: 100,
      },
      carInfo: {
        brand: 54,
        model: 616,
        year: 2014,
        carSubModelYear: null,
        registeredProvince: 100000,
        carUsageType: 'personal',
        carDashCam: true,
        carModified: false,
        engineSize: 2500,
        noOfDoors: 4,
      } as any,
    });

    expect(defaultValues).toEqual(
      expect.objectContaining({
        insuranceCategory: 'mandatory',
        brand: 54,
        model: 616,
        year: 2014,
        province: 100000,
        drivingPurpose: 'personal',
        dashCam: false,
        engineSize: 2500,
        noOfDoors: 4,
      })
    );
  });
});

describe('mergeStoredFilterWithLeadDefaults', () => {
  it('detects usable lead defaults by value type', () => {
    expect(isUsableDefaultValue(null)).toBe(false);
    expect(isUsableDefaultValue('')).toBe(false);
    expect(isUsableDefaultValue(0)).toBe(false);
    expect(isUsableDefaultValue({})).toBe(false);
    expect(isUsableDefaultValue(false)).toBe(true);
    expect(isUsableDefaultValue('54')).toBe(true);
    expect(isUsableDefaultValue(2014)).toBe(true);
    expect(isUsableDefaultValue({ key: 'value' })).toBe(true);
  });

  it('restores lead-backed defaults when stored values are empty', () => {
    const result = mergeStoredFilterWithLeadDefaults(
      {
        ...defaultFiltervalue,
        brand: '54',
        model: '616',
        year: 2014,
        province: 100000,
        drivingPurpose: 'personal',
        dashCam: true,
        modification: false,
        engineSize: 2500,
        noOfDoors: 4,
      } as any,
      {
        ...defaultFiltervalue,
        insuranceCategory: 'mandatory',
        brand: '',
        model: {},
        year: 0,
        province: {},
        drivingPurpose: '',
        dashCam: false,
        modification: false,
        engineSize: undefined,
        noOfDoors: undefined,
      } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        insuranceCategory: 'mandatory',
        brand: '54',
        model: '616',
        year: 2014,
        province: 100000,
        drivingPurpose: 'personal',
        dashCam: false,
        modification: false,
        engineSize: 2500,
        noOfDoors: 4,
      })
    );
  });
});

describe('getDefaultPaymentOption', () => {
  const leadData = {
    data: {
      checkout: {
        paymentOption: 'RABBIT_CARE_INSTALLMENT',
      },
    },
  } as Lead;

  const paymentOptions = [
    'CREDIT_CARD_INSTALLMENT',
    'FULL_PAYMENT',
    'RABBIT_CARE_INSTALLMENT',
  ];

  it('should return "RABBIT_CARE_INSTALLMENT"', async () => {
    expect(getDefaultPaymentOption(leadData, paymentOptions)).toBe(
      'RABBIT_CARE_INSTALLMENT'
    );
  });

  it('should return "CREDIT_CARD_INSTALLMENT"', async () => {
    expect(getDefaultPaymentOption({} as Lead, paymentOptions)).toBe(
      'CREDIT_CARD_INSTALLMENT'
    );
  });

  it('should return "FULL_PAYMENT"', async () => {
    expect(getDefaultPaymentOption({} as Lead)).toBe('FULL_PAYMENT');
  });
});
