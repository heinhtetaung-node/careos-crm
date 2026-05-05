import _camelCase from 'lodash/camelCase';
import get from 'lodash/get';
import has from 'lodash/has';
import { v4 } from 'uuid';

import { fakeTypes } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import {
  LeadType,
  StatusLeadAll,
} from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { LeadAssignmentActions } from 'presentation/redux/actions/leads/lead-assignment';
import { getString, LANGUAGES } from 'presentation/theme/localization';
import { UNIT_OF_ENGINE_SIZE } from 'shared/constants';
import { getValidAppointmentDate } from 'shared/helper/AppointmentLogicHelper';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import {
  formatDDMMYYYY,
  formatDDMMYYYYHHMMSS,
  formatTimeAgo,
  getRenewalPackageStatus,
  getYesNoOptions,
  maskEmailAddress,
  maskPhoneNumber,
  modelValidationField,
} from 'shared/helper/utilities';
import { IAction, IState } from 'shared/interfaces/common';

const localStorage = new LocalStorage();
const initialState: IState<any> & { totalItem?: number } & {
  pageState: any;
} = {
  data: [],
  isFetching: false,
  success: true,
  status: '',
  totalItem: 0,
  tableType: '',
  pageState: {
    pageSize: 15,
    currentPage: 1,
  },
};
enum GENDER {
  MALE = 'm',
  FEMALE = 'f',
}

export const customTrueFalse = (value: boolean) => {
  if (typeof value === 'boolean') {
    if (value) {
      return getString('customTrueFalse.yes');
    }
    return getString('customTrueFalse.no');
  }
  return '';
};
export const customerGender = (gender: string, translate: boolean = false) => {
  if (gender) {
    if (gender === GENDER.MALE) {
      return translate ? getString('text.male') : 'Male';
    }
    if (gender === GENDER.FEMALE) {
      return translate ? getString('text.female') : 'Female';
    }
  }
  return '';
};
export const customerLeadStatus = (status: string) => {
  const findLeadStatus = StatusLeadAll.find((item) => item.value === status);
  return findLeadStatus?.title || '';
};

export const customerLeadType = (status: string) => {
  const findLeadType = LeadType.find((item) => item.value === status);
  return findLeadType?.title || '';
};

export const customerPolicyType = (policy: string[]) =>
  (policy || [])
    .map(
      (policyItem) =>
        fakeTypes.find((item) => item.value === policyItem)?.title || ''
    )
    .join(', ') || '';

export const findShortInsurerName = (id: string, defaultValue = '') => {
  if (
    localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE) === LANGUAGES.ENGLISH
  ) {
    return defaultValue;
  }
  if (id) {
    return getString(`shortInsurers.${id}`);
  }
  return '';
};

export const findLongInsurerName = (name: string, defaultValue = '') => {
  const id = name.split('/')[1];
  if (
    localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE) === LANGUAGES.ENGLISH
  ) {
    return defaultValue;
  }
  if (id) {
    return getString(`longInsurers.${id}`);
  }
  return '';
};

export const getPhoneNumber = (item: any, maskData = false) => {
  const phones = item?.insuree?.phone;
  if (!phones || !phones.length) {
    return '';
  }

  if (maskData) {
    return has(item, 'lead.data.primaryPhoneIndex')
      ? maskPhoneNumber(item.insuree.phone[item.lead.data.primaryPhoneIndex])
      : maskPhoneNumber(phones[phones.length - 1]);
  }

  return has(item, 'lead.data.primaryPhoneIndex')
    ? item.insuree.phone[item.lead.data.primaryPhoneIndex]
    : phones[phones.length - 1];
};

export const getEmailAddresses = (item: any, maskData = false) => {
  if (item?.insuree?.email?.length) {
    if (maskData) {
      return maskEmailAddress(
        item.insuree.email[item.insuree.email.length - 1]
      );
    }
    return item.insuree.email[item.insuree.email.length - 1];
  }
  return '';
};

