/* eslint-disable import/prefer-default-export */
import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';

export const policyHolderAddressItems: IFormikControllerProps[] = [
  {
    name: 'mainAddress',
    title: 'addressModal.mainAddress',
    isReadOnly: true,
    display: true,
    fieldType: 'textContent',
  },
  {
    name: 'addressLine',
    title: 'qc.address',
    isReadOnly: true,
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-address-line',
  },
  {
    name: 'province',
    title: 'text.province',
    isReadOnly: true,
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-province',
  },
  {
    name: 'district',
    title: 'text.district',
    isReadOnly: true,
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-distirct',
  },
  {
    name: 'subDistrict',
    title: 'text.subDistrict',
    isReadOnly: true,
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-sub-district',
  },
  {
    name: 'postalCode',
    title: 'text.postcode',
    isReadOnly: true,
    fieldType: 'text',
    display: true,
    dataTestId: 'policy-postal-code',
  },
];
