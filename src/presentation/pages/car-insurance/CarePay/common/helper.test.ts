import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

import { formatFilterURI, getUserRoleAccess } from './helper';

const mockPayload = {
  search: {
    inputValue: '',
    selectValue: 'transaction.leadHumanId',
    'transaction.leadHumanId': '',
  },
  dueDate: {
    startDate: new Date('11/12/2023'),
    endDate: new Date('12/12/2023'),
  },
  paymentStatus: [
    {
      id: 1,
      title: 'Fully paid',
      value: 'PAID',
    },
  ],
  transactionStatus: [
    {
      id: 4,
      title: 'Pending',
      value: 'PENDING',
    },
  ],
};

describe('Testing Contract helper funcs', () => {
  it('should call formatFilterUri func and return formatter uri string', () => {
    const uri = formatFilterURI(mockPayload);
    expect(uri).toBe(
      'followup.dueDate>=\'2023-11-11T17:00:00.000Z\' followup.dueDate<=\'2023-12-11T17:00:00.000Z\' charges[].status="SUCCESSFUL" transaction.statusCode!="SUCCESSFUL"'
    );
  });
});

describe('Testing getUserRoleAccess func', () => {
  const rolesAndAccess = [
    {
      role: UserRoleID.Admin,
      access: {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
        canUpdateDueDate: true,
        canAccessTravelPage: true,
        canCancelPolicy: true,
        canDownloadPolicy: true,
        canSendPolicyEmail: true,
      },
    },
    {
      role: UserRoleID.QualityControl,
      access: {
        canAssign: false,
        canCreatePaymentLink: false,
        canSetUpSMS: false,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
      },
    },
    {
      role: UserRoleID.BackOffice,
      access: {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdateDueDate: true,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
      },
    },
    {
      role: UserRoleID.CiAgent,
      access: {
        canAssign: false,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdateDueDate: true,
        canUpdatePaymentStatus: true,
        canAssignContract: false,
        canApproveContract: true,
      },
    },
    {
      role: UserRoleID.CiSuperVisor,
      access: {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdateDueDate: true,
        canUpdatePaymentStatus: true,
        canAssignContract: false,
        canApproveContract: true,
      },
    },
    {
      role: UserRoleID.Supervisor,
      access: {
        canAssign: false,
        canCreatePaymentLink: false,
        canSetUpSMS: false,
        canUpdatePaymentStatus: false,
        canAssignContract: false,
        canApproveContract: false,
      },
    },
  ];

  it.each(rolesAndAccess)(
    'should return user access according to their role of $role',
    async ({ role, access }) => {
      const userRoleAccess = getUserRoleAccess(role as UserRoleID);
      expect(userRoleAccess).toEqual(access);
    }
  );
});
