import { makeStyles } from '@material-ui/core';
import { Formik, Form } from 'formik';
import _get from 'lodash/get';
import React, { FormEvent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { useCreateCustomerEmailMutation } from 'data/slices/customerSlice';
import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { validateEmailWithoutSpecialChars } from 'shared/validators/email';

interface OrderEmailModalProps {
  customerId?: string;
  close: () => void;
}

interface EmailFormData {
  email: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiInputLabel-animated': {
      color: '#4f4b66',
      fontSize: '14px',
    },
    '& input': {
      padding: '11px 16px',
      border: `1px solid ${theme.palette.grey[200]}`,
      borderRadius: '10px',
      height: '42px',
      boxSizing: 'border-box',

      '&:hover, &:focus': {
        transition: '0.2s',
        border: `1px solid ${theme.palette.primary.main}`,
        boxShadow: `0 7px 15px 0 #2a31cb1a`,
      },
    },
  },
  addbtn: {
    marginRight: '0px !important',
  },
}));

function OrderEmailModal({ close, customerId }: OrderEmailModalProps) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [addEmailToCustomer, { isLoading, isSuccess, error }] =
    useCreateCustomerEmailMutation();

  const { lead: leadPath } = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const leadId = leadPath?.split('/')[1] ?? '';
  const { data: leadData } = useGetLeadByIDQuery(leadId);
  const [updateLead] = useUpdateLeadJsonMutation();

  const emailSchema = Yup.object().shape({
    email: validateEmailWithoutSpecialChars(),
  });

  const submitHandler = async ({ email }: EmailFormData) => {
    if (customerId) {
      await addEmailToCustomer({
        customerName: customerId,
        email: email?.trim(),
      });
    }

    const { customerEmail }: any = leadData?.data ?? [];
    if (customerEmail) {
      updateLead({
        leadId,
        payload: [
          {
            op: 'add',
            path: '/customerEmail',
            value: [...customerEmail, email],
          },
        ],
      });
    }

    close();
  };

  useEffect(() => {
    if (error) {
      const errMsg = _get(error, 'data.message', getString('text.error'));
      dispatch(
        showSnackBar({
          isOpen: true,
          message: errMsg,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.addEmailSuccess'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div data-testid="order-email-modal">
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
            <Form
              className={`relative text-left m-[25px] z-[1000] ${classes.root}`}
            >
              <div>
                <Controls.Input
                  name="email"
                  label={getString('text.email')}
                  value={values.email}
                  onChange={handleChangeEmail}
                  error={touched.email ? errors.email : ''}
                  placeholder={getString('text.enterEmail')}
                  fixedLabel
                  inputProps={{ 'data-testid': 'order-email-input' }}
                />
              </div>

              <div>
                <Controls.Button
                  type="submit"
                  color="primary"
                  className={`float-right mt-[30px] uppercase  ${classes.addbtn}`}
                  disabled={!(isValid && dirty && !isLoading)}
                  text={
                    isLoading
                      ? getString('text.loading')
                      : getString('text.addButton')
                  }
                  data-testid="order-submit-button"
                />

                <Controls.Button
                  color="secondary"
                  variant="text"
                  className="float-right mt-[30px] uppercase"
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

export default OrderEmailModal;
