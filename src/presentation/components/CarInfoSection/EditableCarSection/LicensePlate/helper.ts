import { object, string, boolean, number } from 'yup';

import { getString } from 'presentation/theme/localization';

const freeTextRegex = /^([\u0E00-\u0E7F\d]{1,3})$/;

function reverseString(raw: string): string {
  return raw.split('').reverse().join('');
}

/**
 * Formats license plates of these formats: 1กพ 123 กท, 1กพ-123 กท.
 */
function handleLPWithAbbrevation(licensePlateArray: string[]) {
  if (licensePlateArray.length === 3) {
    return {
      freeText: licensePlateArray[0],
      numericalText: licensePlateArray[1],
    };
  }

  const licensePlateSplitArray = licensePlateArray[0].split('-');
  if (licensePlateSplitArray?.length === 2) {
    return {
      freeText: licensePlateSplitArray[0],
      numericalText: licensePlateSplitArray[1],
    };
  }

  // license plate is all number
  if (
    !Number.isNaN(licensePlateArray[0]) &&
    typeof parseInt(licensePlateArray[0], 10) === 'number'
  ) {
    return {
      freeText: licensePlateArray[0].substring(0, 3),
      numericalText: licensePlateSplitArray[0].substring(3),
    };
  }

  return {
    freeText: '',
    numericalText: '',
  };
}

/**
 * Formats license plates of these formats: 1กพ 123, 1กพ-123, 1กพ123.
 */
function handleLPWithoutAbbrevation(licensePlateArray: string[]) {
  // 1กพ 123
  if (licensePlateArray?.length && licensePlateArray.length === 2) {
    return {
      freeText: licensePlateArray[0],
      numericalText: licensePlateArray[1],
    };
  }

  if (licensePlateArray?.length && licensePlateArray.length === 1) {
    const licensePlateSplitArray = licensePlateArray[0].split('-');
    // 1กพ-123
    if (licensePlateSplitArray?.length === 2) {
      return {
        freeText: licensePlateSplitArray[0],
        numericalText: licensePlateSplitArray[1],
      };
    }

    // 1กพ123
    if (licensePlateSplitArray?.length === 1) {
      const reversedValue = reverseString(licensePlateSplitArray[0]);
      const firstCharIdx = reversedValue.search(/\D/);
      const serialNumber = reverseString(
        reversedValue.slice(0, firstCharIdx)?.trim()
      );
      const seriesLetters = reverseString(
        reversedValue.slice(firstCharIdx)?.trim()
      );

      return {
        freeText: seriesLetters,
        numericalText: serialNumber,
      };
    }
  }
  return {
    freeText: '',
    numericalText: '',
  };
}

/**
 * Formats license plates of these formats: 1กพ 123 กท, 1กพ-123 กท, 1กพ 123, 1กพ-123, 1กพ123.
 */
export function formatLicensePlateString(
  licensePlate: string,
  abbreviation: string
): any {
  const licensePlateArray = licensePlate?.split(' ');
  if (
    abbreviation &&
    licensePlateArray?.length &&
    licensePlateArray[licensePlateArray.length - 1].includes(abbreviation)
  ) {
    return handleLPWithAbbrevation(licensePlateArray);
  }
  return handleLPWithoutAbbrevation(licensePlateArray);
}

export function formatLicensePlate(raw: string): string {
  const reversedValue = reverseString(raw);
  const firstCharIdx = reversedValue.search(/\D/);
  const serialNumber = reversedValue.slice(0, firstCharIdx).trim();
  const seriesLetters = reversedValue.slice(firstCharIdx).trim();

  return reverseString(`${serialNumber} ${seriesLetters}`);
}

export const validateLicensePlate = (data: any) =>
  data && data.match(freeTextRegex);

export const validationSchema = object().shape({
  freeText: string().when('redPlate', {
    is: (value: boolean) => value === false,
    then: () =>
      string()
        .required(getString('errors.licensePlate'))
        .test(
          'validate-thai-id',
          getString('errors.licensePlate'),
          validateLicensePlate
        )
        .min(1)
        .max(3),
    otherwise: () => string().optional().notRequired(),
  }),
  numericalText: number().when('redPlate', {
    is: (value: boolean) => value === false,
    then: () =>
      number()
        .typeError(getString('errors.licensePlate'))
        .required(getString('errors.licensePlate'))
        .test(
          'maxLength',
          getString('errors.licensePlate'),
          (val) => !Number.isNaN(val) && `${val}`.length <= 4
        ),
    otherwise: () => number().optional().notRequired(),
  }),
  redPlate: boolean().optional(),
});

export const getLicensePlatePayload = (formData: any, abbreviation: string) => {
  if (formData && abbreviation) {
    return `${formData.freeText}-${formData.numericalText} ${abbreviation}`;
  }
  return null;
};
