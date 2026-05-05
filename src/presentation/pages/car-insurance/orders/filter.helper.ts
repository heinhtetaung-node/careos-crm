/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { getI18n } from 'react-i18next';
import { map } from 'rxjs/operators';

import InsurerAPI from 'data/gateway/api/services/insurer';
import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import { insuranceType } from 'presentation/components/QcDetailPage/hooks/usePackagesInfo';
import { getString } from 'presentation/theme/localization';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';
import {
  addOnOptions,
  documentStatusOptions,
  itemDocumentStatusOptions,
  itemQcStatusOptions,
  paymentStatusOptions,
  qcStatusOptions,
} from 'shared/constants/ordersAllSearchFields';
import TeamRole from 'shared/constants/teamRole';

import {
  assignToTeamField,
  assignToUserField,
  getPolicyFields,
  salesAgentsField,
  salesAgentsTeamsField,
} from './filterFields';
import { getNewValue, getPayload, getSearch } from './useOrderSearch';

export enum OrderFilters {
  ORDER_IS_CANCELLED = 'order.isCancelled in ("false")',
  ORDER_IS_NOT_CANCELLED = 'order.isCancelled in ("true")',
}

export const SearchFields = [
  { id: 1, title: 'text.select', value: '' },
  {
    id: 2,
    title: 'searchFieldPrintingAndShippingOption.policyHolderName',
    value: 'policyHolderName',
  },
  { id: 3, title: 'searchFieldLeadOption.customerName', value: 'customerName' },
  {
    id: 4,
    title: 'searchFieldLeadOption.customerPhone',
    value: 'customerPhone',
  },
  {
    id: 5,
    title: 'searchFieldLeadOption.customerEmail',
    value: 'customerEmail',
  },
  { id: 6, title: 'searchFieldPrintingAndShippingOption.orderId', value: 'id' },
  { id: 7, title: 'searchFieldLeadOption.licensePlate', value: 'licensePlate' },
  {
    id: 8,
    title: 'searchFieldLeadOption.reference',
    value: 'reference',
  },
  {
    id: 9,
    title: 'text.chassisNumber',
    value: 'chassisNumber',
  },
  {
    id: 10,
    title: 'searchFieldOrderOption.applicationNumber',
    value: 'applicationNumber',
  },
];

const localeSearchFields = SearchFields.map((searchField) => ({
  ...searchField,
  title: getString(searchField.title),
}));

export const INITIAL_VALUES = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  source: [],
  leadStatus: [],
  assignToUser: [],
  assignToTeam: [],
  insuranceType: null,
  insurer: [],
  documentStatus: [],
  qcStatus: [],
  approvalStatus: [],
  submissionStatus: [],
  paymentDaysOverdue: [0, 0],
  salesAgents: [],
  salesAgentsTeams: [],
};

export const INITIAL_VALUES_PRINTING_AND_SHIPPING = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  itemInsuranceType: [],
  itemInsurer: [],
  paymentType: [],
  printingPaymentStatus: [],
  itemDocumentStatus: [],
  itemQcStatus: [],
  itemSubmissionStatus: [],
  itemPrintingAndShippingStatus: [],
  itemApprovalStatus: [],
};

export const CANCELLATION_INITIAL_VALUES = {
  search: { key: 'id', value: '' },
  premiumRemittanceStatus: [],
  premiumReturnStatus: [],
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
};

const policyListing = [
  '/orders/approval',
  '/orders/shipment',
  '/orders/submission',
];

const showSalesAgentsTeams = ['/orders/all', '/orders/approval'];

const ordersAll = '/orders/all';
const ordersAllHealth = '/health/orders';
const myOrders = '/orders/my-orders';
const myOrdersHealth = '/health/orders/my-orders';
const showPolicyFields = [ordersAll, myOrders, ordersAllHealth, myOrdersHealth];

export function getInsurersList({ pageSize, pageToken }: InsurerAPIOptions) {
  const insurerAPI = new InsurerAPI();
  return insurerAPI.getInsurers(pageSize, pageToken).pipe(
    map((response) => {
      const { data } = response;

      if (data == null) {
        return [];
      }

      const language = getI18n()?.language || 'en';

      return {
        nextPageToken: data.nextPageToken,
        data: data.insurers.map(
          ({ name, displayName, displayNameTh }, index) => ({
            id: index,
            displayName: language === 'th' ? displayNameTh : displayName,
            name,
          })
        ),
      };
    })
  );
}

