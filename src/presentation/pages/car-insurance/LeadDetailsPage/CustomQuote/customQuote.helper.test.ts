import { sub, differenceInYears, format } from 'utils/datetime';

import {
  prepareCreateRenewalQuoteData,
  prepareCustomQuoteFormData,
  prepareCreateCustomQuoteData,
  getCarAge,
} from './customQuote.helper';

jest.useFakeTimers().setSystemTime(new Date('01-01-2019'));
const expirationDate = new Date();

const formikValues = {
  bail_bond_coverage: '120000',
  car_age: 2020,
  car_insurance_type: 'Type 2',
  car_repair_type: 'Dealer',
  car_submodels: 'G',
  chassisNo: '',
  claimNumber: '',
  claimValue: '1000',
  deductible_amount: '120000',
  expiration_date: expirationDate,
  fire_theft_coverage: 'No',
  fire_theft_coverage_value: 10000,
  firstDriverDOB: '',
  fixedDriver: '',
  flood_coverage: 'No',
  flood_coverage_value: 10000,
  has_cctv_discount: 'Yes',
  insurance_company_id: '7',
  lastPolicyNumber: '',
  liability_per_accident_coverage: '120000',
  liability_per_person_coverage: '120000',
  liability_property_coverage: '120000',
  medical_expenses_coverage: '120000',
  medical_expenses_coverage_no: '1',
  modified_car_accepted: 'Yes',
  name: 'test',
  noClaimBonus: 1000,
  oic_code: 110,
  package_type: 'STANDARD',
  personal_accident_coverage: '120000',
  personal_accident_coverage_no: '1',
  price: '120000',
  secondDriverDOB: '',
  start_date: new Date(),
  sum_coverage_max: '120000',
  sum_coverage_min: '',
};

test('should return expect format', () => {
  expect(prepareCreateRenewalQuoteData(formikValues)).toEqual({
    bailBondCoverage: 12000000,
    carInsuranceType: 'TYPE_2',
    carRepairType: 'DEALER',
    claimValue: 100000,
    deductibleAmount: 12000000,
    fireTheftCoverage: 0,
    floodCoverage: 0,
    insurer: 'insurers/7',
    lastPolicyExpirationDate: new Date(expirationDate).toISOString(),
    lastPolicyNumber: '',
    liabilityPerAccidentCoverage: 12000000,
    liabilityPerPersonCoverage: 12000000,
    liabilityPropertyCoverage: 12000000,
    medicalExpensesCoverage: 12000000,
    medicalExpensesCoverageNo: 1,
    noClaimBonus: 100000,
    numberOfClaims: 0,
    oicCode: 'TYPE_110',
    personalAccidentCoverage: 12000000,
    personalAccidentCoverageNo: 1,
    sumCoverage: 12000000,
    grossPremium: 12000000,
  });
});

test('should return expect fire flood coverage if flood and fire_thief_coverage exist', () => {
  expect(
    prepareCreateRenewalQuoteData({
      ...formikValues,
      fire_theft_coverage: 'Yes',
      flood_coverage: 'Yes',
    })
  ).toEqual({
    bailBondCoverage: 12000000,
    carInsuranceType: 'TYPE_2',
    carRepairType: 'DEALER',
    claimValue: 100000,
    deductibleAmount: 12000000,
    fireTheftCoverage: 1000000,
    floodCoverage: 1000000,
    insurer: 'insurers/7',
    lastPolicyExpirationDate: new Date(expirationDate).toISOString(),
    lastPolicyNumber: '',
    liabilityPerAccidentCoverage: 12000000,
    liabilityPerPersonCoverage: 12000000,
    liabilityPropertyCoverage: 12000000,
    medicalExpensesCoverage: 12000000,
    medicalExpensesCoverageNo: 1,
    noClaimBonus: 100000,
    numberOfClaims: 0,
    oicCode: 'TYPE_110',
    personalAccidentCoverage: 12000000,
    personalAccidentCoverageNo: 1,
    sumCoverage: 12000000,
    grossPremium: 12000000,
  });
});

