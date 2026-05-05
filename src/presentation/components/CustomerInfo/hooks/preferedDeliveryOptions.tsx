import _camelCase from 'lodash/camelCase';
import { useEffect, useState } from 'react';

import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { DeliveryOption } from 'data/slices/deliveryOptionSlice/interface';
import { DeliveryOptionsSelect } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/type';
import { getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';

export const useDeliveryOptions = (isHealthOrder?: boolean) => {
  const [deliveryOptionsSelect, setDeliveryOptionsSelect] = useState<
    DeliveryOptionsSelect[]
  >([]);
  const { data: deliveryOptionsResponse } = useGetDeliveryOptionsQuery();

  const transformDeliveryOptions = (deliveryOptions: DeliveryOption[]) =>
    deliveryOptions
      .filter(
        (delivery) =>
          !isHealthOrder ||
          delivery.name !== 'deliveryOptions/kerry-express-dashcam'
      )
      .map((item: DeliveryOption, index: number) => {
        const name = item?.displayName ? _camelCase(item.displayName) : '';
        return {
          id: index,
          name: item?.name ?? ShipmentProviders.EMAIL,
          title: getString(`qc.${name}`) as string,
        };
      });

  useEffect(() => {
    const { deliveryOptions } = deliveryOptionsResponse ?? {};
    if (!deliveryOptions) {
      return;
    }
    setDeliveryOptionsSelect(transformDeliveryOptions(deliveryOptions));
  }, [deliveryOptionsResponse]);

  return { deliveryOptionsSelect, deliveryOptionsResponse };
};

export default useDeliveryOptions;
