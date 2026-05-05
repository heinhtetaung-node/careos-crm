import withCircle from 'presentation/HOCs/WithCircle';
import { IRoutes } from './route.interface';
import { getUserPermission } from './helper';
import {
  AdminUser,
  DocumentSearchIcon,
  LeadAll,
  PackageImportIcon,
} from 'presentation/components/icons';
import {
  CRM_ROUTES,
  getPackageComparisonlUrl,
  getPackageDetailUrl,
  getPackagesUrl,
} from './Urls';
import NewDetailPageLayout from 'presentation/layouts/NewDetailPageLayout';
import DashboardLayout from '../layouts/Dashboard';
import PageLayout from '../layouts/Page';
import LeadAllPage from 'presentation/pages/health-insurance/leads/LeadAllPage/AllLeadsPage';
import LeadImportPage from 'presentation/pages/health-insurance/leads/ImportLeadPage';
import LeadRejectPage from 'presentation/pages/health-insurance/leads/LeadRejectionPage';
import OrderMassStatusUpdate from '../pages/health-insurance/orders/ImportMassStatusChange';
import OrdersAllPage from '../pages/health-insurance/orders/All';
import OrdersMyOrderPage from '../pages/health-insurance/orders/MyOrder';
import OrdersDetailPage from '../pages/health-insurance/orders/Detail';
import OrderDocumentsPage from '../pages/health-insurance/orders/Documents';
import OrderSubmissionPage from '../pages/health-insurance/orders/Submission';
import OrderApprovalPage from '../pages/health-insurance/orders/Approval';
import PrintingAndShipping from '../pages/health-insurance/orders/PrintingAndShipping';
import ExportShipment from '../pages/health-insurance/orders/ExportShipment';
import PackageImportPage from '../pages/health-insurance/package/ImportPackagePage';
import DiscountImportPage from '../pages/health-insurance/Discounts/DiscountsImport';
import DiscountApprovalPage from '../pages/health-insurance/Discounts/DiscountApprovalPage';
import DiscountVoucherPage from '../pages/health-insurance/Discounts/Voucher';
import DiscountCampaignPage from '../pages/health-insurance/Discounts/CampaignPage';
import ContractListingPage from '../pages/health-insurance/CarePay/Contracts';
import TransactionListingPage from '../pages/health-insurance/CarePay/Transaction';
import PackageListingPage from '../pages/health-insurance/leads/PackageListingPage';
import CreatePaymentPage from '../pages/car-insurance/CreatePaymentPage';
import CreateContractPage from '../pages/car-insurance/CreateContractPage';
import CustomQuotePage from '../pages/car-insurance/LeadDetailsPage/CustomQuote';
import PackageDetailPage from 'presentation/pages/health-insurance/leads/PackageDetailPage';
import PackageComparisonPage from 'presentation/pages/car-insurance/PackageComparisonPage';
import LeadDetailPage from 'presentation/pages/health-insurance/leads/leadDetailsPage';
import QcDetailPage from 'presentation/pages/health-insurance/orders/QcDetailPage';
import PhoneBook from 'presentation/pages/car-insurance/InsurerPhoneBook';
import UserPageV2 from 'presentation/pages/admin/users/UserV2';
import AdminTeamPage from 'presentation/pages/admin/Team/newTeam';
import PerformanceStatisticPage from 'presentation/pages/admin/PerformanceStatistic';

