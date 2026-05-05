import { Grid } from '@material-ui/core';
import { Form, Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Controls from 'presentation/components/controls/Control';
import {
  IEmailRequestBody,
  mailTypes,
  getMailIndex,
} from 'presentation/components/NewMessage/newMessage.helper';
import useMessage from 'presentation/hooks/useMessage';
import { sendEmail } from 'presentation/redux/actions/leadDetail/email';
import { getString } from 'presentation/theme/localization';

import './MessageModalReply.scss';

import EmailReplyForm from './EmailReplyForm';
import { getParentMailUUID, initialFormData } from './messageReply.helper';

interface IReplyMessage {
  handleCancelMessage: (value: boolean) => void;
  replyType: string;
  orderLeadId?: string;
}

function MessageModalReply({
  handleCancelMessage,
  replyType,
  orderLeadId,
}: IReplyMessage) {
  const parentMail: any = useSelector<any>(
    (state) => state.leadsDetailReducer.emailReducer.data.emailReplyTo
  );

  const dispatch = useDispatch();

  const [validationSchema] = useState<any>();

  const {
    formData,
    setFormData,
    handleCancelMessageInternal,
    handleChangeEmailForm,
    uploadFileAndSendEmail,
  } = useMessage(handleCancelMessage);

  const handleSubmitMessageInternal = () => {
    const mailId = uuidv4();
    const mailModal: IEmailRequestBody = {
      subject: formData.email.subject,
      body: formData.email.message,
      cc: formData.email.cc,
      bodyText: formData.email.message,
      emailIndex: getMailIndex(formData.email.to),
      parentId: parentMail ? getParentMailUUID(parentMail.name) : '',
      type: mailTypes.OUTBOUND,
      name: `mails/${mailId}`,
    };
    if (!formData.email.attachment.length) {
      dispatch(sendEmail(mailModal, orderLeadId ?? undefined));
    } else {
      uploadFileAndSendEmail(mailId, mailModal);
    }
    setFormData(cloneDeep(initialFormData));
  };

  const validateSubmit = useMemo(() => {
    if (
      formData?.email?.message &&
      formData?.email?.subject &&
      formData?.email?.to.length
    ) {
      return false;
    }

    return true;
  }, [formData]);
  return (
    <div className="reply-message-section">
      <Formik
        enableReinitialize
        initialValues={formData}
        validationSchema={validationSchema}
        onSubmit={handleSubmitMessageInternal}
        validateOnMount
      >
        {() => (
          <Form>
            <Grid
              container
              direction="row"
              className="reply-message-section__header"
            >
              <Grid item xs={12} md={3}>
                <h3 className="reply-message-section__header__title">
                  {getString('text.replyMessage')}
                </h3>
              </Grid>
            </Grid>
            <Grid container direction="row" justifyContent="center">
              <Grid item xs={12} sm={8} md={6} lg={4}>
                <EmailReplyForm
                  changeForm={handleChangeEmailForm}
                  email={formData.email}
                  replyType={replyType}
                  parentMail={parentMail}
                />
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              className="reply-message-section__footer"
            >
              <Grid
                item
                xs={12}
                md={12}
                className="reply-message-section__footer__buttons"
              >
                <Controls.Button
                  color="primary"
                  text={getString('text.cancelButton')}
                  onClick={() => handleCancelMessageInternal(false)}
                  data-testid="cancel-message-button"
                />

                <Controls.Button
                  type="submit"
                  color="primary"
                  disabled={validateSubmit}
                  text={getString('text.send')}
                  data-testid="send-message-button"
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default MessageModalReply;
