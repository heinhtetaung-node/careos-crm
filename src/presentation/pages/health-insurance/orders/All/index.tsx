import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';

import OrderAllPage from 'presentation/pages/car-insurance/orders/All';

function OrdersAllPage() {
  return (
    <div data-testid="health-all-listing-page">
      <Helmet title="Health Insurance - All Orders Page" />
      <OrderAllPage />
    </div>
  );
}
export default OrdersAllPage;
