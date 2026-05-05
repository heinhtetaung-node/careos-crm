import { addYears, subYears } from 'date-fns';

import {
  validationSchema,
  transformPayload,
  getValidationData,
  ageValidationFn,
} from './helper';

describe('validationSchema', () => {
  test.each([
    {
      numberOfFixedDriver: 1,
      firstDriverFirstName: 'Joon Sang',
      firstDriverLastName: 'Jo',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT',
      firstDriverLicense: '12345678',
      expectation: true,
    },
    {
      numberOfFixedDriver: 1,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT',
      firstDriverLicense: '12345678',
      expectation: true,
    },
    {
      numberOfFixedDriver: 1,
      firstDriverFirstName: 'Hello @123',
      firstDriverLastName: 'Hello$$$',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: null,
      firstDriverLicense: 'ABCDEFG',
      expectation: false,
    },
    {
      numberOfFixedDriver: 1,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: null,
      firstDriverNationalId: null,
      firstDriverPassport: null,
      firstDriverLicense: '98765432',
      expectation: true,
    },
    {
      numberOfFixedDriver: 1,
      firstDriverFirstName: null,
      firstDriverLastName: null,
      firstDriverDOB: null,
      firstDriverValidationType: null,
      firstDriverNationalId: null,
      firstDriverPassport: null,
      firstDriverLicense: null,
      expectation: false,
    },
    {
      numberOfFixedDriver: 2,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT',
      firstDriverLicense: '12345678',
      secondDriverFirstName: 'World',
      secondDriverLastName: 'World',
      secondDriverDOB: '1999-01-01',
      secondDriverValidationType: 'nationalId',
      secondDriverNationalId: 'FakeNationalId',
      secondDriverPassport: null,
      secondDriverLicense: '12345678',
      expectation: true,
    },
    {
      numberOfFixedDriver: 2,
      firstDriverFirstName: 'Joon Sang',
      firstDriverLastName: 'Jo',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT',
      firstDriverLicense: '12345678',
      secondDriverFirstName: 'Se Weon',
      secondDriverLastName: 'Lee',
      secondDriverDOB: '1999-01-01',
      secondDriverValidationType: 'nationalId',
      secondDriverNationalId: 'FakeNationalId',
      secondDriverPassport: null,
      secondDriverLicense: '12345678',
      expectation: true,
    },
    {
      numberOfFixedDriver: 2,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: null,
      firstDriverNationalId: null,
      firstDriverPassport: null,
      firstDriverLicense: '12345678',
      secondDriverFirstName: 'World',
      secondDriverLastName: 'World',
      secondDriverDOB: '1999-01-01',
      secondDriverValidationType: null,
      secondDriverNationalId: null,
      secondDriverPassport: null,
      secondDriverLicense: '12345678',
      expectation: true,
    },
    {
      numberOfFixedDriver: 2,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT',
      firstDriverLicense: '12345678',
      secondDriverFirstName: null,
      secondDriverLastName: null,
      secondDriverDOB: null,
      secondDriverValidationType: null,
      secondDriverNationalId: null,
      secondDriverPassport: null,
      secondDriverLicense: null,
      expectation: false,
    },
    {
      numberOfFixedDriver: 2,
      firstDriverFirstName: 'Hello',
      firstDriverLastName: 'Hello',
      firstDriverDOB: '1990-01-01',
      firstDriverValidationType: 'passport',
      firstDriverNationalId: null,
      firstDriverPassport: 'FAKEPASSPORT@1',
      firstDriverLicense: '12345678',
      secondDriverFirstName: '007Bond',
      secondDriverLastName: 'Bond007',
      secondDriverDOB: '1900-01-01',
      secondDriverValidationType: 'nationalId',
      secondDriverNationalId: 'FakeNationalID@2',
      secondDriverPassport: null,
      secondDriverLicense: 'FakeLicense',
      expectation: false,
    },
  ])(
    'isValidSync should return $expectation when numberOfFixedDriver is $numberOfFixedDriver and respective data is passed',
    ({ expectation, numberOfFixedDriver, ...rest }) => {
      expect(
        validationSchema.isValidSync({ ...rest, numberOfFixedDriver })
      ).toBe(expectation);
    }
  );
});

const leadData = {
  data: {
    numberOfFixedDriver: 1,
    firstDriverFirstName: 'Hello',
    firstDriverLastName: 'Hello',
    firstDriverDOB: '1990-01-01',
    firstDriverValidationType: 'passport',
    firstDriverNationalId: null,
    firstDriverPassport: 'FAKEPASSPORT',
    firstDriverLicense: '12345678',
  },
};

