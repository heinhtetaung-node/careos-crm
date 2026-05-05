import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

export enum PAGE {
  HOME = 'HOME',
  ORDERS_ALL = 'ORDERS_ALL',
  ORDERS_APPROVAL_ALL = 'ORDERS_APPROVAL_ALL',
  ORDERS_PRINTING_ALL = 'ORDERS_PRINTING_ALL',
  ORDERS_APPROVAL_DETAIL = 'ORDERS_APPROVAL_DETAIL',
  ORDERS_PRINTING_DETAIL = 'ORDERS_PRINTING_DETAIL',
}

const mapPageRoute = (page: string, params: any) => {
  if (page === PAGE.ORDERS_PRINTING_DETAIL) {
    return `/orders/${params.orderId}/policies/${params.policyId}/printing-and-shipping`;
  }

  return '/';
};

const leadDetailsPage = [
  '/leads/:id',
  '/leads/:id/create-payment',
  '/leads/:id/create-contract',
  '/leads/:id/custom-quote',
  '/leads/:id/packages',
  '/leads/:id/detail',
  '/leads/:id/detail/custom',
  '/leads/:id/compare',
];

const orderDetailsPage = [
  '/orders/:orderId',
  '/orders/:orderId/policies/:policyId/submission',
  '/orders/:orderId/policies/:policyId/approval',
  '/orders/:orderId/policies/:policyId/printing-and-shipping',
  '/orders/new/:orderId',
  '/orders/qc/:orderId',
];

const authPage = [
  '/auth/sign-in',
  '/auth/404',
  '/auth/500',
  '/permission/denied',
];

const carePayPage = [
  '/care-pay',
  '/care-pay/contracts',
  '/care-pay/transactions',
];

const travelPages = ['/travel', '/travel/orders', '/travel/orders/all'];

const healthLeadPages = [
  '/health/leads',
  '/health/leads/package-listing',
  '/health/leads/:id',
  '/health/leads/:id/create-payment',
  '/health/leads/:id/create-contract',
  '/health/leads/:id/custom-quote',
  '/health/leads/:id/packages',
  '/health/leads/:id/detail',
  '/health/leads/:id/compare',
  '/health/leads/import',
];
const healthCustomerPages = ['/health/customers', '/health/customers/:id'];
const healthTransactionPages = [
  '/health/transactions',
  '/health/transactions/:id',
];
const healthOrderPages = ['/health/orders', '/health/orders/:orderId'];
const healthMyOrderPages = [
  '/health/orders/my-orders',
  '/health/orders/my-orders/:id',
];

