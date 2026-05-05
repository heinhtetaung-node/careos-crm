import {
  AsyncThunk,
  AsyncThunkAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _set from 'lodash/set';
import { object, ValidationError } from 'yup';

import { errorReducerKey } from './constants';

type GetDataType = (state: unknown) => unknown;
type SchemaValidatorArgs = {
  valSchema: ReturnType<typeof object>;
  getDataFromState: GetDataType;
};
type Validator = {
  validate: (arg: any) => AsyncThunkAction<any, any, any>;
  thunkAction: AsyncThunk<any, any, any>;
};
type CreateSchemaValidatorOptions = {
  dataReducerPath: string | GetDataType;
};

/**
 * TransformYupErrorsIntoObject
 *
 * @description Transform the unusable yup error into a useable validation object
 * @param {ValidationError} errors Yup validation errors
 * @returns {Record<string, string>} Validation errors
 */
export const transformYupErrorsIntoObject = (errors: ValidationError) => {
  const validationErrors: Record<string, string> = {};

  errors.inner.forEach(({ path, message }) => {
    if (path !== undefined) {
      _set(validationErrors, path, message);
    }
  });

  return validationErrors;
};

const decodeNestedErrors = (errorObj: any, keys: string[]) =>
  keys.reduce(
    (p, val) =>
      p ||
      (typeof _get(errorObj, val, undefined) === 'string' &&
        _get(errorObj, val, undefined)),
    undefined
  );

export const createSchemaValidator = (
  name: string,
  { dataReducerPath }: CreateSchemaValidatorOptions
) => {
  const schemaValidator: any = createAsyncThunk(
    `${name}/validation`,
    async (
      { valSchema, getDataFromState }: SchemaValidatorArgs,
      { getState, rejectWithValue }
    ) => {
      const state = getState();
      const vData = getDataFromState(state);
      try {
        await valSchema.validate(vData, { abortEarly: false });
        return {};
      } catch (error: any) {
        newrelic?.noticeError?.(error.inner);
        return rejectWithValue(transformYupErrorsIntoObject(error));
      }
    }
  );

  return {
    validate: (schema: SchemaValidatorArgs['valSchema']) =>
      schemaValidator({
        valSchema: schema,
        getDataFromState:
          typeof dataReducerPath === 'string'
            ? (state: unknown) => _get(state, dataReducerPath, undefined)
            : dataReducerPath,
      }),
    thunkAction: schemaValidator,
  };
};

// solve api call validation, and how to show error snack bar
export function createErrorSlice<T extends Record<string, string | string[]>>(
  name: string,
  _schema: T,
  validator: Validator
) {
  const { reducer, actions } = createSlice({
    name,
    initialState: {} as Partial<T>,
    reducers: {
      setErrors: (_state, action: PayloadAction<Partial<T>>) => action.payload,
      setFieldError: (
        _state,
        action: PayloadAction<{ key: keyof T; value: string | undefined }>
      ) => {
        const { key, value } = action.payload;
        _set(_state, key, value);
      },
    },
    extraReducers: (builder) => {
      builder.addCase(
        validator.thunkAction.fulfilled,
        (_state, _action) => ({})
      );
      builder.addCase(validator.thunkAction.rejected, (state, action) => {
        Object.entries(_schema).forEach(([key, value], _idx) => {
          const error =
            typeof value === 'string'
              ? _get(action.payload, value, undefined)
              : decodeNestedErrors(action.payload, value);
          _set(state, key, error);
        });
      });
    },
  });
  const reducerKey = name;
  const errorSelectorFn = (state: any) =>
    _get(state, `${errorReducerKey}.${name}`, {}) as Record<keyof T, string>;
  return { reducer: { [reducerKey]: reducer }, errorSelectorFn, actions };
}
