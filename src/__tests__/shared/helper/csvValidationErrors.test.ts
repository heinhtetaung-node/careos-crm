import { getString } from 'presentation/theme/localization';
import csvValidationErrors, {
  validateDataWithType,
  validateEffectiveTime,
} from 'shared/helper/csvValidationErrors';
import { add, sub } from 'utils/datetime';

const inputNoRequiredField = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 125920,
    result: [
      {
        'First Name': 'name one',
        'Preferred voluntary type': 'test',
        'Last Name': '',
        'Dash Cam': 'test',
        'Driving purpose': '',
        'Registred province': '',
        'Current Insurer': '',
        'Policy Start date': new Date(),
        'Marketing consent': 'test',
        Phone: '099922000',
        'Car Modification': 'test',
        Email: 'john@gmail.com',
        'Redbook ID': 'test',
        'Date of birth': '1910-10-10',
        Gender: 'male',
      },
      {
        'First Name': 'name one',
        'Preferred voluntary type': 'test',
        'Last Name': 'evan',
        'Dash Cam': 'test',
        'Driving purpose': '',
        'Registred province': '',
        'Current Insurer': '',
        'Policy Start date': new Date(),
        'Marketing consent': 'test',
        Phone: '099922000',
        'Car Modification': 'test',
        Email: 'john@gmail.com',
        'Redbook ID': 'test',
        'Date of birth': '1910-10-10',
        Gender: 'male',
      },
    ],
  },
  csvName: 'lead',
  requiredColumns: ['Last Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Car Modification',
    'Dash Cam',
    'Driving purpose',
    'Registred province',
    'Current Insurer',
    'Policy Start date',
    'Preferred voluntary type',
    'Marketing consent',
  ],
};

const inputWrongFile = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/excel',
    fileSize: 125920,
    result: [
      {
        'First Name': 'name one',
        'Preferred voluntary type': 'test',
        'Last Name': 'evan',
        'Dash Cam': 'test',
        'Driving purpose': '',
        'Registred province': '',
        'Current Insurer': '',
        'Policy Start date': new Date(),
        'Marketing consent': 'test',
        Phone: '099922000',
        'Car Modification': 'test',
        Email: 'john@gmail.com',
        'Redbook ID': 'test',
        'Date of birth': '1910-10-10',
        Gender: 'male',
      },
      {
        'First Name': 'name one',
        'Preferred voluntary type': 'test',
        'Last Name': 'evan',
        'Dash Cam': 'test',
        'Driving purpose': '',
        'Registred province': '',
        'Current Insurer': '',
        'Policy Start date': new Date(),
        'Marketing consent': 'test',
        Phone: '099922000',
        'Car Modification': 'test',
        Email: 'john@gmail.com',
        'Redbook ID': 'test',
        'Date of birth': '1910-10-10',
        Gender: 'male',
      },
    ],
  },
  csvName: 'lead',
  requiredColumns: ['Last Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Car Modification',
    'Dash Cam',
    'Driving purpose',
    'Registred province',
    'Current Insurer',
    'Policy Start date',
    'Preferred voluntary type',
    'Marketing consent',
  ],
};

const fileWithFieldMismatchAndExtraFields = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: 'FieldMismatch',
    result: [
      {
        'First Name': 'first',
        'Last Name': 'last',
        Gender: 'f',
        'Date of birth': '1990-01-02',
        Phone: '999999999',
        Email: 'panraweb@rabbit.co.th',
        'Redbook ID': '',
        'Car Modification': '1',
        'Dash Cam': '1',
        'Driving purpose': 'Personal',
        'Registred province': '100000',
        'Current Insurer': '7',
        'Policy Start date': '2021-06-13',
        'Preferred voluntary type': 'Type 2+',
        'Marketing consent': 'Y Panrawe',
        __parsed_extra: [
          'Testeight',
          'f',
          '1990-01-02',
          '999999999',
          'panraweb@rabbit.co.th',
          '',
          '1',
          '1',
          'Personal',
          '100000',
          '7',
          '2021-06-13',
          'Type 2+',
          'Y Panrawe',
          'Testnine',
          'f',
          '1990-01-02',
          '999999999',
          'panraweb@rabbit.co.th',
          '',
          '1',
          '1',
          'Personal',
          '100000',
          '7',
          '2021-06-13',
          'Type 2+',
          'Y',
        ],
      },
    ],
  },
  csvName: 'lead',
  requiredColumns: ['First Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Policy Start date',
  ],
};

