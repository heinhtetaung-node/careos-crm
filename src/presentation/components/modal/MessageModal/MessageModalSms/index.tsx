import { Grid, Container, Paper } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getString } from 'presentation/theme/localization';
import { convertDateTime } from 'shared/helper/convertDateTime';

import { IItemSMS } from '../messageModal.helper';
import './index.scss';

interface IPropsMessageModalSms {
  sms: IItemSMS;
}

function MessageModalSms({ sms }: IPropsMessageModalSms) {
  const [isTemplate, setIsTemplate] = useState<boolean>(false);
  const { i18n } = useTranslation();

  const template = useMemo(
    () => ({
      __html: sms.message,
    }),
    [sms]
  );

  useEffect(() => {
    if (template) {
      setIsTemplate(
        template.__html.indexOf('class="rabbit-email-template') !== -1
      );
    }
  }, [template]);

  const addressClass = useMemo(
    () => (i18n.language === 'en' ? 'address' : 'address th'),
    [i18n.language]
  );

  return (
    <Grid item xs={12} md={12} className="message-model-email">
      <Grid container xs={12} md={12} className="modal-header-email">
        <Grid
          container
          xs={12}
          md={12}
          lg={12}
          xl={12}
          className="modal-header-email__content"
        >
          <Grid item xs={12} md={12} lg={6} xl={9}>
            {sms.title && (
              <Paper className="custom-name unittest-template">
                {getString(`smsTemplateOption.${sms.title}.option`)}
              </Paper>
            )}
            <h2 className="modal-header-email__content__subject unittest-subject">
              {getString(`smsTemplateOption.${sms.title}.option`)}
            </h2>
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={12} md={12} className="modal-body">
        <Grid item xs={12} md={12} className="modal-body__content">
          <Grid item xs={12} md={8} className="modal-body__content__left">
            <div className="modal-body__content__left__item">
              <div className={addressClass}>
                <div className="address__key">
                  <span>{getString('text.from')}</span>
                </div>
                <span>
                  :&nbsp;
                  <a href={`mailto:${sms.phone}`}>1438</a>
                </span>
              </div>
              <div className={addressClass}>
                <div className="address__key">
                  <span>{getString('text.to')}</span>
                </div>
                <span>
                  :&nbsp;
                  <a href={`mailto:${sms.phone}`}>{sms.phone}</a>
                </span>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={4} className="modal-body__content__right">
            <span className="emailDateTime">
              {convertDateTime(sms.createTime)}
            </span>
          </Grid>
        </Grid>
        <Container className="modal-body__email">
          <Paper className="modal-body__email__template">
            <div
              className={
                !isTemplate && sms.message !== '' ? 'pre-wrap' : 'body-text'
              }
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={template}
            />
          </Paper>
        </Container>
      </Grid>
    </Grid>
  );
}

export default MessageModalSms;
