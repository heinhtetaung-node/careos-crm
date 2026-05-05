import React from 'react';
import { Monitor, Users } from 'react-feather';

import {
  AdminUser,
  LeadAll,
  PackageImportIcon,
  DocumentSearchIcon,
} from 'presentation/components/icons';
import withCircle from 'presentation/HOCs/WithCircle';
import ImportCuratedCar from 'presentation/pages/car-insurance/CarManagement/ImportCuratedCar';
import CustomerMergeDetailPage from 'presentation/pages/car-insurance/CustomerMerge/CustomerMergeDetailPage';
import PackageComparisonPage from 'presentation/pages/car-insurance/PackageComparisonPage';
import PackageDetailPage from 'presentation/pages/car-insurance/PackageDetailPage';
import CustomPackageDetailPage from 'presentation/pages/car-insurance/PackageDetailPage/CustomPackageDetailPage';
import RefundsPage from '../pages/car-insurance/OrderCancellation/RefundsPage';
import LeadRejectionPage from '../pages/car-insurance/leads/LeadRejectionPage';
import LeadAllPage from '../pages/car-insurance/leads/LeadAllPage';
import LeadAssignmentPage from '../pages/car-insurance/leads/LeadAssignmentPage';
import SignIn from '../pages/admin/auth/SignIn';
import Page404 from '../pages/admin/auth/Page404';
import Page500 from '../pages/admin/auth/Page500';
import Home from '../pages/Home';
import LeadSourcePage from '../pages/car-insurance/leads/LeadSourcePage/LeadSourcePageV2';
import LeadDetailsPage from '../pages/car-insurance/LeadDetailsPage';
import OrderDetailsPage from '../pages/car-insurance/OrderDetailPage';
import CreatePaymentPage from '../pages/car-insurance/CreatePaymentPage';
import CreateContractPage from '../pages/car-insurance/CreateContractPage';
import CustomQuotePage from '../pages/car-insurance/LeadDetailsPage/CustomQuote';
import PackageListingPage from '../pages/car-insurance/PackageListingPageNew';
import PhoneBook from '../pages/car-insurance/InsurerPhoneBook';
import CustomerDetailsPage from '../pages/car-insurance/CustomerDetailsPage';
import OrdersAllPage from '../pages/car-insurance/orders/All';
import OrderDocumentsPage from '../pages/car-insurance/orders/Documents';
import QCModulePage from '../pages/car-insurance/orders/QCModule';
import OrderSubmissionPage from '../pages/car-insurance/orders/Submission';
import OrderApprovalPage from '../pages/car-insurance/orders/Approval';
import PrintingAndShipping from '../pages/car-insurance/orders/PrintingAndShipping';
import ExportShipment from '../pages/car-insurance/orders/ExportShipment';
import MyOrderPage from '../pages/car-insurance/orders/MyOrders';
import MyLeadPage from '../pages/car-insurance/myLeads';
import SubmissionOrderPage from '../pages/car-insurance/OrderDetailPage/SubmissionOrderDetailPage';
import ApprovalOrderPage from '../pages/car-insurance/OrderDetailPage/ApprovalOrderDetailPage';
import PrintingAndShippingOrderPage from '../pages/car-insurance/OrderDetailPage/PrintingAndShippingOrderDetailPage';
import NewOrderPage from '../pages/car-insurance/OrderDetailPage/NewOrderDetailPage';
import QcDetailPage from '../pages/car-insurance/OrderDetailPage/QcDetailPage';
import MyOrderDetailPage from '../pages/car-insurance/OrderDetailPage/MyOrderDetailPage';
import OrderMassStatusUpdate from '../pages/car-insurance/orders/ImportMassStatusChange';
import OrderConfigsPage from '../pages/car-insurance/OrderDetailPage/ConfigsPage';
import ImportLeadPage from '../pages/car-insurance/leads/ImportLeadPage';
import UserPageV2 from '../pages/admin/users/UserV2';
import AutoAssignConfigPage from '../pages/admin/AutoAssign/Configs';
import AutoAssignImportPage from '../pages/admin/AutoAssign/Import';
import MassLeadImport from '../pages/admin/AutoAssign/MassLeadImport';
import AdminTeamPage from '../pages/admin/Team/newTeam';
import PerformanceStatisticPage from '../pages/admin/PerformanceStatistic';
import PackageImportPage from '../pages/car-insurance/package/ImportPackagePage';
import ImportCarBrand from '../pages/car-insurance/CarManagement/ImportCarBrand';
import ImportCarModel from '../pages/car-insurance/CarManagement/ImportCarModel';
import ImportRedbook from '../pages/car-insurance/CarManagement/ImportRedbook';
import CustomerProfileImportPage from '../pages/car-insurance/CustomerProfile/ImportCustomerProfile';
import AllCustomerPage from '../pages/car-insurance/CustomerProfile/All';
import PermissionDeniedPage from '../pages/permissionDenied';
import AccountSettingsPage from '../pages/Account/Settings';
import DiscountImportPage from '../pages/car-insurance/Discounts/DiscountsImport';
import DiscountApprovalPage from '../pages/car-insurance/Discounts/DiscountApprovalPage';
import DiscountVoucherPage from '../pages/car-insurance/Discounts/Voucher';
import DiscountCampaignPage from '../pages/car-insurance/Discounts/CampaignPage';
import CommissionReprtPage from '../pages/car-insurance/CommissionReportPage';
import CustomerMergePage from '../pages/car-insurance/CustomerMerge/CustomerMergeListingPage';
import CancellationAllPage from '../pages/car-insurance/OrderCancellation/All/index';
import ContractListingPage from '../pages/car-insurance/CarePay/Contracts';
import TransactionListingPage from '../pages/car-insurance/CarePay/Transaction';
import AccountingAllPage from '../pages/car-insurance/Accounting/All';
import MassStatusPage from '../pages/car-insurance/Accounting/MassStatus';

