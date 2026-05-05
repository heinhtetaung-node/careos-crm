export interface AddressProps {
  orderProduct?: string;
  addressLine: string;
  province: string;
  provinceCode: string | number;
  district: string;
  districtCode: string | number;
  subDistrict: string;
  subDistrictCode: string | number;
  postalCode: string | number;
  addressType: string;
  disabled: boolean;
  fields?: any;
  question?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  handleModalToggle?: () => void;
  setSubmitButtonToggle?: React.Dispatch<React.SetStateAction<boolean>>;
}
