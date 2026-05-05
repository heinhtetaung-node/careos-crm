import React from 'react';
import { getI18n } from 'react-i18next';
import { isThai, Language } from 'utils/language';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { getString } from 'presentation/theme/localization';

import { policyHolderAddressItems } from './helper';

interface PolicyHolderAddressProps {
  address: OrderDataResponse['policyHolderAddress'];
}

export default function PolicyHolderAddress({
  address,
}: PolicyHolderAddressProps) {
  const isThaiLang = isThai(getI18n()?.language as Language);

  const initialValues = {
    mainAddress: getString('addressModal.mainAddress'),
    addressLine: address?.addressLine,
    province: isThaiLang ? address?.provinceTh : address?.province,
    district: isThaiLang ? address?.districtTh : address?.district,
    subDistrict: isThaiLang ? address?.subDistrictTh : address?.subDistrict,
    postalCode: address?.zipcode,
  };

  return (
    <FormikWrapper
      title="addressModal.titlePolicyAddress"
      items={policyHolderAddressItems}
      initialValues={initialValues}
      handleUpdate={() => null}
    />
  );
}
