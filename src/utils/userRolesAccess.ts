import { PRODUCTS } from 'config/TypeFilter';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

// This is for component level.
const getUserRoleAccessLead = (userRole: string, product?: string) => {
  switch (userRole) {
    case UserRoleID.SuperAdmin:
      return {
        canComment: true,
        canEdit: true,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: true,
        canCall: true,
        canCreatePayment: true,
        canCreateContract: true,
        canApproveCreditTerm: true,
        canUpdateRefundStatus: true,
      };
    case UserRoleID.Admin:
    case UserRoleID.Supervisor:
    case UserRoleID.Manager:
      return {
        canComment: true,
        canEdit: true,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: true,
        canCall: true,
        canCreatePayment: true,
        canCreateContract: true,
      };
    case UserRoleID.SalesAgent:
      return {
        canComment: true,
        canEdit: true,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: false, // set to false, because of the logic where only assigned agent can view these pages.
        canCreateCustomPackage: true,
        canCall: true,
        canCreatePayment: true,
        canCreateContract: true,
      };
    case UserRoleID.BackOffice:
    case UserRoleID.QualityControl:
    case UserRoleID.DocumentsCollection:
    case UserRoleID.ProblemCase:
    case UserRoleID.Shipment:
    case UserRoleID.InboundAgent:
      return {
        canComment: true,
        canEdit: true,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: false,
        canCall: true,
        canCreatePayment: false,
        canCreateContract: false,
      };
    case UserRoleID.CustomerService:
    case UserRoleID.Submission:
      return {
        canComment: true,
        canEdit: true,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: false,
        canCall: false,
        canCreatePayment: false,
        canCreateContract: false,
      };
    case UserRoleID.CiAgent:
      return {
        canComment: true,
        canEdit: false,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: false,
        canCall: product === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
        canCreatePayment: false,
        canCreateContract: false,
        canApproveCreditTerm: true,
        canUpdateRefundStatus: true,
      };
    case UserRoleID.CiSuperVisor:
      return {
        canComment: true,
        canEdit: false,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: false,
        canCall: false,
        canCreatePayment: false,
        canCreateContract: false,
        canApproveCreditTerm: true,
        canUpdateRefundStatus: true,
      };
    case UserRoleID.Accounting:
    default:
      return {
        canComment: false,
        canEdit: false,
        viewSelectedPackage: true,
        viewPackageListingDetailComparison: true,
        canCreateCustomPackage: false,
        canCall: false,
        canCreatePayment: false,
        canCreateContract: false,
        canUpdateRefundStatus: true,
      };
  }
};

// eslint-disable-next-line import/prefer-default-export
export { getUserRoleAccessLead };
