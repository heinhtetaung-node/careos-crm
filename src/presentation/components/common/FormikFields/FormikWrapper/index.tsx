import Grid from '@material-ui/core/Grid';
import { Formik, Form } from 'formik';
import _isEmpty from 'lodash/isEmpty';
import * as React from 'react';

import { IFormikWrapper, IFormikItem } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';

import { useStyles, Paper, PanelHeader } from './index.styles';

import FormikController from '../FormikController';

function FormikWrapper({
  title,
  items,
  initialValues,
  validationSchema,
  handleUpdate,
  hasSectionWrapper = false,
  textFieldError = false,
  setFieldsErrors,
}: IFormikWrapper) {
  const classes = useStyles();
  const handleSubmit = (values: any) => {
    if (handleUpdate) {
      handleUpdate(values);
    }
  };
  const renderForm = (content: IFormikItem[]) => (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      {({ errors, values }) => {
        if (setFieldsErrors && errors) setFieldsErrors(errors);
        return (
          <Form className={classes.form}>
            {content
              .filter((item) => item.display)
              .map((item) => (
                <FormikController
                  key={item.name}
                  {...item}
                  error={errors[item.name] as string}
                  value={values[item.name]}
                  handleUpdate={(payload: any) => {
                    if (_isEmpty(errors)) {
                      handleSubmit({ ...values, ...payload });
                    }
                  }}
                  textFieldError={textFieldError}
                />
              ))}
          </Form>
        );
      }}
    </Formik>
  );

  const renderContent = () => (items?.length ? renderForm(items) : null);

  if (hasSectionWrapper) {
    return renderContent();
  }

  return (
    <Paper elevation={3}>
      {/* Header */}
      <Grid container>
        <Grid item xs={12} className={classes.panelHeader}>
          {/* Header */}
          <PanelHeader variant="h5">
            {title ? getString(title) : ''}
          </PanelHeader>
        </Grid>
        <Grid item xs={12}>
          {/* Content */}
          {renderContent()}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FormikWrapper;
