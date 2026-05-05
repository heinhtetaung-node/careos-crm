/* eslint-disable no-param-reassign */
import carColumns from './config';

export const getMappedCarData = (carData: any, dataPatch: any) => {
  const newCarColumns = { ...carColumns };

  Object.entries(newCarColumns).forEach(
    ([key, { inputProps }]: [string, any]) => {
      inputProps.value = carData[key];
      dataPatch.forEach(({ name, field, response }: any) => {
        if (name === key) {
          inputProps[field] = response;
        }
      });
    }
  );

  return newCarColumns;
};

export const API_CALLING_FIELDS = [
  'carSubModelYear',
  'carModified',
  'carDashCam',
  'carUsageType',
  'carRegisteredSeats',
  'registeredProvince',
  'carLicensePlate',
  'chassisNumber',
  'vehicleIdNumber',
  'carColor',
];
