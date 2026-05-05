/* eslint-disable react/jsx-no-bind */
import { Button as PackageButton } from '@alphafounders/ui';
import { Grid, InputLabel } from '@material-ui/core';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import React, { useCallback } from 'react';

import Controls from 'presentation/components/controls/Control';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import {
  validationSchema,
  transformPayload,
  getValidationData,
  ageValidationFn,
  updateOrderFixedDriver,
  validationSchemaOrder,
} from './helper';

import CommonModal from '../CommonModal';
import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';

export interface IFixedDriverModal {
  readonly openModal: boolean;
  handleCloseModal: () => void;
  readonly title?: string;
  readonly leadData: any;
  readonly isDisabled?: boolean;
  readonly isOrder?: boolean;
  readonly driverCount?: number;
  onSuccess?: (values: any) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&& input': {
      display: 'none',
      width: 0,
    },
  },
  icon: {
    display: 'none',
    width: 0,
  },
  checkedIcon: {
    display: 'none',
    width: 0,
  },
  dobInput: {
    '& > div': {
      width: '100%',
      padding: '5px 5px 5px 10px',
      border: '1px solid',
      borderColor: theme.palette.common.blue,
      borderRadius: '10px',
    },
    '& > div:hover': {
      borderColor: theme.palette.common.blueNormal,
    },
  },
}));

const FormControlLabel = withStyles((theme) => ({
  root: {
    margin: 0,
    width: '100%',
    textAlign: 'center',
    padding: '13px 10px',
    border: '1px solid',
    borderColor: theme.palette.common.blue,
    borderRadius: '10px',
    '&:hover': {
      borderColor: theme.palette.common.blueNormal,
    },
    '&& span:first-child': {
      width: 0,
      padding: 0,
    },
    '&.selected': {
      background: '#f2f3fa',
      border: '1px solid',
      borderColor: theme.palette.common.blueNormal,
    },
  },
  label: {
    width: '100%',
  },
}))(MuiFormControlLabel);

const RadioGroup = withStyles(() => ({
  root: {
    margin: 0,
    display: 'grid',
    width: '100%',
    paddingTop: '5px',
    paddingBottom: '10px',
    gap: '10px',
    gridTemplateColumns: 'auto auto',
    '&& label': {
      '&& span:first-child': {
        width: 0,
      },
    },
  },
}))(MuiRadioGroup);

