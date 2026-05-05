import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Form, Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import Controls from 'presentation/components/controls/Control';
import { sendSms } from 'presentation/redux/actions/leadDetail/sms';
import { getString } from 'presentation/theme/localization';

import SMSForm from './SMSForm';
import { ISms } from './SMSForm/sms.helper';

import {
  initialFormData,
  IFormData,
  smsStatusTypes,
  ISmsRequestBody,
} from '../newMessage.helper';

const useSmsStyles = makeStyles({
  newMessageSection: {
    minHeight: '100%',
    textAlign: 'left',
    padding: '20px 20px',
    marginTop: '20px',
  },
  newMessageSectionFooter: {
    display: 'flex',
    flexBasis: 'auto',
  },
});
interface NewMessage {
  handleCancelMessage: (value: boolean) => void;
  refetch?: () => void;
  orderLeadId?: string;
}
function NewSMS({ handleCancelMessage, refetch, orderLeadId }: NewMessage) {
  const classes = useSmsStyles();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<IFormData>(
    cloneDeep(initialFormData)
  );

  const handleCancelMessageInternal = (value: boolean) => {
    handleCancelMessage(value);
    setFormData(cloneDeep(initialFormData));
  };

  const handleChangeSmsForm = (formValue: ISms) => {
    setFormData({
      ...formData,
      sms: formValue,
    });
  };

  const handleSubmitMessageInternal = () => {
    const smsModal: ISmsRequestBody = {
      message: formData.sms.smsMessage,
      phoneIndex: +formData.sms.phone,
      status: smsStatusTypes.PENDING,
      title: formData.sms.smsTemplate,
    };
    dispatch(sendSms(smsModal, orderLeadId ?? undefined));

    setFormData(cloneDeep(initialFormData));
    if (refetch) {
      setTimeout(() => {
        refetch();
      }, 100);
    }
  };

  const validateSubmit = useMemo(() => {
    if (formData.sms.smsMessage && formData.sms.phone) {
      return false;
    }

    return true;
  }, [formData]);

  return (
    <div className={classes.newMessageSection}>
      <Formik
        enableReinitialize
        initialValues={formData}
        onSubmit={handleSubmitMessageInternal}
        validateOnMount
      >
        {() => (
          <Form>
            <Grid container direction="row" justifyContent="center">
              <Grid item xs={12} sm={8} md={6} lg={4}>
                <SMSForm changeForm={handleChangeSmsForm} sms={formData.sms} />
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              className={classes.newMessageSectionFooter}
            >
              <Grid
                item
                xs={12}
                md={12}
                className={classes.newMessageSectionFooter}
              >
                <Controls.Button
                  color="primary"
                  text={getString('text.cancelButton')}
                  onClick={() => handleCancelMessageInternal(false)}
                />

                <Controls.Button
                  type="submit"
                  color="primary"
                  onClick={() => handleSubmitMessageInternal()}
                  disabled={validateSubmit}
                  text={getString('text.send')}
                  data-testid="send-message"
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default NewSMS;
