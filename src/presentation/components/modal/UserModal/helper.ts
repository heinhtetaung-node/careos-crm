import * as Yup from 'yup';

import { CreateUserRequest } from 'data/slices/userSlice/interface';
import { getString } from 'presentation/theme/localization';
import { EMAIL_REGEX } from 'shared/constants';
import {
  RolesWithoutProduct,
  UserRoleID,
} from 'presentation/components/ProtectedRouteHelper';

export const scores = [
  { id: 1, title: '1', value: '1' },
  { id: 2, title: '2', value: '2' },
  { id: 3, title: '3', value: '3' },
  { id: 4, title: '4', value: '4' },
];
const PRODUCT_TYPE = {
  CAR_INSURANCE: 'products/car-insurance',
  HEALTH_INSURANCE: 'products/health-insurance',
  TRAVEL_INSURANCE: 'products/travel-insurance',
};
export const ProductTypeOptions = [
  {
    id: 0,
    title: getString('productionOptions.carInsurance'),
    value: PRODUCT_TYPE.CAR_INSURANCE,
  },
  {
    id: 1,
    title: getString('productionOptions.healthInsurance'),
    value: PRODUCT_TYPE.HEALTH_INSURANCE,
  },
  {
    id: 2,
    title: getString('productionOptions.travelInsurance'),
    value: PRODUCT_TYPE.TRAVEL_INSURANCE,
  },
];
export const createValidationSchema = (
  teamRoles: string[],
  salesAgentRole: string
) =>
  Yup.object().shape({
    role: Yup.object({
      name: Yup.string().required(),
    }).required(getString('text.error', { field: 'User role' })),
    firstName: Yup.string().trim().required('Required'),
    lastName: Yup.string().trim().required('Required'),
    humanId: Yup.string()
      .trim()
      .test('Validate email', getString('text.invalidEmail2'), (email) => {
        if (!email) return false;
        return EMAIL_REGEX.test(email);
      }),
    team: Yup.object().when('role', {
      is: (role: { name: string }) => teamRoles.includes(role?.name),
      then: () =>
        Yup.object({
          name: Yup.string().required(),
        }).required(getString('text.error', { field: 'Team' })),
    }),
    dailyLimit: Yup.number().when('role', {
      is: (role: { name: string }) => role?.name === salesAgentRole,
      then: () => Yup.number().required('Required'),
    }),
    totalLimit: Yup.number().when('role', {
      is: (role: { name: string }) => role?.name === salesAgentRole,
      then: () => Yup.number().required('Required'),
    }),
    agentScore: Yup.object().when('role', {
      is: (role: { name: string }) => role?.name === salesAgentRole,
      then: () =>
        Yup.object({
          value: Yup.string().required(),
        }).required(getString('text.error', { field: 'Agent score' })),
    }),
    licenseNo: Yup.string()
      .max(20)
      .test(
        'check-licenseNo',
        'License No. must include alphanumeric characters only',
        (value: string | undefined) =>
          value === undefined ? true : /^([A-Za-z0-9])*$/.test(value)
      ),
    licenseIssueDate: Yup.date(),
    licenseExpiryDate: Yup.date(),
    language: Yup.object({
      value: Yup.string().required(),
    }).required(getString('text.error', { field: 'Language' })),
    product: Yup.object().when('role', {
      is: (role: { name: string }) =>
        !RolesWithoutProduct.includes(role?.name as UserRoleID),
      then: () =>
        Yup.object({
          value: Yup.string().required(),
        }).required(getString('text.error', { field: 'Product Type' })),
    }),
  });

export const getErrorOrSuccessMessage = (
  status: string,
  type: 'success' | 'error',
  message?: string
) => {
  switch (status) {
    case 'addUser':
      if (type === 'error')
        return getString('text.createUserFail', { message });
      return getString('text.createUserSuccessfully');

    case 'updateUser':
      if (type === 'error')
        return getString('text.updateUserFail', { message });
      return getString('text.updateUserSuccessfully');

    case 'deleteUser':
      if (type === 'error') return getString('text.suspendUserFailed');
      return getString('text.suspendUserSuccess');

    case 'unDeleteUser':
      if (type === 'error') return getString('text.activateUserFailed');
      return getString('text.activateUserSuccess');

    case 'moveMember':
      if (type === 'error') return getString('text.moveUserToTeamFail');
      return getString('text.moveUserToTeamSuccess');

    case 'addMember':
      if (type === 'error') return getString('text.addUserToTeamFail');
      return getString('text.addUserToTeamSuccess');

    case 'deleteMember':
      if (type === 'error') return getString('text.deleteMemberFromTeamFail');
      return getString('text.deleteMemberFromTeamSuccess');

    default:
      return getString('error.oops');
  }
};

export function transformValuesForUserAPI(
  values: {
    firstName: string;
    lastName: string;
    humanId: string;
    role: { name: string };
    language: { value: string };
    agentScore?: { value: string };
    team?: { name: string };
    dailyLimit?: number;
    totalLimit?: number;
    licenseNo?: string;
    licenseIssueDate?: string;
    licenseExpiryDate?: string;
    product?: { value: string };
  },
  isSalesAgent = false,
  isLicensedBrokerAgent = false
) {
  const transformedValues: CreateUserRequest = {
    firstName: values?.firstName,
    lastName: values?.lastName,
    humanId: values?.humanId,
    role: values?.role?.name,
    product: values?.product?.value,
    annotations: {
      lang: values?.language?.value,
    },
  };

  if (isSalesAgent) {
    transformedValues.annotations = {
      ...transformedValues.annotations,
      daily_limit: values?.dailyLimit?.toString() ?? undefined,
      total_limit: values?.totalLimit?.toString() ?? undefined,
      score: values?.agentScore?.value ?? undefined,
    };
  }

  if (isLicensedBrokerAgent) {
    transformedValues.annotations = {
      ...transformedValues.annotations,
      license_no: values?.licenseNo?.toString() || undefined,
      license_issue_date: values?.licenseIssueDate || undefined,
      license_expiry_date: values?.licenseExpiryDate || undefined,
    };
  }

  return transformedValues;
}

export function handleRoleChange(
  event: any,
  setFieldValue: (field: string, value: any) => void,
  handleChange: (event: any) => void
) {
  setFieldValue('team', {});
  const selectedRole = event.target.value.name;
  if (RolesWithoutProduct.includes(selectedRole)) {
    setFieldValue('product', { value: '' });
  }
  handleChange(event);
}
