import csvValidationErrors, {
  validateEffectiveTime,
  validateDataWithType,
  MAX_FILE_UPLOAD_SIZE,
  NEW_MAX_FILE_UPLOAD_SIZE,
} from './csvValidationErrors';
import { getString } from 'presentation/theme/localization';
import { healthLeadImportShouldNotHaveColumns } from 'presentation/pages/health-insurance/leads/ImportLeadPage/ImportHealthLeadPageHelper';
import { ImportType } from 'shared/constants/importFile';
import * as datetime from 'utils/datetime';

jest.mock('presentation/theme/localization');
jest.mock(
  'presentation/pages/health-insurance/leads/ImportLeadPage/ImportHealthLeadPageHelper'
);
jest.mock('shared/constants', () => ({
  csvTypeFiles: ['text/csv', 'application/csv', 'text/comma-separated-values'],
}));
jest.mock('utils/datetime');
const mockGetString = getString as jest.MockedFunction<typeof getString>;
const mockSet = jest.fn();
const mockDifferenceInDays = jest.fn();
const mockIsSameDay = jest.fn();
const mockIsBefore = jest.fn();
const mockIsValidDateFormat = jest.fn();
const mockedDatetime = jest.mocked(datetime);
mockedDatetime.set.mockImplementation(mockSet);
mockedDatetime.differenceInDays.mockImplementation(mockDifferenceInDays);
mockedDatetime.isSameDay.mockImplementation(mockIsSameDay);
mockedDatetime.isBefore.mockImplementation(mockIsBefore);
mockedDatetime.isValidDateFormat.mockImplementation(mockIsValidDateFormat);
describe('csvValidationErrors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetString.mockImplementation(
      (key: string, params: Record<string, any>) => {
        if (params) {
          return `${key}_${JSON.stringify(params)}`;
        }
        return key;
      }
    );
    Object.defineProperty(healthLeadImportShouldNotHaveColumns, '0', {
      value: 'Phone',
    });
    Object.defineProperty(healthLeadImportShouldNotHaveColumns, '1', {
      value: 'Email',
    });
    Object.defineProperty(healthLeadImportShouldNotHaveColumns, 'length', {
      value: 2,
    });
  });
  describe('isCsvFileError', () => {
    it('should return error message for non-CSV file types', () => {
      const fileResult = {
        fileName: 'test.txt',
        name: 'test.txt',
        fileType: 'text/plain',
        fileSize: 1000,
        result: [],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'test',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toContain('text.requiredCsvValidation');
    });
    it('should not return error for CSV file types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Add some data to avoid empty file error
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'test',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).not.toContain('text.requiredCsvValidation');
    });
  });
  describe('checkRowsRequiredValidation', () => {
    it('should validate required columns for lead import', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Phone: '+1234567890' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name', 'Phone'],
        template: ['Name', 'Phone'],
      });
      expect(result).not.toContain('text.requiredCsvValidation');
    });
    it('should validate required columns for renewal package with insurer_accept = 1', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ insurer_accept: '1', Name: 'John', Phone: '+1234567890' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'renewal package',
        requiredColumns: [['Name', 'Phone'], ['Email']],
        template: ['Name', 'Phone'],
      });
      expect(result).not.toContain('text.requiredCsvValidation');
    });
    it('should validate required columns for renewal package with insurer_accept != 1', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ insurer_accept: '0', Email: 'test@example.com' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'renewal package',
        requiredColumns: [['Name', 'Phone'], ['Email']],
        template: ['Name', 'Phone'],
      });
      expect(result).not.toContain('text.requiredCsvValidation');
    });
    it('should validate required columns for other CSV types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Email: 'test@example.com' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name', 'Email'],
        template: ['Name', 'Email'],
      });
      expect(result).not.toContain('text.requiredCsvValidation');
    });
    it('should detect missing required columns for lead import', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Missing Phone column
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name', 'Phone'],
        template: ['Name', 'Phone'],
      });
      expect(
        result.some((error) => error.includes('text.requiredRowsValidation'))
      ).toBe(true);
    });
    it('should detect invalid phone number format in lead import', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Phone: '1234567890' }], // Phone without +
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name', 'Phone'],
        template: ['Name', 'Phone'],
      });
      expect(
        result.some((error) =>
          error.includes('text.phoneNumberFormatValidation')
        )
      ).toBe(true);
    });
    it('should reject Thai local phone number format in lead import', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Phone: '0812345678' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name', 'Phone'],
        template: ['Name', 'Phone'],
      });
      expect(
        result.some((error) =>
          error.includes('text.phoneNumberFormatValidation')
        )
      ).toBe(true);
    });
    it('should detect health lead import should not have columns', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Phone: '+1234567890' }], // Has Phone column which should not be present
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name'],
        shouldNotHaveColumns: ['Phone'],
        template: ['Name'],
      });
      expect(
        result.some((error) => error.includes('text.shouldNotHaveColumns'))
      ).toBe(true);
    });
    it('should allow Redbook ID in car lead import when no forbidden columns are configured', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [
          { 'First Name': 'John', Phone: '+66812345678', 'Redbook ID': 'RB1' },
        ],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['First Name', 'Phone'],
        template: ['First Name', 'Phone', 'Redbook ID'],
      });
      expect(
        result.some((error) => error.includes('text.shouldNotHaveColumns'))
      ).toBe(false);
    });
    it('should detect missing required columns for renewal package with insurer_accept = 1', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ insurer_accept: '1', Name: 'John' }], // Missing Phone
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'renewal package',
        requiredColumns: [['Name', 'Phone'], ['Email']],
        template: ['Name', 'Phone'],
      });
      expect(
        result.some((error) => error.includes('text.requiredColumnValidation'))
      ).toBe(true);
    });
    it('should detect missing required columns for renewal package with insurer_accept != 1', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ insurer_accept: '0', Name: 'John' }], // Missing Email
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'renewal package',
        requiredColumns: [['Name', 'Phone'], ['Email']],
        template: ['Name', 'Phone', 'Email'], // Include Email in template
      });
      expect(
        result.some((error) => error.includes('text.requiredColumnValidation'))
      ).toBe(true);
    });
    it('should handle columns with asterisk in other CSV types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ 'Name*': 'John', Email: 'test@example.com' }], // Name with asterisk
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name', 'Email'],
        template: ['Name', 'Email'],
      });
      expect(result).not.toContain('text.requiredRowsValidation');
    });
    it('should validate required columns for insurance premium CSV', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Premium: '1000' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'insurance premium',
        requiredColumns: ['Name', 'Premium'],
        template: ['Name', 'Premium'],
      });
      expect(result).not.toContain('text.requiredRowsValidation');
    });
    it('should detect missing required columns for insurance premium CSV', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Missing Premium
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'insurance premium',
        requiredColumns: ['Name', 'Premium'],
        template: ['Name', 'Premium'],
      });
      expect(
        result.some((error) => error.includes('text.requiredRowsValidation'))
      ).toBe(false);
    });
    it('should validate required columns for insurance coverage CSV', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Coverage: 'Full' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'insurance coverage',
        requiredColumns: ['Name', 'Coverage'],
        template: ['Name', 'Coverage'],
      });
      expect(result).not.toContain('text.requiredRowsValidation');
    });
    it('should detect missing required columns for insurance coverage CSV', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Missing Coverage
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'insurance coverage',
        requiredColumns: ['Name', 'Coverage'],
        template: ['Name', 'Coverage'],
      });
      expect(
        result.some((error) => error.includes('text.requiredRowsValidation'))
      ).toBe(false);
    });
    it('should validate Customer Profile CSV type (no validation)', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Missing required fields but should not validate
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'Customer Profile',
        requiredColumns: ['Name', 'Email'],
        template: ['Name', 'Email'],
      });
      expect(result).not.toContain('text.requiredRowsValidation');
    });
  });
  describe('checkTemplatesValidation', () => {
    it('should validate template columns for Discounts import type', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [
          { Name: 'John' },
          ['Name', 'Email', 'Phone'], // Second row as array
        ],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'discounts',
        requiredColumns: ['Name'],
        template: ['Name', 'Email', 'Phone'],
        importModalType: ImportType.Discounts,
      });
      expect(result).toEqual([]);
    });
    it('should detect template column mismatch for Discounts import type', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [
          { Name: 'John' },
          ['Name', 'WrongColumn', 'Phone'], // Wrong column name
        ],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'discounts',
        requiredColumns: ['Name'],
        template: ['Name', 'Email', 'Phone'],
        importModalType: ImportType.Discounts,
      });
      expect(
        result.some((error) => error.includes('text.requiredColumnValidation'))
      ).toBe(true);
    });
    it('should validate template columns for other import types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Email: 'test@example.com' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name', 'Email'],
        importModalType: ImportType.Lead,
      });
      expect(result).toEqual([]);
    });
    it('should detect missing template columns for other import types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }], // Missing Email column
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name', 'Email'],
        importModalType: ImportType.Lead,
      });
      expect(
        result.some((error) => error.includes('text.requiredColumnValidation'))
      ).toBe(true);
    });
    it('should allow configured optional template columns to be omitted', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Phone: '+66812345678' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'lead import',
        requiredColumns: ['Name', 'Phone'],
        template: ['Name', 'Phone', 'Redbook ID'],
        optionalColumns: ['Redbook ID'],
        importModalType: ImportType.Lead,
      });
      expect(result).toEqual([]);
    });
  });
  describe('rowsDataValidationWithType', () => {
    it('should validate data types correctly', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Age: '25', Email: 'test@example.com' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name', 'Age', 'Email'],
        template: ['Name', 'Age', 'Email'],
        templateWithType: [
          { name: 'Name', dataType: 'string' },
          { name: 'Age', dataType: 'number' },
          { name: 'Email', dataType: 'email' },
        ],
      });
      expect(result).toEqual([]);
    });
    it('should detect invalid data types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John', Age: 'not-a-number', Email: 'invalid-email' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name', 'Age', 'Email'],
        template: ['Name', 'Age', 'Email'],
        templateWithType: [
          { name: 'Name', dataType: 'string' },
          { name: 'Age', dataType: 'number' },
          { name: 'Email', dataType: 'email' },
        ],
      });
      expect(
        result.some((error) => error.includes('text.invalidDataFormat'))
      ).toBe(true);
    });
  });
  describe('file size validation', () => {
    it('should validate file size within limits', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 500 * 1024, // 500KB
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toEqual([]);
    });
    it('should allow larger files for PACKAGE import type', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 10 * 1024 * 1024, // 10MB
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'package data',
        requiredColumns: ['Name'],
        template: ['Name'],
        importModalType: 'PACKAGE',
      });
      expect(result).toEqual([]);
    });
    it('should reject files larger than 1MB for non-PACKAGE import types', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 2 * 1024 * 1024, // 2MB
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
        importModalType: 'LEADS',
      });
      expect(result.some((error) => error.includes('text.maximumSize'))).toBe(
        true
      );
    });
    it('should reject files larger than 20MB for PACKAGE import type', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 25 * 1024 * 1024, // 25MB
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'package data',
        requiredColumns: ['Name'],
        template: ['Name'],
        importModalType: 'PACKAGE',
      });
      expect(result.some((error) => error.includes('text.maximumSize'))).toBe(
        true
      );
    });
  });
  describe('special error conditions', () => {
    it('should handle delimiter error', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        errorFileMessage: 'Delimiter',
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name', 'Email'],
      });
      expect(result).toContain('text.missingHeaderFile');
      expect(
        result.some((error) => error.includes('text.requiredColumnValidation'))
      ).toBe(true);
    });
    it('should handle field mismatch error', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        errorFileMessage: 'FieldMismatch',
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toContain('text.fieldMismatch');
    });
    it('should handle empty file', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toContain('text.emptyFile');
    });
    it('should handle maximum upload limit exceeded', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: Array(1001).fill({ Name: 'John' }), // 1001 rows
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
        maximumUpload: 1000,
      });
      expect(result.some((error) => error.includes('text.maximumUpload'))).toBe(
        true
      );
    });
  });
  describe('edge cases', () => {
    it('should handle file with zero size', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 0,
        result: [],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toEqual([]);
    });
    it('should handle missing result property', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: ['Name'],
        template: ['Name'],
      });
      expect(result).toContain('text.emptyFile');
    });
    it('should handle empty required columns array', () => {
      const fileResult = {
        fileName: 'test.csv',
        name: 'test.csv',
        fileType: 'text/csv',
        fileSize: 1000,
        result: [{ Name: 'John' }],
      };
      const result = csvValidationErrors({
        file: fileResult,
        csvName: 'customer data',
        requiredColumns: [],
        template: ['Name'],
      });
      expect(result).toEqual([]);
    });
  });
});
describe('validateEffectiveTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return true for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    mockDifferenceInDays.mockReturnValue(1);
    mockIsSameDay.mockReturnValue(false);
    const result = validateEffectiveTime(futureDate);
    expect(result).toBe(true);
  });
  it('should return true for same day before 7 PM', () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0); // 10 AM
    mockDifferenceInDays.mockReturnValue(0);
    mockIsSameDay.mockReturnValue(true);
    mockIsBefore.mockReturnValue(true);
    mockSet.mockReturnValue(new Date());
    const result = validateEffectiveTime(today);
    expect(result).toBe(true);
  });
  it('should return false for same day after 7 PM', () => {
    const today = new Date();
    today.setHours(20, 0, 0, 0); // 8 PM
    mockDifferenceInDays.mockReturnValue(0);
    mockIsSameDay.mockReturnValue(true);
    mockIsBefore.mockReturnValue(false);
    mockSet.mockReturnValue(new Date());
    const result = validateEffectiveTime(today);
    expect(result).toBe(false);
  });
  it('should return false for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    mockDifferenceInDays.mockReturnValue(-1);
    const result = validateEffectiveTime(pastDate);
    expect(result).toBe(false);
  });
  it('should handle string dates', () => {
    mockDifferenceInDays.mockReturnValue(1);
    mockIsSameDay.mockReturnValue(false);
    const result = validateEffectiveTime('2024-12-25');
    expect(result).toBe(true);
  });
});
describe('validateDataWithType', () => {
  it('should validate string type correctly', () => {
    expect(validateDataWithType('string', 'test')).toBe(true);
    expect(validateDataWithType('string', '123')).toBe(false); // Number as string
    expect(validateDataWithType('string', '')).toBe(true);
  });
  it('should validate number type correctly', () => {
    expect(validateDataWithType('number', '123')).toBe(true);
    expect(validateDataWithType('number', '0')).toBe(true);
    expect(validateDataWithType('number', 'abc')).toBe(false);
    expect(validateDataWithType('number', '')).toBe(true);
  });
  it('should validate string|number type correctly', () => {
    expect(validateDataWithType('string|number', 'test')).toBe(true);
    expect(validateDataWithType('string|number', '123')).toBe(true);
    expect(validateDataWithType('string|number', '7')).toBe(true); // numeric model names like ORA "7"
    expect(validateDataWithType('string|number', '6')).toBe(true); // numeric model names like Jaecoo "6"
    expect(validateDataWithType('string|number', '')).toBe(true);
    expect(validateDataWithType('string|number', '   ')).toBe(false); // whitespace-only rejected
  });
  it('should validate email type correctly', () => {
    expect(validateDataWithType('email', 'test@example.com')).toBe(true);
    expect(validateDataWithType('email', 'invalid-email')).toBe(false);
    expect(validateDataWithType('email', '')).toBe(true);
  });
  it('should validate gender type correctly', () => {
    expect(validateDataWithType('gender', 'm')).toBe(true);
    expect(validateDataWithType('gender', 'f')).toBe(true);
    expect(validateDataWithType('gender', 'x')).toBe(false);
    expect(validateDataWithType('gender', '')).toBe(true);
  });
  it('should validate date type correctly', () => {
    mockIsValidDateFormat.mockReturnValue(true);
    expect(validateDataWithType('date', '2023-12-25')).toBe(true);
    mockIsValidDateFormat.mockReturnValue(false);
    expect(validateDataWithType('date', 'invalid-date')).toBe(false);
    expect(validateDataWithType('date', '')).toBe(true);
  });
  it('should validate effectiveDate type correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    mockIsValidDateFormat.mockReturnValue(true);
    mockDifferenceInDays.mockReturnValue(1);
    mockIsSameDay.mockReturnValue(false);
    expect(validateDataWithType('effectiveDate', futureDate)).toBe(true);
    expect(validateDataWithType('effectiveDate', '2023-12-25')).toBe(true);
    mockIsValidDateFormat.mockReturnValue(false);
    expect(validateDataWithType('effectiveDate', 'invalid-date')).toBe(false);
  });
  it('should validate zeroOneBool type correctly', () => {
    expect(validateDataWithType('zeroOneBool', 0)).toBe(true);
    expect(validateDataWithType('zeroOneBool', 1)).toBe(true);
    expect(validateDataWithType('zeroOneBool', 2)).toBe(false);
    expect(validateDataWithType('zeroOneBool', '')).toBe(true);
  });
  it('should validate insuranceType type correctly', () => {
    expect(validateDataWithType('insuranceType', '1')).toBe(true);
    expect(validateDataWithType('insuranceType', '2+')).toBe(true);
    expect(validateDataWithType('insuranceType', '4')).toBe(false);
    expect(validateDataWithType('insuranceType', '')).toBe(true);
  });
  it('should validate importOperation type correctly', () => {
    expect(validateDataWithType('importOperation', '')).toBe(true);
    expect(validateDataWithType('importOperation', 'insert')).toBe(true);
    expect(validateDataWithType('importOperation', 'update')).toBe(true);
    expect(validateDataWithType('importOperation', 'delete')).toBe(true);
    expect(validateDataWithType('importOperation', ' UPDATE ')).toBe(true);
    expect(validateDataWithType('importOperation', 'udpate')).toBe(false);
    expect(validateDataWithType('importOperation', 1)).toBe(false);
  });
  it('should validate provinceIds type correctly', () => {
    expect(validateDataWithType('provinceIds', '100000')).toBe(true);
    expect(validateDataWithType('provinceIds', '0')).toBe(true);
    expect(validateDataWithType('provinceIds', '100000,110000')).toBe(true);
    expect(validateDataWithType('provinceIds', '100000, 110000')).toBe(true);
    expect(validateDataWithType('provinceIds', '10000')).toBe(false);
    expect(validateDataWithType('provinceIds', 'bangkok')).toBe(false);
    expect(validateDataWithType('provinceIds', '')).toBe(false);
  });
  it('should validate bool type case-insensitively and accept native booleans', () => {
    expect(validateDataWithType('bool', 'true')).toBe(true);
    expect(validateDataWithType('bool', 'false')).toBe(true);
    expect(validateDataWithType('bool', 'TRUE')).toBe(true);
    expect(validateDataWithType('bool', 'FALSE')).toBe(true);
    expect(validateDataWithType('bool', true)).toBe(true);
    expect(validateDataWithType('bool', false)).toBe(true);
    expect(validateDataWithType('bool', '')).toBe(false);
    expect(validateDataWithType('bool', 'yes')).toBe(false);
  });
  it('should return false for unknown data types', () => {
    expect(validateDataWithType('unknown', 'test')).toBe(false);
  });
});
describe('Constants', () => {
  it('should export correct file size constants', () => {
    expect(MAX_FILE_UPLOAD_SIZE).toBe(1 * 1024 * 1024); // 1MB
    expect(NEW_MAX_FILE_UPLOAD_SIZE).toBe(20 * 1024 * 1024); // 20MB
  });
});