export const healthRoutes: IRoutes = {
  id: 'Leads',
  path: '/health/leads',
  name: 'menu.lead.root',
  layout: PageLayout,
  permission: getUserPermission('/health/leads'),
  children: [
    {
      id: 'leadsAll',
      path: '/health/leads',
      name: 'menu.lead.root',
      component: LeadAllPage,
      permission: getUserPermission('/health/leads'),
      showInHeader: true,
      hiddenIcon: true,
    },
    {
      id: 'leadsDetails',
      path: '/health/leads/:id',
      name: 'Lead',
      component: LeadDetailPage,
      permission: getUserPermission('/health/leads/:id'),
    },
    {
      path: '/health/leads/:id/create-payment',
      name: 'Create Payment',
      component: CreatePaymentPage,
      permission: getUserPermission('/health/leads/:id/create-payment'),
    },
    {
      path: '/health/leads/:id/create-contract',
      name: 'Create Contract',
      component: CreateContractPage,
      permission: getUserPermission('/health/leads/:id/create-contract'),
    },
    {
      path: '/health/leads/:id/custom-quote',
      name: 'Custom Quote Page',
      component: CustomQuotePage,
      permission: getUserPermission('/health/leads/:id/custom-quote'),
    },
    {
      path: getPackagesUrl(undefined, true),
      name: 'Packages',
      component: PackageListingPage,
      permission: getUserPermission('/health/leads/:id/packages'),
    },
    {
      path: `${getPackageDetailUrl({ isHealth: true })}`,
      name: 'Package Detail',
      component: PackageDetailPage,
      permission: getUserPermission('/health/leads/:id/detail'),
    },
    {
      path: `${getPackageComparisonlUrl({ isHealth: true })}`,
      name: 'Package Comparison',
      component: PackageComparisonPage,
      permission: getUserPermission('/health/leads/:id/compare'),
    },
    {
      path: '/insurer-phonebook',
      name: 'Phone Book',
      component: PhoneBook,
      permission: getUserPermission('/insurer-phonebook'),
    },
    {
      id: 'importLead',
      path: '/health/leads/import',
      name: 'menu.autoAssignment.leadsImport',
      component: LeadImportPage,
      permission: getUserPermission('/health/leads/import'),
    },
    {
      id: 'rejectLead',
      path: '/health/leads/rejection',
      name: 'menu.lead.rejections',
      component: LeadRejectPage,
      permission: getUserPermission('/health/leads/rejection'),
    },
    {
      id: 'transactions',
      path: '/health/transactions',
      name: 'menu.transactions',
      component: TransactionListingPage,
      permission: getUserPermission('/health/transactions'),
      showInHeader: true,
      hiddenIcon: true,
    },
    {
      id: 'orders',
      path: '/health/orders',
      name: 'menu.orders',
      component: OrdersAllPage,
      permission: getUserPermission('/health/orders'),
      showInHeader: true,
      hiddenIcon: true,
    },
    {
      id: 'myOrders',
      path: '/health/orders/my-orders',
      name: 'menu.order.myOrders',
      component: OrdersMyOrderPage,
      permission: getUserPermission('/health/orders/my-orders'),
      showInHeader: true,
      hiddenIcon: true,
    },
    {
      id: 'ordersDetail',
      path: '/health/orders/:orderId',
      name: 'menu.orderDetail',
      component: OrdersDetailPage,
      permission: getUserPermission('/health/orders/:orderId'),
      showInHeader: false,
      hiddenIcon: true,
    },
    {
      id: 'myOrderDetail',
      path: '/health/orders/my-orders/:orderId',
      name: 'My Order',
      component: OrdersDetailPage,
      permission: getUserPermission('/health/orders/my-orders/:id'),
    },
    {
      path: '/health/leads/package-listing',
      name: 'menu.lead.packageListing',
      component: PackageListingPage,
      sideBar: false,
      permission: getUserPermission('/health/leads/package-listing'),
    },
    {
      id: 'users',
      path: '/health/users',
      name: 'menu.userManagement.users',
      component: UserPageV2,
      sideBar: true,
      permission: getUserPermission('/health/users'),
    },
    {
      id: 'teams',
      path: '/health/teams',
      name: 'menu.userManagement.teams',
      component: AdminTeamPage,
      sideBar: true,
      permission: getUserPermission('/health/teams'),
    },
    {
      id: 'campaign-discount',
      path: '/health/discounts/campaign',
      name: 'text.campaign',
      component: DiscountCampaignPage,
      showInHeader: true,
      hiddenIcon: true,
      permission: getUserPermission('/health/discounts/campaign'),
    },
    {
      id: 'contract-listing',
      path: '/health/contracts',
      name: 'menu.carePay.contractManagement',
      component: ContractListingPage,
      showInHeader: true,
      hiddenIcon: true,
      permission: getUserPermission('/health/contracts'),
    },
    {
      id: 'performance-statistic',
      path: '/health/performance-statistic',
      name: 'menu.performanceStatistic.root',
      component: PerformanceStatisticPage,
      showInHeader: true,
      hiddenIcon: true,
      layout: DashboardLayout,
      permission: getUserPermission('/health/performance-statistic'),
    },
  ],
};

