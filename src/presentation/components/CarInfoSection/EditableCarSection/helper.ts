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

/**
 * Parse manufactured year from API response.
 * Supports multiple response shapes:
 * - Plain number (old API): 2025
 * - Object with year property (new API): { name: 'manufacturedYears/2025', year: 2025 }
 * - Object with name property only (new API fallback): { name: 'manufacturedYears/2025' }
 */
export const parseManufacturedYear = (year: any): number | undefined => {
  if (typeof year === 'number') {
    return year;
  }
  if (typeof year?.year === 'number') {
    return year.year;
  }
  if (typeof year?.name === 'string') {
    const tail = year.name.split('/').pop();
    return tail ? Number(tail) : undefined;
  }
  return undefined;
};

/**
 * Derives the submodel autocomplete `value` from a car resource `name` path.
 * Matches the branch in useUpdateCarData fetchOptions when stateField is carSubModelYear.
 */
export const parseCarSubmodelResourceNameToOptionValue = (
  name: string | undefined
): number | '' => {
  const nameStr: string = name ?? '';
  const yearMatch = nameStr.includes('years/')
    ? nameStr.substring(nameStr.indexOf('years/')).replace('years/', '')
    : nameStr.split('/').pop();
  return yearMatch ? parseInt(String(yearMatch), 10) : '';
};
