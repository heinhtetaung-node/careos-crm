import _keyBy from 'lodash/keyBy';
import { useState, useEffect } from 'react';

import { OrderTransform } from 'data/slices/orderSlice';
import { Order } from 'presentation/components/OrderListingTable/helper';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { Addons } from 'shared/types/addons';

export default function useOrderWithInsurers(
  orders: OrderTransform[] | undefined
) {
  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data ?? []
  );
  const [orderDataWithInsurers, setOrderDataWithInsurers] = useState<
    OrderTransform[]
  >([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!orders) return;
    dispatch(getInsurersAll({ pageSize: 1000 }));
  }, [dispatch, orders]);

  useEffect(() => {
    /* eslint-disable prefer-const */
    if (!orders) return;
    const insurersMap = _keyBy(insurers, 'name');
    const ordersWithInsurerName = orders.map((order: any) => {
      const products = order.products?.map(
        (product: Order['products'][number]) => {
          const isAddon = [
            Addons.ASSET,
            Addons.CAR_REPLACEMENT,
            Addons.ROADSIDE_ASSISTANCE,
          ].includes(product.package as any);
          return {
            ...product,
            insurer: insurersMap[product.insurer]?.displayName ?? '',
            isAddon,
          };
        }
      );
      return {
        ...order,
        insurer: !Number(order.insurer?.name?.split('/')?.[1])
          ? insurers.find(
              (insurer: any) => insurer.name === order?.item?.insurer
            )
          : order.insurer,
        products,
      };
    });
    setOrderDataWithInsurers(ordersWithInsurerName);
  }, [insurers, orders]);

  return { orderDataWithInsurers };
}
