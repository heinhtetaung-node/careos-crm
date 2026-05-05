import { SearchLeads, SelectDateTypeMyLeads } from 'mock-data/AdminPage.mock';
import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import CarModelFilter from 'presentation/components/FilterPanel/Filters/CarModelFilter';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import {
  LeadType,
  RenewalStatuses,
  StatusLeadAll,
  YesNoOptions,
} from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getString } from 'presentation/theme/localization';

// eslint-disable-next-line import/prefer-default-export
export const getMyLeadFields = ({
  highlightLeadEnabled,
}: {
  highlightLeadEnabled: boolean;
}) => {
  const localeSelectDateTypeMyLeads = SelectDateTypeMyLeads.map((type) => ({
    ...type,
    title: getString(type.title),
  }));

  const localeLeadStatus = StatusLeadAll.map((type) => ({
    ...type,
    title: getString(type.title),
  }));

  const localeLeadType = LeadType.map((type) => ({
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

  const fields: IFilterFormField[] = [
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'leadStatus',
        label: getString('text.leadStatus'),
        options: localeLeadStatus,
        filterType: 'summary',
        fixedLabel: true,
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: MultiDateRangeWithType,
      inputProps: {
        name: 'date',
        label: '',
        value: '',
        options: localeSelectDateTypeMyLeads,
        filterType: 'summary',
        responsive: {
          xs: 12,
          md: 6,
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
      InputComponent: SearchField,
      inputProps: {
        name: 'search',
        label: getString('text.search'),
        searchOption: SearchLeads,
        fixedLabel: true,
        filterType: 'detail',
        placeholder: getString('text.select'),
        responsive: {
          xs: 12,
          md: 6,
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
        testid: 'lead-type-autocomplete',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Select,
      inputProps: {
        name: 'renewalPackageStatus',
        label: getString('text.renewalPackageStatus'),
        options: renewalStatus,
        filterType: 'detail',
        selectField: 'value',
        placeholder: getString('text.select'),
        fixedLabel: true,
        multiple: false,
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
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
    },
    {
      InputComponent: CarModelFilter,
      inputProps: {
        name: 'carmodel',
        label: '',
        options: renewalStatus,
        filterType: 'detail',
        selectField: 'value',
        responsive: {
          xs: 12,
          md: 6,
        },
        dependentValues: ['car.brand', 'car.model'],
      },
    },
  ];

  if (highlightLeadEnabled) {
    fields.push({
      InputComponent: Controls.Select,
      inputProps: {
        name: 'highlightedColor',
        label: getString('lead.highlightedColor'),
        options: [
          {
            id: 0,
            value: 'blue',
            title: getString('highlightedColor.blue'),
          },
        ],
        selectField: 'value',
        fixedLabel: true,
        filterType: 'detail',
        placeholder: getString('text.select'),
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    });
  }

  return fields;
};