const fileWithDelimiterError = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: 'Delimiter',
    result: [
      {
        'First Name': 'first',
        Phone: '999999999',
      },
    ],
  },
  csvName: 'lead',
  requiredColumns: [],
  template: ['First Name', 'Phone'],
};

const emptyFile = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [],
  },
  csvName: 'lead',
  requiredColumns: ['First Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Policy Start date',
  ],
};

const fileWithMaximumRows = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [
      {
        'First Name': 'first',
        'Last Name': 'last',
        Gender: 'f',
        'Date of birth': '1990-01-02',
        Phone: '999999999',
        Email: 'panraweb@rabbit.co.th',
        'Redbook ID': '',
        'Policy Start date': '2021-06-13',
      },
      {
        'First Name': 'first 2',
        'Last Name': 'last 2',
        Gender: 'm',
        'Date of birth': '1990-01-02',
        Phone: '999999999',
        Email: 'panraweb@rabbit.co.th',
        'Redbook ID': '',
        'Policy Start date': '2021-06-13',
      },
    ],
  },
  csvName: 'lead',
  maximumUpload: 1,
  requiredColumns: ['First Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Policy Start date',
  ],
};

const properCsvFile = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [
      {
        'First Name': 'first',
        'Last Name': 'last',
        Gender: 'f',
        'Date of birth': '1990-01-02',
        Phone: '999999999',
        Email: 'panraweb@rabbit.co.th',
        'Redbook ID': '',
        'Policy Start date': '2021-06-13',
      },
    ],
  },
  csvName: 'lead',
  maximumUpload: 1,
  requiredColumns: ['First Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Policy Start date',
  ],
};

const fileToTestTemplateValidation = {
  file: {
    fileName: 'lead_file.csv',
    name: 'Leads',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [
      {
        'First Name': 123,
        'Last Name': 'last',
        Gender: 'female',
        'Date of birth': '1990/01/02',
        Phone: 'hello',
        Email: 'none',
        'Redbook ID': 123,
        'Policy Start date': '2021/06/13',
      },
    ],
  },
  csvName: 'lead',
  maximumUpload: 1,
  requiredColumns: ['First Name', 'Phone'],
  template: [
    'First Name',
    'Last Name',
    'Gender',
    'Date of birth',
    'Phone',
    'Email',
    'Redbook ID',
    'Policy Start date',
  ],
  templateWithType: [
    { name: 'First Name', dataType: 'string' },
    { name: 'Last Name', dataType: 'string' },
    { name: 'Gender', dataType: 'gender' },
    { name: 'Date of birth', dataType: 'date' },
    { name: 'Phone', dataType: 'number' },
    { name: 'Email', dataType: 'email' },
    { name: 'Redbook ID', dataType: 'string' },
    { name: 'Policy Start date', dataType: 'date' },
  ],
};

const fileToTestRequiredColumnWithInsurerAccept = {
  file: {
    fileName: 'renewal.csv',
    name: 'renewal package',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [
      {
        insurer_accept: '1',
        chassis_no: '123',
        insurer_id: 'blabla',
        car_repair_type: 'Dealer',
        last_policy_expiration_date: '',
        oic_code: '',
        car_insurance_type: '',
      },
    ],
  },
  csvName: 'renewal package',
  maximumUpload: 1,
  requiredColumns: [
    [
      'insurer_accept',
      'chassis_no',
      'insurer_id',
      'last_policy_expiration_date',
      'oic_code',
      'car_insurance_type',
      'car_repair_type',
    ],
    ['chassis_no', 'insurer_id', 'insurer_accept'],
  ],
  template: [
    'insurer_accept',
    'chassis_no',
    'insurer_id',
    'last_policy_expiration_date',
    'oic_code',
    'car_insurance_type',
    'car_repair_type',
  ],
  templateWithType: [],
};

