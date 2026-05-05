/* eslint-disable react/function-component-definition */
import { Grid, FormControl } from '@material-ui/core';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';

import './index.scss';

interface Props {
  isLoading?: boolean;
  onSubmit?: (comment: string) => void;
}

const validationSchema = Yup.object().shape({
  comment: Yup.string().trim().required(getString('errors.requiredField')),
});

const CommentModal: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const handleSubmit = (values: { comment: string }) => {
    if (onSubmit) onSubmit(values.comment);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        comment: '',
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      validateOnMount
    >
      {(props) => {
        const { values, errors, handleChange } = props;
        return (
          <Form className="summary-call-form" data-testid="summary-call-modal">
            <Grid item xs={12} md={12} className="summary-call-modal">
              <FormControl margin="normal" required className="relative z-50">
                <Controls.Input
                  name="comment"
                  label={getString('text.comment')}
                  value={values.comment}
                  onChange={handleChange}
                  rows={4}
                  required
                  multiline
                  className="summary-call-form__comment"
                  dataTestid="comment-input"
                />
              </FormControl>

              <Grid container className="button-group justify-center">
                <Controls.Button
                  data-testid="comment-submit"
                  type="submit"
                  color="primary"
                  disabled={
                    values.comment === '' ||
                    Object.keys(errors).length ||
                    isLoading
                  }
                  text={
                    isLoading
                      ? getString('text.loading')
                      : getString('text.save')
                  }
                />
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CommentModal;
