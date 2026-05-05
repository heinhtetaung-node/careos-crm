import { getString } from 'presentation/theme/localization';
import { csvTypeFiles } from 'shared/constants';
import { ImportType } from 'shared/constants/importFile';
import {
  differenceInDays,
  isBefore,
  isSameDay,
  isValidDateFormat,
  set,
} from 'utils/datetime';

interface IProps<T> {
  file: T;
  csvName: string;
  isErrorCheck?: boolean;
  optionalColumns?: string[];
  requiredColumns: string[] | string[][];
  shouldNotHaveColumns?: string[];
  template: string[];
  [key: string]: any;
}

interface FileResult {
  fileName: string;
  name: string;
  fileType: string;
  fileSize: number;
  result: any[];
}

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validGender = new Set(['m', 'f']);
const dateFormat = 'yyyy-MM-dd';
const validZeroOneBool = new Set([0, 1]);
const validInsuranceType = new Set(['1', '2', '2+', '3', '3+']);
const validImportOperation = new Set(['', 'insert', 'update', 'delete']);
const provinceCodeRegex = /^\d{6}$/;
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

const isValidE164Phone = (value: string | number) =>
  e164PhoneRegex.test(String(value).trim());

const isCsvFileError = (fileResult: FileResult): string | undefined => {
  let message: string | undefined;
  if (!csvTypeFiles.includes(fileResult.fileType)) {
    return getString('text.requiredCsvValidation');
  }
  return message;
};

const checkRowsRequiredValidation = (
  requiredArray: string[] | string[][],
  result: any[],
  csvName: string,
  shouldNotHaveColumns: string[] = []
): any => {
  const checkRowsRequireErrorMessages: string[] = [];

  if (
    [
      'insurance packages',
      'insurance condition sets',
      'insurance condition items',
      'insurance premium',
      'insurance coverage',
    ].includes(csvName)
  ) {
    const required = requiredArray as string[];
    for (let i = 0; i < result.length; i += 1) {
      const row = result[i];
      for (let j = 0; j < required.length; j += 1) {
        const key = required[j];
        const keysIncludingStars = `${key}*`;
        if (!(key in row || keysIncludingStars in row)) {
          checkRowsRequireErrorMessages.push(
            getString('text.requiredColumnValidation', { column: key })
          );
        }
      }
      if (checkRowsRequireErrorMessages.length > 0) break; // same as `.some` early exit
    }
    return checkRowsRequireErrorMessages;
  }

  if (csvName === 'lead import') {
    if (result.length > 0) {
      for (let i = 0; i < shouldNotHaveColumns.length; i += 1) {
        const cols = shouldNotHaveColumns[i];
        if (Object.keys(result[0]).includes(cols)) {
          checkRowsRequireErrorMessages.push(
            getString('text.shouldNotHaveColumns', {
              column: cols,
              name: csvName,
            })
          );
        }
      }
    }

    for (let i = 0; i < result.length; i += 1) {
      const rows = result[i];
      const required = requiredArray as string[];
      for (let j = 0; j < required.length; j += 1) {
        const cols = required[j];
        if (!Object.keys(rows).includes(cols)) {
          checkRowsRequireErrorMessages.push(
            getString('text.requiredRowsValidation', {
              column: cols,
              name: csvName,
              row: i + 1,
            })
          );
        }
      }

      if ('Phone' in rows) {
        if (rows.Phone && !isValidE164Phone(rows.Phone)) {
          checkRowsRequireErrorMessages.push(
            getString('text.phoneNumberFormatValidation', {
              column: 'Phone',
              row: i + 1,
            })
          );
        }
      }
    }
  }

  if (csvName === 'renewal package') {
    for (let i = 0; i < result.length; i += 1) {
      const rows = result[i];
      const required =
        rows.insurer_accept === '1' ? requiredArray[0] : requiredArray[1];
      const keys = Object.keys(rows);
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        const value = rows[key];
        if ((required as string[]).includes(key) && !value) {
          checkRowsRequireErrorMessages.push(
            getString('text.requiredRowsValidation', {
              column: key,
              name: csvName,
              row: i + 1,
            })
          );
        }
      }
    }
  }

  if (csvName !== 'Customer Profile' && csvName !== 'renewal package') {
    const required = requiredArray as string[];
    for (let i = 0; i < result.length; i += 1) {
      const rows = result[i];
      const keys = Object.keys(rows);
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        const value = rows[key];
        if (required.includes(key) && !value) {
          checkRowsRequireErrorMessages.push(
            getString('text.requiredRowsValidation', {
              column: key,
              name: csvName,
              row: i + 1,
            })
          );
        }
      }
    }
  }

  return checkRowsRequireErrorMessages;
};

const checkTemplatesValidation = (
  csvTemplate: string[],
  result: any[],
  type: ImportType,
  optionalColumns: string[] = []
) => {
  const checkTemplatesErrorMessages: string[] = [];
  const [firstCol, secondCol] = result;

  if (type === ImportType.Discounts) {
    if (secondCol) {
      csvTemplate.forEach((cols, index) => {
        if (secondCol[index] !== cols) {
          checkTemplatesErrorMessages.push(
            getString('text.requiredColumnValidation', { column: cols })
          );
        }
      });
    }
    return checkTemplatesErrorMessages;
  }

  if (firstCol) {
    csvTemplate.forEach((cols: any) => {
      if (firstCol[cols] === undefined && !optionalColumns.includes(cols)) {
        checkTemplatesErrorMessages.push(
          getString('text.requiredColumnValidation', { column: cols })
        );
      }
    });
  }
  return checkTemplatesErrorMessages;
};

