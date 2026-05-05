import { has } from 'lodash';
import { object, string } from 'yup';

import { PatchParam } from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater/updateRules';
import { getString } from 'presentation/theme/localization';
import { isMaxAge, isMinAge } from 'shared/validators/ageValidator';

const invalidNameRegex = /[\u200B\d'"!@#$%^&*)(+=_-]/;
const nameRegex = /[\u0E00-\u0E7Fa-zA-Z]/;
const specialCharactersRegex = /[^\w]/;
const onlyNumber = /[^\d]/;

const validateCustomerName = (name: any) => {
  if (!name || invalidNameRegex.test(name)) {
    return false;
  }

  return nameRegex.test(name);
};

const validateSpecialCharacters = (name: any) =>
  !specialCharactersRegex.test(name);

const validateLicensePlate = (name: any) => !onlyNumber.test(name);

const ageValidationFn = (value: string | Date) => {
  if (value && isMaxAge(value)) {
    return getString('errors.invalidAgeOver');
  }
  if (value && isMinAge(value)) {
    return getString('errors.invalidAgeUnder');
  }
  return '';
};

const validationSchema = object().shape({
  firstDriverFirstName: string()
    .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
    .test(
      'Validate Customer Name',
      getString('errors.invalidData'),
      validateCustomerName
    )
    .required(),

  firstDriverLastName: string()
    .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
    .test(
      'Validate Customer Name',
      getString('errors.invalidData'),
      validateCustomerName
    )
    .required(),

  firstDriverDOB: string().required(),

  firstDriverValidationType: string().optional().nullable(),

  firstDriverNationalId: string().when('firstDriverValidationType', {
    is: (type: string) => type === 'nationalId',
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .test(
          'Validate Special Characters',
          getString('errors.invalidData'),
          validateSpecialCharacters
        )
        .optional()
        .nullable(),
    otherwise: () => string().notRequired().nullable(),
  }),

  firstDriverPassport: string().when('firstDriverValidationType', {
    is: (type: string) => type === 'passport',
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .test(
          'Validate Special Characters',
          getString('errors.invalidData'),
          validateSpecialCharacters
        )
        .optional()
        .nullable(),
    otherwise: () => string().notRequired().nullable(),
  }),

  firstDriverLicense: string()
    .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
    .test(
      'Validate License Number',
      getString('errors.invalidData'),
      validateLicensePlate
    )
    .required(),

  // Second driver validation
  secondDriverFirstName: string().when('numberOfFixedDriver', {
    is: (fixedDrivers: number) => fixedDrivers === 2,
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .test(
          'Validate Customer Name',
          getString('errors.invalidData'),
          validateCustomerName
        )
        .required(getString('errors.requiredField')),
    otherwise: () => string().notRequired().nullable(),
  }),

  secondDriverLastName: string().when('numberOfFixedDriver', {
    is: (fixedDrivers: number) => fixedDrivers === 2,
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .test(
          'Validate Customer Name',
          getString('errors.invalidData'),
          validateCustomerName
        )
        .required(getString('errors.requiredField')),
    otherwise: () => string().notRequired().nullable(),
  }),

  secondDriverDOB: string().when('numberOfFixedDriver', {
    is: (fixedDrivers: number) => fixedDrivers === 2,
    then: () => string().required(getString('errors.requiredField')),
    otherwise: () => string().notRequired().nullable(),
  }),

  secondDriverValidationType: string().when('numberOfFixedDriver', {
    is: (fixedDrivers: number) => fixedDrivers === 2,
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .optional()
        .nullable(),
    otherwise: () => string().notRequired().nullable(),
  }),

  secondDriverNationalId: string().when(
    ['numberOfFixedDriver', 'secondDriverValidationType'],
    {
      is: (fixedDrivers: number, type: string) =>
        fixedDrivers === 2 && type === 'nationalId',
      then: () =>
        string()
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate Special Characters',
            getString('errors.invalidData'),
            validateSpecialCharacters
          )
          .optional()
          .nullable(),
      otherwise: () => string().notRequired().nullable(),
    }
  ),

  secondDriverPassport: string().when(
    ['numberOfFixedDriver', 'secondDriverValidationType'],
    {
      is: (fixedDrivers: number, type: string) =>
        fixedDrivers === 2 && type === 'passport',
      then: () =>
        string()
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate Special Characters',
            getString('errors.invalidData'),
            validateSpecialCharacters
          )
          .optional()
          .nullable(),
      otherwise: () => string().notRequired().nullable(),
    }
  ),

  secondDriverLicense: string().when('numberOfFixedDriver', {
    is: (fixedDrivers: number) => fixedDrivers === 2,
    then: () =>
      string()
        .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
        .test(
          'Validate License Number',
          getString('errors.invalidData'),
          validateLicensePlate
        )
        .required(getString('errors.requiredField')),
    otherwise: () => string().notRequired().nullable(),
  }),
});

