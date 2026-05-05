import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import clsx from 'clsx';
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import styled from 'styled-components';

import LeadDetail from 'data/repository/leadDetail/cloud';
import {
  useCreateRenewalPackageMutation,
  useCreateCustomPackageMutation,
} from 'data/slices/customQuoteSlice';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import * as CONSTANTS from 'shared/constants';
import { getErrorMessageFromErrorObj } from 'utils/error';

import CarSumInsured from './CarSumInsured';
import Coverage from './Coverage';
import {
  validationSchema,
  initialCustomQuoteFormData,
  getCarSubModel,
  getCarAgeAndSubModel,
  prepareCreateRenewalQuoteData,
  prepareCustomQuoteFormData,
} from './customQuote.helper';
import Package from './Package';
import PackageType from './PackageType';

import './index.scss';

const useStyles = makeStyles((theme) => ({
  button: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderRadius: '7px',
    padding: '10px 40px',
    [theme.breakpoints.up('lg')]: {
      fontSize: '11px',
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: '14px',
    },
    '&:hover': {
      backgroundColor: Color.BLUE_DARK,
      color: theme.palette.common.white,
    },
  },
  formBackground: {
    background: Color.WHITE,
  },
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

const Wrapper = styled.div`
  height: 100%;
`;

const destroy$ = new Subject();

function CustomQuotePage() {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const [createRenewalQuote] = useCreateRenewalPackageMutation();
  const [createCustomPackage] = useCreateCustomPackageMutation();

  const [carSubModel, setCarSubModel] = useState<number>(0);
  const [carSubModelName, setCarSubModelName] = useState<string>('');
  const [carYear, setCarYear] = useState<number>(0);
  const [registeredProvince, setRegisteredProvince] = useState('');

  const leadData = useAppSelector(
    (state) => state?.leadsDetailReducer?.lead?.payload?.data
  );
  const [updatedPackageType, setUpdatedPackageType] = useState<string>('');

  useEffect(() => {
    if (leadData) {
      setRegisteredProvince(leadData.registeredProvince ?? '');
      if (carSubModel === 0 && carYear === 0) {
        // api wont be called if carSubModel or carYear already exist
        LeadDetail.getCarBySubModelYear(leadData.carSubModelYear)
          .pipe(
            takeUntil(destroy$),
            mergeMap((res: any) => getCarAgeAndSubModel(res))
          )
          .subscribe((res: any) => {
            const [carSubModelData, carYearData] = res;
            setCarSubModel(getCarSubModel(carSubModelData));
            setCarSubModelName(carSubModelData.displayName);
            setCarYear(carYearData.year);
          });
      }
    } else {
      dispatch(getLead());
    }
    return () => {
      destroy$.next(true);
    };
  }, [dispatch, leadData, carSubModel, carYear]);

  const createPackageApiChooser = (formValues: FormikValues) => {
    if (formValues.package_type === 'RENEWAL') {
      return createRenewalQuote({
        leadId: `leads/${id}`,
        packageData: {
          renewalPackage: prepareCreateRenewalQuoteData(formValues),
        },
      });
    }

    const formattedValue = prepareCustomQuoteFormData(
      formValues,
      carSubModel.toString(),
      registeredProvince
    );

    return createCustomPackage({
      leadId: `leads/${id}`,
      packageData: { package: formattedValue },
    });
  };

  const onSubmit = async (formVal: FormikValues) => {
    const response = await createPackageApiChooser(formVal);

    if (!('data' in response)) {
      const error = response.error as any;
      const errorMessage = getErrorMessageFromErrorObj(error?.data);
      const errorCode = error?.status;

      dispatch(
        showSnackBar({
          isOpen: true,
          message:
            errorCode === 424 ? getString('text.leadIsNotSync') : errorMessage,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );

      return;
    }

    dispatch(
      showSnackBar({
        isOpen: true,
        message: getString('package.createPackageSuccessfully'),
        status: CONSTANTS.snackBarConfig.type.success,
      })
    );

    const fromPackages = location.state?.fromPackages;
    navigate(fromPackages ? `/leads/${id}/packages` : `/leads/${id}`);
  };

  return (
    <Wrapper
      className={clsx('custom-quote-page mb-5 pb-2', classes.formBackground)}
      data-testid="custom-quote-wrapper"
    >
      <Formik
        initialValues={initialCustomQuoteFormData}
        validationSchema={validationSchema()}
        isInitialValid={false}
        onSubmit={onSubmit}
      >
        {(formik: FormikProps<any>) => (
          <Form>
            <Grid container direction="row" justifyContent="center">
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                className="custom-quote-page__action"
              >
                <Button
                  size="medium"
                  className="custom-quote-page--backbtn"
                  onClick={() => navigate(-1)}
                >
                  <ArrowBackIosIcon />
                  <b>{getString('package.backButton')}</b>
                </Button>
                <Button
                  className={classes.button}
                  type="submit"
                  disabled={!formik.isValid}
                >
                  {getString('package.saveAndSendPackageButton')}
                </Button>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              spacing={5}
              className={clsx('pt-12 px-[5%]')}
            >
              <Grid item xs={12} md={3}>
                <PackageType
                  classes={classes}
                  handleChangePackageType={setUpdatedPackageType}
                />
              </Grid>
              <Grid item xs={12} md={3} lg={3}>
                <Package
                  classes={classes}
                  updatedPackageType={updatedPackageType}
                />
              </Grid>
              <Grid item xs={12} md={3} lg={3}>
                <CarSumInsured
                  carSubmodels={carSubModelName}
                  carAge={carYear}
                />
              </Grid>
              <Grid item xs={12} md={3} lg={3}>
                <Coverage classes={classes} />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default CustomQuotePage;
