import { DetailViewTextFieldProps } from 'presentation/components/common/FormikFields/DetailViewTextField/DetailViewTextField';

export enum CAR_ROWS {
  CAR_BRAND = 'brand',
  CAR_MODEL = 'model',
  CAR_YEAR = 'year',
  SUB_MODEL = 'carSubModelYear',
  FUEL_TYPE = 'fuelType',
  TRANSMISSION_GEAR = 'transmission',
  ENGINE_SIZE = 'engineSize',
  NUMBER_DOORS = 'noOfDoors',
  CAB_TYPE = 'cabType',
  MODIFICATION = 'carModified',
  DASHCAM = 'carDashCam',
  DRIVING_PURPOSE = 'carUsageType',
  NUMBER_REGISTERED_SEATS = 'carRegisteredSeats',
  PROVINCE = 'registeredProvince',
  RED_PLATE = 'redPlate',
  LICENSE_PLATE = 'carLicensePlate',
  CHASSIS_NUMBER = 'chassisNumber',
  VEHICLE_ID_NUMBER = 'vehicleIdNumber',
  VEHICLE_COLOR = 'carColor',
}

interface AutocompleteProps {
  value: string;
  isReadOnly: boolean;
  title: string;
  error: null | string;
  placeholder?: string;
  options?: any;
  name: string;
  showAsterisk: boolean;
  relatedField?: string[];
  multiple?: boolean;
  getOptionsFn?: (payload: any) => any;
  showLabel?: boolean;
  dataTestId?: string;
  hasOptions?: boolean;
  disableClearable?: boolean;
  isDisabled?: boolean;
  disableCloseOnSelect?: boolean;
}

export interface RadioProps {
  name: string;
  title: string;
  dataTestId?: string;
  options?: any;
  row?: boolean;
  showLabel?: boolean;
  isReadOnly?: boolean;
  error: any;
  value: string | undefined;
  handleChange?: (e: any) => void;
  isDisabled?: boolean;
  relatedField?: string[];
  showAsterisk?: boolean;
}

export interface CustomDetailViewTextFieldProps
  extends DetailViewTextFieldProps {
  hasOptions?: boolean;
  options?: any;
  isDisabled?: boolean;
  abbreviation?: string;
  hideLabel?: boolean;
  backgroundColor?: string | undefined;
}

type inputPropsType =
  | AutocompleteProps
  | RadioProps
  | CustomDetailViewTextFieldProps;

export interface RowProps {
  InputComponent: any;
  inputProps: inputPropsType;
  type: 'autocomplete' | 'radio' | 'text' | 'licensePlate';
}

export type CarRowProps = { [key in CAR_ROWS]?: RowProps };