export const routesPermission: Record<string, string[]> = {
  [UserRoleID.Admin]: ['*'],
  [UserRoleID.SuperAdmin]: ['*'],
  [UserRoleID.Manager]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    '/leads/rejection',
    '/leads-settings/sources',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/documents',
    '/orders/qc',
    '/orders/submission',
    '/orders/approval',
    '/orders/shipment',
    '/orders/export-shipment',
    '/orders/mass-status-update',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/discounts',
    '/discounts/approval',
    '/discounts/voucher',
    '/commission-report',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthOrderPages,
    '/health/orders/qc/:orderId',
    ...healthTransactionPages,
    '/health/leads/rejection',
    '/cancellation',
    '/refunds/all',
    '/performance-statistic',
    '/health/performance-statistic',
  ],
  [UserRoleID.Supervisor]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    '/leads/rejection',
    '/leads-settings/sources',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/documents',
    '/orders/qc',
    '/orders/submission',
    '/orders/approval',
    '/orders/shipment',
    '/orders/export-shipment',
    '/orders/mass-status-update',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/discounts',
    '/discounts/approval',
    '/discounts/voucher',
    '/commission-report',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthOrderPages,
    '/health/orders/qc/:orderId',
    ...healthTransactionPages,
    '/health/leads/rejection',
    '/cancellation',
    '/refunds/all',
    '/performance-statistic',
    '/health/performance-statistic',
  ],
  [UserRoleID.SalesAgent]: [
    '/account/settings',
    '/leads/my-leads',
    ...leadDetailsPage,
    '/orders/my-orders',
    '/orders/my-orders/:orderId',
    '/orders/:orderId/policies/:policyId/approval',
    '/orders/qc/:orderId',
    ...authPage,
    '/customers/:id',
    '/commission-report',
    ...travelPages,
    ...healthLeadPages,
    ...healthMyOrderPages,
    '/health/orders/qc/:orderId',
  ],
  [UserRoleID.InboundAgent]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/approval',
    '/orders/shipment',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/customer-profile',
    '/customer-profile/all',
    '/commission-report',
    '/health/contracts',
    '/cancellation',
    '/cancellation/all',
    '/refunds/all',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthTransactionPages,
    ...healthOrderPages,
  ],
  [UserRoleID.CustomerService]: [
    '/',
    '/account/settings',
    ...authPage,
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
  ],
  [UserRoleID.DocumentsCollection]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/documents',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/commission-report',
    ...travelPages,
  ],
  [UserRoleID.QualityControl]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    '/leads/rejection',
    ...leadDetailsPage,
    '/orders',
    '/orders/qc',
    '/orders/submission',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/commission-report',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthTransactionPages,
    ...healthOrderPages,
    '/health/orders/qc/:orderId',
  ],
  [UserRoleID.CiSuperVisor]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/submission',
    '/orders/approval',
    '/cancellation',
    '/cancellation/all',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthTransactionPages,
    ...healthOrderPages,
    '/refunds/all',
  ],
  [UserRoleID.CiAgent]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/submission',
    '/orders/approval',
    '/cancellation',
    '/cancellation/all',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthTransactionPages,
    ...healthOrderPages,
    '/refunds/all',
  ],
  [UserRoleID.Submission]: [
    '/',
    '/account/settings',
    '/orders',
    '/orders/submission',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/commission-report',
    ...travelPages,
    ...healthLeadPages,
  ],
  [UserRoleID.ProblemCase]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/documents',
    '/orders/qc',
    '/orders/submission',
    '/orders/approval',
    '/orders/shipment',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/commission-report',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
  ],
  [UserRoleID.BackOffice]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/documents',
    '/orders/qc',
    '/orders/submission',
    '/orders/approval',
    '/orders/shipment',
    '/orders/export-shipment',
    '/orders/mass-status-update',
    ...orderDetailsPage,
    '/cancellation',
    '/cancellation/all',
    ...authPage,
    '/customers/:id',
    '/commission-report',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthCustomerPages,
    ...healthTransactionPages,
    ...healthOrderPages,
    '/health/orders/qc/:orderId',
    '/refunds/all',
  ],
  [UserRoleID.Shipment]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/shipment',
    '/orders/export-shipment',
    ...orderDetailsPage,
    ...authPage,
    '/customers/:id',
    '/commission-report',
    ...travelPages,
    ...healthLeadPages,
  ],
  [UserRoleID.Accounting]: [
    '/',
    '/account/settings',
    '/leads',
    '/leads/all',
    ...leadDetailsPage,
    '/orders',
    '/orders/all',
    '/orders/submission',
    ...orderDetailsPage,
    '/cancellation',
    '/cancellation/all',
    ...authPage,
    '/customers/:id',
    '/commission-report',
    '/health/contracts',
    ...carePayPage,
    ...travelPages,
    ...healthLeadPages,
    ...healthTransactionPages,
    ...healthOrderPages,
    '/accounting',
    '/accounting/all',
    '/accounting/mass-status',
    '/refunds/all',
  ],
};

const userRoutes = [
  '/admin/users',
  '/admin/teams',
  '/admin',
  '/health/teams',
  '/health/users',
  '/car/redbook-import',
];

export const getUserPermission = (path: string): string[] => {
  const permissions: string[] = [];
  Object.keys(routesPermission).forEach((role) => {
    if (
      routesPermission[role].includes(path) ||
      routesPermission[role].includes('*')
    ) {
      if (userRoutes.includes(path)) {
        if (role === UserRoleID.SuperAdmin) permissions.push(role);
      } else {
        permissions.push(role);
      }
    }
  });
  return permissions;
};

export default mapPageRoute;

export const shouldEnableChatwoot = (
  userRole: UserRoleID,
  path: string
): boolean => {
  if (
    [UserRoleID.Admin, UserRoleID.SuperAdmin, UserRoleID.InboundAgent].includes(
      userRole
    )
  ) {
    return true;
  }

  const hasAccessRole = [
    UserRoleID.Manager,
    UserRoleID.Supervisor,
    UserRoleID.SalesAgent,
    UserRoleID.BackOffice,
  ].includes(userRole);

  const hasAccessPath = [
    '/leads/:id',
    '/orders/:orderId',
    '/orders/my-orders/:orderId',
    '/health/leads/:id',
    '/health/orders/:orderId',
  ].includes(path);

  return hasAccessRole && hasAccessPath;
};