import { getUserPermission } from './helper';
import { IRoutes } from './route.interface';
import {
  CRM_ROUTES,
  getPackageDetailUrl,
  getCustomPackageDetailUrl,
  getPackagesUrl,
  getPackageComparisonlUrl,
  getBrandImportUrl,
  getModelImportUrl,
  getRedbookImportUrl,
} from './Urls';

import AuthLayout from '../layouts/Auth';
import DashboardLayout from '../layouts/Dashboard';
import NewDetailPageLayout from '../layouts/NewDetailPageLayout';
import PageLayout from '../layouts/Page';
import {
  healthCarePayRoutes,
  healthDiscountRoutes,
  healthRoutes,
  healthOrdersRoutes,
  healthPackageRoutes,
  healthPerformanceStatisticRoutes,
} from './healthRoutes';
import { travelOrdersRoutes } from './travelRoutes';

const presentationRoutes: IRoutes = {
  id: 'Home',
  path: '/',
  icon: <Monitor />,
  component: Home,
  children: null,
  layout: DashboardLayout,
  permission: getUserPermission('/'),
};

const accountRoutes: IRoutes = {
  id: 'Settings',
  path: '/account/settings',
  icon: <Monitor />,
  component: AccountSettingsPage,
  children: null,
  layout: AuthLayout,
  permission: getUserPermission('/account/settings'),
};

