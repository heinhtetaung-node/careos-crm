import React, { useEffect, useState } from 'react';

import { ShippingDelivery } from 'presentation/components/common/InfoPanel/ShippingInfo';
import { useGetShipmentsQuery } from 'presentation/pages/car-insurance/orders/PrintingAndShipping/PolicySearchSlice';

export default function useGetShipmentData({
  orderId,
  policyId,
}: {
  orderId: string;
  policyId: string;
}) {
  const [policyShipmentData, setPolicyShipmentData] =
    useState<ShippingDelivery | null>(null);

  const { data: shippingData } = useGetShipmentsQuery(`orders/${orderId}`, {
    skip: !orderId && !policyId,
  });

  useEffect(() => {
    if (shippingData && policyId) {
      const policyShipping = shippingData[policyId ?? ''];
      setPolicyShipmentData(policyShipping);
    }
  }, [shippingData, policyId]);
  return policyShipmentData;
}
