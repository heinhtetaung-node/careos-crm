import { Grid } from '@material-ui/core';
import { Form, Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Controls from 'presentation/components/controls/Control';
import formatEmailTemplate from 'presentation/components/EmailTemplate';
import useMessage from 'presentation/hooks/useMessage';
import { sendEmail } from 'presentation/redux/actions/leadDetail/email';
import { getString } from 'presentation/theme/localization';

import EmailForm from './EmailForm';
import {
  initialFormData,
  emailValidationSchema,
  getMailIndex,
  mailTypes,
  IEmailRequestBody,
} from './newMessage.helper';
import './index.scss';

interface INewMessage {
  handleCancelMessage: (value: boolean) => void;
  orderLeadId?: string;
}

function NewMessage({ handleCancelMessage, orderLeadId }: INewMessage) {
  const dispatch = useDispatch();

  const {
    formData,
    setFormData,
    handleCancelMessageInternal,
    handleChangeEmailForm,
    uploadFileAndSendEmail,
  } = useMessage(handleCancelMessage);

  const [validationSchema] = useState(emailValidationSchema);

  const handleSubmitMessageInternal = () => {
    const mailId = uuidv4();
    const mailModal: IEmailRequestBody = {
      subject: formData.email.subject,
      body: formatEmailTemplate(formData.email.message),
      emailIndex: getMailIndex(formData.email.to),
      type: mailTypes.OUTBOUND,
      cc: formData.email.cc,
      bodyText: formData.email.message,
      name: `mails/${mailId}`,
    };
    if (formData?.email?.emailTemplate === 'other') {
      mailModal.emailAddress = formData.email.to;
      delete mailModal.emailIndex;
    }
    if (formData.email.attachment.length === 0) {
      dispatch(sendEmail(mailModal, orderLeadId ?? undefined));
    } else {
      uploadFileAndSendEmail(mailId, mailModal);
    }
    // Reset the form
    setFormData(cloneDeep(initialFormData));
  };

  const validateSubmit = useMemo(() => {
    if (
      formData?.email?.message &&
      formData?.email?.subject &&
      formData?.email?.to
    ) {
      return false;
    }
    return true;
  }, [formData]);

  return (
    <div className="new-message-section">
      <Formik
        enableReinitialize
        initialValues={formData}
        validationSchema={validationSchema}
        onSubmit={handleSubmitMessageInternal}
        validateOnMount
      >
        {() => (
          <Form>
            <Grid container direction="row" justifyContent="center">
              <Grid item xs={12} sm={8} md={6} lg={4}>
                <EmailForm
                  changeForm={handleChangeEmailForm}
                  email={formData.email}
                />
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              className="new-message-section__footer"
            >
              <Grid
                item
                xs={12}
                md={12}
                className="new-message-section__footer__buttons"
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

export default NewMessage;