describe('prepareCustomQuoteFormData', () => {
  it('returns data in correct format', () => {
    expect(prepareCustomQuoteFormData(formikValues, '12345', '100000')).toEqual(
      {
        bailBondCoverage: '12000000',
        carInsuranceType: 'TYPE_2',
        carRepairType: 'DEALER',
        carAgeMax: differenceInYears(new Date(), new Date('01-01-2020')),
        carAgeMin: differenceInYears(new Date(), new Date('01-01-2020')),
        deductibleAmount: '12000000',
        insurer: 'insurers/7',
        liabilityPerAccidentCoverage: '12000000',
        liabilityPerPersonCoverage: '12000000',
        liabilityPropertyCoverage: '12000000',
        medicalExpensesCoverage: '12000000',
        medicalExpensesCoverageNo: 1,
        oicCode: 'TYPE_110',
        packageType: 'STANDARD',
        personalAccidentCoverage: '12000000',
        personalAccidentCoverageNo: 1,
        price: '12000000',
        displayName: 'test',
        expireTime: new Date(expirationDate).toISOString(),
        startTime: new Date(expirationDate).toISOString(),
        fireTheftCoverage: '0',
        floodCoverage: '0',
        modifiedCarAccepted: true,
        hasCctvDiscount: true,
        provinces: ['provinces/100000'],
        source: 'MANUAL',
        sumCoverageMax: '12000000',
        sumCoverageMin: '12000000',
        termsEn: '',
        termsTh: '',
        carSubmodels: ['brands/-/models/-/submodels/12345'],
      }
    );
  });

  it('returns data in correct format when package has fire and theft and flood coverage', () => {
    expect(
      prepareCustomQuoteFormData(
        {
          ...formikValues,
          fire_theft_coverage: 'Yes',
          flood_coverage: 'Yes',
          package_type: 'TRANSFER_CODE',
        },
        '12345'
      )
    ).toEqual({
      bailBondCoverage: '12000000',
      carInsuranceType: 'TYPE_2',
      carRepairType: 'DEALER',
      carAgeMax: differenceInYears(new Date(), new Date('01-01-2020')),
      carAgeMin: differenceInYears(new Date(), new Date('01-01-2020')),
      deductibleAmount: '12000000',
      insurer: 'insurers/7',
      liabilityPerAccidentCoverage: '12000000',
      liabilityPerPersonCoverage: '12000000',
      liabilityPropertyCoverage: '12000000',
      medicalExpensesCoverage: '12000000',
      medicalExpensesCoverageNo: 1,
      oicCode: 'TYPE_110',
      packageType: 'TRANSFER_CODE',
      personalAccidentCoverage: '12000000',
      personalAccidentCoverageNo: 1,
      price: '12000000',
      displayName: 'test',
      expireTime: new Date(expirationDate).toISOString(),
      startTime: new Date(expirationDate).toISOString(),
      fireTheftCoverage: '1000000',
      floodCoverage: '1000000',
      modifiedCarAccepted: true,
      hasCctvDiscount: true,
      provinces: null,
      source: 'MANUAL',
      sumCoverageMax: '12000000',
      sumCoverageMin: '12000000',
      termsEn: '',
      termsTh: '',
      carSubmodels: ['brands/-/models/-/submodels/12345'],
    });
  });
});

describe('prepareCreateCustomQuoteData', () => {
  it('returns data in correct format', () => {
    expect(prepareCreateCustomQuoteData(formikValues, 12345)).toEqual({
      active: true,
      bail_bond_coverage: 120000,
      car_age_max: 2020,
      car_age_min: 2020,
      car_insurance_type: 'Type 2',
      car_repair_type: 'Dealer',
      car_submodels: [12345],
      chassisNo: '',
      claimNumber: '',
      claimValue: '1000',
      deductible_amount: 120000,
      expiration_date: format(new Date(), 'yyyy-MM-dd'),
      fire_theft_coverage: 0,
      firstDriverDOB: '',
      fixedDriver: '',
      flood_coverage: 0,
      has_cctv_discount: true,
      insurance_company_id: 7,
      is_fixed_premium: true,
      is_linkout: false,
      lastPolicyNumber: '',
      liability_per_accident_coverage: 120000,
      liability_per_person_coverage: 120000,
      liability_property_coverage: 120000,
      medical_expenses_coverage: 120000,
      medical_expenses_coverage_no: 1,
      modified_car_accepted: true,
      name: 'test',
      noClaimBonus: 1000,
      oic_code: 110,
      package_type: 'STANDARD',
      personal_accident_coverage: 120000,
      personal_accident_coverage_no: 1,
      price: 120000,
      provinces: [],
      reuse_manual_package: false,
      secondDriverDOB: '',
      source: 'manual',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      sum_coverage_max: 120000,
      sum_coverage_min: 120000,
    });
  });

  it('returns data in correct format when package has fire and theft and flood coverage', () => {
    expect(
      prepareCreateCustomQuoteData(
        {
          ...formikValues,
          fire_theft_coverage: 'Yes',
          flood_coverage: 'Yes',
          package_type: 'TRANSFER_CODE',
        },
        12345
      )
    ).toEqual({
      active: true,
      bail_bond_coverage: 120000,
      car_age_max: 2020,
      car_age_min: 2020,
      car_insurance_type: 'Type 2',
      car_repair_type: 'Dealer',
      car_submodels: [12345],
      chassisNo: '',
      claimNumber: '',
      claimValue: '1000',
      deductible_amount: 120000,
      expiration_date: format(new Date(), 'yyyy-MM-dd'),
      fire_theft_coverage: 10000,
      firstDriverDOB: '',
      fixedDriver: '',
      flood_coverage: 10000,
      has_cctv_discount: true,
      insurance_company_id: 7,
      is_fixed_premium: true,
      is_linkout: false,
      lastPolicyNumber: '',
      liability_per_accident_coverage: 120000,
      liability_per_person_coverage: 120000,
      liability_property_coverage: 120000,
      medical_expenses_coverage: 120000,
      medical_expenses_coverage_no: 1,
      modified_car_accepted: true,
      name: 'test',
      noClaimBonus: 1000,
      oic_code: 110,
      package_type: 'TRANSFER_CODE',
      personal_accident_coverage: 120000,
      personal_accident_coverage_no: 1,
      price: 120000,
      provinces: [],
      reuse_manual_package: false,
      secondDriverDOB: '',
      source: 'manual',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      sum_coverage_max: 120000,
      sum_coverage_min: 120000,
    });
  });
});

test('getCarAge should return difference in years', () => {
  const last5Year = sub(new Date(), { years: 5 }).toISOString();
  const previousYear = sub(new Date(), { years: 1 }).toISOString();
  const currentYear = new Date().toISOString();

  expect(getCarAge(parseInt(previousYear, 10))).toBe(2);
  expect(getCarAge(parseInt(currentYear, 10))).toBe(1);
  expect(getCarAge(parseInt(last5Year, 10))).toBe(6);
});
