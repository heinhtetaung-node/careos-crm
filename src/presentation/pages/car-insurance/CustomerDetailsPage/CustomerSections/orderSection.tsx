import clsx from 'clsx';
import React, { useState } from 'react';

import { TransformedOrder } from 'data/slices/customerSlice/types';
import { getString } from 'presentation/theme/localization';

import { RenderOrderList } from '../helper';
import { IOrderSectionProps } from '../types';

function OrderSection({ classes, orders }: IOrderSectionProps) {
  const [expanded, setExpended] = useState<string | false>(false);

  return (
    <div
      className={clsx({
        [classes.card]: true,
        [classes.overflow]: orders.length > 7,
        [classes.textCenter]: !orders.length,
      })}
    >
      {orders?.length ? (
        orders.map((_order: TransformedOrder, index: number) => (
          <RenderOrderList
            key={_order.orderId}
            id={_order.orderId}
            name={`Order ${index + 1}`}
            data={_order}
            expanded={expanded}
            handleExpand={setExpended}
            classes={classes}
          />
        ))
      ) : (
        <p data-testid="no-orders">{getString('text.noOrders')}</p>
      )}
    </div>
  );
}
export default OrderSection;
