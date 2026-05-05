import _camelCase from 'lodash/camelCase';
import _find from 'lodash/find';
import { useState, useEffect } from 'react';

import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { DeliveryOption } from 'data/slices/deliveryOptionSlice/interface';
import { getString } from 'presentation/theme/localization';
import { ShipmentMethods, ShippingMethods } from 'shared/constants/orderType';

export interface OptionsProps {
  title: string;
  value: string;
}

export default function useDeliveryOptions() {
  const initialValue = {
    deliveryOptions: [] as OptionsProps[],
    docsShipmentMethod: [] as OptionsProps[],
  };
  const [preferredDeliveryOptions, setPreferredDeliveryOptions] =
    useState<Record<string, any>>(initialValue);
  const { data: deliveryOptionsResponse } = useGetDeliveryOptionsQuery();

  useEffect(() => {
    if (deliveryOptionsResponse) {
      const { deliveryOptions } = deliveryOptionsResponse || {};
      const shipmentFields = deliveryOptions.reduce(
        (currentValue, option: DeliveryOption) => {
          currentValue.deliveryOptions.push({
            title: getString(`qc.${_camelCase(option.displayName)}`),
            value: option.name,
          });
          const docsShipmentMethod =
            option.shipmentMethod === ShipmentMethods.SHIPMENT_METHOD_EMAIL
              ? ShippingMethods.EMAIL
              : ShippingMethods.COURIER;
          if (
            !_find(currentValue.docsShipmentMethod, [
              'value',
              docsShipmentMethod,
            ])
          ) {
            const docsShipmentMethodText =
              docsShipmentMethod === ShippingMethods.EMAIL
                ? 'qc.digitalDelivery'
                : 'qc.kerry';
            currentValue.docsShipmentMethod.push({
              title: getString(docsShipmentMethodText),
              value: docsShipmentMethod,
            });
          }

          return currentValue;
        },
        initialValue
      );
      setPreferredDeliveryOptions(shipmentFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryOptionsResponse]);

  return preferredDeliveryOptions;
}
