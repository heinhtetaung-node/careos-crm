import { Grid } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import Helmet from 'react-helmet';
import * as Yup from 'yup';

import TeamSourceCloud from 'data/repository/admin/team/cloud';
import CarSourceCloud from 'data/repository/car/cloud';
import { useLazyAssignUserSearchQuery } from 'data/slices/gffSlice';
import { useLazyGetRejectionReasonsQuery } from 'data/slices/rejectionSlice';
import { useLazyGetSourcesLeadServiceQuery } from 'data/slices/sourceSlices/sourceSlices';
import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import LeadTable from 'presentation/components/TableAllLead/LeadTable';
import { clearLeadAssignmentPageState } from 'presentation/redux/actions/leads/lead-assignment';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';

import TABLE_LEAD_TYPE, {
  LeadType,
  SearchFieldLeadAll,
  StatusLeadAll,
  INITIAL_VALUES,
  DuplicateLead,
  RejectedLead,
  RenewalStatuses,
  YesNoOptions,
  handleUserData,
} from './LeadDashBoard.helper';
import { useLazyGetAllUserStreamingByLeadSearchQuery } from 'data/slices/userSlice';

interface LeadDashboardProps {
  tableType: string;
  helmet: string;
}

// INFO: for update validation
const searchSchema = Yup.object().shape({
  search: Yup.object().shape({}),
  date: Yup.object().shape({}),
});

const localeSearchFieldLeadAll = SearchFieldLeadAll.map((searchField) => ({
  ...searchField,
  title: getString(searchField.title),
}));

export const localeLeadType = LeadType.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const localeStatusLeadAll = StatusLeadAll.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const duplicateLead = DuplicateLead.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const rejectedLead = RejectedLead.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const renewalStatus = RenewalStatuses.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const yesNoFilterOptions = YesNoOptions.map((option) => ({
  ...option,
  title: getString(option.title),
}));

const getLeadStatusByTable = (tableType: string) => {
  const statuses = localeStatusLeadAll;

  if (tableType === 'LEAD_ASSIGNMENT') {
    return statuses.filter(
      (status) => status.value !== 'LEAD_STATUS_PURCHASED'
    );
  }

  return statuses;
};