export const formatOneLead = (item: any, role?: string) => {
  if (!item) {
    return {};
  }

  const rejections = item?.rejections;
  const isRejectedLead = item?.lead?.isRejected;
  const firstRejection = rejections?.find((rejection: any) => {
    if (isRejectedLead) {
      return rejection.approved;
    }
    return rejection.decideTime === null;
  });

  const isAdmin = ['roles/admin', 'roles/super-admin'].includes(role ?? '');

  return {
    phoneNumber: getPhoneNumber(item, !isAdmin),
    email: getEmailAddresses(item, !isAdmin),
    carEngineSize: item?.car?.engineSize
      ? `${item.car.engineSize} ${UNIT_OF_ENGINE_SIZE}`
      : '',
    leadDetailId: item?.lead?.name ? item.lead.name.replace('leads/', '') : '',
    leadType: customerLeadType(item?.lead?.type),
    leadStatus: customerLeadStatus(item?.lead?.status),
    gender: customerGender(item?.insuree?.gender),
    marketingConsent: customTrueFalse(item?.lead?.data?.marketingConsent),
    carDashcam: customTrueFalse(item?.car?.dashcam),
    carModification: customTrueFalse(item?.car?.modified),
    policyPreferredType: customerPolicyType(
      item?.insurance?.voluntaryInsuranceType
    ),
    expiryDate: formatDDMMYYYY(item?.insurance?.policyExpiryDate),
    createdOn: formatDDMMYYYYHHMMSS(item?.lead?.createTime),
    updatedOn: formatDDMMYYYYHHMMSS(item?.lead?.updateTime),
    assignedOn: formatDDMMYYYYHHMMSS(item?.assigned?.createTime),
    dob: formatDDMMYYYY(item?.insuree?.dateOfBirth),
    policyStartDate: formatDDMMYYYY(item?.insurance?.policyStartDate),
    user: `${modelValidationField(
      item?.assigned?.firstName
    )} ${modelValidationField(item?.assigned?.lastName)}`,
    teamName: modelValidationField(item?.team?.displayName),
    name: `${modelValidationField(
      item?.lead?.data?.customerFirstName
    )} ${modelValidationField(item?.lead?.data?.customerLastName)}`,
    leadScore: modelValidationField(item?.score),
    sumInsured: modelValidationField(item?.car?.sumInsured),
    appointmentDate: item?.appointments?.length
      ? getValidAppointmentDate(item.appointments)
      : '',
    leadId: modelValidationField(item?.lead?.humanId),
    licensePlate: modelValidationField(item?.car?.licensePlate),
    leadSource: modelValidationField(item?.source?.source),
    customerId: modelValidationField(item?.customer?.humanId),
    referralId: modelValidationField(item?.insurance?.preferredInsurerId),
    age: modelValidationField(item?.insuree?.age),
    carBrand: modelValidationField(item?.car?.brand),
    carModel: modelValidationField(item?.car?.model),
    carYear: modelValidationField(item?.car?.year),
    carTransmission: modelValidationField(item?.car?.transmission),
    carUsage: modelValidationField(item?.car?.usage),
    carRegisteredProvince: modelValidationField(item?.car?.registeredProvince),
    currentInsurer: findShortInsurerName(
      item?.insurance?.currentInsurerId,
      item?.insurance?.currentInsurer
    ),
    lastInsurer: findShortInsurerName(
      item?.insurance?.preferredInsurerId,
      item?.insurance?.preferredInsurer
    ),
    isChecked: false,
    failedDials: '',
    connectDials: '',
    leadSubStatus: '',
    totalDials: '',
    paymentDate: '',
    renewalId: '',
    lastVisitedOn: '',
    rejectionComment: '',
    commentId: modelValidationField(firstRejection?.comment),
    rejectionReason: firstRejection?.reason
      ? getString(`rejectReason.${_camelCase(firstRejection?.reason)}`)
      : null,
    rejectedDate: formatDDMMYYYYHHMMSS(firstRejection?.createTime),
    rejectionId: modelValidationField(firstRejection?.name),
    isRejected: item?.lead.isRejected,
    rejections,
    duplicateLead: customTrueFalse(item?.attributes?.isDuplicate),
    assignmentResourceName: item?.attributes?.assignmentResourceName,
    renewalPackageStatus: item?.attributes?.insurerAcceptedStatus
      ? getString(
          getRenewalPackageStatus(item.attributes.insurerAcceptedStatus)
        )
      : '',
    sundayContactable: has(item, 'attributes.sundayContactable')
      ? getString(getYesNoOptions(get(item, 'attributes.sundayContactable')))
      : '',
    optOutCalls: item?.lead?.data?.optOutCalls,
    callAttempts: item?.attributes?.callAttempts ?? '0',
    lastCallDate: formatDDMMYYYYHHMMSS(item?.attributes?.lastCallTimestamp),
    daysSinceLastCall: formatTimeAgo(item?.attributes?.lastCallTimestamp),
  };
};

export const formatLeadAssignment = (listAssignment: any[]) =>
  listAssignment.map((item) => ({
    ...formatOneLead(item),
    id: v4(),
  }));

export default function LeadAssignmentReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadAssignmentActions.GET_LEAD_ASSIGNMENT: {
      const { pageSize, currentPage, orderBy } = action.payload;

      return {
        ...state,
        isFetching: true,
        pageState: {
          pageSize: pageSize || state.pageState.pageSize,
          currentPage: currentPage || state.pageState.currentPage,
          orderBy,
        },
      };
    }
    case LeadAssignmentActions.GET_LEAD_ASSIGNMENT_SUCCESS: {
      const formatList =
        formatLeadAssignment(action.payload?.data?.leads || []) || [];
      return {
        ...state,
        data: formatList,
        success: true,
        isFetching: false,
        totalItem: Number(action.payload?.data?.total),
        tableType: action.tableType,
      };
    }
    case LeadAssignmentActions.GET_LEAD_ASSIGNMENT_FAILED: {
      return {
        ...state,
        success: false,
        isFetching: false,
        data: [],
        totalItem: 0,
      };
    }
    case LeadAssignmentActions.GET_COMMENT_LEAD_ASSIGNMENT_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        success: true,
        isFetching: false,
        totalItem: Number(action.totalItem),
      };
    }
    case LeadAssignmentActions.CLEAR_LEAD_ASSIGNMENT_PAGE_STATE: {
      return {
        ...state,
        pageState: {
          pageSize: 15,
          currentPage: 1,
        },
      };
    }
    default:
      return state;
  }
}
