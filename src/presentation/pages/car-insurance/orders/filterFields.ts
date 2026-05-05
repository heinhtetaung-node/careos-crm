/* eslint-disable arrow-body-style */
import qs from 'qs';

import TeamSourceCloud from 'data/repository/admin/team/cloud';
import UserSourceCloud from 'data/repository/admin/user/cloud';
import {
  useLazyGetAllUsersByStreamingQuery,
  useLazyGetAllUserStreamingByLeadSearchQuery,
} from 'data/slices/userSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import {
  approvalStatusOptions,
  submissionItemStatusOptions,
} from 'shared/constants/ordersAllSearchFields';
import {
  PrintingAndShippingPaymentStatus,
  PrintingAndShippingPaymentTypes,
} from 'shared/constants/orderType';
import {
  insuranceTypeCollection,
  motorInsuranceTypeCollection,
} from 'shared/constants/packageStaticData';
import TeamRole from 'shared/constants/teamRole';
import { User } from 'shared/types/user';

import { getInsurersList, roleCombination } from './filter.helper';

export const insurerField: IFilterFormField = {
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name: 'insurer',
    label: getString('text.insurers'),
    labelField: 'displayName',
    valueField: 'name',
    filterType: 'detail',
    paginate: true,
    async: true,
    asyncFn: () => getInsurersList({ pageSize: 1000 }),
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
};

export const policyInsurerField: IFilterFormField = {
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name: 'itemInsurer',
    label: getString('text.insurers'),
    labelField: 'displayName',
    valueField: 'name',
    filterType: 'detail',
    paginate: true,
    async: true,
    asyncFn: () => getInsurersList({ pageSize: 1000 }),
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
};

export const motorInsuranceTypesField: IFilterFormField = {
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name: 'itemInsuranceType',
    label: getString('text.productType'),
    // Specifies what property in the option should be used as the label
    labelField: 'title',
    // Specifies which property will serve as the value.
    valueField: 'packageValue',
    options: motorInsuranceTypeCollection().map(
      ({ value, packageValue, title }, index: number) => ({
        id: index + 1,
        value,
        packageValue,
        title,
      })
    ),
    filterType: 'detail',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
};

export const productTypeField: IFilterFormField = {
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name: 'insuranceType',
    label: getString('text.productType'),
    // Specifies what property in the option should be used as the label
    labelField: 'title',
    // Specifies which property will serve as the value.
    valueField: 'value',
    options: insuranceTypeCollection().map(
      ({ value, title }, index: number) => ({ id: index + 1, value, title })
    ),
    filterType: 'detail',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
};

export const paymentTypeField = (
  options: {
    id: number;
    value: PrintingAndShippingPaymentStatus | PrintingAndShippingPaymentTypes;
    title: string;
  }[] = []
): IFilterFormField => ({
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name: 'paymentType',
    label: getString('text.paymentType'),
    options,
    filterType: 'detail',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
});

