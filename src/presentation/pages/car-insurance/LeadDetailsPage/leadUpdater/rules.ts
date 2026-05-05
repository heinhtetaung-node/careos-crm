import _has from 'lodash/has';

import { AddressType } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';

import { ExternalRules, UpdateRule } from './updateRules';

import { HealthLead, Lead } from 'shared/types/lead';
import { PurchasingPurposes } from '../CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';

export const OldUpdateRules: UpdateRule[] = [
  {
    name: 'Clear checkout if car data change',
    catchParams: [
      '/carSubModelYear',
      '/carModified',
      '/carDashCam',
      '/carUsageType',
      '/registeredProvince',
      '/currentInsurer',
      '/insuranceKind',
    ],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) => Boolean(lead.data?.checkout?.package),
        path: '/checkout/package',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.checkout?.installments),
        path: '/checkout/installments',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.checkout?.paymentOption),
        path: '/checkout/paymentOption',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.checkout?.paymentMethod),
        path: '/checkout/paymentMethod',
        op: 'remove',
        value: () => null,
      },
    ],
  },
];

const isCompanyPolicyHolderWithAddress = (
  lead: Lead,
  value: PurchasingPurposes,
  addressKey:
    | 'customerPolicyAddress'
    | 'customerShippingAddress'
    | 'customerBillingAddress' = 'customerPolicyAddress'
) =>
  value === PurchasingPurposes.companyIsPolicyHolder &&
  (lead.data?.[addressKey]?.length ?? 0) > 0;

const isPurchased = (lead: Lead) => lead?.status === 'LEAD_STATUS_PURCHASED';

