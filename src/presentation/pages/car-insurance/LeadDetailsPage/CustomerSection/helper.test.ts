import { differenceInYears } from 'utils/datetime';

import {
  formatDateValue,
  getClassFieldItem,
  IFieldValue,
  getAgeByDOB,
} from './helper';

describe('formatDateValue', () => {
  test('null case', () => {
    const formatedDate = formatDateValue(null);
    expect(formatedDate).toBe('');
  });
  test('date case', () => {
    const formatedDate = formatDateValue(new Date('1995-12-17T03:24:00'));
    expect(formatedDate).toBe('17/12/1995');
  });
});

describe('getClassFieldItem', () => {
  test('test with isFieldDisabled flage', () => {
    const classString = getClassFieldItem(
      { isEdit: true } as IFieldValue,
      true
    );
    expect(classString).toBe('field-item active');
  });
  test('test with not edit config', () => {
    const classString = getClassFieldItem(
      { isEdit: false } as IFieldValue,
      true
    );
    expect(classString).toBe('field-item');
  });
});

describe('getAgeByDOB', () => {
  it('returns the age', () => {
    const result = getAgeByDOB('12/23/1990');
    expect(result).toEqual(
      differenceInYears(new Date(), new Date('12/23/1990'))
    );
  });

  it('returns empty string if passed date is in wrong format', () => {
    const result = getAgeByDOB('23/12/1990');
    expect(result).toEqual('');
  });
});
