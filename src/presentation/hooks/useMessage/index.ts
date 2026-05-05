import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  IEmailRequestBody,
  initialFormData,
} from 'presentation/components/NewMessage/newMessage.helper';
import { uploadAttachment } from 'presentation/redux/actions/leadDetail/email';

export default function useMessage(
  handleCancelMessage: (value: boolean) => void
) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<any>(cloneDeep(initialFormData));

  const handleCancelMessageInternal = (value: boolean) => {
    handleCancelMessage(value);
    setFormData(cloneDeep(initialFormData));
  };

  const handleChangeEmailForm = (formValue: any) => {
    setFormData({
      ...formData,
      email: formValue,
    });
  };

  const uploadFileAndSendEmail = (
    mailId: string,
    mailModal: IEmailRequestBody
  ) => {
    const attachments = formData.email?.attachment || [];
    const listAttachment = attachments.map((item: File) => {
      return {
        fileModal: {
          fileSize: item.size,
          label: item.name,
        },
        file: item,
        mailId,
      };
    });

    dispatch(uploadAttachment({ listAttachment, mailModal }));
  };

  return {
    formData,
    setFormData,
    handleCancelMessageInternal,
    handleChangeEmailForm,
    uploadFileAndSendEmail,
  };
}
