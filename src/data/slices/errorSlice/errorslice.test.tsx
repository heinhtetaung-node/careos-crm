import { useSelector } from 'react-redux';
import { object, string } from 'yup';

import { renderHook } from '__tests__/rtl-test-utils';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';

import { errorSelectorFn, validateLead } from './leadDetailError';

import { transformYupErrorsIntoObject } from '.';

const YupSchema = object().shape({
  name: string().required('Name is required'),
  data: object().shape({
    customerFirstName: string().required('customerFirstName is required'),
  }),
});

function useTestHook() {
  const errors = useSelector(errorSelectorFn);
  const dispatch = useAppDispatch();

  const validate = () => {
    dispatch(validateLead(YupSchema as any));
  };

  return { errors, validate };
}

describe('errorSlice', () => {
  it('should create empty initial error', () => {
    const { result } = renderHook(() => useTestHook());
    expect((result.current as any).errors).toEqual({});
  });

  it('should return errors after validation', () => {
    const { result } = renderHook(() => useTestHook());
    (result.current as any).validate();
    expect((result.current as any).errors).toEqual({});
  });
});

describe('transformYupObjectIntoObject', () => {
  it('should yup array error into object', (done) => {
    try {
      YupSchema.validateSync({}, { abortEarly: false });
    } catch (e: any) {
      expect(transformYupErrorsIntoObject(e)).toEqual({
        data: {
          customerFirstName: 'customerFirstName is required',
        },
        name: 'Name is required',
      });
      done();
    }
    expect.assertions(1);
  });

  it('empty error case', () => {
    expect(transformYupErrorsIntoObject({ inner: [{}] } as any)).toEqual({});
  });
});
