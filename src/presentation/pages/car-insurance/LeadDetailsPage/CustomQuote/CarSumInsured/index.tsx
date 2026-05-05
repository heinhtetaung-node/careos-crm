import { makeStyles, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';

import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import { carAndSumInsuredSchema } from 'shared/constants/packageFormFields';

import { getTitle } from '../customQuote.helper';
import CustomQuoteField from '../customQuoteField';

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: theme.typography.h6.fontSize,
    fontFamily: theme.typography.fontFamily,
  },
  titleBackground: {
    background: theme.palette.info.main,
  },
  inputRow: {
    '&:nth-child(2n - 1)': {
      background: Color.BLUE_WHITE,
      '& .MuiInputBase-root': {
        background: Color.WHITE,
        borderRadius: '10px',
      },
    },
    '& .custom-quote-page__field--item': {
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
}));

interface CarSumInsuredProps {
  carSubmodels: string;
  carAge: number;
}

function CarSumInsured({ carSubmodels, carAge }: Readonly<CarSumInsuredProps>) {
  const classes = useStyles();
  // INFO: Set Car Submodels* Value when have data from Redux
  const { setFieldValue } = useFormikContext<any>();
  useEffect(() => {
    setFieldValue('car_submodels', carSubmodels);
  }, [carSubmodels, setFieldValue]);

  useEffect(() => {
    setFieldValue('car_age', carAge);
  }, [carAge, setFieldValue]);

  return (
    <Paper elevation={3} className="shared-insurer-info">
      <div className="package-section custom-quote-components">
        <div className="custom-quote-components--headerSection">
          <div
            className={clsx('custom-quote-page__name', classes.titleBackground)}
          >
            <h5
              className={clsx('custom-quote-page__name--text', classes.title)}
            >
              {getString('package.carAndSumInsuredTitle')}
            </h5>
          </div>
        </div>
        <CustomQuoteField
          data={getTitle(carAndSumInsuredSchema)}
          classes={classes}
        />
      </div>
    </Paper>
  );
}

export default CarSumInsured;
