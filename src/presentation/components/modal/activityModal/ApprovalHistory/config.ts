import { Column } from 'presentation/HOCs/WithTableList';

export const columns: Column[] = [
  {
    id: 'index',
    field: 'index',
    label: 'text.noDots',
    minWidth: 50,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'discountType',
    field: 'discountType',
    label: 'menu.discounts.discountType',
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'approver',
    field: 'approver',
    label: 'text.approver',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'requestTime',
    field: 'requestTime',
    label: 'lead.dateRequest',
    minWidth: 140,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'approvalTime',
    field: 'approvalTime',
    label: 'lead.dateApproved',
    minWidth: 140,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'status',
    field: 'status',
    label: 'text.status',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'requestDiscount',
    field: 'requestDiscount',
    label: 'menu.discounts.requestDiscount',
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'priceBeforeDiscount',
    field: 'priceBeforeDiscount',
    label: 'menu.discounts.priceBeforeDiscount',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'priceAfterDiscount',
    field: 'priceAfterDiscount',
    label: 'menu.discounts.priceAfterDiscount',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'approvalReason',
    field: 'approvalReason',
    label: 'lead.approvalReason',
    minWidth: 300,
    sorting: 'none',
    disabled: true,
  },
];

export const initialFilter = (id: string, isHealth: boolean = false) => {
  if (isHealth) {
    return `healthLead.name='leads/${id}'`;
  }
  return `lead.name='leads/${id}'`;
};