const fileToTestRequiredColumnWithInsurerNotAccept = {
  file: {
    fileName: 'renewal.csv',
    name: 'renewal package',
    fileType: 'text/csv',
    fileSize: 523,
    errorFileMessage: '',
    result: [
      {
        chassis_no: '12234',
        insurer_id: 'blabla',
        insurer_accept: '0',
        car_repair_type: 'Dealer',
        last_policy_expiration_date: '',
        oic_code: '',
        car_insurance_type: '',
      },
    ],
  },
  csvName: 'renewal package',
  maximumUpload: 1,
  requiredColumns: [
    [
      'insurer_accept',
      'chassis_no',
      'insurer_id',
      'last_policy_expiration_date',
      'oic_code',
      'car_insurance_type',
      'car_repair_type',
    ],
    ['chassis_no', 'insurer_id', 'insurer_accept'],
  ],
  template: [
    'insurer_accept',
    'chassis_no',
    'insurer_id',
    'last_policy_expiration_date',
    'oic_code',
    'car_insurance_type',
    'car_repair_type',
  ],
  templateWithType: [],
};

jest.useFakeTimers().setSystemTime(new Date('2022-11-22'));

test('File input with no required field', () => {
  expect(csvValidationErrors(inputNoRequiredField)).toEqual([
    getString('text.requiredRowsValidation'),
  ]);
});

test('File input with wrong', () => {
  expect(csvValidationErrors(inputWrongFile)).toEqual([
    getString('text.requiredCsvValidation'),
  ]);
});

test('File with inconsistent line breaks', () => {
  expect(csvValidationErrors(fileWithFieldMismatchAndExtraFields)).toEqual([
    getString('text.fieldMismatch'),
  ]);
});

test('File with delimiter error', () => {
  expect(csvValidationErrors(fileWithDelimiterError)).toEqual([
    getString('text.missingHeaderFile'),
    getString('text.requiredColumnValidation'),
    getString('text.requiredColumnValidation'),
  ]);
});

test('Empty csv files', () => {
  expect(csvValidationErrors(emptyFile)).toEqual([getString('text.emptyFile')]);
});

test('File with maximum rows error', () => {
  expect(csvValidationErrors(fileWithMaximumRows)).toEqual([
    getString('text.maximumUpload'),
  ]);
});

test('Proper file without error', () => {
  expect(csvValidationErrors(properCsvFile)).toEqual([]);
});

test('Test template validation', () => {
  expect(csvValidationErrors(fileToTestTemplateValidation)).toEqual([
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
    getString('text.invalidDataFormat'),
  ]);
});

test('Test template validation', () => {
  expect(
    csvValidationErrors(fileToTestRequiredColumnWithInsurerNotAccept)
  ).toEqual([]);
});

test('Test template validation', () => {
  expect(
    csvValidationErrors(fileToTestRequiredColumnWithInsurerAccept)
  ).toEqual([
    'text.requiredRowsValidation',
    'text.requiredRowsValidation',
    'text.requiredRowsValidation',
  ]);
});