export const getFields = ({
  teamRole = null,
  isAdmin = false,
}: {
  teamRole?: TeamRole | TeamRole[] | null;
  isAdmin?: boolean;
}): IFilterFormField[] => [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: localeSearchFields,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
      },
    },
  },
  {
    InputComponent: MultiDateRangeWithType,
    inputProps: {
      name: 'date',
      label: '',
      value: '',
      filterType: 'detail',
      responsive: {
        xs: 12,
        md: 9,
      },
      hasExpand: true,
    },
  },
  // NOTE: Temporary hide in ORDER-1435
  // paymentTypeField(),
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'paymentStatus',
      label: getString('text.paymentStatus'),
      placeholder: getString('text.select'),
      options: paymentStatusOptions,
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  // NOTE: Temporary hide in ORDER-1435
  // {
  //   InputComponent: Controls.Slider,
  //   inputProps: {
  //     name: 'paymentDaysOverdue',
  //     label: getString('text.paymentDaysOverdue'),
  //     min: 0,
  //     max: 9999999,
  //     step: 10000,
  //     marks: false,
  //     isPlaceHolder: false,
  //     filterType: 'detail',
  //     fixedLabel: true,
  //     responsive: {
  //       xs: 6,
  //       md: 3,
  //     },
  //   },
  // },
  // Empty space to make document status move to new line.
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: '',
      label: '',
      placeholder: '',
      options: [],
      filterType: 'detail-empty',
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
      name: 'documentStatus',
      label: getString('text.documentStatus'),
      placeholder: getString('text.select'),
      options: policyListing.includes(window.location.pathname)
        ? itemDocumentStatusOptions
        : documentStatusOptions,
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
      name: 'qcStatus',
      label: getString('text.qcStatus'),
      placeholder: getString('text.select'),
      options: policyListing.includes(window.location.pathname)
        ? itemQcStatusOptions
        : qcStatusOptions,
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
    InputComponent: Controls.Select,
    inputProps: {
      name: 'insuranceType',
      label: getString('leadDetailFields.insuranceType'),
      placeholder: getString('text.select'),
      options: Object.entries(insuranceType).map(([value, title], index) => ({
        id: index + 1,
        value,
        title,
      })),
      filterType: 'detail',
      selectField: 'value',
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
      name: 'insurer',
      label: getString('qc.insurer'),
      placeholder: getString('text.select'),
      async: true,
      asyncFn: () =>
        getInsurersList({
          pageSize: 1000,
        }),
      paginate: true,
      labelField: 'displayName',
      valueField: 'name',
      filterType: 'detail',
      selectField: 'value',
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
      name: 'addOn',
      label: getString('text.addOns'),
      placeholder: getString('text.select'),
      options: addOnOptions,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
      hasSelectAll: true,
    },
  },
  ...getPolicyFields(
    policyListing.includes(window.location.pathname) ||
      showPolicyFields.includes(window.location.pathname)
  ),
  ...(isAdmin
    ? assignToUserField(
        teamRole,
        !(
          ordersAll.includes(window.location.pathname) ||
          ordersAllHealth.includes(window.location.pathname)
        )
      )
    : []),
  ...salesAgentsField(
    ordersAll.includes(window.location.pathname) ||
      ordersAllHealth.includes(window.location.pathname)
  ),
  ...salesAgentsTeamsField(
    showSalesAgentsTeams.includes(window.location.pathname)
  ),
];

export const preferDeliveryOptionField: IFilterFormField = {
  InputComponent: Controls.Select,
  inputProps: {
    name: 'preferredDeliveryOption',
    label: getString('order.shipping.preferredDeliveryOption'),
    placeholder: getString('text.select'),
    options: getNewShippingMethodsOptions().map(({ value, title }, index) => ({
      id: index + 1,
      value,
      title,
    })),
    filterType: 'detail',
    selectField: 'value',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
    hasSelectAll: true,
  },
};

export const documentsFilters = (
  teamRole: TeamRole | TeamRole[],
  isAdmin: boolean
): IFilterFormField[] => [
  ...getFields({ teamRole, isAdmin }),
  ...(isAdmin
    ? [assignToTeamField(TeamRole.DocumentsCollection, 'assignToDocumentTeam')]
    : []),
  preferDeliveryOptionField,
];

export const cancellationFilters = () => [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: localeSearchFields.filter((field) => field.value === 'id'),
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
      },
    },
  },
];

export const QCFilters = (
  teamRole: TeamRole,
  isAdmin: boolean
): IFilterFormField[] => [
  ...getFields({ teamRole, isAdmin }),
  ...(isAdmin ? [assignToTeamField(teamRole, 'assignToQCTeam')] : []),
];

export const submissionFilters = (
  teamRole: TeamRole | TeamRole[],
  isAdmin: boolean
): IFilterFormField[] => [
  ...getFields({ teamRole, isAdmin }),
  ...(isAdmin
    ? [assignToTeamField(TeamRole.QualityControl, 'assignToSubmissionTeam')]
    : []),
  preferDeliveryOptionField,
];

export const approvalFilters = (
  teamRole: TeamRole,
  isAdmin: boolean
): IFilterFormField[] => [...getFields({ teamRole, isAdmin })];

interface InsurerAPIOptions {
  pageSize: number;
  pageToken?: string;
}

/**
 * Returns an Observable of all the different insurers and their
 * relevant information.
 * @param pageSize
 * @param pageToken
 * @returns Observable of insurers
 */

export const formatSearchVal = (values: any) => {
  const search = getSearch(values);
  const newValue = getNewValue(values, search);
  return getPayload(newValue);
};

export const addFilters = (
  dirtyFilter: boolean,
  intitialFilters: string[],
  searchVal: any
) => {
  if (!dirtyFilter) return { filters: intitialFilters };
  return {
    ...formatSearchVal(searchVal),
  };
};

export const roleCombination = (teamRole: TeamRole | TeamRole[]) =>
  Array.isArray(teamRole) ? teamRole.join(`","`) : teamRole;

export const HealthFilterFields = (baseFields: IFilterFormField[]) => {
  const hiddenSearchOptHealth = ['licensePlate', 'chassisNumber', 'reference'];
  const hiddenDeliveryOptHealth = ['deliveryOptions/kerry-express-dashcam'];

  return (
    baseFields
      // Always remove these fields for health
      .filter(
        (field) => !['addOn', 'insuranceType'].includes(field.inputProps?.name)
      )
      // Always filter out certain search options for health
      .map((field) => {
        const { name, searchOption } = field.inputProps || {};

        if (name === 'search') {
          return {
            ...field,
            inputProps: {
              ...field.inputProps,
              searchOption: searchOption?.filter(
                (opt) => !hiddenSearchOptHealth.includes(opt.value)
              ),
            },
          };
        }

        if (name === 'preferredDeliveryOption') {
          return {
            ...field,
            inputProps: {
              ...field.inputProps,
              options: getNewShippingMethodsOptions().filter(
                ({ value }) => !hiddenDeliveryOptHealth.includes(value)
              ),
            },
          };
        }

        return field;
      })
  );
};
