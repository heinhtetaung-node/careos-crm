import { validationSchema } from '../validation';

describe('Test validationSchema', () => {
  it('Should return of yup is ObjectSchema', () => {
    expect(typeof validationSchema).toEqual('function');
    expect(Object.keys(validationSchema()?.fields || {}).length).toEqual(3);
  });
});