const leadsRoutes: IRoutes = {
  id: 'Leads',
  path: '/leads',
  name: 'menu.lead.root',
  icon: withCircle(LeadAll),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/leads'),
  children: [
    {
      id: 'leadsAssignment',
      path: '/leads/assignment',
      name: 'menu.lead.assignment',
      component: LeadAssignmentPage,
      sideBar: true,
      permission: getUserPermission('/leads/assignment'),
    },
    {
      id: 'leadsRejections',
      path: '/leads/rejection',
      name: 'menu.lead.rejections',
      component: LeadRejectionPage,
      sideBar: true,
      permission: getUserPermission('/leads/rejection'),
    },
    {
      id: 'leadsAll',
      path: '/leads/all',
      name: 'menu.lead.all',
      component: LeadAllPage,
      sideBar: true,
      permission: getUserPermission('/leads/all'),
    },
    {
      id: 'leadsImport',
      path: '/leads/import',
      name: 'menu.lead.import',
      component: ImportLeadPage,
      sideBar: true,
      permission: getUserPermission('/leads/import'),
    },
    {
      id: 'leadsSources',
      path: '/leads-settings/sources',
      name: 'menu.lead.sources',
      component: LeadSourcePage,
      sideBar: true,
      permission: getUserPermission('/leads-settings/sources'),
    },
  ],
};

const customerRoutes: IRoutes = {
  id: 'Customer',
  path: '/customers',
  name: 'Customer',
  layout: PageLayout,
  permission: getUserPermission('/customers'),
  children: [
    {
      path: '/customers/:id',
      name: 'Customer',
      component: CustomerDetailsPage,
      permission: getUserPermission('/customers/:id'),
    },
    {
      path: '/customers-merge/customers',
      name: 'Customer Merge',
      component: CustomerMergeDetailPage,
      permission: getUserPermission('/customers-merge/customers'),
    },
  ],
};

const leadRoutes: IRoutes = {
  id: 'Lead',
  path: '/leads',
  name: 'Lead',
  layout: PageLayout,
  permission: getUserPermission('/leads'),
  children: [
    {
      path: '/leads/my-leads',
      name: 'My Leads',
      component: MyLeadPage,
      permission: getUserPermission('/leads/my-leads'),
    },
    {
      path: '/leads/:id',
      name: 'Lead',
      component: LeadDetailsPage,
      permission: getUserPermission('/leads/:id'),
    },
    {
      path: '/leads/:id/create-payment',
      name: 'Create Payment',
      component: CreatePaymentPage,
      permission: getUserPermission('/leads/:id/create-payment'),
    },
    {
      path: '/leads/:id/create-contract',
      name: 'Create Contract',
      component: CreateContractPage,
      permission: getUserPermission('/leads/:id/create-contract'),
    },
    {
      path: '/leads/:id/custom-quote',
      name: 'Custom Quote Page',
      component: CustomQuotePage,
      permission: getUserPermission('/leads/:id/custom-quote'),
    },
    {
      path: getPackagesUrl(),
      name: 'Packages',
      component: PackageListingPage,
      permission: getUserPermission('/leads/:id/packages'),
    },
    {
      path: getCustomPackageDetailUrl(),
      name: 'Custom Package Detail',
      component: CustomPackageDetailPage,
      permission: getUserPermission('/leads/:id/detail/custom'),
    },
    {
      path: getPackageDetailUrl(),
      name: 'Package Detail',
      component: PackageDetailPage,
      permission: getUserPermission('/leads/:id/detail'),
    },
    {
      path: getPackageComparisonlUrl(),
      name: 'Package Comparison',
      component: PackageComparisonPage,
      permission: getUserPermission('/leads/:id/compare'),
    },
    {
      path: '/insurer-phonebook',
      name: 'Phone Book',
      component: PhoneBook,
      permission: getUserPermission('/leads/:id/detail'),
    },
  ],
};

const discountRoutes: IRoutes = {
  id: 'Discounts',
  path: '/discounts',
  name: 'menu.discounts.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/discounts'),
  children: [
    {
      id: 'discountsApproval',
      path: '/discounts/approval',
      name: 'menu.discounts.approval',
      component: DiscountApprovalPage,
      sideBar: true,
      permission: getUserPermission('/discounts/approval'),
    },
    {
      id: 'discountsImport',
      path: '/discounts/import',
      name: 'menu.discounts.importDiscount',
      component: DiscountImportPage,
      sideBar: true,
      permission: getUserPermission('/discounts/import'),
    },
    {
      id: 'discountsVoucher',
      path: CRM_ROUTES.DISCOUNT_VOUCHER,
      name: 'menu.discounts.voucher',
      component: DiscountVoucherPage,
      sideBar: true,
      permission: getUserPermission(CRM_ROUTES.DISCOUNT_VOUCHER),
    },
    {
      id: 'discountsCampaign',
      path: '/discounts/campaign',
      name: 'text.campaign',
      component: DiscountCampaignPage,
      sideBar: true,
      permission: getUserPermission('/discounts/campaign'),
    },
  ],
};

