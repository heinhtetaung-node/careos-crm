import { getString } from 'presentation/theme/localization';

import {
  validateData,
  isValidName,
  isValidVehicleNum,
  checkFieldBoolean,
  isValidLicense,
  DRIVER_FIELDS,
  getDriverFieldsToRemoveForCount,
} from './helper';

describe('Test isValidName', () => {
  it('Should return true if input valid', () => {
    expect(isValidName('John')).toEqual(true);
  });
  it('Should return true if input has Thai characters', () => {
    expect(isValidName('นาย')).toEqual(true);
  });
  it('Should return true if input has Thai and English characters', () => {
    expect(isValidName('Test นาย')).toEqual(true);
  });
  it('Should return true if input invalid', () => {
    expect(isValidName('123')).toEqual(false);
  });
  it('Should return true if input invalid characters', () => {
    expect(isValidName('Test!sl.')).toEqual(false);
  });
  it('Should return true if input invalid characters', () => {
    expect(isValidName('😀')).toEqual(false);
  });
});

describe('Test isValidVehicleNum', () => {
  it('Should return true if input valid', () => {
    expect(isValidVehicleNum('A1029092HE')).toEqual(true);
  });
  it('Should return true if input invalid', () => {
    expect(isValidVehicleNum('!!!123')).toEqual(false);
  });
});

describe('Test validateData', () => {
  it('Should return true if input valid', () => {
    const payload = {
      name: 'firstDriverName',
      value: 'Testdriver',
    };
    expect(validateData(payload)).toEqual(true);
  });
  it('Should return true if input invalid', () => {
    const payload = {
      name: 'firstDriverName',
      value: '1212Testdriver',
    };
    expect(validateData(payload)).toEqual(false);
  });
  it('Should return true if field is carLicensePlate', () => {
    const payload = {
      name: 'carLicensePlate',
      value: 'A1-2901',
    };
    expect(validateData(payload)).toEqual(true);
  });
  it('Should return true if field is carLicensePlate', () => {
    const payload = {
      name: 'engineNumber',
      value: 'A12901',
    };
    expect(validateData(payload)).toEqual(true);
  });
  it('Should not return anything if no field name passed', () => {
    const payload = {
      value: 'Testdriver!',
      name: '',
    };
    expect(validateData(payload)).toEqual(false);
  });
});

describe('Test checkFieldBoolean', () => {
  it('Should return true if input valid', () => {
    expect(checkFieldBoolean(true)).toEqual(`${getString('text.yes')}`);
  });
  it('Should return true if input invalid', () => {
    expect(checkFieldBoolean(false)).toEqual(`${getString('text.no')}`);
  });
});

describe('Test isValidLicense', () => {
  it('Should return true if input valid', () => {
    expect(isValidLicense('3กฮ-1990 สป')).toEqual(true);
  });
  it('Should return false if input has special characters', () => {
    expect(isValidLicense('3กa-!!s1 สป')).toEqual(false);
  });
  it('Should return false if input contains empty strings', () => {
    expect(isValidLicense('3กa- สป')).toEqual(0);
  });
  it('Should handle invalid input', () => {
    expect(isValidLicense('3กaสป')).toEqual(false);
  });
});

describe('DRIVER_FIELDS', () => {
  it('defines first driver fields', () => {
    expect(DRIVER_FIELDS.first).toEqual([
      'firstDriverDOB',
      'firstDriverDrivingLicense',
      'firstDriverIdNumber',
      'firstDriverName',
    ]);
  });
  it('defines second driver fields', () => {
    expect(DRIVER_FIELDS.second).toEqual([
      'secondDriverDOB',
      'secondDriverDrivingLicense',
      'secondDriverIdNumber',
      'secondDriverName',
    ]);
  });
});

describe('getDriverFieldsToRemoveForCount', () => {
  it('returns all first and second driver fields when count is 0', () => {
    const result = getDriverFieldsToRemoveForCount(0);
    expect(result).toHaveLength(8);
    expect(result).toEqual([...DRIVER_FIELDS.first, ...DRIVER_FIELDS.second]);
  });
  it('returns only second driver fields when count is 1', () => {
    const result = getDriverFieldsToRemoveForCount(1);
    expect(result).toHaveLength(4);
    expect(result).toEqual(DRIVER_FIELDS.second);
  });
  it('returns empty array when count is 2', () => {
    const result = getDriverFieldsToRemoveForCount(2);
    expect(result).toEqual([]);
  });
});
