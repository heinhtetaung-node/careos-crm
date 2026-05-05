import { filterMap } from '../lead';

import { buildFilter } from '.';

describe('buildFilter', () => {
  test('with url encoding enabled(firstName)', () => {
    const result = buildFilter(
      { search: { customerName: 'test test' } },
      filterMap()
    );
    expect(result).toEqual(['insuree.fullName:"test%20test"']);
  });

  test('with url encoding disabled(firstName)', () => {
    const result = buildFilter(
      { search: { customerName: 'test test' } },
      filterMap(),
      [],
      false
    );
    expect(result).toEqual(['insuree.fullName:"test test"']);
  });

  test('with url encoding enabled(email)', () => {
    const result = buildFilter(
      { search: { customerEmail: 'test@test' } },
      filterMap()
    );
    expect(result).toEqual(['insuree.email="test%40test"']);
  });

  test('with url encoding disabled(email)', () => {
    const result = buildFilter(
      { search: { customerEmail: 'test@test' } },
      filterMap(),
      [],
      false
    );
    expect(result).toEqual(['insuree.email="test@test"']);
  });
});
