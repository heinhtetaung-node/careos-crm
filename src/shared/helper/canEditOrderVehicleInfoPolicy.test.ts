import canEditOrderVehicleInfoPolicy from './canEditOrderVehicleInfoPolicy';
import { UserRoles } from 'config/constant';
import { ItemApprovalStatus, OrderQcStatus } from 'shared/constants/orderType';

const baseItem = {
  approvalStatus: ItemApprovalStatus.PENDING,
  submissionStatus: 'ITEM_SUBMISSION_STATUS_DRAFT',
};

/** Policy rules only apply when BROK-4710 is enabled. */
const withPolicy = { isEnabledVehicleUpdateWithinOrder: true as const };

describe('canEditOrderVehicleInfoPolicy', () => {
  it('should return false when policyItems is undefined', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: undefined,
      userRole: UserRoles.ADMIN_ROLE,
      order: {},
      ...withPolicy,
    });

    expect(result).toBe(false);
  });

  it('on order detail, privileged role can edit when page not readOnly even if approval status is not allowed (bridge)', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [
        {
          ...baseItem,
          approvalStatus: 'SOME_OTHER_STATUS',
        } as any,
      ],
      userRole: UserRoles.ADMIN_ROLE,
      order: {},
      ...withPolicy,
      readOnly: false,
    });

    expect(result).toBe(true);
  });

  it('should return true for valid role and allowed approval status', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [baseItem],
      userRole: UserRoles.ADMIN_ROLE,
      order: {},
      ...withPolicy,
    });

    expect(result).toBe(true);
  });

  it('should return false when user role is invalid and not sales with rejected QC', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [baseItem],
      userRole: UserRoles.SALE_ROLE,
      order: { qcStatus: OrderQcStatus.APPROVED },
      ...withPolicy,
    });

    expect(result).toBe(false);
  });

  it('should allow sales when QC is rejected (override role)', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [baseItem],
      userRole: UserRoles.SALE_ROLE,
      order: { qcStatus: OrderQcStatus.REJECTED },
      ...withPolicy,
    });

    expect(result).toBe(true);
  });

  it('should return false for supervisor when any item is submitted (bridge does not apply)', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [
        {
          ...baseItem,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        },
      ],
      userRole: UserRoles.SUPERVISOR_ROLE,
      order: {},
      ...withPolicy,
      readOnly: false,
    });

    expect(result).toBe(false);
  });

  it('should return true for supervisor when no submitted items', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [baseItem],
      userRole: UserRoles.SUPERVISOR_ROLE,
      order: {},
      ...withPolicy,
    });

    expect(result).toBe(true);
  });

  it('should return false when both role invalid and approval invalid', () => {
    const result = canEditOrderVehicleInfoPolicy({
      policyItems: [
        {
          ...baseItem,
          approvalStatus: 'INVALID',
        } as any,
      ],
      userRole: UserRoles.SALE_ROLE,
      order: { qcStatus: OrderQcStatus.APPROVED },
      ...withPolicy,
    });

    expect(result).toBe(false);
  });

  it('when BROK-4710 off, skips policy and only uses readOnly', () => {
    expect(
      canEditOrderVehicleInfoPolicy({
        policyItems: undefined,
        userRole: UserRoles.SALE_ROLE,
        order: {},
        isEnabledVehicleUpdateWithinOrder: false,
        readOnly: false,
      })
    ).toBe(true);

    expect(
      canEditOrderVehicleInfoPolicy({
        policyItems: [baseItem],
        userRole: UserRoles.ADMIN_ROLE,
        order: {},
        isEnabledVehicleUpdateWithinOrder: false,
        readOnly: true,
      })
    ).toBe(false);
  });

  it('when isEnabledVehicleUpdateWithinOrder is omitted, defaults to false and returns !readOnly (line 18 default)', () => {
    expect(
      canEditOrderVehicleInfoPolicy({
        userRole: UserRoles.SALE_ROLE,
        order: {},
        readOnly: false,
      })
    ).toBe(true);

    expect(
      canEditOrderVehicleInfoPolicy({
        userRole: UserRoles.ADMIN_ROLE,
        order: {},
        readOnly: true,
      })
    ).toBe(false);
  });

  it('on QC page, allows Sales when order QC is rejected (special case lines 55–61)', () => {
    expect(
      canEditOrderVehicleInfoPolicy({
        policyItems: [baseItem],
        userRole: UserRoles.SALE_ROLE,
        order: { qcStatus: OrderQcStatus.REJECTED },
        isQcPage: true,
        ...withPolicy,
        readOnly: false,
      })
    ).toBe(true);
  });

  it('on QC page, uses isAllowedQcStatus && hasValidRole when not Sales rejected special case (lines 62–64)', () => {
    expect(
      canEditOrderVehicleInfoPolicy({
        policyItems: [baseItem],
        userRole: UserRoles.ADMIN_ROLE,
        order: { qcStatus: OrderQcStatus.PENDING },
        isQcPage: true,
        ...withPolicy,
      })
    ).toBe(true);

    expect(
      canEditOrderVehicleInfoPolicy({
        policyItems: [baseItem],
        userRole: UserRoles.ADMIN_ROLE,
        order: { qcStatus: OrderQcStatus.APPROVED },
        isQcPage: true,
        ...withPolicy,
      })
    ).toBe(false);
  });
});
