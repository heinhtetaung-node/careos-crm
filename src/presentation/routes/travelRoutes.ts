import withCircle from 'presentation/HOCs/WithCircle';
import { LeadAll } from 'presentation/components/icons';

import { IRoutes } from './route.interface';
import { getUserPermission } from './helper';
import DashboardLayout from '../layouts/Dashboard';

import OrdersAllPage from '../pages/travel-insurance/order/all';

export const travelOrdersRoutes: IRoutes = {
  id: 'Travel-Orders',
  path: '/travel',
  name: 'menu.order.root',
  icon: withCircle(LeadAll),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/travel'),
  children: [
    {
      id: 'All',
      path: '/travel/orders/all',
      name: 'menu.order.all',
      component: OrdersAllPage,
      sideBar: true,
      permission: getUserPermission('/travel/orders/all'),
    },
  ],
};
