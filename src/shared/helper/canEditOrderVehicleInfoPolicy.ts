import { UserRoles } from 'config/constant';
import { PolicyItem } from 'presentation/pages/car-insurance/orders/PrintingAndShipping/helper';
import { ItemApprovalStatus, OrderQcStatus } from 'shared/constants/orderType';

type CanEditOrderVehicleInfoPolicyParams = {
  policyItems?: PolicyItem[];
  userRole: UserRoles;
  order: {
    isCancelled?: boolean;
    qcStatus?: OrderQcStatus;
  };
};

export default function canEditOrderVehicleInfoPolicy({
  policyItems,
  userRole,
  order,
  isQcPage = false,
  isEnabledVehicleUpdateWithinOrder = false,
  readOnly = false,
}: Readonly<CanEditOrderVehicleInfoPolicyParams> & {
  isQcPage?: boolean;
  isEnabledVehicleUpdateWithinOrder?: boolean;
  readOnly?: boolean;
}): boolean {
  if (!isEnabledVehicleUpdateWithinOrder) return !readOnly;
  if (!policyItems) return false;
  const isAllowedApprovalStatus = policyItems.every((item) =>
    [
      ItemApprovalStatus.PENDING,
      ItemApprovalStatus.REJECTED,
      ItemApprovalStatus.SUBMISSION_PROBLEM,
    ].includes(item?.approvalStatus as ItemApprovalStatus)
  );
  const isAllowedQcStatus = [
    OrderQcStatus.PENDING,
    OrderQcStatus.REJECTED,
  ].includes(order.qcStatus as OrderQcStatus);
  const hasValidRole = [
    UserRoles.ADMIN_ROLE,
    UserRoles.SUPER_ADMIN_ROLE,
    UserRoles.MANAGER_ROLE,
    UserRoles.SUPERVISOR_ROLE,
    UserRoles.BACK_OFFICE,
  ].includes(userRole);
  const isRejectedQcSales =
    order.qcStatus === OrderQcStatus.REJECTED &&
    userRole === UserRoles.SALE_ROLE;
  const isSupervisorWithSubmittedItem =
    userRole === UserRoles.SUPERVISOR_ROLE &&
    policyItems.some(
      (item) => item.submissionStatus === 'ITEM_SUBMISSION_STATUS_SUBMITTED'
    );
  const isRoleAllowed = hasValidRole || isRejectedQcSales;

  // Special case: If QC status is rejected, Sales Agent needs to be able to update the rejected items.
  if (
    isQcPage &&
    order.qcStatus === OrderQcStatus.REJECTED &&
    userRole === UserRoles.SALE_ROLE
  )
    return true;

  if (isQcPage) {
    return isAllowedQcStatus && hasValidRole;
  }

  const policyAllowsOrderDetail =
    isAllowedApprovalStatus && isRoleAllowed && !isSupervisorWithSubmittedItem;

  /** Bridge does not override supervisor + submitted policy line. */
  if (
    !policyAllowsOrderDetail &&
    !readOnly &&
    hasValidRole &&
    !isSupervisorWithSubmittedItem
  ) {
    return true;
  }

  return policyAllowsOrderDetail;
}