const validateString = (value: string) =>
  value ? typeof value === 'string' && Number.isNaN(+value) : true;

const validateNumber = (value: string) =>
  value
    ? String(value).trim() !== '' &&
      typeof +value === 'number' &&
      !Number.isNaN(+value)
    : true;

const validateEmail = (value: string) =>
  value ? emailRegex.test(value) : true;

const validateGender = (value: string) =>
  value ? validGender.has(value) : true;

const validateDate = (value: string) =>
  value ? isValidDateFormat(value, dateFormat) : true;

const validateZeroOneBool = (value: number) =>
  value ? validZeroOneBool.has(+value) : true;

const validateInsuranceType = (value: string) =>
  value ? validInsuranceType.has(value) : true;

const validateImportOperation = (value: string) => {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'string') return false;

  return validImportOperation.has(value.trim().toLowerCase());
};

const validateProvinceIDs = (value: string) => {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'string') return false;

  const normalized = value.trim();
  if (!normalized) return false;

  return normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .every((part) => part === '0' || provinceCodeRegex.test(part));
};

const validateBool = (value: string | boolean) => {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'false';
  }
  return false;
};

export const validateEffectiveTime = (value: string | Date) => {
  const currentDate = new Date(value);
  const daysDifference = differenceInDays(currentDate, new Date());

  if (daysDifference >= 0) {
    if (isSameDay(currentDate, new Date())) {
      return isBefore(currentDate, set(new Date(), { hours: 19, minutes: 0 }));
    }
    return true;
  }
  return false;
};

export const validateDataWithType = (
  dataType: string,
  value: string | any
): boolean => {
  switch (dataType) {
    case 'string':
      return validateString(value);
    case 'number':
      return validateNumber(value);
    case 'string|number':
      return validateString(value) || validateNumber(value);
    case 'email':
      return validateEmail(value);
    case 'gender':
      return validateGender(value);
    case 'date':
      return validateDate(value);
    case 'effectiveDate':
      if (value instanceof Date) {
        return validateEffectiveTime(value);
      }
      return validateDate(value) && validateEffectiveTime(value);
    case 'zeroOneBool':
      return validateZeroOneBool(value);
    case 'insuranceType':
      return validateInsuranceType(value);
    case 'importOperation':
      return validateImportOperation(value);
    case 'provinceIds':
      return validateProvinceIDs(value);
    case 'bool':
      return validateBool(value);
    default:
      return false;
  }
};

const rowsDataValidationWithType = (
  templateWithType: any[],
  result: any[]
): string[] => {
  const checkRowDataValidationWithType: string[] = [];
  result.forEach((rows: any, index: number) => {
    Object.entries(rows).forEach(([key, value]) => {
      templateWithType.forEach((field) => {
        if (field.name === key) {
          const validData = validateDataWithType(field.dataType, value);
          if (!validData) {
            checkRowDataValidationWithType.push(
              getString('text.invalidDataFormat', {
                column: key,
                row: index + 1,
              })
            );
          }
        }
      });
    });
  });

  return checkRowDataValidationWithType;
};

export const MAX_FILE_UPLOAD_SIZE = 1 * 1024 * 1024; // 1MB;
export const NEW_MAX_FILE_UPLOAD_SIZE = 20 * 1024 * 1024; // 20MB;

const csvValidationErrors = (props: IProps<any>): string[] => {
  let errors: string[] = [];
  if (props.file.errorFileMessage === 'Delimiter') {
    errors = [...errors, getString('text.missingHeaderFile')];
    props.template.forEach((cols: any) => {
      errors.push(getString('text.requiredColumnValidation', { column: cols }));
    });
  }

  if (props.file.fileSize > 0) {
    const allowedBiggerFiles =
      props.importModalType === ImportType.Package ||
      props.importModalType === ImportType.Redbook;

    const maxAllowedSize = allowedBiggerFiles
      ? NEW_MAX_FILE_UPLOAD_SIZE
      : MAX_FILE_UPLOAD_SIZE;

    if (props.file.fileSize > maxAllowedSize) {
      errors.push(
        getString('text.maximumSize', { size: allowedBiggerFiles ? 20 : 1 })
      );
      return errors;
    }

    const csvFileError = isCsvFileError(props.file);
    if (csvFileError) {
      errors.push(csvFileError);
    } else {
      if (props.file.errorFileMessage === 'FieldMismatch') {
        errors = [...errors, getString('text.fieldMismatch')];
      }

      if (!props.file?.result?.length) {
        errors.push(getString('text.emptyFile'));
        return errors;
      }

      if (
        props.maximumUpload &&
        props.file?.result?.length > props.maximumUpload
      ) {
        errors = [
          ...errors,
          getString('text.maximumUpload', {
            type: props.csvName.toLowerCase(),
            maxNumber: props.maximumUpload,
          }),
        ];
      }

      const headerRequiredErrors = checkTemplatesValidation(
        props.template,
        props.file.result,
        props.importModalType,
        props.optionalColumns
      );

      const fieldRequiredValidation = checkRowsRequiredValidation(
        props.requiredColumns,
        props.file.result,
        props.csvName,
        props.shouldNotHaveColumns
      );

      const fieldWithDataValidation = props.templateWithType
        ? rowsDataValidationWithType(props.templateWithType, props.file.result)
        : [];

      if (headerRequiredErrors.length) {
        errors = [...errors, ...headerRequiredErrors];
      }
      if (fieldRequiredValidation.length) {
        errors = [...errors, ...fieldRequiredValidation];
      }
      if (fieldWithDataValidation.length) {
        errors = [...errors, ...fieldWithDataValidation];
      }
    }
  }

  return errors;
};
export default csvValidationErrors;
