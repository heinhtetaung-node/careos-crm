import TeamSourceCloud from 'data/repository/admin/team/cloud';
import UserSourceCloud from 'data/repository/admin/user/cloud';
import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { LEAD_TYPE } from 'shared/constants';
import { buildFilter } from 'utils/url';

export const initialFilter = `request.status='PENDING' attributes.cancelled=false lead.product='products/car-insurance'&showDeleted=false`;

export const columns: (
  event: any,
  isEnablePreviewButton: boolean
) => Column[] = (handleClick, isEnablePreviewButton) => [
  {
    id: 'file',
    field: 'file',
    label: 'text.file',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
    clickable: true,
    onClick: isEnablePreviewButton ? handleClick : undefined,
  },
  {
    id: 'requestTime',
    field: 'requestTime',
    label: 'menu.discounts.requestTime',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'status',
    field: 'status',
    label: 'text.status',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'leadId',
    field: 'leadId',
    label: 'text.leadId',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'discountType',
    field: 'discountType',
    label: 'menu.discounts.discountType',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'agentName',
    field: 'agentName',
    label: 'text.agentName',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'insurer',
    field: 'insurer',
    label: 'menu.discounts.insurer',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'insuranceType',
    field: 'insuranceType',
    label: 'menu.discounts.insuranceType',
    minWidth: 250,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'leadType',
    field: 'leadType',
    label: 'leadDetailFields.leadType',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'requestDiscount',
    field: 'requestDiscount',
    label: 'menu.discounts.requestDiscount',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'maxDiscount',
    field: 'maxDiscount',
    label: 'menu.discounts.maxDiscount',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
    transform: ({ maxDiscount }: any) => `${maxDiscount}%`,
  },
  {
    id: 'priceBeforeDiscount',
    field: 'priceBeforeDiscount',
    label: 'menu.discounts.priceBeforeDiscount',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'priceAfterDiscount',
    field: 'priceAfterDiscount',
    label: 'menu.discounts.priceAfterDiscount',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'description',
    field: 'description',
    label: 'text.description',
    minWidth: 250,
    sorting: 'none',
    disabled: true,
  },
];

const localeLeadType = [
  { id: 1, title: getString('leadTypeFilter.new'), value: LEAD_TYPE.NEW },
  {
    id: 2,
    title: getString('leadTypeFilter.renewal'),
    value: LEAD_TYPE.RENEWAL,
  },
  {
    id: 3,
    title: getString('leadTypeFilter.retainer'),
    value: LEAD_TYPE.RETAINER,
  },
];

export const localeDiscountType = [
  { key: 0, title: getString('text.select'), value: '' },
  {
    key: 1,
    title: `${getString('text.agent')}/${getString('text.supervisor')}`,
    value: 'agent-discount',
  },
  { key: 2, title: getString('text.matchPrice'), value: 'match-price' },
];

const DiscountApprovalSearchOptions = [
  {
    key: 0,
    title: getString('text.select'),
    value: '',
  },
  {
    key: 2,
    title: getString('text.leadId'),
    value: 'lead.humanId',
  },
];

const DiscountApprovalSearchOptionsHealth = [
  ...DiscountApprovalSearchOptions.map((option) =>
    option.value === 'lead.humanId'
      ? { ...option, value: 'healthLead.humanId' }
      : option
  ),
];

export const filterFields: (
  data: typeof localeDiscountType,
  product?: string
) => IFilterFormField[] = (campaigns, product = 'products/car-insurance') => [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption:
        product === 'products/health-insurance'
          ? DiscountApprovalSearchOptionsHealth
          : DiscountApprovalSearchOptions,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'approver',
      label: getString('text.approver'),
      async: true,
      asyncFn: () =>
        UserSourceCloud.getAllUsers({
          filter: `role in ("roles/manager", "roles/supervisor")`,
          orderBy: '',
          showDeleted: false,
          pageSize: 500,
          pageToken: '',
        }),
      labelField: 'fullName',
      valueField: 'name',
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'salesAgentsTeams',
      label: getString('team.sales'),
      async: true,
      asyncFn: () =>
        TeamSourceCloud.getTeamsByRole({
          role: 'roles/sales',
          orderBy: '',
          pageSize: 500,
          pageToken: '',
          product,
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
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'agentName',
      label: getString('text.agentName'),
      async: true,
      asyncFn: () =>
        UserSourceCloud.getUsersWithTeams({
          filter: 'role="roles/sales"',
          orderBy: '',
          pageSize: 100,
          pageToken: '',
        }),
      labelField: 'fullName',
      valueField: 'name',
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'discountType',
      label: getString('menu.discounts.discountType'),
      options: campaigns,
      filterType: 'detail',
      valueField: 'name',
      selectField: 'value',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },

  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'packageType',
      label: getString('leadDetailFields.leadType'),
      options: localeLeadType,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export const tableInitialValues = {
  search: { key: 'lead.humanId', value: '' },
  salesAgentsTeams: [],
  agentName: [],
  discountType: '',
  packageType: [],
  approver: [],
};

export const leadMapped: Record<string, string> = {
  packageType: 'lead.type',
  agentName: 'user.name',
  approver: 'request.approver',
  salesAgentsTeams: 'team.name',
  discountType: 'request.type',
};

export const formatFilterURI = (payload: any, isAllRequests: boolean) => {
  const filterParts: string[] = [];

  const {
    agentName,
    packageType,
    salesAgentsTeams,
    discountType,
    search,
    approver,
  } = payload;
  if (discountType?.length) {
    const discountPart = `discountType="${discountType}"`;
    filterParts.push(discountPart);
  }
  if (Object.keys(search).length) {
    const { key, value }: { key: string; value: string } = search;
    if (value) {
      filterParts.push(` ${key}="${value}"`);
    }
  }

  filterParts.push(
    buildFilter(
      { agentName, packageType, salesAgentsTeams, approver },
      leadMapped
    )
  );

  if (!isAllRequests) {
    filterParts.push(initialFilter);
  } else {
    filterParts.push("lead.product='products/car-insurance'");
  }
  return filterParts.join(' ');
};
