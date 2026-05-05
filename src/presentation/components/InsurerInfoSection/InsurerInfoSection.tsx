import { makeStyles, Paper, Theme } from '@material-ui/core';
import React from 'react';

import { IInsurerItem } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

import ButtonsSection from './ButtonsSection';
import useInsurerInfoSection from './useInsurerInfoSection';

import SectionRenderer from '../common/FormikFields/SectionRenderer';

interface InsurerInfoProps {
  insurers: IInsurerItem[];
  isPaymentMade?: boolean;
  isFieldDisabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    height: '100%',
    border: `1px solid #E9EDF5`,
    borderRadius: 6,
  },
  insurerInfoTitle: {
    margin: 0,
    padding: '10px 15px',
    color: theme.palette.primary.main,
    background: theme.palette.grey[200],
    borderRadius: '6px 6px 0 0',
  },
  insuranceInfoField: {
    display: 'flex',
    padding: '10px 15px',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  fieldItem: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    '&.MuiInputBase-input': {
      lineHeight: '0.5em',
      borderRadius: 6,
      border: `1px solid ${theme.palette.common.blue}`,
      background: theme.palette.common.white,
    },
    '&.MuiSelect-select': {
      "&[aria-expanded='true']": {
        borderBottom: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },
      '&.MuiAutocomplete-inputRoot': {
        fieldset: {
          borderRadius: 4,
          border: `1px solid #e9edf5`,
        },

        '&.MuiInputBase-input': {
          border: 0,
        },
      },
      '&.shared-select, & shared-input': {
        backgroundColor: '#fff',
        borderRadius: 4,
      },
    },
  },
  saveButtonWrapper: {
    display: 'flex',
    marginLeft: 8,
    '& .save-button': {
      [theme.breakpoints.up('md')]: {
        fontSize: 'small',
        minWidth: 38,
        height: '30px !important',
      },

      [theme.breakpoints.up('xl')]: {
        fontSize: 13,
        minWidth: 50,
        height: '30px !important',
      },
    },
  },
  select: {
    borderTop: '1px solid !important',
    borderTopRightRadius: '10px !important',
  },
  saveButton: {
    minHeight: 0,
    padding: 5,
  },
}));

function InsurerInfoSection({
  insurers,
  isPaymentMade,
  isFieldDisabled = false,
}: Readonly<InsurerInfoProps>) {
  const classes = useStyles();

  const { dataSchema } = useInsurerInfoSection(
    insurers,
    isFieldDisabled,
    isPaymentMade
  );

  return (
    <Paper elevation={3} className={`shared-insurer-info ${classes.paper}`}>
      <SectionRenderer
        config={{
          title: getString('text.insurance'),
        }}
        dataSchema={dataSchema}
      />
      <ButtonsSection isFieldDisabled={isFieldDisabled} />
    </Paper>
  );
}

export default InsurerInfoSection;
