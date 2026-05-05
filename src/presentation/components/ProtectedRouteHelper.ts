import { PRODUCT_TYPE, PRODUCTS } from 'config/TypeFilter';
import { User } from 'shared/types/user';

export enum UserRoleID {
  SuperAdmin = 'roles/super-admin',
  Admin = 'roles/admin',
  Manager = 'roles/manager',
  Supervisor = 'roles/supervisor',
  SalesAgent = 'roles/sales',
  InboundAgent = 'roles/inbound',
  CustomerService = 'roles/customer-service',
  DocumentsCollection = 'roles/documents-collection',
  QualityControl = 'roles/quality-control',
  Submission = 'roles/submission',
  ProblemCase = 'roles/problem-case',
  BackOffice = 'roles/backoffice-supervisor',
  Shipment = 'roles/shipment-agent',
  Accounting = 'roles/accounting',
  CiAgent = 'roles/cash-installment-agent',
  CiSuperVisor = 'roles/cash-installment-supervisor',
}

export const RolesWithoutProduct = [
  UserRoleID.Admin,
  UserRoleID.SuperAdmin,
  UserRoleID.Accounting,
  UserRoleID.InboundAgent,
  UserRoleID.CiAgent,
  UserRoleID.CiSuperVisor,
  UserRoleID.QualityControl,
];

export const MY_LEADS_URL = '/leads/my-leads';
export const HEALTH_LEAD_URL = '/health/leads';
export const PERMISSION_DENIED_URL = '/permission/denied';

export const getEligibleProducts = (user: User): string[] => {
  const userRole = user?.role as UserRoleID;

  switch (userRole) {
    case UserRoleID.SuperAdmin:
    case UserRoleID.Admin:
    case UserRoleID.Accounting:
    case UserRoleID.InboundAgent:
    case UserRoleID.CiAgent:
    case UserRoleID.CiSuperVisor:
      return [
        PRODUCTS.CAR_PRODUCT_INSURANCE,
        PRODUCTS.HEALTH_PRODUCT_INSURANCE,
        PRODUCTS.TRAVEL_PRODUCT_INSURANCE,
      ];
    case UserRoleID.QualityControl:
      return [
        PRODUCTS.CAR_PRODUCT_INSURANCE,
        PRODUCTS.HEALTH_PRODUCT_INSURANCE,
      ];
    default:
      return [user.product ?? ''];
  }
};
