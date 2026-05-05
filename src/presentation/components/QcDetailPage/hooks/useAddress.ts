import _camelCase from 'lodash/camelCase';
import _isEmpty from 'lodash/isEmpty';
import { useState, useEffect } from 'react';
import { getI18n } from 'react-i18next';

import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { DeliveryOption } from 'data/slices/deliveryOptionSlice/interface';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';

interface AddressType {
  province?: string;
  provinceTh?: string;
  district?: string;
  districtTh?: string;
  subDistrict?: string;
  subDistrictTh?: string;
  addressLine?: string;
  zipcode?: string;
}

function getI18Address(rawAddress: AddressType) {
  if (_isEmpty(rawAddress)) return '-';
  const {
    province = '',
    provinceTh = '',
    district = '',
    districtTh = '',
    subDistrict = '',
    subDistrictTh = '',
    addressLine = '',
    zipcode = '',
  } = rawAddress;
  const language = getI18n()?.language || 'en';
  let address = '';
  address = `${addressLine}, ${subDistrict}, ${district}, ${province}`;
  if (language === 'th') {
    address = `${addressLine}, ${subDistrictTh}, ${districtTh}, ${provinceTh}`;
  }
  return `${address} ${zipcode}`;
}

export default function useAddress(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const [addressInfo, setAddressInfo] = useState({});
  const { data: getDeliveryOptions } = useGetDeliveryOptionsQuery();

  useEffect(() => {
    const { deliveryOptions } = getDeliveryOptions || {};
    const { deliveryOption } = resp?.order?.data ?? {};

    let deliveryOptionText = '-';
    if (deliveryOptions && deliveryOptions?.length > 0) {
      const { displayName } =
        deliveryOptions.find(
          (option: DeliveryOption) => option.name === deliveryOption
        ) ?? {};
      deliveryOptionText = displayName
        ? getString(`qc.${_camelCase(displayName)}`)
        : '-';
    }

    if (!isFetching) {
      const policyHolderAddress = resp?.policyHolderAddress;
      const isBillingAddress =
        resp?.order?.data?.policyHolder?.policyAddress?.isBillingAddress;
      const isShippingAddress =
        resp?.order?.data?.policyHolder?.policyAddress?.isShippingAddress;
      const shippingAddress = resp?.shippingAddress;
      const billingAddress = resp?.billingAddress;
      const address = {
        [Questions.POLICYHOLDER_ADDRESS]: getI18Address(policyHolderAddress),
        [Questions.BILLING_ADDRESS]: isBillingAddress
          ? getString('qc.usePolicyAddress')
          : getI18Address(billingAddress ?? {}),
        [Questions.SHIPPING_ADDRESS]: isShippingAddress
          ? getString('qc.usePolicyAddress')
          : getI18Address(shippingAddress ?? {}),
        [Questions.PREFERRED_DELIVERY]: deliveryOptionText,
      };

      setAddressInfo(address);
    }
  }, [isFetching, resp, getDeliveryOptions]);

  return addressInfo;
}
