import _camelCase from 'lodash/camelCase';
import _has from 'lodash/has';

import { getString, checkKeyExist } from 'presentation/theme/localization';

interface MetadataInterface {
  detail?: string;
  field?: string;
  rule?: string;
  resource?: string;
  serviceFailure?: string;
}

interface ErrorMessageInterface {
  '@type': string;
  reason: string;
  metadata: MetadataInterface;
}

const ERRORS = {
  REQUEST_VALIDATION_ERROR: 'REQUEST_VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  NOT_ALLOW_PURCHASE_NEED_PAYMENT: 'NOT_ALLOW_PURCHASE_NEED_PAYMENT',
};

const fieldKeyValue: Record<string, string> = {
  deliveryOption: 'text.deliveryOptions',
  documents: 'lead.document',
  policyHolderType: 'text.policyHolderInformation',
  customerFirstName: 'leadDetailFields.firstName',
  customerLastName: 'leadDetailFields.lastName',
  customerDOB: 'leadDetailFields.dob',
  policyTitle: 'leadDetailFields.title',
  policyHolderFirstName: 'leadDetailFields.firstName',
  policyHolderLastName: 'leadDetailFields.lastName',
  policyHolderNationalId: 'leadDetailFields.nationalIdPassport',
  policyHolderDOB: 'leadDetailFields.dob',
  customerEmail: 'text.email',
  customerGender: 'leadDetailFields.gender',
  registeredProvince: 'leadDetailFields.province',
  carColor: 'leadDetailFields.vehicleColor',
  carLicensePlate: 'leadDetailFields.licensePlate',
  vehicleIdNumber: 'leadDetailFields.vehicleIdNumber',
  chassisNumber: 'leadDetailFields.chassisNumber',
  policyStartDate: 'leadDetailFields.voluntaryPolicyStartDate',
  compulsoryPolicyStartDate: 'leadDetailFields.compulsoryPolicyStartDate',
  numberOfFixedDriver: 'leadDetailFields.fixedDriver',
  firstDriverFirstName: 'leadDetailFields.firstDriverFirstName',
  firstDriverLastName: 'leadDetailFields.firstDriverLastName',
  secondDriverFirstName: 'leadDetailFields.secondDriverFirstName',
  secondDriverLastName: 'leadDetailFields.secondDriverLastName',
  locale: 'leadDetailFields.language',
  carSubModelYear: 'leadDetailFields.vehicleSubModelYear',
  documentsIdCard: 'leadDetailFields.idCard',
  documentsVehicleRegistration: 'leadDetailFields.vehicleRegistration',
  companyName: 'leadDetailFields.companyName',
  taxID: 'leadDetailFields.taxId',
  customerBillingAddress: 'addressModal.titleBillingAddress',
  customerPolicyAddress: 'addressModal.titlePolicyAddress',
  customerShippingAddress: 'addressModal.titleShipmentAddress',
  firstDriverDOB: 'leadDetailFields.firstDriverDob',
  firstDriverLicense: 'leadDetailFields.firstDriverLicense',
  secondDriverLicense: 'leadDetailFields.secondDriverLicense',
  voluntaryPolicyStartDate: 'leadDetailFields.voluntaryPolicyStartDate',
  mandatoryPolicyStartDate: 'leadDetailFields.compulsoryPolicyStartDate',
};

function getFieldTranslation(fields: string[]) {
  const translatedFields: string[] = [];
  fields.forEach((field: string) => {
    let fieldName = field;
    if (checkKeyExist(fieldKeyValue[_camelCase(field)])) {
      fieldName = getString(fieldKeyValue[_camelCase(field)]);
    }
    translatedFields.push(fieldName);
  });
  return translatedFields;
}

function handleGreaterLessRule(
  error: ErrorMessageInterface,
  ruleType: 'greaterThan' | 'lessThan'
) {
  if (_has(error, 'metadata.rule')) {
    const ruleArray = error.metadata.rule?.split('.');

    const fieldOne = fieldKeyValue[_camelCase(error?.metadata?.field)];
    const fieldTwo = ruleArray
      ? fieldKeyValue[_camelCase(ruleArray[ruleArray.length - 1])]
      : '';

    const errorMessage = getString(`errors.${ruleType}`, {
      fieldOne: checkKeyExist(fieldOne)
        ? getString(fieldOne)
        : error?.metadata?.field,
      fieldTwo: checkKeyExist(fieldTwo) ? getString(fieldTwo) : '',
    });
    return errorMessage;
  }
  return getString('clipboard.apiFailure');
}

