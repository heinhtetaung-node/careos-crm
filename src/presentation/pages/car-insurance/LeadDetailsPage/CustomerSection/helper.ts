import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import _isEmpty from 'lodash/isEmpty';
import React from 'react';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 } from 'uuid';

import { StatusLeadAll } from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';
import { differenceInYears, format, isValid } from 'utils/datetime';

export const changeFixedDriver = new BehaviorSubject<number | null>(null);
export const changeFixedDriver$ = changeFixedDriver.asObservable();

export interface ILeadData {
  customerFirstName: string;
  customerLastName: string;
  status: string;
  gender: string;
  customerDOB: string;
  age: number | null;
  customerProvince: string;
  customerCity: string;
  customerReference: string;
  leadType: string;
  leadReference: string;
  leadParent: string;
  name: string;
  isRejected: boolean;
  reference?: string | null;
  agentName?: string;
}
export interface ICustomerData {
  lead: ILeadData;
  customer?: any;
  policyHolder?: any;
  leadInfo?: any;
}
export interface CustomerSectionProps {
  isFieldDisabled?: boolean;
  isPendingRejection?: boolean;
  isPartiallyDisabled?: boolean;
}

export const INITIAL_STATUS_VALUE = null;
export const dateOfBirth = new Date('1989-02-02T17:00:00.000Z');

export enum EDIT_TYPE {
  INPUT = 'input',
  SELECT = 'select',
  DATE = 'date',
  DATE_PICKER = 'date picker',
  RADIO = 'radio',
  LEAD_ID = 'lead id',
  LABEL_W_LOGO = 'label with logo',
}

