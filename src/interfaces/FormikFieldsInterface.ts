export interface IFormikFieldProps {
  name: string;
  title: string;
  dataTestId?: string;
  placeholder?: string;
  showLabel?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  value?: string;
  error?: string;
}

export interface IFormikControllerProps extends IFormikFieldProps {
  fieldType?:
    | 'text'
    | 'select'
    | 'radio'
    | 'textContent'
    | 'license'
    | 'datefield'
    | 'province'
    | 'district'
    | 'subDistrict'
    | 'autocomplete';
  display?: boolean;
  isInputMasked?: boolean;
  options?: any;
  error?: string;
  province?: string;
  values?: any;
  value?: any;
  isDob?: boolean;
  showAsterisk?: boolean;
}

export interface IFormikTextFieldProps extends IFormikFieldProps {
  isInputMasked?: boolean;
  options?: any;
}

export interface IFormikLicenseFieldProps extends IFormikTextFieldProps {
  province?: string;
}

export interface IFormikRadioFieldProps extends IFormikFieldProps {
  options?: any;
  row?: boolean;
}

export interface IFormikSelectFieldProps extends IFormikFieldProps {
  handleUpdate?: (payload: any) => void;
  options?: any;
}

export interface IFormikItem extends IFormikFieldProps {
  display?: boolean;
}

export interface IFormikWrapper {
  title?: string;
  items?: IFormikItem[];
  initialValues?: any;
  validationSchema?: any;
  handleUpdate: (payload: any) => void;
  hasSectionWrapper?: boolean;
  textFieldError?: boolean;
  setFieldsErrors?: React.Dispatch<React.SetStateAction<any>>;
}
