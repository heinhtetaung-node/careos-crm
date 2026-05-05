import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';

import OrdersDetailPageFromCar from 'presentation/pages/car-insurance/OrderDetailPage';

function OrdersDetailPage() {
  return (
    <div data-testid="health-all-listing-page">
      <Helmet title="Health Insurance - All Orders Page" />
      <OrdersDetailPageFromCar />
    </div>
  );
}
export default OrdersDetailPage;
