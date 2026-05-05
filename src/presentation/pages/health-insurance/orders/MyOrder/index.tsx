import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';

import MyOrders from 'presentation/pages/car-insurance/orders/MyOrders';

function OrdersMyOrdersPage() {
  return (
    <div data-testid="health-order-listing-page">
      <Helmet title="Health Insurance - My Orders Page" />
      <MyOrders />
    </div>
  );
}
export default OrdersMyOrdersPage;
