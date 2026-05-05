import React from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { connect } from 'react-redux';

import { TeamName, Product, LeadType, Manager } from 'mock-data/AdminPage.mock';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField';
import { getString } from 'presentation/theme/localization';

import Controls from '../../controls/Control';
import './LeadsFilter.scss';

const searchOption = [
  { id: 1, value: 'carInsurance', title: 'Car Insurance' },
  { id: 2, value: 'healthInsurance', title: 'Health Insurance' },
  { id: 3, value: 'lifeInsurance', title: 'Life Insurance' },
];

const LeadsFilter: React.FC = () => {
  const handleSubmit = (values: any) => {
    console.log(values);
  };

  const fields: IFilterFormField[] = [
    {
      InputComponent: SearchField,
      inputProps: {
        name: 'search',
        label: getString('text.search'),
        fixedLabel: true,
        searchOption,
        placeholder: getString('text.select'),
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 6,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'leadSource',
        label: getString('text.leadSource'),
        fixedLabel: true,
        options: TeamName,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'leadStatus',
        label: getString('text.leadStatus'),
        fixedLabel: true,
        options: TeamName,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Slider,
      inputProps: {
        name: 'sumInsured',
        label: getString('text.preferredSumInsured'),
        min: 0,
        max: 100000,
        step: 10000,
        marks: true,
        fixedLabel: true,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'carBrand',
        label: getString('text.carBrand'),
        fixedLabel: true,
        options: Product,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'leadType',
        label: getString('text.leadType'),
        fixedLabel: true,
        options: LeadType,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'assignToUser',
        label: getString('text.assignedToUser'),
        fixedLabel: true,
        options: Manager,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'assignToTeam',
        label: getString('text.assignedToTeam'),
        fixedLabel: true,
        options: Manager,
      },
      xs: 12,
      md: 6,
      lg: 6,
      xl: 3,
    },
  ];

  const initialValues = {
    date: { criteria: '', range: {} },
    date2: { criteria: '', range: {} },
    search: { '': '' },
    product: [],
    leadSource: [],
    leadStatus: [],
    leadScore: [],
    carBrand: [],
    leadType: [],
    assignToUser: [],
    assignToTeam: [],
    sumInsured: [0, 0],
  };

  return (
    <FilterPanel
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onReset={handleSubmit}
    />
  );
};

const mapStateToProps = (state: any) => ({
  lang: state.languageReducer,
});

export default connect(mapStateToProps)(LeadsFilter);
