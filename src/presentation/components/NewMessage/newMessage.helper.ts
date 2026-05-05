import * as yup from 'yup';

import { getString } from 'presentation/theme/localization';

export enum MessageType {
  Email = 'email',
  SMS = 'sms',
}

export interface ISmsRequestBody {
  message: string;
  phoneIndex: number;
  status: string;
  title: string;
}

export interface IFileModal {
  fileSize: number;
  label: string;
}

export interface IEmailRequestBody {
  name: string;
  subject: string;
  body: string;
  cc: string[];
  bodyText: string;
  emailIndex?: number;
  type: string;
  parentId?: string;
  emailAddress?: string;
}
export interface IFormData {
  [MessageType.Email]: {
    message: string;
    emailTemplate: string;
    to: string;
    cc: string[];
    subject: string;
    attachment: any[];
  };
  [MessageType.SMS]: {
    smsMessage: string;
    phone: string;
    smsTemplate: string;
  };
}

export const initialFormData = {
  email: {
    message: '',
    emailTemplate: '',
    to: '',
    cc: [],
    subject: '',
    attachment: [],
  },
  sms: {
    smsMessage: '',
    phone: '',
    smsTemplate: '',
  },
};

export const emailValidationSchema = yup.object().shape({
  email: yup.object().shape({
    message: yup.string().required('Message is required'),
    subject: yup
      .string()
      .required(getString('errors.required', { field: 'Subject' })),
  }),
});

export const smsValidationSchema = yup.object().shape({
  sms: yup.object().shape({
    message: yup.string().required('Message is required'),
    phone: yup
      .string()
      .required(getString('errors.required', { field: 'Phone Number' }))
      .trim(),
  }),
});

export const EmailTemplates = [
  {
    id: 1,
    value: 'quote',
    title: getString('emailTemplateOption.quote.option'),
  },
  // {
  //   id: 2,
  //   value: 'paymentFollowUp',
  //   title: getString('emailTemplateOption.paymentFollowUp.option'),
  // },
  {
    id: 3,
    value: 'notReachable',
    title: getString('emailTemplateOption.notReachable.option'),
  },
  {
    id: 4,
    value: 'renewalReminder',
    title: getString('emailTemplateOption.renewalReminder.option'),
  },
  {
    id: 5,
    value: 'noTemplate',
    title: getString('emailTemplateOption.noTemplate.option'),
  },
  {
    id: 6,
    value: 'requestForAdditionalDocuments',
    title: getString(
      'emailTemplateOption.requestForAdditionalDocuments.option'
    ),
  },
  {
    id: 7,
    value: 'requestForGeneralDocuments',
    title: getString('emailTemplateOption.requestForGeneralDocuments.option'),
  },
  {
    id: 8,
    value: 'requestForGeneralFixedCarDriverDocuments',
    title: getString(
      'emailTemplateOption.requestForGeneralFixedCarDriverDocuments.option'
    ),
  },
  {
    id: 10,
    value: 'requestPayment',
    title: getString('emailTemplateOption.requestPayment.option'),
  },
  {
    id: 9,
    value: 'other',
    title: getString('emailTemplateOption.other.option'),
  },
];

export const getMailIndex = (email: string) => {
  const mailIndex = Number(email) - 1;

  return mailIndex || 0;
};

export enum smsStatusTypes {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum mailTypes {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
  SYSTEM = 'SYSTEM',
  SUPPORT = 'SUPPORT',
}

export interface IListAttachmentRequest {
  listAttachment: IAttachmentRequest[];
  mailModal: IEmailRequestBody;
}

export interface IAttachmentRequest {
  fileModal: IFileModal;
  file: File;
  mailId: string;
}
