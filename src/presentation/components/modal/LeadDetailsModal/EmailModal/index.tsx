import { Formik, Form } from 'formik';
import React, { FormEvent } from 'react';
import * as Yup from 'yup';

import { useCreateCustomerEmailMutation } from 'data/slices/customerSlice';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';

import useAddEmail from './useAddEmail';
import './index.scss';

interface AddEmailModalProps {
  customerId?: string;
  close: () => void;
}

interface IEmailAddData {
  email: string;
}

function EmailModal({ close, customerId }: AddEmailModalProps) {
  const { addEmail } = useAddEmail();
  const [addEmailToCustomer, { isLoading }] = useCreateCustomerEmailMutation();

  const emailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').trim(),
  });

  const submitHandler = async (value: IEmailAddData) => {
    addEmail(value?.email?.trim());
    if (customerId) {
      await addEmailToCustomer({
        customerName: customerId,
        email: value?.email?.trim(),
      });
    }
    close();
  };

  return (
    <div data-testid="email-modal">
      <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={submitHandler}
        validationSchema={emailSchema}
      >
        {(props) => {
          const {
            values,
            dirty,
            handleChange,
            isValid,
            touched,
            errors,
            setFieldTouched,
          } = props;

          const handleChangeEmail = (event: FormEvent) => {
            handleChange(event);
            setFieldTouched('email', true, false);
          };

          return (
            <Form className="shared-form-email-container">
              <div className="clear">
                <Controls.Input
                  name="email"
                  label={getString('text.email')}
                  value={values.email}
                  onChange={handleChangeEmail}
                  error={touched.email ? errors.email : ''}
                  placeholder={getString('text.enterEmail')}
                  fixedLabel
                  inputProps={{ 'data-testid': 'email-input' }}
                />
              </div>

              <div className="clear">
                <Controls.Button
                  type="submit"
                  color="primary"
                  className="clear__btn"
                  disabled={!(isValid && dirty && !isLoading)}
                  text={
                    isLoading
                      ? getString('text.loading')
                      : getString('text.addButton')
                  }
                  data-testid="submit-button"
                />

                <Controls.Button
                  color="secondary"
                  variant="text"
                  className="clear__btn"
                  text={getString('text.cancelButton')}
                  onClick={close}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default EmailModal;