const ordersRoutes: IRoutes = {
  id: 'Orders',
  path: '/orders',
  name: 'menu.order.root',
  icon: withCircle(LeadAll),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/orders'),
  children: [
    {
      id: 'ordersAll',
      path: '/orders/all',
      name: 'menu.order.all',
      component: OrdersAllPage,
      sideBar: true,
      permission: getUserPermission('/orders/all'),
    },
    {
      id: 'ordersDocuments',
      path: '/orders/documents',
      name: 'menu.order.documents',
      component: OrderDocumentsPage,
      sideBar: true,
      permission: getUserPermission('/orders/documents'),
    },
    {
      id: 'ordersQC',
      path: '/orders/qc',
      name: 'menu.order.QC',
      component: QCModulePage,
      sideBar: true,
      permission: getUserPermission('/orders/qc'),
    },
    {
      id: 'ordersSubmission',
      path: '/orders/submission',
      name: 'menu.order.submission',
      component: OrderSubmissionPage,
      sideBar: true,
      permission: getUserPermission('/orders/submission'),
    },
    {
      id: 'ordersApproval',
      path: '/orders/approval',
      name: 'menu.order.approval',
      component: OrderApprovalPage,
      sideBar: true,
      permission: getUserPermission('/orders/approval'),
    },
    {
      id: 'ordersPrintingAndShipping',
      path: '/orders/shipment',
      name: 'menu.order.printingShipping',
      component: PrintingAndShipping,
      sideBar: true,
      permission: getUserPermission('/orders/shipment'),
    },
    {
      id: 'ordersExportShipment',
      path: '/orders/export-shipment',
      name: 'text.exportShipmentMenu',
      component: ExportShipment,
      sideBar: true,
      permission: getUserPermission('/orders/export-shipment'),
    },
    {
      id: 'ordersMassStatusUpdate',
      path: '/orders/mass-status-update',
      name: 'order.massAssign.massStatusChange',
      component: OrderMassStatusUpdate,
      sideBar: true,
      permission: getUserPermission('/orders/mass-status-update'),
    },
  ],
};

const adminRoutes: IRoutes = {
  id: 'Admin',
  path: '/admin',
  name: 'menu.userManagement.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/admin'),
  children: [
    {
      id: 'users',
      path: '/admin/users',
      name: 'menu.userManagement.users',
      component: UserPageV2,
      sideBar: true,
      permission: getUserPermission('/admin/users'),
    },
    {
      id: 'teams',
      path: '/admin/teams',
      name: 'menu.userManagement.teams',
      component: AdminTeamPage,
      sideBar: true,
      permission: getUserPermission('/admin/teams'),
    },
  ],
};

const performanceStatisticRoutes: IRoutes = {
  id: 'PerformanceStatistic',
  path: '/performance-statistic',
  name: 'menu.performanceStatistic.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/performance-statistic'),
  children: [
    {
      id: 'performanceStatistic',
      path: '/performance-statistic',
      name: 'menu.performanceStatistic.root',
      component: PerformanceStatisticPage,
      sideBar: true,
      permission: getUserPermission('/performance-statistic'),
    },
  ],
};