describe('transformPayload', () => {
  it('returns expected transformed value when only 1 fixed driver data is entered', () => {
    expect(
      transformPayload(
        {
          numberOfFixedDriver: 1,
          firstDriverFirstName: 'Hello',
          firstDriverLastName: 'Hello',
          firstDriverDOB: '1990-01-01',
          firstDriverValidationType: 'passport',
          firstDriverNationalId: null,
          firstDriverPassport: 'FAKEPASSPORT',
          firstDriverLicense: '12345678',
        },
        leadData
      )
    ).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverFirstName', value: 'Hello' },
        { op: 'add', path: '/firstDriverLastName', value: 'Hello' },
        { op: 'add', path: '/firstDriverDOB', value: '1990-01-01' },
        { op: 'add', path: '/firstDriverLicense', value: '12345678' },
        { op: 'add', path: '/firstDriverPassport', value: 'FAKEPASSPORT' },
      ])
    );
  });

  it('returns expected transformed value when only 1 fixed driver data is entered', () => {
    expect(
      transformPayload(
        {
          numberOfFixedDriver: 1,
          firstDriverFirstName: 'Hello',
          firstDriverLastName: 'Hello',
          firstDriverDOB: '1990-01-01',
          firstDriverValidationType: 'nationalId',
          firstDriverNationalId: 'FakeNationalId',
          firstDriverPassport: null,
          firstDriverLicense: '12345678',
        },
        leadData
      )
    ).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverFirstName', value: 'Hello' },
        { op: 'add', path: '/firstDriverLastName', value: 'Hello' },
        { op: 'add', path: '/firstDriverDOB', value: '1990-01-01' },
        { op: 'add', path: '/firstDriverLicense', value: '12345678' },
        { op: 'add', path: '/firstDriverNationalId', value: 'FakeNationalId' },
      ])
    );
  });

  it('returns expected transformed value when both fixed driver data are entered', () => {
    expect(
      transformPayload(
        {
          numberOfFixedDriver: 2,
          firstDriverFirstName: 'Hello',
          firstDriverLastName: 'Hello',
          firstDriverDOB: '1990-01-01',
          firstDriverValidationType: 'passport',
          firstDriverNationalId: null,
          firstDriverPassport: 'FAKEPASSPORT',
          firstDriverLicense: '12345678',
          secondDriverFirstName: 'World',
          secondDriverLastName: 'World',
          secondDriverDOB: '1999-01-01',
          secondDriverValidationType: 'nationalId',
          secondDriverNationalId: 'FakeNationalId',
          secondDriverPassport: null,
          secondDriverLicense: '12345678',
        },
        leadData,
        true
      )
    ).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverFirstName', value: 'Hello' },
        { op: 'add', path: '/firstDriverLastName', value: 'Hello' },
        { op: 'add', path: '/firstDriverDOB', value: '1990-01-01' },
        { op: 'add', path: '/firstDriverLicense', value: '12345678' },
        { op: 'add', path: '/secondDriverFirstName', value: 'World' },
        { op: 'add', path: '/secondDriverLastName', value: 'World' },
        { op: 'add', path: '/secondDriverDOB', value: '1999-01-01' },
        { op: 'add', path: '/secondDriverLicense', value: '12345678' },
        { op: 'add', path: '/firstDriverPassport', value: 'FAKEPASSPORT' },
        { op: 'add', path: '/secondDriverNationalId', value: 'FakeNationalId' },
      ])
    );
  });

  it('returns expected transformed value when both fixed driver data are entered', () => {
    expect(
      transformPayload(
        {
          numberOfFixedDriver: 2,
          firstDriverFirstName: 'Hello',
          firstDriverLastName: 'Hello',
          firstDriverDOB: '1990-01-01',
          firstDriverValidationType: 'passport',
          firstDriverNationalId: null,
          firstDriverPassport: 'FAKEPASSPORT',
          firstDriverLicense: '12345678',
          secondDriverFirstName: 'World',
          secondDriverLastName: 'World',
          secondDriverDOB: '1999-01-01',
          secondDriverValidationType: 'passport',
          secondDriverNationalId: null,
          secondDriverPassport: 'FakePassportNo',
          secondDriverLicense: '12345678',
        },
        leadData,
        true
      )
    ).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverFirstName', value: 'Hello' },
        { op: 'add', path: '/firstDriverLastName', value: 'Hello' },
        { op: 'add', path: '/firstDriverDOB', value: '1990-01-01' },
        { op: 'add', path: '/firstDriverLicense', value: '12345678' },
        { op: 'add', path: '/secondDriverFirstName', value: 'World' },
        { op: 'add', path: '/secondDriverLastName', value: 'World' },
        { op: 'add', path: '/secondDriverDOB', value: '1999-01-01' },
        { op: 'add', path: '/secondDriverLicense', value: '12345678' },
        { op: 'add', path: '/firstDriverPassport', value: 'FAKEPASSPORT' },
        { op: 'add', path: '/secondDriverPassport', value: 'FakePassportNo' },
      ])
    );
  });
});

describe('getValidationData', () => {
  const dataToTest = [
    {
      type: 'first',
      data: {
        firstDriverNationalId: 'FakeNationalId',
      },
      response: 'nationalId',
    },
    {
      type: 'first',
      data: {
        firstDriverPassport: 'FakePassport',
      },
      response: 'passport',
    },
    {
      type: 'second',
      data: {
        secondDriverNationalId: 'FakeNationalId',
      },
      response: 'nationalId',
    },
    {
      type: 'second',
      data: {
        secondDriverPassport: 'FakePassport',
      },
      response: 'passport',
    },
  ];

  dataToTest.forEach((testData) => {
    it(`returns ${testData.response} when type is ${testData.type} & data is provided`, () => {
      expect(getValidationData(testData.data, testData.type)).toBe(
        testData.response
      );
    });
  });
});

describe('ageValidationFn', () => {
  const dataToTest = [
    {
      providedDate: new Date(subYears(new Date(), 101)),
      response: 'errors.invalidAgeOver',
    },
    {
      providedDate: new Date(subYears(new Date(), 16)),
      response: 'errors.invalidAgeUnder',
    },
    {
      providedDate: new Date(addYears(new Date(), 1)),
      response: 'errors.invalidAgeUnder',
    },
    {
      providedDate: new Date(subYears(new Date(), 19)),
      response: '',
    },
  ];

  dataToTest.forEach((testData) => {
    it(`returns ${testData.response} when date entered is ${testData.providedDate}`, () => {
      expect(ageValidationFn(testData.providedDate)).toBe(testData.response);
    });
  });
});