const validationSchemaOrder = object().shape({
  firstDriverName: string()
    .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
    .test(
      'Validate Customer Name',
      getString('errors.invalidData'),
      validateCustomerName
    )
    .required(),
  firstDriverDOB: string().required(),
  firstDriverValidationType: string().nullable(),
  firstDriverIdNumber: string().when(
    ['firstDriverValidationType'],
    ([type], schema) => {
      if (type === 'passport') {
        return schema
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate Special Characters',
            getString('errors.invalidData'),
            validateSpecialCharacters
          )
          .nullable();
      }
      return schema.notRequired().nullable();
    }
  ),
  firstDriverLicense: string()
    .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
    .test(
      'Validate License Number',
      getString('errors.invalidData'),
      validateLicensePlate
    )
    .required(),
  secondDriverName: string().when(
    ['numberOfFixedDriver'],
    ([fixedDrivers], schema) => {
      if (fixedDrivers === 2) {
        return schema
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate Customer Name',
            getString('errors.invalidData'),
            validateCustomerName
          )
          .required(getString('errors.requiredField'));
      }
      return schema.notRequired().nullable();
    }
  ),
  secondDriverDOB: string().when(
    ['numberOfFixedDriver'],
    ([fixedDrivers], schema) => {
      if (fixedDrivers === 2) {
        return schema.required(getString('errors.requiredField'));
      }
      return schema.notRequired().nullable();
    }
  ),
  secondDriverValidationType: string().when(
    ['numberOfFixedDriver'],
    ([fixedDrivers], schema) => {
      if (fixedDrivers === 2) {
        return schema
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .nullable();
      }
      return schema.notRequired().nullable();
    }
  ),
  secondDriverIdNumber: string().when(
    ['numberOfFixedDriver', 'secondDriverValidationType'],
    ([fixedDrivers, type], schema) => {
      if (fixedDrivers === 2 && type === 'passport') {
        return schema
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate Special Characters',
            getString('errors.invalidData'),
            validateSpecialCharacters
          )
          .nullable();
      }
      return schema.notRequired().nullable();
    }
  ),
  secondDriverLicense: string().when(
    ['numberOfFixedDriver'],
    ([fixedDrivers], schema) => {
      if (fixedDrivers === 2) {
        return schema
          .max(100, getString('errors.exceedCharacters', { maxLength: 100 }))
          .test(
            'Validate License Number',
            getString('errors.invalidData'),
            validateLicensePlate
          )
          .required(getString('errors.requiredField'));
      }
      return schema.notRequired().nullable();
    }
  ),
});
const transformPayload = (
  values: any,
  leadData: any,
  hasTwoFixedDriver = false
) => {
  const payload: PatchParam[] = [
    {
      path: '/firstDriverFirstName',
      op: 'add',
      value: values.firstDriverFirstName,
    },
    {
      path: '/firstDriverLastName',
      op: 'add',
      value: values.firstDriverLastName,
    },
    {
      path: '/firstDriverDOB',
      op: 'add',
      value: values.firstDriverDOB,
    },
    {
      path: '/firstDriverLicense',
      op: 'add',
      value: values.firstDriverLicense,
    },
  ];

  if (hasTwoFixedDriver) {
    payload.push(
      {
        path: '/secondDriverFirstName',
        op: 'add',
        value: values.secondDriverFirstName,
      },
      {
        path: '/secondDriverLastName',
        op: 'add',
        value: values.secondDriverLastName,
      },
      {
        path: '/secondDriverDOB',
        op: 'add',
        value: values.secondDriverDOB,
      },
      {
        path: '/secondDriverLicense',
        op: 'add',
        value: values.secondDriverLicense,
      }
    );
  }

  if (
    values.firstDriverValidationType === 'nationalId' &&
    values?.firstDriverNationalId
  ) {
    payload.push({
      path: '/firstDriverNationalId',
      op: 'add',
      value: values.firstDriverNationalId,
    });
  }

  if (
    values.firstDriverValidationType === 'nationalId' &&
    !values.firstDriverNationalId &&
    has(leadData, 'data.firstDriverNationalId')
  ) {
    payload.push({
      path: '/firstDriverNationalId',
      op: 'remove',
    });
  }

  if (
    values.firstDriverValidationType === 'passport' &&
    values.firstDriverPassport
  ) {
    payload.push({
      path: '/firstDriverPassport',
      op: 'add',
      value: values.firstDriverPassport,
    });
  }

  if (
    values.firstDriverValidationType === 'passport' &&
    !values.firstDriverPassport &&
    has(leadData, 'data.firstDriverPassport')
  ) {
    payload.push({
      path: '/firstDriverPassport',
      op: 'remove',
    });
  }

  if (
    values.secondDriverValidationType === 'nationalId' &&
    values.secondDriverNationalId
  ) {
    payload.push({
      path: '/secondDriverNationalId',
      op: 'add',
      value: values.secondDriverNationalId,
    });
  }

  if (
    values.secondDriverValidationType === 'nationalId' &&
    !values.secondDriverNationalId &&
    has(leadData, 'data.secondDriverNationalId')
  ) {
    payload.push({
      path: '/secondDriverNationalId',
      op: 'remove',
    });
  }

  if (
    values.secondDriverValidationType === 'passport' &&
    values.secondDriverPassport
  ) {
    payload.push({
      path: '/secondDriverPassport',
      op: 'add',
      value: values.secondDriverPassport,
    });
  }

  if (
    values.secondDriverValidationType === 'passport' &&
    !values.secondDriverPassport &&
    has(leadData, 'data.secondDriverPassport')
  ) {
    payload.push({
      path: '/secondDriverPassport',
      op: 'remove',
    });
  }

  return payload;
};

