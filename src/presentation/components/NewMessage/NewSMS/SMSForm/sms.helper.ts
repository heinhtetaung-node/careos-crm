import { getString } from 'presentation/theme/localization';

export interface ISmsTemplate {
  [key: string]: string;
}

// INFO: Just fake email template
export const SmsTemplateConfiguration: ISmsTemplate = {
  '0812019311':
    '"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock"',
  '0812019312':
    'Hi Alex \n\n' +
    'I hope you are well. \n\n' +
    'I just wanted to drop you a quick note to remind you that 100$ in respect of our invoice is due for payment on 17/11/2020. \n\n' +
    'I would be really grateful if you could confirm that everything is on track for payment. \n\n' +
    'Best regards',
  '0812019313':
    'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old',
  '0812019314':
    'Hi Alex \n\n' +
    'Thanks for using our product. We’re really sad to see you go – but we had a good run. \n\n' +
    'If you have any outstanding questions, feel free to contact us at support@acme.com or +123456789. \n\n' +
    'And, if you ever need a product like ours in future, we hope we’ll see you again. \n\n' +
    'All the best,',
};

export const FakePhoneNumber = [
  { id: 1, title: '0812019311', label: '0812019311' },
  { id: 2, title: '0812019312', label: '0812019312' },
  { id: 3, title: '0812019313', label: '0812019313' },
  { id: 4, title: '0812019314', label: '0812019314' },
];

export interface ISms {
  phone: string;
  smsMessage: string;
  smsTemplate: string;
}

export const FakeSMSTemplate = [
  {
    id: 1,
    value: 'lineAccount',
    title: getString('smsTemplateOption.lineAccount.option'),
  },
  {
    id: 2,
    value: 'requestDocuments',
    title: getString('smsTemplateOption.requestDocuments.option'),
  },
  {
    id: 3,
    value: 'renewalReminder',
    title: getString('smsTemplateOption.renewalReminder.option'),
  },
  {
    id: 4,
    value: 'notReachableV2',
    title: getString('smsTemplateOption.notReachableV2.option'),
  },
];