export const assignToTeamField = (
  teamRole: TeamRole,
  name: string
): IFilterFormField => ({
  InputComponent: Controls.Autocomplete,
  inputProps: {
    name,
    label: getString('text.assignedToTeam'),
    async: true,
    asyncFn: () =>
      TeamSourceCloud.getTeamsByRole({
        role: teamRole,
      }),
    labelField: 'displayName',
    valueField: 'name',
    filterType: 'detail',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
});

export const assignToUserField = (
  teamRole: TeamRole | TeamRole[] | null = null,
  // Always show if shouldShow is not extract false in value
  shouldShow: boolean | true = true
): IFilterFormField[] | any[] => {
  if (!shouldShow) return [];

  return [
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'assignToUser',
        label: getString('text.assignedToUser'),
        async: true,
        asyncFn: () => {
          return UserSourceCloud.getUsersWithTeams({
            ...(teamRole && {
              filter: `role in ("${roleCombination(teamRole)}")`,
            }),
            orderBy: '',
            pageSize: 15,
            pageToken: '',
            showDeleted: true,
          });
        },
        labelField: 'fullName',
        valueField: 'name',
        filterType: 'detail',
        fixedLabel: true,
        startWithValue: {
          fullName: `(${getString('text.unassigned')})`,
          name: '',
        },
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
  ];
};

export const userAssignedLeadSearch = (
  teamRole: TeamRole | TeamRole[] | null = null,
  // Always show if shouldShow is not extract false in value
  shouldShow: boolean | true = true
): IFilterFormField | any => {
  if (!shouldShow) return null;

  const teamRoleQuery = teamRole ? roleCombination(teamRole) : null;
  return {
    InputComponent: Autocomplete,
    inputProps: {
      async: true,
      lookup: 'users',
      type: 'checkbox',
      name: 'assignToUser',
      filterPanel: true,
      limitTags: 1,
      label: getString('text.assignedToUser'),
      callback: (user: User) => ({
        ...user,
        value: user.name,
        title: `${user.firstName} ${user.lastName}`,
      }),
      textFieldProps: {
        placeholder: getString('text.select'),
        dataTestId: 'assigntouser-autocomplete',
        name: 'assignToUser',
        fullWidth: false,
      },
      optionTextKey: 'title',
      options: [{ value: '', title: getString('text.unassigned') }],
      queryParams: teamRoleQuery
        ? `filter=user.role.keyword in("${teamRoleQuery}")`
        : '',
      useLazyQuery: useLazyGetAllUserStreamingByLeadSearchQuery,
      getOptionSelected(option: any, value: any) {
        return option.value === value.value;
      },
      filterType: 'detail',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  };
};

export const saleAgentInputProps = {
  async: true,
  lookup: 'users',
  type: 'checkbox',
  name: 'salesAgents',
  filterPanel: true,
  limitTags: 1,
  label: getString('leadDetailFields.salesAgent'),
  callback: (user: User) => ({
    value: user.name,
    title: `${user.firstName} ${user.lastName}`,
  }),
  textFieldProps: {
    placeholder: getString('text.select'),
    dataTestId: 'sales-agent-autocomplete',
    name: 'salesAgents',
    fullWidth: false,
  },
  optionTextKey: 'title',
  options: [{ value: '', title: getString('text.noAssignee') }],
  queryParams: `filter=role in ("${UserRoleID.SalesAgent}")&pageSize=500&showDeleted=true`,
  useLazyQuery: useLazyGetAllUsersByStreamingQuery,
  getOptionSelected(option: any, value: any) {
    return option.value === value.value;
  },
  filterType: 'detail',
  responsive: {
    xs: 6,
    md: 3,
  },
};

export const salesAgentsField = (
  shouldShow: boolean | null = null
): IFilterFormField[] | any[] => {
  if (shouldShow) {
    return [
      {
        InputComponent: Autocomplete,
        inputProps: saleAgentInputProps,
      },
    ];
  }

  return [];
};

export const qcAgentsField = ({
  hideAssignTo,
  defaultOptions,
}: {
  hideAssignTo?: boolean;
  defaultOptions?: { value: string; title: string }[];
} = {}): IFilterFormField[] | any[] => {
  return [
    !hideAssignTo && {
      InputComponent: Autocomplete,
      inputProps: {
        ...saleAgentInputProps,
        ...(defaultOptions ? { options: defaultOptions } : {}),
        queryParams: `filter=role in ("${UserRoleID.QualityControl}")&pageSize=500&showDeleted=true`,
        name: 'qcAgent',
        label: getString('text.assignedTo'),
      },
    },
  ];
};

export const getAllUsersField = ({
  name,
  label,
  filterUri,
  defaultOptions,
}: {
  name?: string;
  label?: string;
  filterUri?: string;
  defaultOptions?: { value: string; title: string }[];
} = {}): IFilterFormField[] | any[] => {
  return [
    {
      InputComponent: Autocomplete,
      inputProps: {
        ...saleAgentInputProps,
        ...(defaultOptions ? { options: defaultOptions } : {}),
        queryParams: qs.stringify({
          filter: filterUri,
          pageSize: 500,
        }),
        name: name ?? 'allUsers',
        label: label ?? getString('text.selectUsers'),
      },
    },
  ];
};

export const getPolicyFields = (
  isPolicy: boolean
): IFilterFormField[] | any[] => {
  if (isPolicy) {
    return [
      {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'submissionStatus',
          label: getString('text.submissionStatus'),
          placeholder: getString('text.select'),
          options: submissionItemStatusOptions,
          filterType: 'detail',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
          hasSelectAll: true,
        },
      },
      {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'approvalStatus',
          label: getString('text.approvalStatus'),
          placeholder: getString('text.select'),
          options: approvalStatusOptions,
          filterType: 'detail',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
          hasSelectAll: true,
        },
      },
    ];
  }
  return [];
};

export const salesAgentsTeamsField = (
  shouldShow: boolean | null = null
): IFilterFormField[] | any[] => {
  if (shouldShow) {
    return [
      {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'salesAgentsTeams',
          label: getString('team.sales'),
          async: true,
          asyncFn: () => {
            return TeamSourceCloud.getTeamsByRole({
              role: 'roles/sales',
              orderBy: '',
              pageSize: 500,
              pageToken: '',
            });
          },
          labelField: 'displayName',
          valueField: 'name',
          filterType: 'detail',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      },
    ];
  }
  return [];
};
