import { getUserRoleAccessLead } from './userRolesAccess';

describe('getUserRoleAccessLead', () => {
  it('should return admin, supervisor, and manager access', () => {
    const userRole = 'roles/admin';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
      canComment: true,
      canEdit: true,
      viewSelectedPackage: true,
      viewPackageListingDetailComparison: true,
      canCreateCustomPackage: true,
      canCall: true,
      canCreatePayment: true,
      canCreateContract: true,
    });
  });

  it('should return sales agent access', () => {
    const userRole = 'roles/sales';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
      canComment: true,
      canEdit: true,
      viewSelectedPackage: true,
      viewPackageListingDetailComparison: false,
      canCreateCustomPackage: true,
      canCall: true,
      canCreatePayment: true,
      canCreateContract: true,
    });
  });

  it('should return back office and quality control access', () => {
    const userRole = 'roles/backoffice-supervisor';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
      canComment: true,
      canEdit: true,
      viewSelectedPackage: true,
      viewPackageListingDetailComparison: true,
      canCreateCustomPackage: false,
      canCall: true,
      canCreatePayment: false,
      canCreateContract: false,
    });
  });

  it('should return accounting access', () => {
    const userRole = 'roles/accounting';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
      canComment: false,
      canEdit: false,
      viewSelectedPackage: true,
      viewPackageListingDetailComparison: true,
      canCreateCustomPackage: false,
      canCall: false,
      canCreatePayment: false,
      canCreateContract: false,
      canUpdateRefundStatus: true,
    });
  });

  it('should return ciagent access', () => {
    const userRole = 'roles/cash-installment-supervisor';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
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
    });
  });

  it('should return cisupervisor access', () => {
    const userRole = 'roles/cash-installment-agent';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
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
    });
  });

  it('should return default access', () => {
    const userRole = 'roles/accounting';
    const result = getUserRoleAccessLead(userRole);
    expect(result).toEqual({
      canComment: false,
      canEdit: false,
      viewSelectedPackage: true,
      viewPackageListingDetailComparison: true,
      canCreateCustomPackage: false,
      canCall: false,
      canCreatePayment: false,
      canCreateContract: false,
      canUpdateRefundStatus: true,
    });
  });
});