export const UpdateRules: UpdateRule[] = [
  {
    name: 'Clear checkout if something that invalidate the package change',
    catchParams: [
      '/carSubModelYear',
      '/carModified',
      '/carDashCam',
      '/carUsageType',
      '/registeredProvince',
      '/currentInsurer',
      '/insuranceKind',
    ],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          Boolean(lead.data?.checkout?.package) &&
          !lead.data?.checkout?.package?.startsWith('renewalPackages') &&
          !isPurchased(lead),
        path: '/checkout/package',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) =>
          Boolean(lead.data?.checkout?.installments) &&
          !lead.data?.checkout?.package?.startsWith('renewalPackages'),
        path: '/checkout/installments',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) =>
          Boolean(lead.data?.checkout?.paymentOption) &&
          !lead.data?.checkout?.package?.startsWith('renewalPackages'),
        path: '/checkout/paymentOption',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) =>
          Boolean(lead.data?.checkout?.paymentMethod) &&
          !lead.data?.checkout?.package?.startsWith('renewalPackages'),
        path: '/checkout/paymentMethod',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Reset checkout data',
    catchParams: ['/checkout/package'],
    catchOp: 'remove',
    updates: [
      {
        condition: (lead) => Boolean(lead.data?.checkout?.installments),
        path: '/checkout/installments',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.checkout?.paymentOption),
        path: '/checkout/paymentOption',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.checkout?.paymentMethod),
        path: '/checkout/paymentMethod',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Update policy holder first name and address if customer is policyholder',
    catchParams: ['/customerFirstName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolderFirstName',
        op: 'add',
        value: (lead, value) => value,
      },
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/firstName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder lastname and address if customer is policyholder',
    catchParams: ['/customerLastName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolderLastName',
        op: 'add',
        value: (lead, value) => value,
      },
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/lastName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder DOB if customer is policyholder',
    catchParams: ['/customerDOB'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolderDOB',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Reset policy holder information everytime policyHolderType change',
    catchParams: ['/policyHolderType'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) => Boolean(lead.data?.policyTitle),
        path: '/policyTitle',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderFirstName),
        path: '/policyHolderFirstName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderLastName),
        path: '/policyHolderLastName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderNationalId),
        path: '/policyHolderNationalId',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderDOB),
        path: '/policyHolderDOB',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) =>
          _has(lead.data, 'customerPolicyAddress[0].companyName'),
        path: '/customerPolicyAddress/0/companyName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => _has(lead.data, 'customerPolicyAddress[0].taxId'),
        path: '/customerPolicyAddress/0/taxId',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Set customer data to policy holder info if customer is policyHolder',
    catchParams: ['/policyHolderType'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerFirstName),
        path: '/policyHolderFirstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerLastName),
        path: '/policyHolderLastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerDOB),
        path: '/policyHolderDOB',
        op: 'add',
        value: (lead) => lead.data?.customerDOB,
      },
    ],
  },
  {
    name: 'Adjust address type if policyHolderType change',
    catchParams: ['/policyHolderType'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/companyName',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/companyName',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          isCompanyPolicyHolderWithAddress(
            lead,
            value,
            'customerBillingAddress'
          ),
        path: '/customerBillingAddress/0/companyName',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          isCompanyPolicyHolderWithAddress(lead, value),
        path: '/customerPolicyAddress/0/taxId',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/taxId',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/taxId',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          isCompanyPolicyHolderWithAddress(lead, value),
        path: '/customerPolicyAddress/0/addressType',
        op: 'add',
        value: () => AddressType.COMPANY,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerShippingAddress?.length > 0,
        path: '/customerShippingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.COMPANY,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerBillingAddress?.length > 0,
        path: '/customerBillingAddress/0/addressType',
        op: 'add',
        value: () => AddressType.COMPANY,
      },
    ],
  },
  {
    name: 'Update policyAddress firstName if customer is not policy holder',
    catchParams: ['/policyHolderFirstName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/firstName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policyAddress lastName if customer is not policy holder',
    catchParams: ['/policyHolderLastName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/customerPolicyAddress/0/lastName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },

  // check the logic here
  {
    name: 'Update fixed driver details if noOfFixedDriver changes',
    catchParams: ['/numberOfFixedDriver'],
    catchOp: 'add',
    updates: [
      // First fixed driver
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverFirstName'),
        path: '/firstDriverFirstName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverLastName'),
        path: '/firstDriverLastName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverDOB'),
        path: '/firstDriverDOB',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverPassport'),
        path: '/firstDriverPassport',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverNationalId'),
        path: '/firstDriverNationalId',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          value === 0 && _has(lead, 'data.firstDriverLicense'),
        path: '/firstDriverLicense',
        op: 'remove',
        value: () => null,
      },
      // second fixed driver
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) &&
          _has(lead, 'data.secondDriverFirstName'),
        path: '/secondDriverFirstName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) &&
          _has(lead, 'data.secondDriverLastName'),
        path: '/secondDriverLastName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) && _has(lead, 'data.secondDriverDOB'),
        path: '/secondDriverDOB',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) &&
          _has(lead, 'data.secondDriverPassport'),
        path: '/secondDriverPassport',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) &&
          _has(lead, 'data.secondDriverNationalId'),
        path: '/secondDriverNationalId',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead, value) =>
          (value === 1 || value === 0) &&
          _has(lead, 'data.secondDriverLicense'),
        path: '/secondDriverLicense',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Update firstDriverPassport when firstDriverNationalId is added',
    catchParams: ['/firstDriverNationalId'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value && _has(lead, 'data.firstDriverPassport'),
        path: '/firstDriverPassport',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Update firstDriverNationalId when firstDriverPassport is added',
    catchParams: ['/firstDriverPassport'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value && _has(lead, 'data.firstDriverNationalId'),
        path: '/firstDriverNationalId',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Update secondDriverPassport when secondDriverNationalId is added',
    catchParams: ['/secondDriverNationalId'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value && _has(lead, 'data.secondDriverPassport'),
        path: '/secondDriverPassport',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Update secondDriverNationalId when secondDriverPassport is added',
    catchParams: ['/secondDriverPassport'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value && _has(lead, 'data.secondDriverNationalId'),
        path: '/secondDriverNationalId',
        op: 'remove',
        value: () => null,
      },
    ],
  },
];
export const HealthUpdateRules: UpdateRule[] = [
  UpdateRules[0],
  UpdateRules[1],
  {
    name: 'Update policy holder first name and address if customer is policyholder',
    catchParams: ['/customer/firstName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/firstName',
        op: 'add',
        value: (lead, value) => value,
      },
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/firstName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder lastname and address if customer is policyholder',
    catchParams: ['/customer/lastName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/lastName',
        op: 'add',
        value: (lead, value) => value,
      },
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/lastName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder DOB if customer is policyholder',
    catchParams: ['/customer/dob'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/dob',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder first name and address if customer is policyholder',
    catchParams: ['/customer/isThaiNational'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/locale',
        op: 'add',
        value: (lead, value) => (value === true ? 'th-th' : 'th-en'),
      },
    ],
  },
  {
    name: 'Update policy holder title if customer is policyholder',
    catchParams: ['/customer/title'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/title',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder gender if customer is policyholder',
    catchParams: ['/customer/gender'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/gender',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder nationalId if customer is policyholder',
    catchParams: ['/customer/nationalId'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/nationalId',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder weight if customer is policyholder',
    catchParams: ['/customer/weight'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/weight',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder height if customer is policyholder',
    catchParams: ['/customer/height'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/height',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policy holder occupation if customer is policyholder',
    catchParams: ['/customer/occupation'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
          PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/occupation',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Reset policy holder information everytime policyHolderType change',
    catchParams: ['/policyHolder/type'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) => Boolean(lead.data?.policyTitle),
        path: '/policyHolder/title',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderFirstName),
        path: '/policyHolder/firstName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderLastName),
        path: '/policyHolder/lastName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderNationalId),
        path: '/policyHolder/nationalId',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolder?.gender),
        path: '/policyHolder/gender',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolder?.weight),
        path: '/policyHolder/weight',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolder?.height),
        path: '/policyHolder/height',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderDOB),
        path: '/policyHolder/dob',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => Boolean(lead.data?.policyHolderOccupation),
        path: '/policyHolder/occupation',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) =>
          Boolean((lead as unknown as HealthLead).data?.policyHolder?.locale),
        path: '/policyHolder/locale',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => _has(lead.data, 'policyAddress[0].companyName'),
        path: '/policyAddresses/0/companyName',
        op: 'remove',
        value: () => null,
      },
      {
        condition: (lead) => _has(lead.data, 'policyAddresses[0].taxId'),
        path: '/policyAddresses/0/taxId',
        op: 'remove',
        value: () => null,
      },
    ],
  },
  {
    name: 'Set customer data to policy holder info if customer is policyHolder',
    catchParams: ['/policyHolder/type'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerFirstName),
        path: '/policyHolder/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerLastName),
        path: '/policyHolder/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customerDOB),
        path: '/policyHolder/dob',
        op: 'add',
        value: (lead) => lead.data?.customerDOB,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customer?.nationalId),
        path: '/policyHolder/nationalId',
        op: 'add',
        value: (lead) => lead.data?.customer?.nationalId,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean((lead as any as HealthLead).data?.customer?.gender),
        path: '/policyHolder/gender',
        op: 'add',
        value: (lead) => (lead as any as HealthLead).data?.customer?.gender,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean((lead as any as HealthLead).data?.customer?.weight),
        path: '/policyHolder/weight',
        op: 'add',
        value: (lead) => (lead as any as HealthLead).data?.customer?.weight,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean((lead as any as HealthLead).data?.customer?.height),
        path: '/policyHolder/height',
        op: 'add',
        value: (lead) => (lead as any as HealthLead).data?.customer?.height,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean((lead as any as HealthLead).data?.customer?.occupation),
        path: '/policyHolder/occupation',
        op: 'add',
        value: (lead) => (lead as any as HealthLead).data?.customer?.occupation,
      },
      {
        condition: (_lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder,
        path: '/policyHolder/locale',
        op: 'add',
        value: (_lead, value) => (value === true ? 'th-th' : 'th-en'),
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          Boolean(lead.data?.customer?.title),
        path: '/policyHolder/title',
        op: 'add',
        value: (lead) => lead.data?.customer?.title,
      },
    ],
  },
  {
    name: 'Adjust address type if policyHolderType change',
    catchParams: ['/policyHolder/type'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/firstName',
        op: 'add',
        value: (lead) => lead.data?.customerFirstName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/lastName',
        op: 'add',
        value: (lead) => lead.data?.customerLastName ?? '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/firstName',
        op: 'add',
        value: () => 'STRAWBUYER',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/lastName',
        op: 'add',
        value: () => 'STRAWBUYER',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/addressType',
        op: 'add',
        value: () => AddressType.PERSONAL,
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/companyName',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/taxId',
        op: 'add',
        value: () => '',
      },
      {
        condition: (lead, value) =>
          value === PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/addressType',
        op: 'add',
        value: () => AddressType.COMPANY,
      },
    ],
  },
  {
    name: 'Update policyAddress firstName if customer is not policy holder',
    catchParams: ['/policyHolder/firstName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/firstName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
  {
    name: 'Update policyAddress lastName if customer is not policy holder',
    catchParams: ['/policyHolder/lastName'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.customerIsNotPolicyHolder &&
          lead.data?.customerPolicyAddress?.length > 0,
        path: '/policyAddresses/0/lastName',
        op: 'add',
        value: (lead, value) => value,
      },
    ],
  },
];

