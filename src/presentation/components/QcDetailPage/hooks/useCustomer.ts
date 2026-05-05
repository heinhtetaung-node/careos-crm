import { useState, useEffect } from 'react';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';

export default function useCustomer(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const [customerInfo, setCustomerInfo] = useState({});

  useEffect(() => {
    if (!isFetching) {
      const recentEmail = resp?.customer?.emails[0]?.email; // this email is just to pretend recent email. need to remove after BE support a way to know recent email
      const customer = {
        [Questions.HAS_CUSTOMER_EMAIL]: recentEmail ?? '-',
        [Questions.HAS_CUSTOMER_LINE]: '-',
      };
      setCustomerInfo(customer);
    }
  }, [resp, isFetching]);
  return customerInfo;
}
