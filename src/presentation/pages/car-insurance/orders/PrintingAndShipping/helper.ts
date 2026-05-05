import { makeStyles } from '@material-ui/core';
import _isObject from 'lodash/isObject';
import _omitBy from 'lodash/omitBy';
import * as Yup from 'yup';

import { PhoneCountryCode } from 'data/gateway/api/resource/leadSearch';
import { getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';
import { utcToZonedTime, isValid, format } from 'utils/datetime';

export type PolicySearchResponse = {
  items: PolicyItem[];
  total: number;
};

export type PolicyItem = {
  name: string;
  orderId: string;
  policyId: string;
  insuranceCategory: string;
  productType: string;
  insurer: string;
  customerPolicyholder: string;
  phoneNumber: string;
  email: string;
  licensePlate: string;
  totalPremium: number;
  paymentType: string;
  paymentStatus: string;
  documentStatus: string;
  qcStatus: string;
  submissionStatus: string;
  approvalStatus: string;
  printingAndShippingStatus: string;
  policyStartDate: string;
  createdOn: string;
  updatedOn: string;
};

export const useStyleClasses = makeStyles(() => ({
  root: {
    '& .MuiAutocomplete-root': {
      height: '100%',
    },
    '& .MuiAutocomplete-root, & .MuiFormControl-root.MuiTextField-root, & .MuiInputBase-root.MuiOutlinedInput-root':
      {
        height: '42px',
      },
  },
  formControl: {
    '& .MuiInputBase-root.MuiInput-root.MuiInputBase-formControl': {
      marginTop: 0,
    },
  },
  hideLabel: {
    '& .MuiFormControl-root.MuiTextField-root label.MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl':
      {
        display: 'none',
      },
  },
  normalizeBorderRadius: {
    '& .calendar-date-range .MuiInputBase-root.MuiInput-root.MuiInputBase-formControl.MuiInput-formControl':
      {
        borderRadius: '4px',
      },
  },
  overwriteFormDatePosition: {
    '&.calendar-date-range .form-date': {
      '@media screen and (max-width: 1440px)': {
        left: 0,
      },
    },
  },
}));

export const getShippingFilter = (filters: any) => {
  const queryMap = Object.entries(filters)
    .map(([searchBy, payload]: [any, any]) => {
      if (searchBy === 'insuranceApprovedOn') {
        const { endDate, startDate } = payload;
        return `items[].approvalTime>="${new Date(startDate).toISOString()}" items[].approvalTime<="${new Date(endDate).toISOString()}"`;
      }
      if (searchBy === 'insuranceType')
        return `items[].motorItemType="${payload.value}"`;

      if (searchBy === 'insuranceCompany')
        return `items[].insurer="${payload.value}"`;

      if (searchBy === 'preferredDeliveryOption') {
        const payloadValue =
          payload.value === ShipmentProviders.EMAIL
            ? ShipmentProviders.EMAIL
            : payload.value;
        return `order.data.deliveryOption="${payloadValue}"`;
      }

      if (searchBy === 'paymentStatus')
        return `order.isFullyPaid="${payload.value}"`;

      if (searchBy === 'searchBy') {
        const isPreFixQuery =
          payload.searchBy.endsWith('fullName') ||
          payload.searchBy === 'order.data.carLicensePlate.text';
        const separator = isPreFixQuery ? ':' : '=';
        const phoneMissedCode =
          payload.searchBy === 'customerPhones[].phone' &&
          payload.searchTerm.charAt(0) === '0';
        const searchValue = phoneMissedCode
          ? PhoneCountryCode.thai + payload.searchTerm.substring(1)
          : payload.searchTerm;

        return `${payload.searchBy}${separator}"${searchValue}"`;
      }
      return payload.value;
    })
    .filter(Boolean);

  const filter = queryMap.length > 0 ? queryMap.join(' ') : '';
  return filter ?? '';
};

type FilterFormInitialValues = ReturnType<typeof getFilterFormInitialValues>;

export const getFilterFormInitialValues = () => ({
  insuranceCompany: null,
  policyDocument: null,
  preferredDeliveryOption: null,
  searchBy: {
    searchBy: 'order.humanId',
    searchTerm: '',
  },
  insuranceType: null,
  insuranceApprovedOn: {
    startDate: undefined,
    endDate: undefined,
  },
  shipmentStatus: null,
  paymentStatus: null,
});

export const omitUninterestedFilterValues = (
  values: FilterFormInitialValues
) => {
  const filteredValues = _omitBy(values, (value) => {
    if (_isObject(value)) {
      // eslint-disable-next-line eqeqeq
      return Object.values(value).some((val) => val == undefined || val === '');
    }
    return !value;
  });

  return filteredValues;
};

const maxLength = 255;
const validateName = () =>
  Yup.string()
    .matches(/^[A-Za-z\u0E00-\u0E7F ]*$/, getString('errors.invalidValue'))
    .trim()
    .max(255, getString('errors.exceedCharacters', { maxLength }));

const validatePolicyId = () =>
  Yup.string()
    .matches(/^[a-zA-Z0-9-_]+$/g, getString('errors.invalidValue'))
    .trim()
    .max(255, getString('errors.exceedCharacters', { maxLength }));

const validateOrderId = () =>
  Yup.string()
    .matches(/^[a-zA-Z0-9]+$/g, getString('errors.invalidValue'))
    .trim()
    .max(255, getString('errors.exceedCharacters', { maxLength }));

const validateLicense = () =>
  Yup.string()
    .matches(
      /^([a-zA-Z\u0E00-\u0E7F0-9- ]+)*$/g,
      getString('errors.invalidValue')
    )
    .trim()
    .max(255, getString('errors.exceedCharacters', { maxLength }));

const validatePhone = () =>
  Yup.string()
    .matches(
      /((^(02)\d{7,8}$)|(^(08|09|06)\d{8}$))/g,
      getString('errors.invalidValue')
    )
    .trim()
    .required(getString('errorMessage.inputInvalid'));

const filterSchema = Yup.object().shape({
  search: Yup.object().shape({
    key: Yup.string(),
    value: Yup.mixed()
      .when('policyHolderName', {
        is: true,
        then: validateName,
      })
      .when('customerPhone', {
        is: true,
        then: validatePhone,
      })
      .when('customerEmail', {
        is: true,
        then: () =>
          Yup.string()
            .max(255, getString('errors.exceedCharacters', { maxLength }))
            .email(getString('errors.invalidValue'))
            .trim(),
      })
      .when('licensePlate', {
        is: true,
        then: validateLicense,
      })
      .when('orderId', {
        is: true,
        then: validateOrderId,
      })
      .when('policyId', {
        is: true,
        then: validatePolicyId,
      }),
  }),
});

export default filterSchema;

export const formatDateTime = (time: any) =>
  isValid(new Date(time))
    ? format(utcToZonedTime(new Date(time), 'UTC'), 'dd/MM/yyyy (HH:mm:ss)')
    : '';
