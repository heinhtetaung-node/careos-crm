import { FormControl, Grid } from '@material-ui/core';
import { Form, Formik } from 'formik';
import React, { FormEvent } from 'react';
import * as Yup from 'yup';

import {
  useCreatePhoneNumberMutation,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import phone from 'shared/validators/phone';
import './index.scss';

import useStyle from './style';
import useAddPhone from './useAddPhone';

export const THAI_COUNTRY_CODE = '+66';

interface PhoneModalProps {
  customerId?: string;
  close: () => void;
}

function PhoneModal({ customerId, close }: PhoneModalProps) {
  const classes = useStyle();

  const { addPhone, status } = useAddPhone();
  const { isLoading: isAddingPhoneToLead } = status;
  const [addPhoneToCustomer, { isLoading: isAddingPhoneToCustomer }] =
    useCreatePhoneNumberMutation();
  const [updateCustomer, { isLoading: isUpdatingCustomer }] =
    useUpdateCustomerMutation();
  const isLoading =
    isAddingPhoneToLead || isAddingPhoneToCustomer || isUpdatingCustomer;
  const handleSubmit = async ({
    phone: phoneNumber,
    isMain,
  }: {
    phone: string;
    isMain: boolean;
  }) => {
    const internationalPhoneNumber = phoneNumber.replace(
      /^0+/,
      THAI_COUNTRY_CODE
    );

    addPhone(internationalPhoneNumber, isMain).then(async (res: any) => {
      if (customerId && res?.data) {
        const addPhoneResult = await addPhoneToCustomer({
          customerName: customerId,
          phone: internationalPhoneNumber,
        }).unwrap();

        if (isMain) {
          updateCustomer({
            customerId,
            payload: {
              primaryPhoneId: addPhoneResult?.name,
            },
          });
        }
      }
      close();
    });
  };

  const phoneSchema = Yup.object().shape({
    phone: phone(),
  });

  return (
    <Formik
      initialValues={{
        phone: '',
        isMain: false,
      }}
      onSubmit={close}
      validationSchema={phoneSchema}
    >
      {(props) => {
        const {
          values,
          isValid,
          errors,
          touched,
          handleChange,
          handleBlur,
          dirty,
          setFieldTouched,
        } = props;

        const handleChangeContact = (event: FormEvent) => {
          event.persist();
          handleChange(event);
          setFieldTouched('phone', true, false);
        };

        const handleKeyPress = (event: React.KeyboardEvent) => {
          if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        };

        return (
          <Form className="lead-add-phone">
            <FormControl
              margin="normal"
              required
              style={{ position: 'relative' }}
            >
              <Controls.Input
                onKeyPress={handleKeyPress}
                label={getString('text.phoneNumber')}
                name="phone"
                value={values.phone}
                onChange={handleChangeContact}
                onBlur={handleBlur}
                margin="normal"
                error={touched.phone ? errors.phone : ''}
                placeholder={getString('text.enterPhoneNumber')}
                fixedLabel
              />
              <Controls.Checkbox
                value={values.isMain}
                name="isMain"
                label={getString('text.mainContact')}
                onChange={handleChangeContact}
              />
            </FormControl>
            <Grid container item xs={12} md={12} className={classes.btnGroup}>
              <Controls.Button
                className="button-group__btn"
                text={getString('text.closeButton')}
                color="secondary"
                variant="text"
                onClick={close}
              />
              <Controls.Button
                className="button-group__btn"
                color="primary"
                disabled={!(isValid && dirty && !isLoading)}
                onClick={() => handleSubmit(values)}
                text={
                  isLoading
                    ? getString('text.loading')
                    : getString('text.addButton')
                }
              />
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default PhoneModal;