export interface IFieldValue {
  value: string | number;
  isEdit: boolean;
  isEditable: boolean;
  editType: EDIT_TYPE;
  title: string;
  id: string;
  isError?: boolean;
  options?: any[];
  typeSelect?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const driverAmount = [
  {
    id: 0,
    name: '0',
    title: '0',
    value: 0,
  },
  {
    id: 1,
    name: '1',
    title: '1',
    value: 1,
  },
  {
    id: 2,
    name: '2',
    title: '2',
    value: 2,
  },
];

const driverFormValues = {
  numberOfFixedDriver: {
    value: '',
    isEditable: true,
    editType: EDIT_TYPE.SELECT,
    title: 'fixedDriver',
    id: v4(),
    isError: false,
    placeholder: 'pleaseSelect',
    options: driverAmount,
    name: 'numberOfFixedDriver',
    isRequired: true,
  },
  firstDriverDOB: {
    value: '',
    isEditable: true,
    editType: EDIT_TYPE.DATE_PICKER,
    title: 'firstDriverDOB',
    id: v4(),
    isError: false,
    placeholder: 'enterDOB',
    name: 'firstDriverDOB',
    isRequired: false,
  },
  secondDriverDOB: {
    value: '',
    isEditable: true,
    editType: EDIT_TYPE.DATE_PICKER,
    title: 'secondDriverDOB',
    id: v4(),
    isError: false,
    placeholder: 'enterDOB',
    name: 'secondDriverDOB',
    isRequired: false,
  },
};

export const formValue = {
  customer: {
    firstName: {
      value: '',
      isEditable: true,
      editType: EDIT_TYPE.INPUT,
      title: 'firstName',
      id: v4(),
      isError: false,
      name: 'customerFirstName',
      isRequired: true,
    },
    lastName: {
      value: '',
      isEditable: true,
      editType: EDIT_TYPE.INPUT,
      title: 'lastName',
      id: v4(),
      isError: false,
      name: 'customerLastName',
      isRequired: true,
    },
    gender: {
      value: '1',
      isEditable: true,
      editType: EDIT_TYPE.SELECT,
      title: 'gender',
      id: v4(),
      isError: false,
      options: getOptionData('Gender'),
      name: 'customerGender',
      isRequired: true,
    },
    DOB: {
      isEdit: false,
      isEditable: true,
      editType: EDIT_TYPE.DATE_PICKER,
      title: 'dob',
      id: v4(),
      isError: false,
      name: 'customerDOB',
      isRequired: false,
    },
    age: {
      value: 30,
      title: 'age',
      isEdit: false,
      isEditable: false,
      id: v4(),
      isError: false,
      name: 'customerAge',
      isRequired: false,
    },
    language: {
      value: '',
      isEditable: true,
      editType: EDIT_TYPE.RADIO,
      title: 'language',
      id: v4(),
      isError: false,
      name: 'locale',
      isRequired: false,
      options: getOptionData('Locale'),
    },
  },
  policyHolder: {
    title: {
      value: '0',
      isEdit: false,
      isEditable: true,
      editType: EDIT_TYPE.SELECT,
      title: 'title',
      id: v4(),
      isError: false,
      typeSelect: 'Title',
      name: 'policyTitle',
      isRequired: true,
      options: getOptionData('LeadTitle'),
    },
    firstName: {
      value: 'Siriwan',
      isEdit: false,
      editType: EDIT_TYPE.INPUT,
      isEditable: true,
      title: 'firstName',
      id: v4(),
      isError: false,
      name: 'policyHolderFirstName',
      isRequired: true,
    },
    lastName: {
      value: 'Tongkeang',
      isEdit: false,
      isEditable: true,
      editType: EDIT_TYPE.INPUT,
      title: 'lastName',
      id: v4(),
      isError: false,
      name: 'policyHolderLastName',
      isRequired: true,
    },
    companyName: {
      value: '',
      isEdit: false,
      editType: EDIT_TYPE.INPUT,
      isEditable: true,
      title: 'companyName',
      id: v4(),
      isError: false,
      name: 'customerPolicyAddress/0/companyName',
      isRequired: true,
    },
    taxId: {
      value: '',
      isEdit: false,
      editType: EDIT_TYPE.INPUT,
      isEditable: true,
      title: 'taxId',
      id: v4(),
      isError: false,
      name: 'customerPolicyAddress/0/taxId',
      isRequired: true,
    },
    nationalId: {
      value: '123-4567891-23-4',
      isEditable: true,
      isNumeric: true,
      editType: EDIT_TYPE.INPUT,
      title: 'nationalIdPassport',
      id: v4(),
      isError: false,
      name: 'policyHolderNationalId',
      isRequired: true,
    },
    DOB: {
      isEdit: false,
      isEditable: true,
      editType: EDIT_TYPE.DATE_PICKER,
      title: 'dob',
      id: v4(),
      isError: false,
      name: 'policyHolderDOB',
      isRequired: false,
    },
    age: {
      value: 30,
      title: 'age',
      isEdit: false,
      isEditable: false,
      id: v4(),
      isError: false,
      name: 'policyAge',
      isRequired: false,
    },
    ...driverFormValues,
  },
  leadInfo: {
    agentName: {
      value: 'Siriwan',
      isEdit: false,
      isEditable: false,
      title: 'agentName',
      id: v4(),
      isError: false,
      editType: EDIT_TYPE.INPUT,
      name: 'leadAgentName',
      isRequired: false,
    },
    id: {
      value: 'Rabbit2020',
      title: 'leadId',
      isEdit: false,
      isEditable: false,
      id: v4(),
      isError: false,
      editType: EDIT_TYPE.LEAD_ID,
      name: 'leadId',
      isRequired: false,
    },
    type: {
      value: 'Renewal',
      isEdit: false,
      isEditable: false,
      title: 'leadType',
      id: v4(),
      isError: false,
      editType: EDIT_TYPE.INPUT,
      name: 'leadType',
      isRequired: false,
    },
    source: {
      value: '',
      isEdit: false,
      isEditable: false,
      title: 'leadSource',
      id: v4(),
      isError: false,
      editType: EDIT_TYPE.INPUT,
      name: 'leadSource',
      isRequired: false,
    },
    sundayContactable: {
      value: '',
      isEdit: false,
      isEditable: false,
      title: 'sundayContactable',
      id: v4(),
      isError: false,
      name: 'sundayContactable',
      editType: EDIT_TYPE.LABEL_W_LOGO,
      isRequired: false,
    },
    refId: {
      value: 'Rabbit2020',
      isEdit: false,
      isEditable: false,
      title: 'reference',
      id: v4(),
      isError: false,
      editType: EDIT_TYPE.INPUT,
      name: 'reference',
      isRequired: false,
    },
  },
};

export const getAgeByDOB = (date: Date | string): string | number => {
  if (date && isValid(new Date(date))) {
    return differenceInYears(new Date(), new Date(date));
  }
  return '';
};
/**
 * @deprecated
 */
export const mappingFieldValue = (form: any, data: any) => {
  const newFormValue = { ...form };
  Object.keys(newFormValue).forEach((key) => {
    Object.keys(newFormValue[key]).forEach((childKey) => {
      newFormValue[key][childKey].value = data?.[key]?.[childKey];
    });
  });

  const DOB = data.lead.policyHolder;
  if (DOB) {
    newFormValue.policyHolder.DOB.value = DOB;
    newFormValue.policyHolder.age.value = getAgeByDOB(DOB);
  }
  newFormValue.customer.DOB.value = data.lead.customerDOB;
  newFormValue.customer.age.value = _isEmpty(data.lead.customerDOB)
    ? ''
    : getAgeByDOB(data.lead.customerDOB);

  return newFormValue;
};

export const mappingCustomerStatus = (status: string) => {
  let customerStatus = '';
  StatusLeadAll.forEach((item) => {
    if (status === item.value) {
      customerStatus = item.title;
    }
  });
  return getString(customerStatus);
};

export const getStatusColor = (
  isPending: boolean | null,
  classes: ClassNameMap
) => {
  if (isPending !== INITIAL_STATUS_VALUE) {
    const result = isPending ? classes.statusOrange : classes.statusGreen;
    return result;
  }
  return '';
};

export const getPendingRejection = (response: any) => {
  let isPending = false;
  if (response?.rejections?.length) {
    isPending = response.rejections.find(
      (item: any) => item.decideTime === INITIAL_STATUS_VALUE
    );
  }
  return Boolean(isPending);
};

export const calculateDOBHelper = (schema: any, value: string | Date) => {
  const newDataSchema = { ...schema };
  newDataSchema.policyHolder.age.value = getAgeByDOB(value);
  return newDataSchema;
};

export const renderInputType = (objState: IFieldValue) => {
  if (objState.editType === EDIT_TYPE.INPUT) {
    return 1;
  }
  if (objState.editType === EDIT_TYPE.SELECT) {
    return 2;
  }
  if (objState.editType === EDIT_TYPE.DATE_PICKER) {
    return 3;
  }
  if (objState.editType === EDIT_TYPE.RADIO) {
    return 4;
  }
  if (objState.editType === EDIT_TYPE.LEAD_ID) {
    return 5;
  }
  if (objState.editType === EDIT_TYPE.LABEL_W_LOGO) {
    return 6;
  }
  return 0;
};

export const getClassFieldItem = (
  keyValue: IFieldValue,
  isFieldDisabled: boolean
) => {
  const activeClass = `field-item ${keyValue.isEdit ? 'active' : ''}`;
  const paddingTopClass =
    keyValue.editType === EDIT_TYPE.SELECT && keyValue.isEdit
      ? 'add-top-padding'
      : '';
  if (isFieldDisabled) {
    return activeClass.trim();
  }
  return `${activeClass} ${paddingTopClass}`.trim();
};

export const isMaxAge = (date: string) => {
  const maxYear = 100;
  const years = differenceInYears(new Date(), new Date(date));
  return years > maxYear;
};

export const isMinAge = (date: string) => {
  const minYear = 18;
  const years = differenceInYears(new Date(), new Date(date));
  return years < minYear;
};

export const getDOBError = (value: string) => {
  if (value && isMaxAge(value)) {
    return getString('errors.invalidAgeOver');
  }
  if (value && isMinAge(value)) {
    return getString('errors.invalidAgeUnder');
  }
  return '';
};

export const isDisableDOB = (title: string, value: number) => {
  const first = 'firstDriverDOB';
  const second = 'secondDriverDOB';
  if (title === first || title === second) {
    if (value === 0) {
      return true;
    }
    if (value === 1) {
      return title !== first;
    }
    if (value === 2) {
      return false;
    }
  }
  return false;
};

export const getErrorWhenChangeDOB = (
  value: string | Date,
  state: IFieldValue
) => {
  const error = getDOBError(value as string);
  const newState: any = {
    ...state,
    value,
  };
  if (error) {
    newState.isError = true;
    newState.error = error;
  } else {
    newState.isError = false;
    newState.error = '';
  }
  return newState;
};

export const listenFixedDriverChange = (name: string) => {
  if (name !== 'dob') {
    return changeFixedDriver$.pipe(
      map((fixedValue) => {
        if (fixedValue?.toString()?.length) {
          return isDisableDOB(name, fixedValue);
        }
        return true;
      })
    );
  }
  return of(false);
};

export const handleNumericAlphabet = (event: React.KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (
    (charCode >= 32 && charCode <= 64) ||
    (charCode >= 48 && charCode <= 57) ||
    (charCode >= 65 && charCode <= 90) ||
    (charCode >= 97 && charCode <= 122)
  ) {
    return true;
  }

  event.preventDefault();
  return false;
};

export const onKeyPress = (event: React.KeyboardEvent, isNumeric: boolean) =>
  isNumeric ? handleNumericAlphabet(event) : true;

export const createPolicyholder = (age: string) => ({
  policyHolder: {
    age: {
      value: age,
    },
  },
});

export const renderIf = (condition: boolean, child: any) =>
  condition ? child : null;

export const formatDateValue = (value: string | Date | null) =>
  value && isValid(new Date(value))
    ? format(new Date(value), 'dd/MM/yyyy')
    : '';

export const setDriverDOB = (
  dataSchemaCustomer: any,
  firstDriverResult: boolean,
  secondDriverResult: boolean
) => {
  Object.assign(dataSchemaCustomer.firstDriverDOB, {
    isRequired: firstDriverResult,
  });
  Object.assign(dataSchemaCustomer.secondDriverDOB, {
    isRequired: secondDriverResult,
  });
};

export const addRequireField = (dataSchemaCustomer: any) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(dataSchemaCustomer)) {
    if (key === 'numberOfFixedDriver') {
      const fixedDriverValue = value as IFieldValue;
      const numberOfFixedDriver = fixedDriverValue.value;

      if (numberOfFixedDriver === 0) {
        setDriverDOB(dataSchemaCustomer, false, false);
      } else if (numberOfFixedDriver === 1) {
        setDriverDOB(dataSchemaCustomer, true, false);
      } else if (numberOfFixedDriver === 2) {
        setDriverDOB(dataSchemaCustomer, true, true);
      }
    }
  }
  return dataSchemaCustomer;
};
