import * as Yup from 'yup';

import { INSURANCE_KIND } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { getString } from 'presentation/theme/localization';

// eslint-disable-next-line import/prefer-default-export
export const createOrderSchema = (isHealth: boolean = false) =>
  Yup.object().shape({
    data: Yup.object().shape({
      policyHolderType: Yup.string().required(
        getString('errors.requiredFormField')
      ),
      customerFirstName: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) =>
          schema.required(getString('errors.requiredFormField')),
        otherwise: () => Yup.string().notRequired(),
      }),
      customerLastName: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) =>
          schema.required(getString('errors.requiredFormField')),
        otherwise: () => Yup.string().notRequired(),
      }),
      customerDOB: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) =>
          schema.required(getString('errors.requiredFormField')),
        otherwise: () => Yup.string().notRequired(),
      }),
      policyTitle: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) => schema.notRequired(),
        otherwise: () =>
          Yup.string().required(getString('errors.requiredFormField')),
      }),
      policyHolderFirstName: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) => schema.notRequired(),
        otherwise: () =>
          Yup.string().required(getString('errors.requiredFormField')),
      }),
      policyHolderLastName: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) => schema.notRequired(),
        otherwise: () =>
          Yup.string().required(getString('errors.requiredFormField')),
      }),
      policyHolderNationalId: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) => schema.notRequired(),
        otherwise: () =>
          Yup.string().required(getString('errors.requiredFormField')),
      }),
      ...(isHealth
        ? {
            policyHolderOccupation: Yup.string().required(
              getString('errors.requiredFormField')
            ),
            policyHolderRace: Yup.string().when('policyHolderType', {
              is: PurchasingPurposes.customerIsPolicyHolder,
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
          }
        : {}),
      policyHolderDOB: Yup.string().when('policyHolderType', {
        is: PurchasingPurposes.companyIsPolicyHolder,
        then: (schema) => schema.notRequired(),
        otherwise: () =>
          Yup.string().required(getString('errors.requiredFormField')),
      }),
      customerEmail: Yup.array()
        .min(1, getString('errors.requiredFormField'))
        .of(Yup.string())
        .required(getString('errors.requiredFormField')),
      customerGender: Yup.string().required(
        getString('errors.requiredFormField')
      ),
      customerShippingAddress: Yup.array()
        .min(1, getString('errors.requiredFormField'))
        .required(getString('errors.requiredFormField')),
      customerBillingAddress: Yup.array()
        .min(1, getString('errors.requiredFormField'))
        .required(getString('errors.requiredFormField')),
      customerPolicyAddress: Yup.array()
        .min(1, getString('errors.requiredFormField'))
        .of(
          Yup.object().shape({
            companyName: Yup.string().when('addressType', {
              is: 'company',
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
            }),
            taxId: Yup.string().when('addressType', {
              is: 'company',
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
            }),
            firstName: Yup.string().when('addressType', {
              is: 'company',
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
            lastName: Yup.string().when('addressType', {
              is: 'company',
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
          })
        ),
      checkout: Yup.object().shape({
        installments: Yup.number().required(
          getString('errors.requiredFormField')
        ),
        package: Yup.string().required(getString('errors.requiredFormField')),
        deliveryOption: Yup.string().notRequired(),
      }),
      ...(!isHealth
        ? {
            policyStartDate: Yup.string().when('insuranceKind', {
              is: INSURANCE_KIND.VOLUNTARY,
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
              otherwise: () => Yup.string().notRequired(),
            }),
            registeredProvince: Yup.number().required(
              getString('errors.requiredFormField')
            ),
            carColor: Yup.array()
              .of(Yup.string())
              .min(1, getString('errors.requiredFormField'))
              .required(getString('errors.requiredFormField')),
            carLicensePlate: Yup.string().required(
              getString('errors.requiredFormField')
            ),
            vehicleIdNumber: Yup.string().required(
              getString('errors.requiredFormField')
            ),
            chassisNumber: Yup.string().required(
              getString('errors.requiredFormField')
            ),
            compulsoryPolicyStartDate: Yup.string().when('insuranceKind', {
              is: INSURANCE_KIND.VOLUNTARY,
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
            numberOfFixedDriver: Yup.number().required(
              getString('errors.requiredFormField')
            ),
            firstDriverDOB: Yup.string().when('numberOfFixedDriver', {
              is: 0,
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
            firstDriverFirstName: Yup.string().when('numberOfFixedDriver', {
              is: 0,
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
            firstDriverLastName: Yup.string().when('numberOfFixedDriver', {
              is: 0,
              then: (schema) => schema.notRequired(),
              otherwise: () =>
                Yup.string().required(getString('errors.requiredFormField')),
            }),
            secondDriverDOB: Yup.string().when('numberOfFixedDriver', {
              is: 2,
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
              otherwise: () => Yup.string().notRequired(),
            }),
            secondDriverFirstName: Yup.string().when('numberOfFixedDriver', {
              is: 2,
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
              otherwise: () => Yup.string().notRequired(),
            }),
            secondDriverLastName: Yup.string().when('numberOfFixedDriver', {
              is: 2,
              then: (schema) =>
                schema.required(getString('errors.requiredFormField')),
              otherwise: () => Yup.string().notRequired(),
            }),
          }
        : {
            policyStartDate: Yup.string().required(
              getString('errors.requiredFormField')
            ),
          }),
    }),
  });
