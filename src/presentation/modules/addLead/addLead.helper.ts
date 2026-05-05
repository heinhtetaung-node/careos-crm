import {
  ADD_LEAD_SCHEMA_ID,
  LEAD_TYPE,
  LEAD_STATUS,
  ADD_HEALTH_LEAD_SCHEMA_ID,
} from 'shared/constants';
import { formatE164 } from 'shared/helper/utilities';

import { ProductTypeFilter } from '../../../config/TypeFilter';

export interface ISelect {
  id?: number | string;
  title?: string;
  value?: string;
  source?: string;
  name?: string;
}

export interface IFormValue {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  product: string;
  source: ISelect;
  reference: string;
  fixedDriver: number;
}
export const PAGE_SIZE_GET_SOURCE = 1000;

/** Lead source display name that should not appear in dropdown options (e.g. Add lead, Import). */
export const LEAD_SOURCE_EXCLUDED_FROM_OPTIONS = 'Change - Online';

/** Map API sources to dropdown options, excluding LEAD_SOURCE_EXCLUDED_FROM_OPTIONS. */
export function getLeadSourceOptions(
  sources: Array<{ source?: string; name?: string }>
): ISelect[] {
  if (!sources?.length) return [];

  const excluded = LEAD_SOURCE_EXCLUDED_FROM_OPTIONS.toLowerCase();

  return sources
    .filter((item) => {
      const source = item.source?.toLowerCase();
      return !source || !source.includes(excluded);
    })
    .map((item) => ({
      id: item.source ?? item.name ?? crypto.randomUUID(),
      title: item.source ?? '',
      value: item.name ?? '',
      source: item.source ?? '',
      name: item.name ?? '',
    }));
}

export const firstProduct = ProductTypeFilter[0].value;
export const addLeadInitialValue = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  product: firstProduct,
  reference: '',
  source: {},
  fixedDriver: 0,
};

export const inputNumberOnly = (event: KeyboardEvent) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

export const inputAlphaNumericOnly = (event: KeyboardEvent) => {
  if (!/^[a-zA-Z0-9 ]*$/.test(event.key)) {
    event.preventDefault();
  }
};

export const customFormValue = (formValue: IFormValue) => {
  // INFO: after that, need to get schema id from api
  const phoneDefaultStatus = 'unverified';
  return {
    schema: ADD_LEAD_SCHEMA_ID,
    data: {
      customerFirstName: formValue?.firstName?.trim() ?? '',
      customerLastName: formValue?.lastName?.trim() ?? '',
      customerPhoneNumber: [
        {
          phone: formatE164(formValue?.phone?.trim()),
          status: phoneDefaultStatus,
        },
      ],
      primaryPhoneIndex: 0,
      customerEmail: formValue.email ? [formValue.email.trim()] : [],
      customerPolicyAddress: [],
      customerShippingAddress: [],
      customerBillingAddress: [],
      numberOfFixedDriver: formValue.fixedDriver,
      locale: 'th-th',
    },
    type: LEAD_TYPE.NEW,
    reference: formValue?.reference?.trim() ?? '',
    source: formValue.source.value,
  };
};

export const healthCustomFormValue = (formValue: IFormValue) => {
  // INFO: after that, need to get schema id from api
  const phoneDefaultStatus = 'unverified';
  return {
    schema: ADD_HEALTH_LEAD_SCHEMA_ID,
    data: {
      customer: {
        firstName: formValue?.firstName?.trim() ?? '',
        lastName: formValue?.lastName?.trim() ?? '',
        phoneNumbers: [
          {
            phone: formatE164(formValue?.phone?.trim()),
            status: phoneDefaultStatus,
          },
        ],
        emails: formValue.email ? [formValue.email.trim()] : [],
        primaryPhoneIndex: 0,
      },
      locale: 'th-th',
      checkout: {},
    },
    type: LEAD_TYPE.NEW,
    reference: formValue?.reference?.trim() ?? '',
    status: LEAD_STATUS.NEW,
    source: formValue.source.value,
  };
};
