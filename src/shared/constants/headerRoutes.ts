import { hideAgentAddLeadButton } from 'config/feature-flags';
import { healthRoutes } from 'presentation/routes/healthRoutes';
import { IHeaderRoutes } from 'presentation/routes/route.interface';

export const myOrderRoute = {
  id: 2,
  icon: '',
  path: '/orders/my-orders',
  text: 'text.myOrder',
};

export const comissionReportRoute = {
  id: 4,
  icon: '',
  path: '/commission-report',
  text: 'text.commissionReport',
};

const addLink: IHeaderRoutes = {
  id: 2,
  icon: null,
  path: '#',
  type: 'addLead',
  text: 'text.addLeadCapital',
};

const headerRoutes: IHeaderRoutes[] = [
  {
    id: 1,
    icon: '',
    path: '/leads/my-leads',
    text: 'text.myLead',
  },
  {
    id: 3,
    icon: '',
    path: '#',
    type: 'appointment',
    text: 'text.myAppointment',
  },
];

export const healthHeaderRoutes = (role: string): IHeaderRoutes[] =>
  healthRoutes?.children?.reduce((acc: IHeaderRoutes[], route: any) => {
    if (
      !route.showInHeader ||
      !route.permission?.includes(role) ||
      (route.id === 'myOrders' && role !== 'roles/sales')
    ) {
      return acc;
    }

    const updatedRoute = { ...route };
    if (role === 'roles/sales' && updatedRoute.id === 'leadsAll') {
      updatedRoute.name = 'menu.lead.myLead';
    }

    acc.push({ ...updatedRoute, text: updatedRoute.name });
    return acc;
  }, []) ?? [];

if (!hideAgentAddLeadButton) {
  headerRoutes.splice(1, 0, addLink);
}

export const emptyHeaderRoutes: IHeaderRoutes[] = [];

export const rightHeaderRoutes: IHeaderRoutes[] = [];

export default headerRoutes;
