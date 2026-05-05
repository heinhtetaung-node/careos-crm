import { useState, useEffect } from 'react';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { OrderQcStatus } from 'shared/constants/orderType';

export default function useQcStatus(
  orderDetail: OrderDataResponse | undefined
) {
  const [qcStatus, setQcStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (orderDetail?.order?.qcStatus) {
      setQcStatus({
        isApproved: orderDetail.order.qcStatus === OrderQcStatus.APPROVED,
        isPreApproved: orderDetail.order.qcStatus === OrderQcStatus.PREAPPROVED,
        isPending: orderDetail.order.qcStatus === OrderQcStatus.PENDING,
        isRejected: orderDetail.order.qcStatus === OrderQcStatus.REJECTED,
      });
    }
  }, [orderDetail]);

  return qcStatus;
}
