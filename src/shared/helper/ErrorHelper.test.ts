import {
  generateErrorMessage,
  handleGenericStructureError,
} from './ErrorHelper';

describe('handleGenericStructureError', () => {
  it('should return formatted error message', () => {
    const response = handleGenericStructureError([
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'field is required',
          field: 'DeliveryOption',
          rule: 'required',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'lead data is invalid',
          field: 'lead',
          rule: 'invalid',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'sum_insured_max must be greater than sum_insured_min',
          field: 'sum_insured_max',
          rule: 'greaterThan.sum_insured_min',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'sum_insured_min must be less than sum_insured_max',
          field: 'sum_insured_min',
          rule: 'lessThan.sum_insured_max',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'locale not found',
          field: 'locale',
          rule: 'notFound',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'Only Agent can convert lead to order',
          field: 'lead',
          rule: 'userIsNotAgent',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'no successful transaction/charges for the lead.',
          field: 'leadTransaction',
          rule: 'notFound',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'no transaction snapshot for the lead.',
          field: 'leadTransactionSnapshot',
          rule: 'notFound',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'something new error',
          field: 'some new field',
          rule: 'somethingNew',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {
          detail: 'field is required',
          field: 'package',
          rule: 'required',
        },
      },
      {
        '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
        reason: 'REQUEST_VALIDATION_ERROR',
        metadata: {},
      },
    ]);
    expect(response).toEqual([
      'errors.greaterThan',
      'errors.lessThan',
      'errors.notAgent',
      'errors.leadTransactionNotFound',
      'errors.leadTransactionSnapshotNotFound',
      'something new error',
      'errors.packageMissing',
      'clipboard.apiFailure',
      'errors.missingRequiredFields',
      'errors.invalidValueForFields',
      'errors.notFoundFields',
    ]);
  });

  it('should return formatted error message', () => {
    const response = handleGenericStructureError([
      {
        '@type': 'Fake @type',
        reason: 'RESOURCE_NOT_FOUND',
        metadata: {
          detail: 'fake detail',
          field: 'fake field',
          rule: 'fakeRule',
        },
      },
    ]);
    expect(response).toEqual(['fake detail']);
  });

  it('should return default error message', () => {
    const response = handleGenericStructureError([
      {
        '@type': 'Fake @type',
        reason: 'INTERNAL_ERROR',
        metadata: {
          detail: 'fake detail',
          field: 'fake field',
          rule: 'fakeRule',
        },
      },
    ]);
    expect(response).toEqual(['errorMessage.generalErrorMessage']);
  });
});

describe('generateErrorMessage', () => {
  it('should return errors.resourceNotFound when RESOURCE_NOT_FOUND and metadata.detail is missing', () => {
    const result = generateErrorMessage({
      '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
      reason: 'RESOURCE_NOT_FOUND',
      metadata: {},
    });
    expect(result).toBe('errors.resourceNotFound');
  });

  it('should return metadata.detail when RESOURCE_NOT_FOUND and metadata.detail is present', () => {
    const result = generateErrorMessage({
      '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
      reason: 'RESOURCE_NOT_FOUND',
      metadata: {
        detail: 'The requested resource was not found.',
      },
    });
    expect(result).toBe('The requested resource was not found.');
  });

  it('should return errorMessage.generalErrorMessage for unknown reason (default branch)', () => {
    const result = generateErrorMessage({
      '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
      reason: 'UNKNOWN_ERROR',
      metadata: {
        detail: 'some detail',
      },
    });
    expect(result).toBe('errorMessage.generalErrorMessage');
  });
});