export const preUpdateRules: UpdateRule[] = [
  {
    name: 'Create an Address if address does not exist and company name, taxid is patched',
    catchParams: [
      '/customerPolicyAddress/0/companyName',
      '/customerPolicyAddress/0/taxId',
    ],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.companyIsPolicyHolder &&
          (!lead.data?.customerPolicyAddress ||
            lead.data?.customerPolicyAddress?.length < 1),
        path: '/customerPolicyAddress',
        op: 'add',
        value: () => [
          {
            addressType: 'company',
            postCode: 0,
            subDistrict: 0,
            district: 0,
            province: 0,
            address: '',
            taxId: '',
            companyName: '',
          },
        ],
      },
    ],
  },
];
export const healthPreUpdateRules: UpdateRule[] = [
  {
    name: 'Create an Address if address does not exist and company name, taxid is patched',
    catchParams: ['/policyAddresses/0/companyName', '/policyAddresses/0/taxId'],
    catchOp: 'add',
    updates: [
      {
        condition: (lead) =>
          lead.data.policyHolderType ===
            PurchasingPurposes.companyIsPolicyHolder &&
          lead.data?.customerPolicyAddress?.length === 0,
        path: '/policyAddresses',
        op: 'add',
        value: () => [
          {
            addressType: 'company',
            postCode: 0,
            subDistrict: 0,
            district: 0,
            province: 0,
            address: '',
            taxId: '',
            companyName: '',
          },
        ],
      },
    ],
  },
];

export const deleteCouponRules: ExternalRules = [
  {
    name: 'Clear voucher if installment plan is more than 1',
    paths: ['/checkout/installments'],
    ops: ['add'],
    condition: (value, lead) =>
      Boolean(lead.data?.checkout?.coupon && (value as number) > 1),
  },
];

export const updateConnectedCustomerRules: ExternalRules = [
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customerFirstName'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ firstName: value }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customerLastName'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ lastName: value }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customerGender'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ gender: (value as string).toUpperCase() }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customerDOB'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ dateOfBirth: new Date(value).toISOString() }),
  },
];
export const updateHealthConnectedCustomerRules: ExternalRules = [
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customer/firstName'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ firstName: value }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customer/lastName'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ lastName: value }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customer/gender'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ gender: (value as string).toUpperCase() }),
  },
  {
    name: 'If customer is connected, update customer data',
    paths: ['/customer/dob'],
    ops: ['add'],
    condition: () => true,
    getValue: (value) => ({ dateOfBirth: new Date(value).toISOString() }),
  },
];