const autoAssignRoutes: IRoutes = {
  id: 'AutoAssign',
  path: '/auto-assign',
  name: 'menu.autoAssignment.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/auto-assign'),
  children: [
    {
      id: 'leadConfigs',
      path: '/auto-assign/configs',
      name: 'menu.autoAssignment.leadsConfig',
      component: AutoAssignConfigPage,
      sideBar: true,
      permission: getUserPermission('/auto-assign/configs'),
    },
    {
      id: 'autoAssignImport',
      path: '/auto-assign/import',
      name: 'menu.autoAssignment.leadsImport',
      component: AutoAssignImportPage,
      sideBar: true,
      permission: getUserPermission('/auto-assign/import'),
    },
    {
      id: 'autoAssignMassLeadImport',
      path: '/auto-assign/mass-lead-import',
      name: 'menu.autoAssignment.leadsMassAssign',
      component: MassLeadImport,
      sideBar: true,
      permission: getUserPermission('/auto-assign/mass-lead-import'),
    },
    {
      id: 'orderConfigs',
      path: '/auto-assign/order-configs',
      name: 'menu.autoAssignment.orderConfig',
      component: OrderConfigsPage,
      sideBar: true,
      permission: getUserPermission('/auto-assign/order-configs'),
    },
  ],
};

const packageRoutes: IRoutes = {
  id: 'Package',
  path: '/package',
  name: 'menu.package.root',
  icon: withCircle(PackageImportIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/package'),
  children: [
    {
      id: 'packageImport',
      path: '/package/import',
      name: 'menu.package.import',
      component: PackageImportPage,
      sideBar: true,
      permission: getUserPermission('/package/import'),
    },
  ],
};

const authRoutes: IRoutes = {
  id: 'Auth',
  path: '/auth',
  icon: <Users />,
  name: 'Auth',
  layout: AuthLayout,
  permission: getUserPermission('/auth'),
  children: [
    {
      path: '/auth/sign-in',
      name: 'Sign In',
      component: SignIn,
      permission: getUserPermission('/auth/sign-in'),
    },
    {
      path: '/auth/404',
      name: '404 Page',
      component: Page404,
      permission: getUserPermission('/auth/404'),
    },
    {
      path: '/auth/500',
      name: '500 Page',
      component: Page500,
      permission: getUserPermission('/auth/500'),
    },
  ],
};

const orderRoutes: IRoutes = {
  id: 'Order',
  path: '/orders',
  name: 'Order',
  layout: PageLayout,
  permission: getUserPermission('/orders'),
  children: [
    {
      path: '/orders/my-orders',
      name: 'My Orders',
      component: MyOrderPage,
      permission: getUserPermission('/orders/my-orders'),
    },
    {
      path: '/orders/my-orders/:orderId',
      name: 'My Order',
      component: MyOrderDetailPage,
      permission: getUserPermission('/orders/my-orders/:orderId'),
    },
    {
      path: '/orders/:orderId',
      name: 'Order',
      component: OrderDetailsPage,
      permission: getUserPermission('/orders/:orderId'),
    },
    {
      path: '/orders/:orderId/policies/:policyId/submission',
      name: 'Submission Order',
      component: SubmissionOrderPage,
      permission: getUserPermission(
        '/orders/:orderId/policies/:policyId/submission'
      ),
    },
    {
      path: '/orders/:orderId/policies/:policyId/approval',
      name: 'Approval Order',
      component: ApprovalOrderPage,
      permission: getUserPermission(
        '/orders/:orderId/policies/:policyId/approval'
      ),
    },
    {
      path: '/orders/:orderId/policies/:policyId/printing-and-shipping',
      name: 'Printing And Shipping Order',
      component: PrintingAndShippingOrderPage,
      permission: getUserPermission(
        '/orders/:orderId/policies/:policyId/printing-and-shipping'
      ),
    },
  ],
};

const customerProfileRoutes: IRoutes = {
  id: 'CustomerProfile',
  path: '/customer-profile',
  name: 'menu.customerProfile.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/customer-profile'),
  children: [
    {
      id: 'customerProfileAll',
      path: '/customer-profile/all',
      name: 'autoAssignOption.all',
      component: AllCustomerPage,
      sideBar: true,
      permission: getUserPermission('/customer-profile/all'),
    },
    {
      id: 'customerProfileImport',
      path: '/customer-profile/import',
      name: 'menu.customerProfile.import',
      component: CustomerProfileImportPage,
      sideBar: true,
      permission: getUserPermission('/customer-profile/import'),
    },
    {
      id: 'CustomerMergeAll',
      path: '/customers-merge/all',
      name: 'menu.customerMerge.all',
      component: CustomerMergePage,
      sideBar: true,
      permission: getUserPermission('/customers-merge/all'),
    },
  ],
};