function LeadDashBoard({ tableType, helmet }: LeadDashboardProps) {
  const product = useAppSelector(
    (state) =>
      state.typeSelectorReducer.globalProductSelectorReducer?.data || ''
  );

  const [getSourcesLeadService] = useLazyGetSourcesLeadServiceQuery();
  const [getRejectionReasons] = useLazyGetRejectionReasonsQuery();
  const [searchAssignedUser] = useLazyAssignUserSearchQuery();
  const [
    getUsersDataFromLeadApi,
    { data: usersDataFromLeadApi, isLoading: isUsersDataLoading },
  ] = useLazyGetAllUserStreamingByLeadSearchQuery();

  const getLeadSources = () =>
    getSourcesLeadService({
      filter: `product in ("${product}")`,
      pageSize: 100,
    });

  const rejectionReason: IFilterFormField = {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'rejectionReasons',
      label: getString('text.rejectionReasons'),
      onFocusFn: getRejectionReasons,
      hasFormattedResponse: true,
      selectField: 'value',
      fixedLabel: true,
      filterType: 'detail',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  };

  const duplicateLeadField: IFilterFormField = {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'rejectedLead',
      label: getString('lead.rejectedLead'),
      options: rejectedLead,
      selectField: 'value',
      fixedLabel: true,
      filterType: 'detail',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  };

  const renewalPackageStatus: IFilterFormField = {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'renewalPackageStatus',
      label: getString('text.renewalPackageStatus'),
      options: renewalStatus,
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  };

  const sundayContactable: IFilterFormField = {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'sundayContactable',
      label: getString('text.sundayContactable'),
      options: yesNoFilterOptions,
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  };

  const fields: IFilterFormField[] = [
    {
      InputComponent: SearchField,
      inputProps: {
        name: 'search',
        label: getString('text.search'),
        searchOption: localeSearchFieldLeadAll,
        fixedLabel: true,
        filterType: 'summary',
        placeholder: getString('text.select'),
        responsive: {
          xs: 6,
          md: 6,
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
          md: 12,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'source',
        label: getString('text.leadSource'),
        onFocusFn: getLeadSources,
        labelField: 'source',
        valueField: 'name',
        fixedLabel: true,
        filterType: 'detail',
        hasSelectAll: tableType !== TABLE_LEAD_TYPE.LEAD_REJECTION,
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'leadStatus',
        label: getString('text.leadStatus'),
        options: getLeadStatusByTable(tableType),
        filterType: 'detail',
        fixedLabel: true,
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Slider,
      inputProps: {
        name: 'sumInsured',
        label: getString('text.preferredSumInsured'),
        min: 0,
        max: 9999999,
        step: 10000,
        marks: false,
        isPlaceHolder: false,
        filterType: 'detail',
        fixedLabel: true,
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Slider,
      inputProps: {
        name: 'callAttempts',
        label: getString('text.callAttempts'),
        min: 0,
        max: 2000,
        step: 1,
        marks: false,
        isPlaceHolder: false,
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
        name: 'carBrand',
        label: getString('text.carBrand'),
        lookupFn: CarSourceCloud.getCarBrandLookup,
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
        name: 'leadType',
        label: getString('text.leadType'),
        options: localeLeadType,
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
        name: 'assignToUser',
        label: getString('text.assignedToUser'),
        async: true,
        asyncFn: undefined,
        onFocusFn: () =>
          searchAssignedUser({ query: '' }).then(({ data }) => ({
            data: handleUserData(data, true),
          })),
        searchFn: (query) =>
          searchAssignedUser({ query }).then(({ data }) =>
            handleUserData(data, false)
          ),
        labelField: 'fullName',
        valueField: 'value',
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
        hasSelectAll: false,
        testid: 'assigned-to-user-autocomplete',
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'assignToTeam',
        label: getString('text.assignedToTeam'),
        async: true,
        asyncFn: (payload: any) =>
          TeamSourceCloud.getTeamsFilter(payload, product),
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
      InputComponent: Controls.Select,
      inputProps: {
        name: 'duplicateLead',
        label: getString('lead.duplicateLead'),
        options: duplicateLead,
        selectField: 'value',
        fixedLabel: true,
        filterType: 'detail',
        placeholder: getString('text.select'),
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
  ];

  if (tableType === TABLE_LEAD_TYPE.LEAD_REJECTION) {
    fields.push(rejectionReason);
  }

  if (tableType === TABLE_LEAD_TYPE.LEAD_ALL) {
    fields.push(duplicateLeadField);
  }

  if (
    tableType === TABLE_LEAD_TYPE.LEAD_ALL ||
    tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT
  ) {
    fields.push(renewalPackageStatus);
  }

  if (
    tableType === TABLE_LEAD_TYPE.LEAD_ALL ||
    tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT
  ) {
    fields.push(sundayContactable);
  }

  const [searchValue, setSearchValue] = useState(INITIAL_VALUES);
  const [agentNameOptions, setAgentNameOptions] = useState<
    Array<Record<string, any>>
  >([]);

  const dispatch = useAppDispatch();

  const handleSubmit = (values: typeof INITIAL_VALUES) => {
    setSearchValue(values);
  };

  const getAgentNameUsersData = () =>
    getUsersDataFromLeadApi(
      `filter=user.role.keyword in("roles/sales") user.product="products/health-insurance"`
    );

  const hasLoadedAgentNames = useRef(false);
  const handleAgentNameFocus = () => {
    if (hasLoadedAgentNames.current) return;
    hasLoadedAgentNames.current = true;
    getAgentNameUsersData();
  };

  useEffect(() => {
    if (!usersDataFromLeadApi?.users) return;
    setAgentNameOptions(usersDataFromLeadApi.users);
  }, [usersDataFromLeadApi]);

  const adjustFilterByProduct = (
    filterFields: IFilterFormField[]
  ): IFilterFormField[] => {
    if (product === 'products/health-insurance') {
      const transformedFields = filterFields
        .filter(
          (field) => !['sumInsured', 'carBrand'].includes(field.inputProps.name)
        )
        .map((field) => {
          // For agent name dropdown
          if (field.inputProps.name === 'assignToUser') {
            return {
              InputComponent: Controls.Autocomplete,
              inputProps: {
                name: 'assignToUser',
                label: getString('text.agentName'),
                async: false,
                onFocus: handleAgentNameFocus,
                options: agentNameOptions,
                loading: isUsersDataLoading,
                labelField: 'fullName',
                valueField: 'name',
                filterType: 'detail',
                fixedLabel: true,
                responsive: {
                  xs: 6,
                  md: 3,
                },
                searchOption: [],
              },
            } as IFilterFormField;
          }

          return field;
        });

      transformedFields[0].inputProps.searchOption =
        transformedFields?.[0]?.inputProps?.searchOption?.filter(
          (option: { value: string }) =>
            !['licensePlate', 'chassisNumber'].includes(option.value)
        );

      return transformedFields;
    }
    return filterFields;
  };

  useEffect(
    () => () => {
      dispatch(clearLeadAssignmentPageState());
    },
    [dispatch]
  );

  return (
    <>
      <Helmet title={helmet} />
      <Grid container spacing={6} data-testid="lead-dashboard">
        <Grid item xs={12} lg={12}>
          <FilterPanel
            fields={adjustFilterByProduct(fields)}
            initialValues={INITIAL_VALUES}
            onSubmit={handleSubmit}
            onReset={handleSubmit}
            validationSchema={searchSchema}
          />
        </Grid>
        <Grid item xs={12} lg={12}>
          <LeadTable tableType={tableType} searchValue={searchValue} />
        </Grid>
      </Grid>
    </>
  );
}
export default LeadDashBoard;
