import _get from 'lodash/get';
import _has from 'lodash/has';

import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

export enum PurchasingPurposes {
  customerIsPolicyHolder = 'customer',
  customerIsNotPolicyHolder = 'straw_buyer',
  companyIsPolicyHolder = 'company',
}

export const getPurchasingPurposeOptions = () => [
  {
    label: getString('policyHolderOptions.customerIsPolicyHolder'),
    name: PurchasingPurposes.customerIsPolicyHolder,
    value: PurchasingPurposes.customerIsPolicyHolder,
    key: PurchasingPurposes.customerIsPolicyHolder,
  },
  {
    label: getString('policyHolderOptions.customerIsNotPolicyHolder'),
    name: PurchasingPurposes.customerIsNotPolicyHolder,
    value: PurchasingPurposes.customerIsNotPolicyHolder,
    key: PurchasingPurposes.customerIsNotPolicyHolder,
  },
  {
    label: getString('policyHolderOptions.companyIsPolicyHolder'),
    name: PurchasingPurposes.companyIsPolicyHolder,
    value: PurchasingPurposes.companyIsPolicyHolder,
    key: PurchasingPurposes.companyIsPolicyHolder,
  },
];

export type Schema = {
  editType?: string;
  id: string;
  isEdit?: boolean;
  isEditable: boolean;
  isError: boolean;
  isRequired: boolean;
  name: string;
  title: string;
  value: string | number | undefined;
  options?: any;
  placeholder?: string;
  typeSelect?: string;
};

export const companyAddressPaths = [
  '/customerPolicyAddress/0/companyName',
  '/customerPolicyAddress/0/taxId',
];

export const policyHolderAddressPaths = {
  '/policyHolderFirstName': '/customerPolicyAddress/0/firstName',
  '/policyHolderLastName': '/customerPolicyAddress/0/lastName',
};

const defaultSetFields = {
  customerFirstName: 'policyHolderFirstName',
  customerLastName: 'policyHolderLastName',
  customerDOB: 'policyHolderDOB',
};

const allRemovePaths = [
  'policyHolderFirstName',
  'policyHolderLastName',
  'policyHolderNationalId',
  'policyHolderDOB',
  'numberOfFixedDriver',
  'firstDriverDOB',
  'secondDriverDOB',
  'policyTitle',
];

const conditionalRemovePaths = [
  {
    checkFn: (leadData: Lead['data']) =>
      _has(leadData, 'customerPolicyAddress[0].companyName'),
    removePath: '/customerPolicyAddress/0/companyName',
  },
  {
    checkFn: (leadData: Lead['data']) =>
      _has(leadData, 'customerPolicyAddress[0].taxId'),
    removePath: '/customerPolicyAddress/0/taxId',
  },
];

interface APIPayload {
  op: 'add' | 'remove';
  path: string;
  value?: any;
}

export const getDefaultSetFields = (
  leadData: any,
  purchasingPurpose: string
): APIPayload[] => {
  if (purchasingPurpose === PurchasingPurposes.customerIsPolicyHolder) {
    return Object.keys(defaultSetFields)
      .filter((key: string) => leadData[key])
      .map((key: string) => ({
        op: 'add',
        path: `/${defaultSetFields[key as keyof typeof defaultSetFields]}`,
        value: leadData[key],
      }));
  }
  return [];
};

export const getPolicyHolderNamesPayload = (
  path: string,
  value: any,
  op: 'add' | 'remove'
) => {
  const basePayload: APIPayload[] = [{ op, path, value }];
  if (Object.keys(policyHolderAddressPaths).includes(path)) {
    basePayload.push({
      op: 'add',
      path: policyHolderAddressPaths[
        path as keyof typeof policyHolderAddressPaths
      ],
      value,
    });
  }
  return basePayload;
};
