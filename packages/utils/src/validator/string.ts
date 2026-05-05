import { string, ValidationError, StringSchema } from 'yup';

/**
 * @deprecated This validator should not be use anymore. We have our own `customString` that extend existing yup `stringSchema`
 */
export const nameValidator = string()
  .required()
  .max(40)
  .test('invalid', 'invalid', (value: string) =>
    Boolean(value.match(/^[A-Za-z\u0E00-\u0E7F .]+$/g))
  );

/**
 * @deprecated The method should not be used. We have our own `customString` that extend existing yup `stringSchema`
 */
export const validateMotorPolicyHolderName = (value: string) => {
  type ErrorCodes = '' | 'max' | 'required' | 'invalid';
  try {
    nameValidator.validateSync(value);
    return {
      isValid: true,
      errorCode: '' as ErrorCodes,
    };
  } catch (e: unknown) {
    const { type, params } = e as ValidationError;
    return {
      isValid: false,
      errorCode: type as ErrorCodes,
      params,
    };
  }
};

class CustomString extends StringSchema<string, any, undefined, ''> {
  customerName(
    trans: { required?: string; max?: string; invalid?: string } = {}
  ) {
    const { required, max, invalid } = {
      required: 'Cannot be empty',
      max: 'Maximum charater limit exceed',
      invalid: 'Invalid charater present',
      ...trans,
    };
    return this.required(required)
      .max(40, max)
      .test('invalid', invalid, (value: string) =>
        Boolean(value.match(/^[A-Za-z\u0E00-\u0E7F .]+$/g))
      ) as this;
  }

  check(value: string | undefined) {
    type ErrorCode = 'max' | 'required' | 'invalid' | null;
    try {
      this.validateSync(value);
      return {
        isValid: true,
        errorCode: null as ErrorCode,
        message: null,
      };
    } catch (e) {
      const { type, errors } = e as ValidationError;
      return {
        isValid: false,
        errorCode: type as ErrorCode,
        message: errors[0],
      };
    }
  }
}

interface CustomStringType extends CustomString {
  required: (...args: Parameters<CustomString['required']>) => this;
  notRequired: (...args: Parameters<CustomString['notRequired']>) => this;
  length: (...args: Parameters<CustomString['length']>) => this;
  min: (...args: Parameters<CustomString['min']>) => this;
  max: (...args: Parameters<CustomString['max']>) => this;
  matches: (...args: Parameters<CustomString['matches']>) => this;
  email: (...args: Parameters<CustomString['email']>) => this;
  url: (...args: Parameters<CustomString['url']>) => this;
  uuid: (...args: Parameters<CustomString['uuid']>) => this;
}

/**
 * Custom string validation schema based on the yup
 * @example
 * How to use it in the yup sehcma:
 * ```
 * const validationSchema = object().shape({
 *   customerName: rabbitString().customerName({
 *    max: 'exceed max charater',
 *    require: 'this field is required',
 *    invalid: 'invalid charater'
 *   })
 * })
 * ```
 * @example
 * How to use as standalone validator:
 * ```
 * rabbitString().customerName().check('customerName')
 * ```
 *
 */
export const rabbitString = () => new CustomString() as CustomStringType;
