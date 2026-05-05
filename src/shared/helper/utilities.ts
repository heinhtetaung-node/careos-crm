import {
  format,
  formatDistanceToNow,
  formatISO,
  isValid,
  parse,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import libPhoneNumber from 'google-libphonenumber';

import { getString } from 'presentation/theme/localization';
import { LEAD_TYPE } from 'shared/constants';
import { satangToBaht } from 'utils/currency';

// Get an instance of `PhoneNumberUtil`
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
const THAI_YEAR_DIFFERENCE = 543;
const DEFAULT_UNIT = 1000;
const DEFAULT_DECIMALS = 2;
const API_NULL_DATE_FORMAT = '0001-01-01T00:00:00Z';

export const languages = [
  {
    id: 1,
    title: 'EN',
    value: 'EN',
  },
  {
    id: 2,
    title: 'TH',
    value: 'TH',
  },
];

export const parseDate = (date: string, dateFormat: string) =>
  parse(date, dateFormat, new Date());

export const convertToIdTitle = (oldArr: any) => {
  if (!oldArr) {
    return [];
  }
  return oldArr.map((val: any) => ({
    ...val,
    id: val.name,
    title: val.displayName,
  }));
};

export const millisToMinutesAndSeconds = (millis: number) => {
  let minutes: string | number = Number(Math.floor(millis / 60000));
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  const seconds = Number(((millis % 60000) / 1000).toFixed(0));
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const toBuddhistYear = (date: Date) => {
  const time = new Date(date);
  const timeDiff = 543;
  const christianYear = format(time, 'yyyy');

  // eslint-disable-next-line radix
  const buddhishYear = (parseInt(christianYear, 10) + timeDiff).toString();

  return `${format(time, 'dd/MM/yyyy')} (${buddhishYear}) <br/> ( ${format(
    time,
    'HH:mm:ss'
  )} PM )`;
};

export const thaiDateFormat = (isoDate: string) => {
  const date = new Date(isoDate);
  let day = String(date.getDate());
  let month = String(date.getMonth() + 1);
  const year = date.getFullYear();
  const thaiYear = year + THAI_YEAR_DIFFERENCE;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return `${day} / ${month} / ${year} (${thaiYear})`;
};

export const thaiYearFormat = (isoDate: string) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const thaiYear = year + THAI_YEAR_DIFFERENCE;

  return `${year} (${thaiYear})`;
};

export const formatBytes = (bytes: any, decimals = DEFAULT_DECIMALS) => {
  if (bytes === 0) return '0 Bytes';

  const unit = DEFAULT_UNIT;
  const fixedDecimal = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const sizeOrder = Math.floor(Math.log(bytes) / Math.log(unit));
  const dividend = unit ** sizeOrder;

  return `${parseFloat((bytes / dividend).toFixed(fixedDecimal))} ${
    sizes[sizeOrder]
  }`;
};

export const capitalizeFirstLetter = (originalString: string) => {
  if (originalString?.length) {
    return (
      originalString.charAt(0).toUpperCase() +
      originalString.slice(1).toLowerCase()
    );
  }
  return '';
};

export const countingAgeToPresent = (DOB: string) => {
  const today = new Date();
  const birthDate = new Date(DOB);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

export const leadTypeText = (type: string) => {
  switch (type) {
    case LEAD_TYPE.NEW:
      return getString('leadTypeFilter.new');
    case LEAD_TYPE.RETAINER:
      return getString('leadTypeFilter.retainer');
    case LEAD_TYPE.RENEWAL:
      return getString('leadTypeFilter.renewal');
    default:
      return getString('leadTypeFilter.new');
  }
};

export const LeadTypeFilter = [
  {
    id: 0,
    value: 'new',
    title: 'leadTypeFilter.new',
    leadType: 'LEAD_TYPE_NEW',
  },
  {
    id: 1,
    value: 'retainer',
    title: 'leadTypeFilter.retainer',
    leadType: 'LEAD_TYPE_RETAINER',
  },
  {
    id: 2,
    value: 'renewal',
    title: 'leadTypeFilter.renewal',
    leadType: 'LEAD_TYPE_RENEWAL',
  },
];

export const mappingLeadType = (type: string) => {
  let leadTypeName = '';
  LeadTypeFilter.forEach((item) => {
    if (item.leadType === type) {
      leadTypeName = item.title;
    }
  });

  return leadTypeName;
};

export const formatDDMMYYYY = (
  date: string,
  dateFormat: 'dd/MM/yyyy' | 'yyyy-MM-dd' = 'dd/MM/yyyy'
) => {
  if (!date || date === API_NULL_DATE_FORMAT || !isValid(new Date(date)))
    return '';
  return format(new Date(date), dateFormat);
};

export const formatDDMMYYYYHHMMSS = (date: string) => {
  // Check if date is valid and not API_NULL_DATE_FORMAT
  if (date === API_NULL_DATE_FORMAT) return '';

  if (date && isValid(new Date(date))) {
    return `${format(new Date(date), 'dd/MM/yyyy')} (${format(
      new Date(date),
      'hh:mm:ss aa'
    )})`;
  }
  return '';
};

export const formatDDMMYYYYHHMMA = (date: string) =>
  date && isValid(new Date(date))
    ? format(new Date(date), 'dd/MM/yyyy (hh:mm a)')
    : '';

export const formatDDMMYYYYHHMMSSUTC = (date: string) => {
  if (date) {
    return format(
      utcToZonedTime(new Date(date), 'UTC'),
      'dd/MM/yyyy (hh:mm:ss aa)'
    );
  }
  return '';
};

// date-fns utc date formatters
export const NewDateFormatters = (timezone = 'UTC') => {
  // will add rest formatters gradually.
  const DDMMYYYY = (date: string) =>
    date ? format(utcToZonedTime(new Date(date), timezone), 'dd/MM/yyyy') : '';
  const DDMMYYYYHM = (date: string) =>
    date
      ? format(utcToZonedTime(new Date(date), timezone), 'dd/MM/yyyy H:mm')
      : '';
  const ISODate = (date: string) =>
    date ? formatISO(zonedTimeToUtc(new Date(date), 'UTC')) : '';
  return { DDMMYYYY, ISODate, DDMMYYYYHM };
};

export const lowercaseFirstLetter = (str: string) =>
  str ? str.charAt(0).toLocaleLowerCase() + str.slice(1) : '';

export const processErrMessage = (errMessage: string) => {
  let resultMessage = errMessage;
  const fieldsMapping: { [key: string]: string } = {
    human_id: 'username',
  };

  Object.entries(fieldsMapping).forEach(([key, value]: any) => {
    if (resultMessage.includes(key))
      resultMessage = resultMessage.replaceAll(key, value);
  });

  return resultMessage.replaceAll('_', ' ');
};

export const modelValidationField = (value: string | number | boolean) =>
  value || '';

// Check is string is possible phone number
export const isPossiblePhoneNumber = (phoneNumber: string) => {
  let parsedNumber;
  try {
    parsedNumber = phoneUtil.parse(phoneNumber, 'TH');
    return phoneUtil.isValidNumberForRegion(parsedNumber, 'TH');
  } catch (error) {
    return false;
  }
};

// Format number in the E164 format
export const formatE164 = (phoneNumber: string) => {
  // Parse number with country code and keep raw input.
  const number = phoneUtil.parseAndKeepRawInput(phoneNumber, 'TH');
  return phoneUtil.format(number, libPhoneNumber.PhoneNumberFormat.E164);
};

const formatPhoneNumber = (number: any) => number.replace(/^\+66/, 0);

export const maskPhoneNumber = (phone: string | undefined) =>
  phone ? formatPhoneNumber(phone).replace(/.{4}$/gi, '****') : '***';

export const isInvalidCharacters = (input: string) => {
  const numberPattern = /\d/;
  const specialCharacters = /[^A-Za-z 0-9]/g;
  return numberPattern.test(input) || specialCharacters.test(input);
};

export const hasSpecialChar = (input: string) => {
  const specialCharacters = /[^A-Za-z\u0E00-\u0E7F 0-9]/g;
  return specialCharacters.test(input);
};

export const isNotANum = (input: string) => {
  const letters = /\D/g;
  return letters.test(input);
};

export const isValidThAndEnName = (input: string) => {
  const numberPattern = /\d/;
  const specialCharacters = /[^A-Za-z \u0E00-\u0E7F]/g;
  return numberPattern.test(input) || specialCharacters.test(input);
};

export const sleep = (ms: number) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

export enum SORT_TABLE_TYPE {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

export const getOrderByField = (field: string, status?: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE) return '';
  if (status === SORT_TABLE_TYPE.ASC) return `order_by=${field}`;
  return `order_by=${field} desc`;
};

export const changeSortStatus = (status: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE) return SORT_TABLE_TYPE.ASC;
  if (status === SORT_TABLE_TYPE.ASC) return SORT_TABLE_TYPE.DESC;
  return SORT_TABLE_TYPE.NONE;
};

export const getRenewalPackageStatus = (status: string) => {
  if (status === 'ACCEPTED') return 'renewalStatus.accepted';
  if (status === 'UNSPECIFIED') return 'renewalStatus.unspecified';
  if (status === 'DECLINED') return 'renewalStatus.declined';
  return '';
};

export const getLeadIdFromPath = () => {
  const pathSplit = window.location.href.split('/');

  if (pathSplit.includes('health')) {
    const pathSplitLeads = window.location.href.split('leads/');
    return (
      pathSplitLeads[1]
        ?.replace('/create-payment', '')
        ?.replace('/create-contract', '') ?? ''
    );
  }
  if (pathSplit && pathSplit.length > 4) {
    return pathSplit[4];
  }
  return '';
};

/**
 * Returns the lead ID from the lead resource name
 * @param leadName resource name of the lead e.g. leads/xxx
 * @returns lead ID
 */
export const getLeadIdFromLeadName = (leadName?: string) => {
  if (leadName == null || !leadName.startsWith('leads/')) return '';
  const parts = leadName.split('/');
  return parts.length < 2 ? '' : parts[1];
};

export const getYesNoOptions = (option: boolean) => {
  if (option) return 'genericOption.yes';
  return 'genericOption.no';
};

export function maskEmailAddress(email: string) {
  const emailSplit = email.split('@');

  if (emailSplit[0].length <= 2) {
    return email;
  }

  return `${emailSplit[0].substring(0, 2)}${'*'.repeat(
    emailSplit[0].length - 2
  )}@${emailSplit[1]}`;
}

export const formatTimeAgo = (timestamp: string) => {
  if (!timestamp) return '';
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  }).replace(/^about\s+/, '');
};

export const formatBoolean = (
  val: boolean | undefined,
  trueText: string,
  falseText: string
): string => {
  switch (val) {
    case true:
      return trueText;
    case false:
      return falseText;
    default:
      return '-';
  }
};

export const formatCurrency = (amount: number, satang: boolean = false) =>
  satang
    ? satangToBaht(amount).toLocaleString('en-US')
    : amount.toLocaleString('en-US');

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
