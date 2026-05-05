import { flattenObject } from './MatchingLeadData.helper';

describe('flattenObject', () => {
  it('returns the flattened object', () => {
    const result = flattenObject({
      name: 'leads/06855dca-4233-4934-9b3d-79aed32982ec',
      score: 40,
      firstName: 'Testing',
      lastName: 'May',
      phone: 'xxxxxxxxx999',
      email: 'tesxxxxx@gmail.com',
      car: {
        licensePlate: '',
        car: 'Toyota Corolla Altis 2018 1600 CC (4 Doors) E ',
      },
    });
    expect(result).toMatchObject({
      name: 'leads/06855dca-4233-4934-9b3d-79aed32982ec',
      score: 40,
      firstName: 'Testing',
      lastName: 'May',
      phone: 'xxxxxxxxx999',
      email: 'tesxxxxx@gmail.com',
      licensePlate: '',
      car: 'Toyota Corolla Altis 2018 1600 CC (4 Doors) E ',
    });
  });
});
