import { Button, makeStyles, Paper, Theme } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';

import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';

import {
  getStatusColor,
  CustomerSectionProps,
  INITIAL_STATUS_VALUE,
  mappingCustomerStatus,
} from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import LeadInfo from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/LeadInfo';

import Customer from './Customer';
import PolicyHolderInformation from './PolicyHolderInformation';

import 'presentation/pages/car-insurance/LeadDetailsPage/index.scss';
import { HealthLead } from 'shared/types/lead';

export const clearRejectionSub$ = new Subject();

export const useStyles = makeStyles((theme: Theme) => ({
  Paper: {
    height: '100%',
  },
  HeaderTitle: {
    display: 'inline-block',
    width: '100%',
    minHeight: 43,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[200],
    '& b': {
      fontSize: 16,
    },
    '& .header-content': {
      padding: '10px 15px',
      margin: 'auto',
      wordBreak: 'break-word',
      '& span': {
        fontSize: 12,
        fontWeight: 'normal',
      },
    },
  },
  Title: {
    margin: 0,
    padding: '10px 15px',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[200],
  },
  Button: {
    float: 'right',
    padding: '0 5px',
    borderRadius: 4,
    textTransform: 'none',
    color: '#fff',
  },
  Item: {
    marginBottom: 11,
    borderRadius: 10,
    '& h3': {
      borderRadius: '10px 10px 0 0',
    },

    '&.column-status': {
      '& div:first-child': {
        borderRadius: '10px 10px 0 0',
        borderLeft: 'none',
        borderRight: 'none',
      },
    },

    '& div:last-child': {
      borderRadius: '0 0 10px 10px',
    },
  },
  statusGreen: {
    backgroundColor: '#1AA886 !important',
    '&:hover': {
      backgroundColor: '#1AA886 !important',
    },
  },
  statusOrange: {
    backgroundColor: '#FF9D00 !important',
    '&:hover': {
      backgroundColor: '#FF9D00 !important',
    },
  },
  statusGray: {
    backgroundColor: '#D9D9D9 !important',
    '&:hover': {
      backgroundColor: '#D9D9D9 !important',
    },
  },
}));

function CustomerSection({
  isFieldDisabled = false,
  isPendingRejection = false,
  isPartiallyDisabled = false,
}: CustomerSectionProps) {
  const classes = useStyles();

  const lead = useGetLeadSelector() as unknown as HealthLead;

  const [_isFieldDisabled, setFieldDisabled] = useState(isFieldDisabled);

  useEffect(() => {
    setFieldDisabled(isFieldDisabled);
  }, [isFieldDisabled]);

  const headerSection = useMemo(() => {
    const buttonClasses = lead.isRejected
      ? classes.statusGray
      : getStatusColor(isPendingRejection, classes);
    return (
      <div className={clsx(classes.HeaderTitle, 'rounded-t-lg')}>
        <div className="header-content">
          <b className="unittest-header">{getString('text.leadInformation')}</b>
          {isPendingRejection !== INITIAL_STATUS_VALUE && (
            <Button
              className={clsx(classes.Button, buttonClasses)}
              variant="contained"
            >
              {mappingCustomerStatus(lead.status)}
            </Button>
          )}
        </div>
      </div>
    );
  }, [classes, isPendingRejection, lead.isRejected, lead.status]);

  return (
    <Paper className="customer-section-container">
      <div className="customer-section" data-testid="customer-section">
        <LeadInfo headerSection={headerSection} isHealth />
        <Customer
          isFieldDisabled={_isFieldDisabled}
          isPartiallyDisabled={isPartiallyDisabled}
        />
        <PolicyHolderInformation
          isFieldDisabled={_isFieldDisabled}
          isPartiallyDisabled={isPartiallyDisabled}
        />
      </div>
    </Paper>
  );
}

export default CustomerSection;