const cancellationRoutes: IRoutes = {
  id: 'Cancellation',
  path: '/cancellation',
  name: 'menu.cancellation.root',
  icon: withCircle(DocumentSearchIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/cancellation'),
  children: [
    {
      id: 'cancellationAll',
      path: '/cancellation/all',
      name: 'menu.cancellation.all',
      component: CancellationAllPage,
      sideBar: true,
      permission: getUserPermission('/cancellation/all'),
    },
    {
      id: 'refunds',
      path: '/refunds/all',
      name: 'menu.refunds.root',
      component: RefundsPage,
      sideBar: true,
      permission: getUserPermission('/refunds/all'),
    },
  ],
};

const accountingRoutes: IRoutes = {
  id: 'Accounting',
  path: '/accounting',
  name: 'menu.accounting.root',
  icon: withCircle(DocumentSearchIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/accounting'),
  children: [
    {
      id: 'AllAccounting',
      path: '/accounting/all',
      name: 'menu.accounting.all',
      component: AccountingAllPage,
      sideBar: true,
      permission: getUserPermission('/accounting/all'),
    },
    {
      id: 'Mass-status-change',
      path: '/accounting/mass-status',
      name: 'menu.accounting.mass-status-change',
      component: MassStatusPage,
      sideBar: true,
      permission: getUserPermission('/accounting/mass-status'),
    },
  ],
};

const permissionDeniedRoutes: IRoutes = {
  id: 'PermissionDenied',
  path: '/permission',
  name: 'Permission Denied',
  layout: PageLayout,
  permission: getUserPermission('/permission'),
  children: [
    {
      path: '/permission/denied',
      name: 'Permission Denied',
      component: PermissionDeniedPage,
      permission: getUserPermission('/permission/denied'),
    },
  ],
};

const newUIOrderRoutes: IRoutes = {
  id: 'New',
  path: '/new',
  name: 'New Order Page',
  layout: NewDetailPageLayout,
  permission: getUserPermission('/new'),
  children: [
    {
      path: '/orders/new/:orderId',
      name: 'Order',
      component: NewOrderPage,
      permission: getUserPermission('/orders/new/:orderId'),
    },
    {
      path: '/orders/qc/:orderId',
      name: 'QC',
      component: QcDetailPage,
      permission: getUserPermission('/orders/qc/:orderId'),
    },
  ],
};

const curatedCarRoutes: IRoutes = {
  id: 'CuratedCar',
  path: '/curated-car',
  name: 'menu.curatedCar.root',
  icon: withCircle(PackageImportIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/curated-car'),
  children: [
    {
      id: 'carBrandImport',
      path: getBrandImportUrl(),
      name: 'menu.curatedCar.brandImport',
      component: ImportCarBrand,
      sideBar: true,
      permission: getUserPermission('/car/brand-import'),
    },
    {
      id: 'carModelImport',
      path: getModelImportUrl(),
      name: 'menu.curatedCar.modelImport',
      component: ImportCarModel,
      sideBar: true,
      permission: getUserPermission('/car/model-import'),
    },
    {
      id: 'carImport',
      path: '/curated-car/import',
      name: 'menu.curatedCar.importSubmodel',
      component: ImportCuratedCar,
      sideBar: true,
      permission: getUserPermission('/curated-car/import'),
    },
    {
      id: 'carRedbookImport',
      path: getRedbookImportUrl(),
      name: 'menu.curatedCar.redbookImport',
      component: ImportRedbook,
      sideBar: true,
      permission: getUserPermission(getRedbookImportUrl()),
    },
  ],
};
const carePayRoutes: IRoutes = {
  id: 'CarePayListing',
  path: '/care-pay',
  name: 'menu.carePay.root',
  icon: withCircle(DocumentSearchIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/care-pay'),
  children: [
    {
      id: 'TransactionListing',
      path: '/care-pay/transactions',
      name: 'menu.carePay.transactionListing',
      component: TransactionListingPage,
      sideBar: true,
      permission: getUserPermission('/care-pay/transactions'),
    },
    {
      id: 'ContractListing',
      path: '/care-pay/contracts',
      name: 'menu.carePay.contractManagement',
      component: ContractListingPage,
      sideBar: true,
      permission: getUserPermission('/care-pay/contracts'),
    },
  ],
};

const commissionReportRoute: IRoutes = {
  id: 'CommissionReport',
  path: '/commission-report',
  layout: PageLayout,
  component: CommissionReprtPage,
  permission: getUserPermission('/commission-report'),
};

export const account = [accountRoutes];
export const dashboard = [
  leadsRoutes,
  ordersRoutes,
  adminRoutes,
  autoAssignRoutes,
  packageRoutes,
  presentationRoutes,
  customerProfileRoutes,
  orderRoutes,
  newUIOrderRoutes,
  commissionReportRoute,
  carePayRoutes,
  accountingRoutes,
];

export const healthSidebar = [
  healthRoutes,
  healthOrdersRoutes,
  healthPackageRoutes,
  adminRoutes,
  healthPerformanceStatisticRoutes,
  healthDiscountRoutes,
  healthCarePayRoutes,
];

export const travelSidebar = [travelOrdersRoutes];

export const sidebar = [
  leadsRoutes,
  ordersRoutes,
  adminRoutes,
  autoAssignRoutes,
  packageRoutes,
  curatedCarRoutes,
  customerProfileRoutes,
  discountRoutes,
  carePayRoutes,
  cancellationRoutes,
  accountingRoutes,
  performanceStatisticRoutes,
];

export const lead = [leadRoutes];
export const customer = [customerRoutes];
export const auth = [authRoutes];
export const permissionDenied = [permissionDeniedRoutes];
export const packages = [packageRoutes];
export const customerProfile = [customerProfileRoutes];
export const order = [orderRoutes];
export const newUI = [newUIOrderRoutes];
export const curatedCar = [curatedCarRoutes];
export const discount = [discountRoutes];
export const commission = [commissionReportRoute];
export const carePay = [carePayRoutes];
export const cancellation = [cancellationRoutes];
export const accounting = [accountingRoutes];
export const performanceStatistic = [performanceStatisticRoutes];

export const flattenRoutes = (
  routes: IRoutes[],
  collection: IRoutes[],
  hasPathLanguage = false
) => {
  const localesString = '/:locale(th|en)?';
  routes.forEach((route: IRoutes) => {
    if (!route.component && !route.children?.length) {
      return;
    }
    const { children, ...parent } = route;
    if (parent.component) {
      collection.push(parent);
    } else if (children?.length) {
      const childWithLayout = children.map((item: IRoutes) => ({
        ...item,
        path: hasPathLanguage ? `${localesString}${item.path}` : item.path,
        layout: item.layout || parent.layout,
      }));
      flattenRoutes(childWithLayout, collection);
    }
  });
  return collection;
};

export default [
  accountRoutes,
  authRoutes,
  leadsRoutes,
  adminRoutes,
  performanceStatisticRoutes,
  autoAssignRoutes,
  packageRoutes,
  permissionDeniedRoutes,
  packageRoutes,
  customerProfileRoutes,
  orderRoutes,
  newUIOrderRoutes,
  curatedCarRoutes,
  commissionReportRoute,
  cancellationRoutes,
  accountingRoutes,
];