function handleGenericStructureError(errors: ErrorMessageInterface[]) {
  if (!errors || errors.length === 0)
    return [getString('clipboard.apiFailure')];

  const errorMessages: string[] = [];
  const requiredFields: string[] = [];
  const notFoundFields: string[] = [];
  const invalidValueFields: string[] = [];

  errors.forEach((error: ErrorMessageInterface) => {
    switch (error?.reason) {
      case ERRORS.NOT_ALLOW_PURCHASE_NEED_PAYMENT:
        errorMessages.push(getString('errors.notAllowedPurchargeNeedPayment'));
        break;
      case ERRORS.REQUEST_VALIDATION_ERROR:
        if (
          error?.metadata?.rule?.includes('required') &&
          error?.metadata?.field
        ) {
          if (error.metadata.field === 'package') {
            errorMessages.push(getString('errors.packageMissing'));
          } else {
            requiredFields.push(error.metadata.field);
          }
        } else if (
          error?.metadata?.rule?.includes('invalid') &&
          error?.metadata?.field
        ) {
          invalidValueFields.push(error.metadata.field);
        } else if (
          error?.metadata?.rule?.includes('greaterThan') &&
          error?.metadata?.field
        ) {
          const errorMessage = handleGreaterLessRule(error, 'greaterThan');
          errorMessages.push(errorMessage);
        } else if (
          error?.metadata?.rule?.includes('lessThan') &&
          error?.metadata?.field
        ) {
          const errorMessage = handleGreaterLessRule(error, 'lessThan');
          errorMessages.push(errorMessage);
        } else if (
          error?.metadata?.rule?.includes('notFound') &&
          error?.metadata?.field
        ) {
          if (error.metadata.field === 'leadTransaction') {
            errorMessages.push(getString('errors.leadTransactionNotFound'));
          } else if (error.metadata.field === 'leadTransactionSnapshot') {
            errorMessages.push(
              getString('errors.leadTransactionSnapshotNotFound')
            );
          } else {
            notFoundFields.push(error.metadata.field);
          }
        } else if (
          error?.metadata?.rule?.includes('userIsNotAgent') &&
          error?.metadata?.field
        ) {
          errorMessages.push(getString('errors.notAgent'));
        } else {
          errorMessages.push(
            error.metadata?.detail ?? getString('clipboard.apiFailure')
          );
        }
        break;
      case ERRORS.RESOURCE_NOT_FOUND:
        errorMessages.push(
          error.metadata?.detail ?? getString('errors.resourceNotFound')
        );
        break;
      default:
        errorMessages.push(getString('errorMessage.generalErrorMessage'));
    }
  });

  if (requiredFields.length) {
    errorMessages.push(
      getString('errors.missingRequiredFields', {
        fields: getFieldTranslation(requiredFields).join(', '),
        count: requiredFields.length,
      })
    );
  }

  if (invalidValueFields.length) {
    errorMessages.push(
      getString('errors.invalidValueForFields', {
        fields: getFieldTranslation(invalidValueFields).join(', '),
        count: invalidValueFields.length,
      })
    );
  }

  if (notFoundFields.length) {
    errorMessages.push(
      getString('errors.notFoundFields', {
        fields: getFieldTranslation(notFoundFields).join(', '),
      })
    );
  }

  return errorMessages;
}

function generateErrorMessage(error: ErrorMessageInterface) {
  switch (error?.reason) {
    case ERRORS.REQUEST_VALIDATION_ERROR:
      if (
        error.metadata.field === 'lead' &&
        error.metadata.rule === 'invalid_uuid.lead'
      ) {
        return getString('errors.leadMissingInvalid');
      }

      if (
        error.metadata.field === 'product_type' &&
        error.metadata.rule === 'required.product_type'
      ) {
        return getString('errors.productTypeMissing');
      }

      if (
        error.metadata.field === 'sum_insured_max' &&
        error.metadata.rule === 'less_than.sum_insured_max'
      ) {
        return getString('errors.minGreaterMax');
      }

      return error.metadata?.detail ?? getString('clipboard.apiFailure');
    case ERRORS.RESOURCE_NOT_FOUND:
      return error.metadata?.detail ?? getString('errors.resourceNotFound');
    default:
      return getString('errorMessage.generalErrorMessage');
  }
}

export { generateErrorMessage, handleGenericStructureError, ERRORS };
