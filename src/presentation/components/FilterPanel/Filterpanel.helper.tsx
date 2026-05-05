import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import { getString } from 'presentation/theme/localization';
import { OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';

export const getRoleAgent = (assignType: OrderType | undefined) => {
  if (assignType === OrderType.QC || assignType === OrderType.Submission) {
    return TeamRole.QualityControl;
  }

  if (assignType === OrderType.Document) {
    return [TeamRole.DocumentsCollection, TeamRole.QualityControl];
  }

  return TeamRole.ProblemCase;
};

export const getAgentName = (
  status: TypeAssign | string,
  agentName: string
) => {
  if (status === TypeAssign.ASSIGN) {
    return agentName;
  }

  return '';
};

export const getNotificationSuccess = (status: TypeAssign | string) => {
  if (status === TypeAssign.ASSIGN) {
    return getString('text.assignedOrderSuccess');
  }

  return getString('text.unassignedOrderSuccess');
};

export const getNotificationFailed = (status: TypeAssign | string) => {
  if (status === TypeAssign.ASSIGN) {
    return getString('text.assignedOrderFailed');
  }

  return getString('text.unassignedOrderFailed');
};

export const getPayloadAssign = (
  orderList: any,
  status: TypeAssign | string,
  agentName: string,
  assignType: OrderType | undefined
) => ({
  body: {
    resources: orderList?.length
      ? orderList.map((orderId: string) =>
          assignType === OrderType.Submission ||
          assignType === OrderType.Approval
            ? `${orderId}`
            : `orders/${orderId}`
        )
      : orderList,
    assignedTo: getAgentName(status, agentName),
  },
  assignType,
});

export const getUsersByRole = (data: any) => {
  if (data?.length) {
    return data.map((item: any) => ({
      ...item,
      title: item.value,
    }));
  }
  return [];
};

export const getDisable = (agentName: any, listCheckBox: any) =>
  !agentName || listCheckBox.length === 0;

export const getDisableUnassign = (listFullItemCheck: any) =>
  listFullItemCheck.length === 0 ||
  listFullItemCheck.filter((item: any) => item.assignedTo === '').length ===
    listFullItemCheck.length;

export const typeOfAssign = (currentUrl: string) => {
  const orderPages = ['/orders/qc', '/orders/documents'];
  const policyPages = ['/orders/submission', '/orders/approval'];
  if (orderPages.includes(currentUrl)) {
    return 'order';
  }
  if (policyPages.includes(currentUrl)) {
    return 'policy';
  }
  return 'order';
};

export const assignTypeToRole = (type: OrderType) => {
  switch (type) {
    case OrderType.Document:
      return [TeamRole.DocumentsCollection, TeamRole.QualityControl];
    case OrderType.QC:
      return TeamRole.QualityControl;
    case OrderType.Submission:
      return [TeamRole.Submission, TeamRole.QualityControl];
    case OrderType.Approval:
      return TeamRole.ProblemCase;
    default:
      return null;
  }
};
