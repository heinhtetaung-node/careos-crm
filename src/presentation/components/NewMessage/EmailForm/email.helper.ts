export const DomainConfigurations: string[] = [
  'rabbit.co.th',
  'rabbitfinance.com',
];

export const AttachmentExtensions: string[] = ['application/pdf', 'image/*'];

export enum EmailTemplateOptions {
  quote = 'quote',
  paymentFollowUp = 'paymentFollowUp',
  notReachable = 'notReachable',
  renewalReminder = 'renewalReminder',
  noTemplate = 'noTemplate',
  requestForAdditionalDocuments = 'requestForAdditionalDocuments',
  requestForGeneralDocuments = 'requestForGeneralDocuments',
  requestForGeneralFixedCarDriverDocuments = 'requestForGeneralFixedCarDriverDocuments',
  other = 'other',
  requestPayment = 'requestPayment',
}

export type IEmailTemplate = Record<EmailTemplateOptions, [string, string]>;

export const isEmail = (_email: string) => {
  return /[\w\d.-]+@[\w\d.-]+\.[\w\d.-]+/.test(_email);
};

export const isValidRabbitEmail = (_email: string, domainList: string[]) => {
  return domainList.filter((domain) => _email.indexOf(domain) !== -1).length;
};

export const customToEmail = (emails: string[]) =>
  emails
    .map((item, index) => ({
      id: index + 1,
      value: item,
      title: item,
    }))
    .reverse();

// validate compare | details url
export function isValidPackageUrl(url: string | undefined) {
  if (!url) return false;
  const regUrl =
    /(en\/)?product\/[-A-Za-z]+\/quotes\?(details|compare)=[0-9,]+&filter=insuranceCategory=(both|mandatory|voluntary)/;
  return regUrl.test(url);
}

export const getFilterValues = (url: string | undefined) => {
  if (!url) return null;
  const params = new URLSearchParams(url);
  return params.get('filter');
};

export function fetchIdsFromUrl(url: string | undefined) {
  if (!url) return [];

  const urlRegex = /[compare|details]=([^&]*)/;
  const result = urlRegex.exec(url);
  if (!result || !result[1]) {
    return [];
  }

  return result[1]
    .split(',')
    .map(Number)
    .filter((x) => x !== 0);
}

export function getTransformedMessage(
  message: string,
  url: string | undefined
) {
  const packageIds = fetchIdsFromUrl(url);
  if (packageIds.length > 1) {
    return message.replace(
      /(\[\[url\]\])/g,
      `{{compare:${packageIds.join(',')}}}`
    );
  }

  return message.replace(/(\[\[url\]\])/g, ` {{package:${packageIds[0]}}}`);
}
