import StopIcon from '@material-ui/icons/Block';
import ActiveIcon from '@material-ui/icons/CheckCircle';
import { ClassNameMap } from '@material-ui/styles';
import React from 'react';

import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { statusOptions } from 'shared/helper/selectOptions';
import { isAfter, set, format, add } from 'utils/datetime';

import { FilterParam } from './types';

export const Columns: Column[] = [
  {
    id: 'status',
    field: 'absent',
    label: 'text.status',
    minWidth: 120,
  },
  {
    id: 'displayName',
    field: 'displayName',
    label: 'text.teamName',
    minWidth: 120,
  },
  {
    id: 'fullName',
    field: 'firstName',
    label: 'text.name',
    minWidth: 150,
  },
  {
    id: 'email',
    field: 'humanId',
    label: 'text.email',
    minWidth: 100,
  },
  {
    id: 'tier',
    field: 'tier',
    label: 'text.tier',
    minWidth: 50,
  },
  {
    id: 'effectiveDate',
    field: 'effectiveDate',
    label: 'menu.autoAssignment.effectiveDate',
    minWidth: 140,
  },
  {
    id: 'lastImport',
    field: 'updateTime',
    label: 'menu.autoAssignment.lastImport',
    minWidth: 140,
  },
  {
    id: 'dailyQuota',
    field: 'quota',
    label: 'text.dailyQuota',
    minWidth: 50,
  },
  {
    id: 'assignedLeadCount',
    field: 'assignedLeadCount',
    label: 'text.assignedLeadCount',
    minWidth: 50,
  },
  {
    id: 'sundayAgent',
    field: 'sundayAgent',
    label: 'text.sundayAgent',
    minWidth: 50,
  },
];

export const filterFields = (
  classes: ClassNameMap<string>,
  getTeams: () => void
) =>
  [
    {
      InputComponent: Controls.Select,
      inputProps: {
        name: 'status',
        label: getString('text.status'),
        placeholder: getString('text.select'),
        options: statusOptions,
        labelField: 'title',
        multiple: false,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'displayName',
        label: getString('text.teamName'),
        labelField: 'displayName',
        valueField: 'name',
        async: false,
        onFocusFn: getTeams,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
        hasSelectAll: true,
      },
    },
    {
      InputComponent: Controls.KeyBoardDatePicker,
      inputProps: {
        className: classes.shared_input,
        name: 'effectiveDate',
        placeholder: getString('text.enterEffectiveDate'),
        label: getString('menu.autoAssignment.effectiveDate'),
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
  ] as IFilterFormField[];

export const tableInitialValues = {
  displayName: [],
  fullName: [],
  status: '',
  effectiveDate: null,
};

export const SettingHeaderTemplate = ({ classes, params, isLoading }: any) => {
  const autoAssignStatus = params?.autoAssignmentEnabled ? (
    <span className={`${classes.statusText} success`}>
      <ActiveIcon fontSize="small" />
      &nbsp;
      {getString('text.on')}
    </span>
  ) : (
    <span className={`${classes.statusText} error`}>
      <StopIcon fontSize="small" />
      &nbsp;
      {getString('text.off')}
    </span>
  );

  return [
    {
      title: getString('text.autoAssign'),
      content: !isLoading ? (
        autoAssignStatus
      ) : (
        <h2>{getString('text.loading')}</h2>
      ),
    },
    {
      title: getString('text.threshold'),
      content: !isLoading ? (
        <h2>
          {params?.premiumLeadThreshold?.toLocaleString('en-US')}
          &nbsp; THB
        </h2>
      ) : (
        <h2>{getString('text.loading')}</h2>
      ),
    },
    {
      title: getString('text.noOfTier'),
      content: !isLoading ? (
        <h2>
          {params?.numTopTier}
          &nbsp;
          {getString('menu.autoAssignment.people')}
        </h2>
      ) : (
        <h2>{getString('text.loading')}</h2>
      ),
    },
  ];
};

export const getDefaultEffectiveDate = () => {
  let currentDate = new Date();
  if (isAfter(currentDate, set(new Date(), { hours: 19, minutes: 0 }))) {
    currentDate = add(currentDate, { days: 1 });
  }

  return format(currentDate, 'yyyy-MM-dd');
};

export const addFilterToURI: (payload: FilterParam) => string = (payload) => {
  let URL = '';

  Object.entries(payload).forEach((data) => {
    const [key, value] = data;
    if (!value) return;

    if (Array.isArray(value) && value.length) {
      const mergedNames =
        value
          .map((val) => (val.key ? `"${val.key}"` : `"${val.name}"`))
          .join(',') ?? '';

      URL += `${
        key === 'displayName' ? 'team' : 'user'
      }.name in (${mergedNames}) `;
    }

    if (key === 'effectiveDate') {
      URL += `config.${key}="${format(new Date(value.toString()), 'yyyy-MM-dd')}"`;
    }

    if (typeof value !== 'string') return;

    if (key === 'status') {
      URL += `config.absent=${value === '1'} `;
    }
  });
  return URL;
};
