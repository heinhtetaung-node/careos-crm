import * as React from 'react';

import DetailViewAutocomplete from '../DetailViewAutocomplete';
import DetailViewDatePickerFormik from '../DetailViewDatepicker/DetailViewDatePickerFormik';
import DetailViewTextField from '../DetailViewTextField';
import DetailViewTextFieldFormik from '../DetailViewTextField/DetailViewTextFieldFormik';
import FormikDistrictSelector from '../FormikAddressField/FormikDistrictSelector';
import FormikProvinceSelector from '../FormikAddressField/FormikProvinceSelector';
import FormikSubDistrictSelector from '../FormikAddressField/FormikSubdistrictSelector';
import FormikLicenseField from '../FormikLicenseField';
import FormikRadioField from '../FormikRadioField';
import FormikSelectField from '../FormikSelectField';
import FormikTextContent from '../FormikTextContent';

function FormikController({ fieldType, display, ...rest }: any) {
  if (display) {
    // 'text' | 'select' | 'radio' | 'textContent' | 'license'
    // datefield | 'province' | 'district' | 'subDistrict'
    // readOnly fields should go be textfield
    switch (fieldType) {
      case 'textContent':
        return <FormikTextContent {...rest} />;
      case 'license':
        return <FormikLicenseField {...rest} />;
      case 'radio':
        return <FormikRadioField {...rest} />;
      case 'select':
        return <FormikSelectField {...rest} />;
      case 'datefield':
        return <DetailViewDatePickerFormik {...rest} />;
      case 'province':
        return <FormikProvinceSelector {...rest} />;
      case 'district':
        return <FormikDistrictSelector {...rest} />;
      case 'subDistrict':
        return <FormikSubDistrictSelector {...rest} />;
      case 'autocomplete':
        return <DetailViewAutocomplete {...rest} />;
      default:
        if (!rest.isReadOnly && !rest.isDisabled) {
          return <DetailViewTextFieldFormik {...rest} />;
        }
        return <DetailViewTextField {...rest} />;
    }
  }
  return null;
}

export default FormikController;
