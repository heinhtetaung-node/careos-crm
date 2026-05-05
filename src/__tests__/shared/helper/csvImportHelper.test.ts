import { getString } from 'presentation/theme/localization';
import { getPackageErrorMessage } from 'shared/helper/csvImportHelper';

const requiredError = {
  errorCode: 'REQUIRED',
  fieldName: 'First Name',
  rowNumber: 1,
};

const transientError = {
  errorCode: 'TRANSIENT',
  fieldName: 'First Name',
  rowNumber: 1,
};

const invalidError = {
  errorCode: 'INVALID',
  message: 'Engine size must be divisible by 1000',
};

const invalidErrorWithField = {
  errorCode: 'INVALID',
  fieldName: 'Max value',
  message: 'must be less than min value',
  rowNumber: 99,
};

const invalidErrorWithoutField = {
  errorCode: 'INVALID',
  message: 'Data Invalid',
  rowNumber: 9,
};

const notExistError = {
  errorCode: 'NOT_EXIST',
  fieldName: 'First Name',
  rowNumber: 100,
};

describe('getPackageErrorMessage', () => {
  it('will return required error message when error is REQUIRED type', () => {
    expect(getPackageErrorMessage(requiredError)).toEqual(
      getString('importData.error.required')
    );
  });

  it('will return transient error message  when error is TRANSIENT type', () => {
    expect(getPackageErrorMessage(transientError)).toEqual(
      getString('importData.error.transient')
    );
  });

  it('will return message from api when error is INVALID type', () => {
    expect(getPackageErrorMessage(invalidError)).toEqual(invalidError.message);
  });

  it('will return message with fieldname when error is INVALID type', () => {
    expect(getPackageErrorMessage(invalidErrorWithField)).toEqual(
      getString('importData.error.invalidWField')
    );
  });

  it('will return message withour fieldname when error is INVALID type', () => {
    expect(getPackageErrorMessage(invalidErrorWithoutField)).toEqual(
      getString('importData.error.invalidNoField')
    );
  });

  it('will return not exist error message  when error is NOT_EXIST type', () => {
    expect(getPackageErrorMessage(notExistError)).toEqual(
      getString('importData.error.notExist')
    );
  });
});
