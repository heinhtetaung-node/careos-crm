import { MoreInfoIcon, ViewDocumentIcon } from '@alphafounders/icons';
import React from 'react';

import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

export const MockData = [
  {
    customerName: 'Hasnain Tariq',
    phone: '123*******',
    email: 'hx********',
    leadId: 'L123123',
    orderID: '12333123',
    nationId: '1231231231231',
    contractStatus: 'PENDING',
    QCStatus: 'PENDING',
    createTime: '12/12/2002',
    installments: 2,
    installmentAmount: '2,0000',
    firstInstallment: '19,000',
    firstInstallmentDate: '12/12/2002',
    insurer: '-',
    policyStartDate: '12/12/2002',
    policyStartEnd: '12/12/2002',
    cancelStatus: 'SUCCESS',
    salesAgent: '-',
    salesTeam: '-',
    assignedQC: 'Hxn',
  },
];
export const getColumns = (
  openDetails: (data: any) => any,
  openInformation: (data: any) => any
): Column[] => [
  {
    id: 'openDetails',
    field: 'openDetails',
    label: 'carepay.contract.openDetails',
    minWidth: 150,
    disabled: true,
    clickable: true,
    customField: true,
    onClick: (data) => openDetails(data),
    icon: (
      <ViewDocumentIcon className="cursor-pointer w-max p-1 bg-primary text-white border-none rounded-full" />
    ),
  },
  {
    id: 'contractInformation',
    field: 'contractInformation',
    label: 'carepay.contract.contractInformation',
    minWidth: 150,
    disabled: true,
    clickable: true,
    customField: true,
    onClick: (data) => openInformation(data),
    icon: (
      <div className="bg-primary w-10 h-10 p-1 pl-2.5 flex justify-center items-center rounded-full">
        <MoreInfoIcon className="w-full" />
      </div>
    ),
  },
  {
    id: 'customerName',
    field: 'attributes.customerFullName',
    label: (
      <div className="text-center flex flex-col">
        <span>{getString('tableListing.insuredPerson')}</span>
        <span className="text-xs">({getString('text.customer')})</span>
      </div>
    ),
    minWidth: 200,
    sorting: 'none',
    transform: ({ policyHolderFullName, customerName }: any) => (
      <div className="w-full flex flex-col">
        <span>{policyHolderFullName || customerName}</span>
        {policyHolderFullName && customerName !== policyHolderFullName && (
          <span className="text-xs">({customerName})</span>
        )}
      </div>
    ),
  },
  {
    id: 'phone',
    field: 'phone',
    label: 'carepay.contract.phone',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'email',
    field: 'email',
    label: 'carepay.contract.email',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'leadId',
    field: 'lead.humanId',
    label: 'carepay.contract.leadId',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'nationId',
    field: 'nationId',
    label: 'carepay.contract.nationId',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'contractStatus',
    field: 'contract.status',
    label: 'carepay.contract.contractStatus',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'createTime',
    field: 'contract.createTime',
    label: 'carepay.contract.createTime',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'installments',
    field: 'price.numberOfInstallments',
    label: 'carepay.contract.installments',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'installmentAmount',
    field: 'price.priceDetail.paymentAmount',
    label: 'carepay.contract.installmentAmount',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'firstInstallment',
    field: 'price.priceDetail.priceSummary.initialAmount',
    label: 'carepay.contract.firstInstallment',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'firstInstallmentDate',
    field: 'contract.firstInstallmentDate',
    label: 'carepay.contract.firstInstallmentDate',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'insurer',
    field: 'insurer',
    label: 'carepay.contract.insurer',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'policyStartDate',
    field: 'contract.coverageStartTime',
    label: 'carepay.contract.policyStartDate',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'policyEndDate',
    field: 'contract.coverageEndTime',
    label: 'carepay.contract.policyEndDate',
    minWidth: 200,
    sorting: 'none',
  },
  {
    id: 'assignedQC',
    field: 'assignedQC',
    label: 'carepay.contract.assignedQC',
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
];