const getValidationData = (data: any, type: string) => {
  if (type === 'first') {
    if (has(data, 'firstDriverNationalId')) {
      return 'nationalId';
    }
    if (has(data, 'firstDriverPassport')) {
      return 'passport';
    }
  }
  if (type === 'second') {
    if (has(data, 'secondDriverNationalId')) {
      return 'nationalId';
    }
    if (has(data, 'secondDriverPassport')) {
      return 'passport';
    }
  }
  return null;
};

const updateOrderFixedDriver = async (
  values: any,
  updateOrder: (payload: any) => Promise<any>,
  orderName: string,
  hasTwoFixedDriver: boolean,
  handleCloseModal: () => void
) => {
  const payloads = [
    {
      op: 'add',
      path: 'data/firstDriverName',
      value: values?.firstDriverName,
    },
    {
      op: 'add',
      path: 'data/firstDriverIdNumber',
      value: values?.firstDriverIdNumber,
    },
    {
      op: 'add',
      path: 'data/firstDriverDrivingLicense',
      value: values?.firstDriverLicense,
    },
    {
      op: 'add',
      path: 'data/firstDriverDOB',
      value: values?.firstDriverDOB,
    },
    ...(hasTwoFixedDriver
      ? [
          {
            op: 'add',
            path: 'data/secondDriverName',
            value: values?.secondDriverName,
          },
          {
            op: 'add',
            path: 'data/secondDriverIdNumber',
            value: values?.secondDriverIdNumber,
          },
          {
            op: 'add',
            path: 'data/secondDriverDrivingLicense',
            value: values?.secondDriverLicense,
          },
          {
            op: 'add',
            path: 'data/secondDriverDOB',
            value: values?.secondDriverDOB,
          },
        ]
      : []),
  ];
  await updateOrder({
    orderId: orderName,
    payload: payloads,
  });
  handleCloseModal();
  return values;
};
export {
  validationSchema,
  validationSchemaOrder,
  transformPayload,
  getValidationData,
  ageValidationFn,
  updateOrderFixedDriver,
};
