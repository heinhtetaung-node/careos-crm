import { getString } from 'presentation/theme/localization';
import {
  hasSpecialChar,
  isNotANum,
  isValidThAndEnName,
} from 'shared/helper/utilities';

type Option = {
  name: string;
  value: string;
};

export enum VehicleColor {
  Red = 'red',
  DarkBlue = 'darkBlue',
  Yellow = 'yellow',
  White = 'white',
  Black = 'black',
  Purple = 'purple',
  Green = 'green',
  Orange = 'orange',
  Brown = 'brown',
  Pink = 'pink',
  Grey = 'grey',
  LightBlue = 'lightBlue',
}

export const vehicleColorOptions = [
  {
    id: 0,
    value: VehicleColor.Red,
    title: getString('order.vehicleColor.red'),
  },
  {
    id: 1,
    value: VehicleColor.DarkBlue,
    title: getString('order.vehicleColor.darkBlue'),
  },
  {
    id: 2,
    value: VehicleColor.Yellow,
    title: getString('order.vehicleColor.yellow'),
  },
  {
    id: 3,
    value: VehicleColor.White,
    title: getString('order.vehicleColor.white'),
  },
  {
    id: 4,
    value: VehicleColor.Black,
    title: getString('order.vehicleColor.black'),
  },
  {
    id: 5,
    value: VehicleColor.Purple,
    title: getString('order.vehicleColor.purple'),
  },
  {
    id: 6,
    value: VehicleColor.Green,
    title: getString('order.vehicleColor.green'),
  },
  {
    id: 7,
    value: VehicleColor.Orange,
    title: getString('order.vehicleColor.orange'),
  },
  {
    id: 8,
    value: VehicleColor.Brown,
    title: getString('order.vehicleColor.brown'),
  },
  {
    id: 9,
    value: VehicleColor.Pink,
    title: getString('order.vehicleColor.pink'),
  },
  {
    id: 10,
    value: VehicleColor.Grey,
    title: getString('order.vehicleColor.grey'),
  },
  {
    id: 11,
    value: VehicleColor.LightBlue,
    title: getString('order.vehicleColor.lightBlue'),
  },
];

export const isValidName = (value: string) =>
  !isValidThAndEnName(value) && value.length && value.length <= 250;

export const isValidVehicleNum = (value: string) =>
  !hasSpecialChar(value) && value.length && value.length <= 17;

export const validateData = (option: Option) => {
  let result;
  switch (option.name) {
    case 'secondDriverName':
    case 'firstDriverName':
      result = isValidName(option.value);
      break;
    case 'carLicensePlate':
    case 'secondDriverDOB':
    case 'firstDriverDOB':
      result = true;
      break;
    default:
      result = isValidVehicleNum(option.value);
      break;
  }
  return result;
};

export const DRIVER_FIELDS = {
  first: [
    'firstDriverDOB',
    'firstDriverDrivingLicense',
    'firstDriverIdNumber',
    'firstDriverName',
  ],
  second: [
    'secondDriverDOB',
    'secondDriverDrivingLicense',
    'secondDriverIdNumber',
    'secondDriverName',
  ],
} as const;

/** Returns driver field keys to remove from order when noOfFixedDriver is set to 0, 1, or 2. */
export function getDriverFieldsToRemoveForCount(
  count: 0 | 1 | 2
): readonly string[] {
  if (count === 0) return [...DRIVER_FIELDS.first, ...DRIVER_FIELDS.second];
  if (count === 1) return DRIVER_FIELDS.second;
  return [];
}

export const checkFieldBoolean = (val: boolean) =>
  val ? `${getString('text.yes')}` : `${getString('text.no')}`;

export const isValidLicense = (val: string) => {
  const licenseStr = val.split(' ')[0] || '';
  const left: string = licenseStr?.split('-')[0] || '';
  const right: string = licenseStr?.split('-')[1] || '';
  return (
    !hasSpecialChar(left) &&
    left.length &&
    left.length <= 3 &&
    !hasSpecialChar(right) &&
    !isNotANum(right) &&
    right.length &&
    right.length <= 4
  );
};
