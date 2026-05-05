import { Grid } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import * as Yup from 'yup';

import FilterPanel from 'presentation/components/FilterPanel/index';

import { getMyLeadFields } from './helper';
import { INITIAL_VALUES } from './myLeadsFilterHelper';

import './index.scss';

// INFO: for update validation
const searchSchema = Yup.object().shape({
  search: Yup.object().shape({}),
  date: Yup.object().shape({}),
});

type TSearchData = {
  searchData: (body: any) => void;
  handleChangeForm: (body: typeof INITIAL_VALUES) => void;
};

function MyLeadsFilter({
  searchData,
  handleChangeForm: _handleChangeForm,
}: Readonly<TSearchData>) {
  const highlightLeadEnabled = false;

  const fields = getMyLeadFields({
    highlightLeadEnabled,
  });

  const handleSubmit = (values: typeof INITIAL_VALUES) => {
    const newValue = {
      ...values,
      date: {
        ...values.date.startDate,
      },
      date2: {
        ...values.date.endDate,
      },
      search: {
        [values.search.key]: values.search.value,
      },
    };

    searchData(newValue);
  };

  return (
    <Grid
      container
      className="my-lead-filter"
      data-testid="myLeads-filter-component"
    >
      <FilterPanel
        fields={fields}
        initialValues={INITIAL_VALUES}
        onSubmit={handleSubmit}
        onReset={handleSubmit}
        validationSchema={searchSchema}
      />
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  lang: state.languageReducer,
});

export default connect(mapStateToProps)(MyLeadsFilter);
