import { makeStyles } from '@material-ui/core';

import { Column } from './TableAllLead.helper';

export enum RejectionType {
  APPROVE = 'APPROVE',
  DECLINE = 'DECLINE',
}

export const leadRejectionColumns: Column[] = [
  {
    id: 'rejectedDate',
    label: 'text.rejectedDate',
    sorting: 'asc',
    minWidth: 100,
    sortingField: 'attributes.undecidedRejectionCreateTime',
  },
  {
    id: 'rejectionReason',
    label: 'text.rejectedReason',
    sorting: 'none',
    minWidth: 100,
    sortingField: 'rejections.reason',
    isNotSorting: true,
  },
  {
    id: 'rejectionComment',
    label: 'text.rejectedComment',
    sorting: 'none',
    minWidth: 80,
    sortingField: '',
    isNotSorting: true,
  },
  {
    id: 'teamName',
    label: 'text.team',
    sorting: 'none',
    minWidth: 80,
    sortingField: 'team.displayName',
    isNotSorting: true,
  },
  {
    id: 'user',
    label: 'text.user',
    sorting: 'none',
    minWidth: 80,
    sortingField: 'assigned.firstName',
    isNotSorting: true,
  },
  {
    id: 'expiryDate',
    label: 'text.expiryDate',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'insurance.policyExpiryDate',
  },
  {
    id: 'leadId',
    label: 'text.leadId',
    sorting: 'none',
    minWidth: 100,
    sortingField: 'lead.humanId',
  },
  {
    id: 'leadType',
    label: 'text.leadType',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'lead.type',
    isNotSorting: true,
  },
  {
    id: 'leadStatus',
    label: 'text.leadStatus',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'lead.status',
    isNotSorting: true,
  },
  {
    id: 'licensePlate',
    label: 'text.licensePlate',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'car.licensePlate',
    isNotSorting: true,
  },
  {
    id: 'duplicateLead',
    label: 'lead.duplicateLead',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'attributes.isDuplicate',
    isNotSorting: true,
  },
  {
    id: 'createdOn',
    label: 'text.createdOn',
    sorting: 'none',
    minWidth: 200,
    sortingField: 'lead.createTime',
  },
  {
    id: 'policyStartDate',
    label: 'text.policyStartDate',
    sorting: 'none',
    minWidth: 150,
    sortingField: 'lead.data.policyStartDate',
  },
];

export const voiceModalStyles = makeStyles({
  voiceModalDialog: {
    '& .MuiDialog-container': {
      height: '70%',
    },
    '& .MuiDialogContent-root': {
      paddingLeft: '0px',
      position: 'relative',
    },
  },
  voiceFileIcon: {
    width: '1.5em',
    height: '1.5em',
    cursor: 'pointer',
  },
  tableCell: {
    whiteSpace: 'normal',
  },
  voiceModalMessage: {
    minHeight: '144px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
});
