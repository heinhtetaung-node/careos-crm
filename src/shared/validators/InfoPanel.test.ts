import { sub, format } from 'date-fns';

import {
  validateAge,
  validateAlphaNumericals,
  validateAlphaNumericalsRequired,
  validateLicense,
  validateName,
  validateShippingName,
  validatePhoneNumber,
  formatDate,
} from './InfoPanel';

// validateAge
it.skip('Test validateAge handle invalid value less than 18 and over 100', () => {
  expect(
    validateAge().isValidSync(
      format(sub(new Date(), { years: 17 }), 'yyyy/MM/dd')
    )
  ).toBeFalsy();
  expect(
    validateAge().isValidSync(
      format(sub(new Date(), { years: 101 }), 'yyyy/MM/dd')
    )
  ).toBeFalsy();
});

it.skip('Test validateAge handle valid value 18 to 100 years', () => {
  expect(
    validateAge().isValidSync(
      format(sub(new Date(), { years: 18 }), 'yyyy/MM/dd')
    )
  ).toBeTruthy();
  expect(
    validateAge().isValidSync(
      format(sub(new Date(), { years: 100 }), 'yyyy/MM/dd')
    )
  ).toBeTruthy();
});

// validateLicense
it('Test validateLicense handle invalid value', () => {
  expect(validateLicense().isValidSync('31ส-12!!')).toBeFalsy();
});

it('Test validateLicense handle valid value', () => {
  expect(validateLicense().isValidSync('31ส-123')).toBeTruthy();
});

// validateAlphaNumericals
it('Test validateAlphaNumericals handle invalid value', () => {
  expect(
    validateAlphaNumericals(17, 'orderId').isValidSync(
      '3amm1233amm1233amm1233amm12331สsss123amm1233amm123'
    )
  ).toBeFalsy();
  expect(
    validateAlphaNumericals().isValidSync(
      '3amm1233amm1233amm1233amm12331สsss123amm'
    )
  ).toBeFalsy();
});

it('Test validateAlphaNumericals handle valid value', () => {
  expect(
    validateAlphaNumericals(255, 'orderId').isValidSync('3amm123')
  ).toBeTruthy();
});

// validateAlphaNumericalsRequired
it('Test validateAlphaNumericalsRequired handle invalid value', () => {
  expect(
    validateAlphaNumericalsRequired().isValidSync('31สsss12!!')
  ).toBeFalsy();
});

it('Test validateAlphaNumericalsRequired handle valid value', () => {
  expect(validateAlphaNumericalsRequired().isValidSync('3amm123')).toBeTruthy();
});

// validateName
it('Test validateName handle invalid value', () => {
  expect(validateName().isValidSync('test!!')).toBeFalsy();
});

it('Test validateName handle valid value', () => {
  expect(validateName().isValidSync('testส')).toBeTruthy();
});

// validateShippingName
it('Test validateShippingName handle invalid value', () => {
  expect(
    validateShippingName('firstName', 40).isValidSync('test!!')
  ).toBeFalsy();
  expect(validateShippingName().isValidSync(':)🎃')).toBeFalsy();
});

it('Test validateShippingName handle valid value', () => {
  expect(
    validateShippingName('firstName', 40).isValidSync('testส')
  ).toBeTruthy();
});

// validatePhoneNumber
it('Test validatePhoneNumber handle invalid value', () => {
  expect(
    validatePhoneNumber('Something went wrong').isValidSync('012928288')
  ).toBeFalsy();
});

it('Test validatePhoneNumber handle valid value', () => {
  expect(validatePhoneNumber().isValidSync('0891029202')).toBeTruthy();
});

describe('formatDate', () => {
  it('returns formatted date', () => {
    const result = formatDate('25/12/1900');
    expect(result).toEqual('1900-12-25');
  });

  it('returns formatted date', () => {
    const result = formatDate('1900-12-25');
    expect(result).toEqual('1900-12-25');
  });

  it('returns empty string when passed with wrong date format', () => {
    const result = formatDate('25/25/25');
    expect(result).toEqual('');
  });

  it('returns empty string when passed with alphabets', () => {
    const result = formatDate('abcdefg');
    expect(result).toEqual('');
  });
});
