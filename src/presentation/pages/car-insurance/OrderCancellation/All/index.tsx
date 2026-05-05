import React from 'react';
import OrderCancellationV1 from './OrderCancellationV1';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import OrderCancellationV2 from './OrderCancellationV2';

const OrderCancellationAll: React.FC = () => {
  const flags = useFlags([
    FeatureFlags.BROK_2382_CANCELLATION_MANAGEMENT_CHANGES_REFUND_REQUEST_20250515_TEMP,
  ]);

  const isEnableOrderCancellationV2 =
    flags[
      FeatureFlags
        .BROK_2382_CANCELLATION_MANAGEMENT_CHANGES_REFUND_REQUEST_20250515_TEMP
    ]?.enabled ?? false;

  if (isEnableOrderCancellationV2) {
    return <OrderCancellationV2 />;
  }

  return <OrderCancellationV1 />;
};

export default OrderCancellationAll;