describe('validateDataWithType', () => {
  it('will return true when we pass string to check against string type', () => {
    expect(validateDataWithType('string', 'hello')).toBe(true);
  });

  it('will return false when we pass number to check against string type', () => {
    expect(validateDataWithType('string', 12345)).toBe(false);
  });

  it('will return true when we pass number to check against number type', () => {
    expect(validateDataWithType('number', 12345)).toBe(true);
  });

  it('should return true if empty', () => {
    expect(validateDataWithType('number', '')).toBe(true);
  });

  it('will return false when we pass number to check against number type', () => {
    expect(validateDataWithType('number', 'A12345')).toBe(false);
  });

  it('will return true when we pass number to check against email type', () => {
    expect(validateDataWithType('email', 'tester@testing.com')).toBe(true);
  });

  it('will return false when we pass invalid format email to check against email type', () => {
    expect(validateDataWithType('email', 'tester@test')).toBe(false);
  });

  it('will return false when we pass number to check against email type', () => {
    expect(validateDataWithType('email', 12345)).toBe(false);
  });

  it('will return false when we pass string to check against email type', () => {
    expect(validateDataWithType('email', 'abcd')).toBe(false);
  });

  it('will return true when we pass "f" to check against gender type', () => {
    expect(validateDataWithType('gender', 'f')).toBe(true);
  });

  it('will return true when we pass "m" to check against gender type', () => {
    expect(validateDataWithType('gender', 'm')).toBe(true);
  });

  it('will return false when we pass "female" to check against gender type', () => {
    expect(validateDataWithType('gender', 'female')).toBe(false);
  });

  it('will return false when we pass "male" to check against gender type', () => {
    expect(validateDataWithType('gender', 'male')).toBe(false);
  });

  it('will return true when we pass valid date format to check against date type', () => {
    expect(validateDataWithType('date', '1990-01-01')).toBe(true);
  });

  it('will return false when we pass invalid date type 1 format to check against date type', () => {
    expect(validateDataWithType('date', '1990/01/01')).toBe(false);
  });

  it('will return false when we pass invalid date type 2 format to check against date type', () => {
    expect(validateDataWithType('date', '1990/1/1')).toBe(false);
  });

  it('will return false when we pass number to check against date type', () => {
    expect(validateDataWithType('date', 1991)).toBe(false);
  });

  it('will return false when we pass string to check against date type', () => {
    expect(validateDataWithType('date', 'hello')).toBe(false);
  });

  it('should return effective date validation', () => {
    expect(validateDataWithType('effectiveDate', '2022-01-01')).toBe(false);
  });

  it('will return true when we pass valid insurance type format to check against insurance type', () => {
    expect(validateDataWithType('insuranceType', '2+')).toBe(true);
  });

  it('will return false when we pass invalid  insurance type format to check against insurance type', () => {
    expect(validateDataWithType('insuranceType', '5+')).toBe(false);
  });

  it('will return false when we pass number to check against insurance type', () => {
    expect(validateDataWithType('insuranceType', 2)).toBe(false);
  });

  it('will return false when we pass a string value for zeroOneBool type', () => {
    expect(validateDataWithType('zeroOneBool', '21')).toBe(false);
  });

  it('will return false when we pass invalid number to check against zeroOneBool type', () => {
    expect(validateDataWithType('zeroOneBool', 3)).toBe(false);
  });

  it('will return false when we pass invalid number zeroOneBool format check against zeroOneBool type', () => {
    expect(validateDataWithType('zeroOneBool', 5)).toBe(false);
  });

  it('will return true when we pass valid zeroOneBool format check against zeroOneBool type', () => {
    expect(validateDataWithType('zeroOneBool', 1)).toBe(true);
  });

  it('will return true when we pass valid zeroOneBool format check against zeroOneBool type', () => {
    expect(validateDataWithType('zeroOneBool', 0)).toBe(true);
  });

  it('will return true when we pass number format check against noValidate type', () => {
    expect(validateDataWithType('string|number', 0)).toBe(true);
  });

  it('will return true when we pass valid string format check against noValidate type', () => {
    expect(validateDataWithType('string|number', '283y5bw')).toBe(true);
  });

  it('will return true when we pass valid empty string format check against noValidate type', () => {
    expect(validateDataWithType('string|number', '')).toBe(true);
  });
});

describe('validateEffectiveTime', () => {
  it("returns true if date passed is today's date", () => {
    expect(validateEffectiveTime(new Date())).toBe(true);
  });

  it("returns true if date passed is tmr's date", () => {
    expect(validateEffectiveTime(add(new Date(), { days: 1 }))).toBe(true);
  });

  it('returns true if date passed is in 5 days', () => {
    expect(validateEffectiveTime(add(new Date(), { days: 5 }))).toBe(true);
  });

  it('returns false if date passed is not today or tmr', () => {
    expect(validateEffectiveTime(sub(new Date(), { days: 1 }))).toBe(false);
  });

  it('returns false if date passed is not today or tmr', () => {
    expect(validateEffectiveTime(sub(new Date(), { days: 300 }))).toBe(false);
  });

  it('returns false if date passed is next week', () => {
    expect(validateEffectiveTime(add(new Date(), { weeks: 1 }))).toBeTruthy();
  });

  it('returns false if date passed is next month', () => {
    expect(validateEffectiveTime(add(new Date(), { months: 1 }))).toBeTruthy();
  });
});
