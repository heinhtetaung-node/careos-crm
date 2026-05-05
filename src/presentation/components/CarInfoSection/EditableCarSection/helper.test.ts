import { getMappedCarData } from './helper';

describe('getMappedCarData function', () => {
  const carData = {
    redPlate: true,
    modification: false,
    brand: 2,
    carUsageType: 'commercial',
    isVan: false,
  };

  const patchData = [
    {
      name: 'carModified',
      field: 'value',
      response: true,
    },
    {
      name: 'carDashCam',
      field: 'isDisabled',
      response: true,
    },
    {
      name: 'brand',
      field: 'options',
      response: [
        { id: 0, value: 1, title: 'Honda' },
        { id: 0, value: 2, title: 'Toyota' },
      ],
    },
  ];

  it('returns correct response', () => {
    expect(getMappedCarData(carData, patchData)).toMatchObject({
      brand: {
        inputProps: {
          options: [
            { id: 0, value: 1, title: 'Honda' },
            { id: 0, value: 2, title: 'Toyota' },
          ],
        },
      },
      carModified: {
        inputProps: {
          value: true,
        },
      },
      carDashCam: {
        inputProps: {
          isDisabled: true,
        },
      },
      carLicensePlate: {
        inputProps: {
          isDisabled: true,
        },
      },
      carRegisteredSeats: {
        inputProps: {
          options: [],
          isDisabled: true,
        },
      },
    });
  });
});
