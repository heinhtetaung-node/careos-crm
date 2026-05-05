import { Grid, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Formik, Form, Field, FieldAttributes } from 'formik';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { useUpdateAutoAssignSettingsMutation } from 'data/slices/autoAssignLeadSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { snackBarConfig } from 'shared/constants';

import { SettingModalProps } from '../types';

const useStyles = makeStyles((theme) => ({
  textField: {
    '& input': {
      maxWidth: 358,
    },
    '& p': {
      color: theme.palette.common.black,
    },
  },
}));

export default function AutoAssignSettingModal({
  onClose,
  values,
  className,
}: SettingModalProps) {
  const [formData, setFormData] = useState({
    autoAssignmentEnabled: false,
    premiumLeadThreshold: 0,
    numTopTier: 0,
  });
  const classes = useStyles();

  const [handleUpdateSettings, { isLoading, isSuccess }] =
    useUpdateAutoAssignSettingsMutation({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (values) {
      setFormData({
        ...values,
      });
    }
  }, [values]);

  useEffect(() => {
    if (!isLoading && isSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updatedInformation'),
          status: snackBarConfig.type.success,
        })
      );
      onClose(isSuccess);
    }
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isLoading, isSuccess]);

  const handleChange = (value: any, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...formData }}
      onSubmit={(_values) => handleUpdateSettings(_values)}
      validationSchema={Yup.object().shape({
        premiumLeadThreshold: Yup.number().required(
          getString('errors.requiredFormField')
        ),
        numTopTier: Yup.number().required(
          getString('errors.requiredFormField')
        ),
      })}
    >
      <Form
        data-testid="autoassign-setting-modal"
        className="admin-team-create-team"
      >
        <p>{getString('text.autoAssign')}</p>
        <Controls.Switch
          checked={formData.autoAssignmentEnabled}
          value={formData.autoAssignmentEnabled}
          onChange={(_, isChecked: boolean) =>
            handleChange(isChecked, 'autoAssignmentEnabled')
          }
        />
        <Field name="premiumLeadThreshold">
          {({ meta }: FieldAttributes<any>) => (
            <Controls.NumberInput
              className={clsx(
                classes.textField,
                className?.shared_input,
                'mt-2 mb-2'
              )}
              adornment="THB"
              fixedLabel
              label={getString('text.threshold')}
              placeholder={getString('text.threshold')}
              name="premiumLeadThreshold"
              error={meta.touched && meta.error ? meta.error : ''}
              value={formData.premiumLeadThreshold}
              onValueChange={(value) =>
                handleChange(value.floatValue, 'premiumLeadThreshold')
              }
            />
          )}
        </Field>
        <Field name="numTopTier">
          {({ meta }: FieldAttributes<any>) => (
            <Controls.NumberInput
              className={clsx(
                classes.textField,
                className?.shared_input,
                'mt-2 mb-2'
              )}
              adornment={getString('menu.autoAssignment.people')}
              fixedLabel
              label={getString('text.noOfTier')}
              placeholder={getString('text.noOfTier')}
              name="numTopTier"
              value={formData.numTopTier}
              error={meta.touched && meta.error ? meta.error : ''}
              onValueChange={(value) =>
                handleChange(value.floatValue, 'numTopTier')
              }
            />
          )}
        </Field>

        <Grid
          container
          className="button-group mt-6 mb-4"
          justifyContent="flex-end"
        >
          <Controls.Button
            color="secondary"
            variant="text"
            text={getString('text.cancelButton')}
            onClick={onClose}
          />
          <Controls.Button
            type="submit"
            color="primary"
            disabled={isLoading}
            loading={isLoading}
            text={getString('text.update')}
          />
        </Grid>
      </Form>
    </Formik>
  );
}
