import { Grid } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineRoundedIcon from '@material-ui/icons/RemoveCircleOutlineRounded';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  SelectDateTypeLeadAll,
  SelectDateTypeOrderApproval,
} from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getString } from 'presentation/theme/localization';

import DateRangeWithType from '../DateRangeWithType';
import './index.scss';

enum dateName {
  startDate = 'date.startDate',
  endDate = 'date.endDate',
}

function MultiDateRangeWithType(props: any) {
  const { onChange, name, value, options, hasExpand, disabledDay } = props;

  const [isAddDate, setIsAddDate] = useState(false);
  const { pathname } = useLocation();

  const handleClickAddDate = (event: boolean) => {
    setIsAddDate(event);
  };

  const localeSelectDateTypes = () => {
    let types;
    if (pathname.startsWith('/orders')) {
      types = pathname.endsWith('/approval')
        ? [
            ...SelectDateTypeLeadAll.slice(0, -2),
            ...SelectDateTypeOrderApproval,
          ]
        : SelectDateTypeLeadAll.slice(0, -2);
    } else if (pathname.startsWith('/health/orders')) {
      types = SelectDateTypeLeadAll.filter((d) => d.value !== 'assignTime');
    } else {
      types = SelectDateTypeLeadAll;
    }

    return types?.map((type) => ({
      ...type,
      title: getString(type.title),
    }));
  };

  return (
    <Grid container>
      <Grid
        container
        spacing={5}
        alignItems="flex-start"
        className="date-range-content"
      >
        <Grid
          container
          item
          xs={12}
          md={!hasExpand ? 6 : 8}
          className="date-range-container"
        >
          <Grid container item xs={12}>
            <DateRangeWithType
              fixedLabel
              name={name}
              selectName="date"
              value={{ ...value.startDate }}
              options={options || localeSelectDateTypes()}
              label={getString('text.selectDateType')}
              onChange={(fieldName: string, fieldValue: any) => {
                onChange(dateName.startDate, fieldValue);
              }}
              disabledDay={disabledDay}
            />
          </Grid>
          {isAddDate && (
            <Grid container item xs={12} className="mt-10">
              <DateRangeWithType
                fixedLabel
                name={name}
                selectName="date"
                value={{ ...value.endDate }}
                options={options || localeSelectDateTypes()}
                label={getString('text.selectDateType')}
                onChange={(fieldName: string, fieldValue: any) => {
                  onChange(dateName.endDate, fieldValue);
                }}
                disabledDay={disabledDay}
              />
            </Grid>
          )}
        </Grid>

        <Grid
          container
          item
          xs={!hasExpand ? 6 : 4}
          className="date-range-btn pt-[35px] pb-5"
        >
          {!isAddDate ? (
            <Grid container item xs={12}>
              <AddCircleOutlineIcon
                fontSize="small"
                className="share-btn add-btn"
                onClick={() => handleClickAddDate(true)}
              />
            </Grid>
          ) : (
            <Grid item xs={12} md={6} xl={6}>
              <RemoveCircleOutlineRoundedIcon
                fontSize="small"
                className="share-btn remove-btn"
                onClick={() => handleClickAddDate(false)}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default MultiDateRangeWithType;
