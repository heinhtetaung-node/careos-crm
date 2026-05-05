import { Grid } from '@material-ui/core';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { maskPhoneNumber } from 'shared/helper/utilities';
import { SelectElement } from 'shared/types/controls';

import './index.scss';

import { ISms, FakeSMSTemplate as smsTemplateOptions } from './sms.helper';

interface ISmsFormProps {
  changeForm: (formData: ISms) => void;
  sms: ISms;
}

const FIRST_PHONE_INDEX = '0';

function SMSForm({ changeForm: handleChangeForm, sms }: ISmsFormProps) {
  const phoneNumbers = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead?.payload?.data?.customerPhoneNumber || []
  );
  const primaryPhoneIndex = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead?.payload?.data?.primaryPhoneIndex?.toString() ||
      ''
  );

  const leadId = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead?.payload?.humanId || '{{leadId}}'
  );

  const { data: agentData } = useGetAuthenticateQuery();

  const isSendEmail = useSelector(
    (state: any) => state.leadsDetailReducer?.smsReducer?.isFetching
  );
  const [charsCount, setCharsCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState(primaryPhoneIndex);

  const bindSmsPhone = (e: React.ChangeEvent<SelectElement>) => {
    setPhoneNumber(e.target.value as string);
  };

  const bindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChangeForm({
      ...sms,
      [name]: value,
    });
  };

  const bindSMSTemplate = (e: React.ChangeEvent<SelectElement>) => {
    const template = getString(`smsTemplateOption.${e.target.value}.content`, {
      agentName: `${agentData?.firstName} ${agentData?.lastName}`,
      leadId,
    });
    handleChangeForm({
      ...sms,
      smsMessage: template,
      smsTemplate: e.target.value as string,
    });
  };

  const maskedNumbers = useMemo(
    () =>
      phoneNumbers.map((num: { phone: string }, index: number) => ({
        id: `${index}`,
        title: maskPhoneNumber(num.phone),
        label: maskPhoneNumber(num.phone),
      })),
    [phoneNumbers]
  );

  const countMessageChars = useMemo(
    () => `${charsCount || 0} / 320 chars`,
    [charsCount]
  );

  useEffect(() => {
    if (sms?.phone) {
      setPhoneNumber(sms?.phone);
    }
  }, [sms]);

  useEffect(() => {
    if (phoneNumber) {
      handleChangeForm({
        ...sms,
        phone: phoneNumber,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  useEffect(() => {
    let primaryPhone = '';
    if (maskedNumbers?.length === 1) {
      primaryPhone = FIRST_PHONE_INDEX;
    } else if (primaryPhoneIndex) {
      primaryPhone = primaryPhoneIndex;
    }
    setPhoneNumber(primaryPhone);
    if (primaryPhone) {
      handleChangeForm({
        ...sms,
        phone: primaryPhone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSendEmail, maskedNumbers]);

  return (
    <div className="sms-form">
      <Grid container className="sms-container">
        <Grid item xs={12}>
          <Controls.Select
            name="smsTemplate"
            label={getString('text.smsTemplate')}
            value={sms.smsTemplate}
            onChange={bindSMSTemplate}
            options={smsTemplateOptions}
            selectField="value"
            fixedLabel
            placeholder={getString('text.select')}
          />
        </Grid>
        <Grid item xs={12}>
          <Controls.Select
            name="phone"
            label={getString('text.phoneNumber')}
            value={phoneNumber}
            onChange={bindSmsPhone}
            options={maskedNumbers}
            selectField="id"
            placeholder="Select"
            fixedLabel
          />
        </Grid>

        <Grid item xs={12} className="sms-container__textfield">
          <Controls.Input
            helperText={countMessageChars}
            inputProps={{ maxLength: 320 }}
            name="smsMessage"
            label={getString('text.message')}
            value={sms.smsMessage}
            multiline
            rows={4}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCharsCount(e.target.value.length);
              bindChange(e);
            }}
            placeholder={getString('text.enterMessage')}
            fixedLabel
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default SMSForm;
