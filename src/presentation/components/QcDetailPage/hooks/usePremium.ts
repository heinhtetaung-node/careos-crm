import { useState, useEffect } from 'react';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { satangToBaht } from 'utils/currency';

import { formatCoverage } from '../helpers/utils';

export default function usePremium(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const [premiumInfo, setPremiumInfo] = useState({});

  useEffect(() => {
    if (!isFetching) {
      const order = resp?.order;
      const items = resp?.items;
      const policyItems = items?.map((i) =>
        satangToBaht(
          i?.discounts?.reduce(
            (acc, curr) => Number(acc) + Number(curr?.amount),
            0
          ) ?? 0
        )
      );
      const premium = {
        [Questions.PREMIUM_DISCOUNTS]: `-${formatCoverage(
          policyItems?.reduce(
            (prev: any, curr: any) => Number(prev) + Number(curr),
            0
          ) ?? 0
        )}`,
        [Questions.PREMIUM_INVOICE]: formatCoverage(
          satangToBaht((order as any)?.invoicePrice ?? 0)
        ),
      };
      setPremiumInfo(premium);
    }
  }, [resp, isFetching]);

  return premiumInfo;
}
