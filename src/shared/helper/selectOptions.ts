import _getValue from 'lodash/get';

import {
  DocTypes,
  Titles,
  leadTitleOptions,
} from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

// Options for dropdown
export const genderOptions = [
  {
    id: 0,
    val: 'm',
    value: 'm',
    title: getString('text.male'),
  },
  {
    id: 1,
    val: 'f',
    value: 'f',
    title: getString('text.female'),
  },
];

export const titleOptionsFull = [
  ...leadTitleOptions().map((option) => ({
    id: option.id,
    val: option.value,
    title: option.title,
  })),
];

export const titleOptions = [
  {
    id: 0,
    val: Titles.KHUN,
    title: getString('text.khun'),
  },
  {
    id: 1,
    val: Titles.MR,
    title: getString('text.mr'),
  },
  {
    id: 2,
    val: Titles.MISS,
    title: getString('text.miss'),
  },
  {
    id: 3,
    val: Titles.MRS,
    title: getString('text.mrs'),
  },
];

export const documentTypeOptions = [
  {
    id: 'DrivingLicense',
    val: DocTypes.DrivingLicense,
    title: getString('leadDetailFields.drivingLicense'),
  },
  {
    id: 'NationalID',
    val: DocTypes.NationalID,
    title: getString('leadDetailFields.nationalId'),
  },
  {
    id: 'Passport',
    val: DocTypes.Passport,
    title: getString('leadDetailFields.passport'),
  },
];

export const languageOptions = [
  {
    id: 0,
    val: 'th-en',
    value: 'th-en',
    title: getString('text.english'),
  },
  {
    id: 1,
    val: 'th-th',
    value: 'th-th',
    title: getString('text.thai'),
  },
];

export const yesNoOptions = [
  {
    id: 0,
    val: 'Yes',
    title: getString('text.yes'),
  },
  {
    id: 1,
    val: 'No',
    title: getString('text.no'),
  },
];

export const getTitle = (title: string | null, isEditable?: boolean) => {
  if (title) {
    const match = titleOptionsFull.find((item) => item.val === title);
    return isEditable ? _getValue(match, 'val') : _getValue(match, 'title');
  }
  return '';
};

export const statusOptions = [
  { id: 1, title: getString('text.absent'), value: 1 },
  { id: 2, title: getString('text.present'), value: 2 },
];