function FixedDriverModal({
  openModal,
  handleCloseModal,
  title,
  leadData,
  isDisabled = false,
  isOrder = false,
  driverCount = 0,
  onSuccess,
}: IFixedDriverModal) {
  const classes = useStyles();
  const { jsonUpdater } = useLeadUpdater(
    leadData?.lead?.replace('leads/', '') ?? ''
  );
  const { showErrorSnackbar } = useSnackbar();
  const [updateOrder] = useUpdateOrderDataMutation();

  const initialValues = {
    numberOfFixedDriver: isOrder
      ? driverCount
      : (leadData?.data?.numberOfFixedDriver ?? 1),
    firstDriverFirstName: leadData?.data?.firstDriverFirstName ?? null,
    firstDriverLastName: leadData?.data?.firstDriverLastName ?? null,
    firstDriverDOB: leadData?.data?.firstDriverDOB ?? null,
    firstDriverValidationType: leadData?.data
      ? getValidationData(leadData?.data, 'first')
      : null,
    firstDriverNationalId: leadData?.data?.firstDriverNationalId ?? null,
    firstDriverPassport: leadData?.data?.firstDriverPassport ?? null,
    firstDriverLicense: leadData?.data?.firstDriverLicense ?? null,
    secondDriverFirstName: leadData?.data?.secondDriverFirstName ?? null,
    secondDriverLastName: leadData?.data?.secondDriverLastName ?? null,
    secondDriverDOB: leadData?.data?.secondDriverDOB ?? null,
    secondDriverValidationType: leadData?.data
      ? getValidationData(leadData?.data, 'second')
      : null,
    secondDriverNationalId: leadData?.data?.secondDriverNationalId ?? null,
    secondDriverPassport: leadData?.data?.secondDriverPassport ?? null,
    secondDriverLicense: leadData?.data?.secondDriverLicense ?? null,
    ...(isOrder
      ? {
          firstDriverName: leadData?.data?.firstDriverName ?? null,
          secondDriverName: leadData?.data?.secondDriverName ?? null,
          firstDriverIdNumber: leadData?.data?.firstDriverIdNumber ?? null,
          secondDriverIdNumber: leadData?.data?.secondDriverIdNumber ?? null,
          firstDriverLicense: leadData?.data?.firstDriverDrivingLicense ?? null,
          secondDriverLicense:
            leadData?.data?.secondDriverDrivingLicense ?? null,
        }
      : {}),
  };

  const hasTwoFixedDriver = leadData?.data?.numberOfFixedDriver === 2;

  const handleSubmit = useCallback(
    async (values: any) => {
      const transformedPayload = transformPayload(
        {
          ...(isOrder
            ? {
                ...values,
                firstDriverFirstName: values.firstDriverName?.split(' ')?.[0],
                firstDriverLastName: values.firstDriverName
                  ?.split(' ')
                  ?.slice(1)
                  .join(' '),
                secondDriverFirstName: values.secondDriverName?.split(' ')?.[0],
                secondDriverLastName: values.secondDriverName
                  ?.split(' ')
                  ?.slice(1)
                  .join(' '),
              }
            : values),
        },
        leadData,
        hasTwoFixedDriver
      );
      jsonUpdater(transformedPayload)
        .finally(() => handleCloseModal())
        .catch(() => {
          showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
        });
      if (isOrder)
        onSuccess?.(
          await updateOrderFixedDriver(
            values,
            updateOrder,
            leadData?.name?.replace('orders/', ''),
            hasTwoFixedDriver,
            handleCloseModal
          )
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasTwoFixedDriver]
  );

  return (
    <CommonModal
      title={title}
      open={openModal}
      handleCloseModal={handleCloseModal}
      maxWidth={hasTwoFixedDriver ? 'md' : 'sm'}
      isHeaderCenter
      dataTestId="fixed-driver-modal"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={isOrder ? validationSchemaOrder : validationSchema}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {(props) => {
          const {
            values,
            isValid,
            isSubmitting,
            dirty,
            handleChange,
            errors,
            touched,
            setFieldTouched,
            setFieldValue,
          } = props;

          function handleInputChange(
            event: React.ChangeEvent<HTMLInputElement>
          ) {
            setFieldTouched(event.target.name);
            handleChange(event);
          }

          function handleDateChange(payload: number | Date, inputName: string) {
            setFieldTouched(inputName);
            setFieldValue(inputName, format(payload, 'yyyy-MM-dd'));
          }

          return (
            <Form>
              <div className="flex flex-col">
                <div
                  className={clsx('grid gap-4 py-[30px] px-[10px]', {
                    'grid-cols-2': hasTwoFixedDriver,
                    'grid-cols-1': !hasTwoFixedDriver,
                  })}
                >
                  <Grid item xs={12} md={12} className="text-left">
                    <span className="text-primary font-bold">
                      {getString('fixedDriverModal.firstDriver')}
                    </span>

                    {isOrder ? (
                      <Grid item xs={12} md={12} className="py-[10px]">
                        <Controls.Input
                          name="firstDriverName"
                          label={getString('leadDetailFields.firstDriverName')}
                          value={values.firstDriverName}
                          onChange={handleInputChange}
                          fixedLabel
                          disabled={isDisabled}
                        />
                      </Grid>
                    ) : (
                      <>
                        <Grid item xs={12} md={12} className="py-[10px]">
                          <Controls.Input
                            name="firstDriverFirstName"
                            label={getString('fixedDriverModal.firstName')}
                            value={values.firstDriverFirstName}
                            onChange={handleInputChange}
                            fixedLabel
                            error={
                              touched?.firstDriverFirstName &&
                              errors.firstDriverFirstName
                            }
                            disabled={isDisabled}
                          />
                        </Grid>

                        <Grid item xs={12} md={12} className="py-[10px]">
                          <Controls.Input
                            name="firstDriverLastName"
                            label={getString('fixedDriverModal.lastName')}
                            value={values.firstDriverLastName}
                            onChange={handleInputChange}
                            error={
                              touched?.firstDriverLastName &&
                              errors.firstDriverLastName
                            }
                            fixedLabel
                            disabled={isDisabled}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12} md={12} className="py-[10px]">
                      <InputLabel id="first-driver-dob-type-label" shrink>
                        {getString('fixedDriverModal.dateOfBirth')}
                      </InputLabel>
                      <DatePickerWithThaiYear
                        name="firstDriverDOB"
                        dataTestId="first-driver-dob-picker"
                        value={values.firstDriverDOB}
                        onChangeDate={(payload: Date | number) =>
                          handleDateChange(payload, 'firstDriverDOB')
                        }
                        className={classes.dobInput}
                        validateFn={ageValidationFn}
                        isDisabled={isDisabled}
                      />
                    </Grid>

                    {isOrder ? (
                      <Grid item xs={12} md={12} className="py-[10px]">
                        <Controls.Input
                          name="firstDriverIdNumber"
                          label={getString('qc.firstDriverIdNumber')}
                          value={values.firstDriverIdNumber}
                          onChange={handleInputChange}
                          fixedLabel
                          disabled={isDisabled}
                        />
                      </Grid>
                    ) : (
                      <Grid item xs={12} md={12} className="pt-[10px]">
                        <Grid
                          item
                          xs={12}
                          md={12}
                          className="flex flex-col justify-start items-start"
                        >
                          <InputLabel
                            id="first-driver-identification-type-label"
                            shrink
                          >
                            {getString('fixedDriverModal.identificationType')}
                          </InputLabel>
                          <RadioGroup
                            aria-label="firstDriverValidationType"
                            data-testid="first-driver-validation-type"
                            name="firstDriverValidationType"
                            onChange={handleChange}
                          >
                            <FormControlLabel
                              value="nationalId"
                              control={
                                <Radio
                                  className={classes.root}
                                  disableRipple
                                  color="default"
                                  checkedIcon={
                                    <span className={classes.icon} />
                                  }
                                  icon={<span className={classes.icon} />}
                                  {...props}
                                  disabled={isDisabled}
                                />
                              }
                              label={getString('fixedDriverModal.nationalId')}
                              className={
                                values.firstDriverValidationType ===
                                'nationalId'
                                  ? 'selected'
                                  : ''
                              }
                            />
                            <FormControlLabel
                              value="passport"
                              control={
                                <Radio
                                  className={classes.root}
                                  disableRipple
                                  color="default"
                                  checkedIcon={
                                    <span className={classes.icon} />
                                  }
                                  icon={<span className={classes.icon} />}
                                  {...props}
                                  disabled={isDisabled}
                                />
                              }
                              label={getString('fixedDriverModal.passport')}
                              className={
                                values.firstDriverValidationType === 'passport'
                                  ? 'selected'
                                  : ''
                              }
                            />
                          </RadioGroup>
                        </Grid>
                        {values.firstDriverValidationType === 'passport' && (
                          <Grid item xs={12} md={12} className="py-[10px]">
                            <Controls.Input
                              name="firstDriverPassport"
                              label={getString('fixedDriverModal.passport')}
                              value={values.firstDriverPassport}
                              onChange={handleInputChange}
                              fixedLabel
                              error={
                                touched?.firstDriverPassport &&
                                errors.firstDriverPassport
                              }
                              disabled={isDisabled}
                            />
                          </Grid>
                        )}
                        {values.firstDriverValidationType === 'nationalId' && (
                          <Grid item xs={12} md={12} className="py-[10px]">
                            <Controls.Input
                              name="firstDriverNationalId"
                              label={getString('fixedDriverModal.nationalId')}
                              value={values.firstDriverNationalId}
                              onChange={handleInputChange}
                              fixedLabel
                              error={
                                touched?.firstDriverNationalId &&
                                errors.firstDriverNationalId
                              }
                              disabled={isDisabled}
                            />
                          </Grid>
                        )}
                      </Grid>
                    )}
                    <Grid item xs={12} md={12} className="py-[10px]">
                      <Controls.Input
                        name="firstDriverLicense"
                        label={getString('fixedDriverModal.driverLicense')}
                        value={values.firstDriverLicense}
                        onChange={handleInputChange}
                        fixedLabel
                        error={
                          touched?.firstDriverLicense &&
                          errors.firstDriverLicense
                        }
                        disabled={isDisabled}
                      />
                    </Grid>
                  </Grid>

                  {hasTwoFixedDriver && (
                    <Grid item xs={12} md={12} className="text-left">
                      <span className="text-primary font-bold">
                        {getString('fixedDriverModal.secondDriver')}
                      </span>
                      {isOrder ? (
                        <Grid item xs={12} md={12} className="py-[10px]">
                          <Controls.Input
                            name="secondDriverName"
                            label={getString(
                              'leadDetailFields.secondDriverName'
                            )}
                            value={values.secondDriverName}
                            onChange={handleInputChange}
                            fixedLabel
                            disabled={isDisabled}
                          />
                        </Grid>
                      ) : (
                        <>
                          <Grid item xs={12} md={12} className="py-[10px]">
                            <Controls.Input
                              name="secondDriverFirstName"
                              label={getString('fixedDriverModal.firstName')}
                              value={values.secondDriverFirstName}
                              onChange={handleInputChange}
                              fixedLabel
                              error={
                                touched?.secondDriverFirstName &&
                                errors.secondDriverFirstName
                              }
                              disabled={isDisabled}
                            />
                          </Grid>

                          <Grid item xs={12} md={12} className="py-[10px]">
                            <Controls.Input
                              name="secondDriverLastName"
                              label={getString('fixedDriverModal.lastName')}
                              value={values.secondDriverLastName}
                              onChange={handleInputChange}
                              fixedLabel
                              error={
                                touched?.secondDriverLastName &&
                                errors.secondDriverLastName
                              }
                              disabled={isDisabled}
                            />
                          </Grid>
                        </>
                      )}

                      <Grid item xs={12} md={12} className="py-[10px]">
                        <InputLabel id="second-driver-dob-type-label" shrink>
                          {getString('fixedDriverModal.dateOfBirth')}
                        </InputLabel>
                        <DatePickerWithThaiYear
                          name="secondDriverDOB"
                          dataTestId="second-driver-dob-picker"
                          value={values.secondDriverDOB}
                          onChangeDate={(payload: Date | number) =>
                            handleDateChange(payload, 'secondDriverDOB')
                          }
                          className={classes.dobInput}
                          validateFn={ageValidationFn}
                          isDisabled={isDisabled}
                        />
                      </Grid>
                      {isOrder ? (
                        <Grid item xs={12} md={12} className="py-[10px]">
                          <Controls.Input
                            name="secondDriverIdNumber"
                            label={getString('qc.secondDriverIdNumber')}
                            value={values.secondDriverIdNumber}
                            onChange={handleInputChange}
                            fixedLabel
                            disabled={isDisabled}
                          />
                        </Grid>
                      ) : (
                        <Grid item xs={12} md={12} className="pt-[10px]">
                          <Grid
                            item
                            xs={12}
                            md={12}
                            className="flex flex-col justify-start items-start"
                          >
                            <InputLabel
                              id="second-driver-identification-type-label"
                              shrink
                            >
                              {getString('fixedDriverModal.identificationType')}
                            </InputLabel>
                            <RadioGroup
                              aria-label="secondDriverValidationType"
                              data-testid="second-driver-validation-type"
                              name="secondDriverValidationType"
                              onChange={handleChange}
                            >
                              <FormControlLabel
                                value="nationalId"
                                control={
                                  <Radio
                                    className={classes.root}
                                    disableRipple
                                    color="default"
                                    checkedIcon={
                                      <span className={classes.icon} />
                                    }
                                    icon={<span className={classes.icon} />}
                                    {...props}
                                    disabled={isDisabled}
                                  />
                                }
                                label={getString('fixedDriverModal.nationalId')}
                                className={
                                  values.secondDriverValidationType ===
                                  'nationalId'
                                    ? 'selected'
                                    : ''
                                }
                              />
                              <FormControlLabel
                                value="passport"
                                control={
                                  <Radio
                                    className={classes.root}
                                    disableRipple
                                    color="default"
                                    checkedIcon={
                                      <span className={classes.icon} />
                                    }
                                    icon={<span className={classes.icon} />}
                                    {...props}
                                    disabled={isDisabled}
                                  />
                                }
                                label={getString('fixedDriverModal.passport')}
                                className={
                                  values.secondDriverValidationType ===
                                  'passport'
                                    ? 'selected'
                                    : ''
                                }
                              />
                            </RadioGroup>
                          </Grid>
                          {values.secondDriverValidationType === 'passport' && (
                            <Grid item xs={12} md={12} className="py-[10px]">
                              <Controls.Input
                                name="secondDriverPassport"
                                label={getString('fixedDriverModal.passport')}
                                value={values.secondDriverPassport}
                                onChange={handleInputChange}
                                fixedLabel
                                error={
                                  touched?.secondDriverPassport &&
                                  errors.secondDriverPassport
                                }
                                disabled={isDisabled}
                              />
                            </Grid>
                          )}
                          {values.secondDriverValidationType ===
                            'nationalId' && (
                            <Grid item xs={12} md={12} className="py-[10px]">
                              <Controls.Input
                                name="secondDriverNationalId"
                                label={getString('fixedDriverModal.nationalId')}
                                value={values.secondDriverNationalId}
                                onChange={handleInputChange}
                                fixedLabel
                                error={
                                  touched?.secondDriverNationalId &&
                                  errors.secondDriverNationalId
                                }
                                disabled={isDisabled}
                              />
                            </Grid>
                          )}
                        </Grid>
                      )}

                      <Grid item xs={12} md={12} className="py-[10px]">
                        <Controls.Input
                          name="secondDriverLicense"
                          label={getString('fixedDriverModal.driverLicense')}
                          value={values.secondDriverLicense}
                          onChange={handleInputChange}
                          fixedLabel
                          error={
                            touched?.secondDriverLicense &&
                            errors.secondDriverLicense
                          }
                          disabled={isDisabled}
                        />
                      </Grid>
                    </Grid>
                  )}
                </div>
                <div className="flex justify-center items-center pb-[22px]">
                  <PackageButton
                    dataTestId="fixed-driver-modal-cancel"
                    className="button-group__btn w-[128px] py-[9px] mr-4"
                    variant="secondary"
                    text={getString('text.cancelButton')}
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  />
                  <PackageButton
                    dataTestId="fixed-driver-modal-save"
                    className="button-group__btn w-[128px] py-[12px]"
                    variant="primary"
                    text={getString('text.addButton')}
                    type="submit"
                    disabled={
                      !isValid ||
                      Object.keys(errors).length > 0 ||
                      !dirty ||
                      isDisabled
                    }
                    isLoading={isSubmitting}
                  />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </CommonModal>
  );
}

export default FixedDriverModal;