export const healthOrdersRoutes: IRoutes = {
  id: 'Orders',
  path: '/health/orders',
  name: 'menu.order.root',
  icon: withCircle(LeadAll),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/orders'),
  children: [
    {
      id: 'ordersAll',
      path: '/health/orders/all',
      name: 'menu.order.all',
      component: OrdersAllPage,
      sideBar: true,
      permission: getUserPermission('/orders/all'),
    },
    {
      id: 'myOrders',
      path: '/health/orders/my-orders',
      name: 'menu.order.myOrders',
      component: OrdersMyOrderPage,
      sideBar: true,
      permission: getUserPermission('/orders/my-orders'),
    },
    {
      id: 'ordersDocuments',
      path: '/health/orders/documents',
      name: 'menu.order.documents',
      component: OrderDocumentsPage,
      sideBar: true,
      permission: getUserPermission('/orders/documents'),
    },
    {
      id: 'ordersSubmission',
      path: '/health/orders/submission',
      name: 'menu.order.submission',
      component: OrderSubmissionPage,
      sideBar: true,
      permission: getUserPermission('/orders/submission'),
    },
    {
      id: 'ordersApproval',
      path: '/health/orders/approval',
      name: 'menu.order.approval',
      component: OrderApprovalPage,
      sideBar: true,
      permission: getUserPermission('/orders/approval'),
    },
    {
      id: 'ordersPrintingAndShipping',
      path: '/health/orders/shipment',
      name: 'menu.order.printingShipping',
      component: PrintingAndShipping,
      sideBar: true,
      permission: getUserPermission('/orders/shipment'),
    },
    {
      id: 'ordersExportShipment',
      path: '/health/orders/export-shipment',
      name: 'text.exportShipmentMenu',
      component: ExportShipment,
      sideBar: true,
      permission: getUserPermission('/orders/export-shipment'),
    },
    {
      id: 'ordersMassStatusUpdate',
      path: '/health/orders/mass-status-update',
      name: 'order.massAssign.massStatusChange',
      component: OrderMassStatusUpdate,
      sideBar: true,
      permission: getUserPermission('/orders/mass-status-update'),
    },
  ],
};

export const healthPackageRoutes: IRoutes = {
  id: 'Package',
  path: '/health/package',
  name: 'menu.package.root',
  icon: withCircle(PackageImportIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/package'),
  children: [
    {
      id: 'packageImport',
      path: '/health/package/import',
      name: 'menu.package.import',
      component: PackageImportPage,
      sideBar: true,
      permission: getUserPermission('/package/import'),
    },
  ],
};

export const healthDiscountRoutes: IRoutes = {
  id: 'Discounts',
  path: '/health/discounts',
  name: 'menu.discounts.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/discounts'),
  children: [
    {
      id: 'discountsApproval',
      path: '/health/discounts/approval',
      name: 'menu.discounts.approval',
      component: DiscountApprovalPage,
      sideBar: true,
      permission: getUserPermission('/discounts/approval'),
    },
    {
      id: 'discountsImport',
      path: '/health/discounts/import',
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
      path: '/health/discounts/campaign',
      name: 'text.campaign',
      component: DiscountCampaignPage,
      sideBar: true,
      permission: getUserPermission('/discounts/campaign'),
    },
  ],
};

export const healthCarePayRoutes: IRoutes = {
  id: 'CarePayListing',
  path: '/health/care-pay',
  name: 'menu.carePay.root',
  icon: withCircle(DocumentSearchIcon),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/care-pay'),
  children: [
    {
      id: 'TransactionListing',
      path: '/health/care-pay/transactions',
      name: 'menu.carePay.transactionListing',
      component: TransactionListingPage,
      sideBar: true,
      permission: getUserPermission('/care-pay/transactions'),
    },
  ],
};

export const healthQCRoutes: IRoutes = {
  id: 'healthQcDetail',
  path: '/',
  name: '',
  layout: NewDetailPageLayout,
  permission: getUserPermission('/'),
  children: [
    {
      path: '/health/orders/qc/:orderId',
      name: 'QC',
      component: QcDetailPage,
      permission: getUserPermission('/health/orders/qc/:orderId'),
    },
  ],
};

export const healthPerformanceStatisticRoutes: IRoutes = {
  id: 'PerformanceStatistic',
  path: '/health/performance-statistic',
  name: 'menu.performanceStatistic.root',
  icon: withCircle(AdminUser),
  layout: DashboardLayout,
  sideBar: true,
  permission: getUserPermission('/health/performance-statistic'),
  children: [
    {
      id: 'performanceStatistic',
      path: '/health/performance-statistic',
      name: 'menu.performanceStatistic.root',
      component: PerformanceStatisticPage,
      sideBar: true,
      permission: getUserPermission('/health/performance-statistic'),
    },
  ],
};
