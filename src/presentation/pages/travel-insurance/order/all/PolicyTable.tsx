import React from 'react';
import clsx from 'clsx';

import { camelCase } from 'lodash';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

import { Button } from '@alphafounders/ui';
import { DownloadFileIcon, EditIcon } from '@alphafounders/icons';

import { UserRoles } from 'config/constant';
import { getString } from 'presentation/theme/localization';
import { getUserRoleAccess } from 'presentation/pages/car-insurance/CarePay/common/helper';
import TextStatus from 'presentation/components/OrderListingTable/TextStatus';

function PolicyTableCell({
  column,
  row,
  handleEdit,
  getDocument,
  role,
}: Readonly<{
  column: string;
  row: any;
  canEdit: boolean;
  handleEdit: (data: any) => void;
  getDocument: (data: any) => void;
  data: any;
  role: UserRoles;
}>) {
  const { canCancelPolicy, canDownloadPolicy } = getUserRoleAccess(
    role as UserRoles
  );

  const childIds = row.childId.split('/');
  const orderId = `orders/${childIds[1]}`;
  const itemId = `"orders/-/items/${childIds[3]}"`;

  switch (camelCase(column)) {
    case 'policy':
      return (
        <div className="flex flex-col items-start">
          <span>{row.policy}</span>
          {row.isCancelled && (
            <span className="p-1 px-2 bg-rose-600 text-white text-[10px] !rounded-[50px] mt-2">
              {getString('text.cancelled')}
            </span>
          )}
        </div>
      );
    case 'approvalStatus':
      return (
        <TextStatus
          status={getString(row[camelCase(column)].status)}
          label={getString(row[camelCase(column)].label)}
          tableType="order"
        />
      );
    case 'policyDocument':
      return (
        <Button
          icon={<DownloadFileIcon fillColor="white" />}
          disabled={!canDownloadPolicy}
          className={clsx('!bg-primary p-2', {
            'opacity-65': !canDownloadPolicy,
          })}
          onClick={() => getDocument({ orderId, itemId })}
          rounded
          text=""
        />
      );
    case 'policyCancellationStatus':
      return (
        <Button
          icon={<EditIcon fillColor="white" className="h-4 w-4" />}
          disabled={!canCancelPolicy}
          onClick={() =>
            handleEdit({
              ...row,
              type: 'cancel-policy',
              show: true,
            })
          }
          className={clsx('!bg-primary p-2', {
            'opacity-65': !canCancelPolicy,
          })}
          rounded
          text=""
        />
      );
    default:
      return row[camelCase(column)];
  }
}

function PolicyTable({
  data,
  handleEdit,
  getDocument,
  canEdit,
  role,
}: Readonly<{
  data: any[];
  handleEdit: (data: any) => void;
  getDocument: (data: any) => void;
  canEdit: boolean;
  role: UserRoles;
}>) {
  const columns = [
    'policy document',
    'policy cancellation status',
    'policy',
    'approval status',
    'policy number',
    'policy start date',
    'insured person',
    'policyholder ID number',
    'policyholder passport number',
    'policyholder Tax Id',
    'total premium',
    'policyholder dob',
    'policyholder gender',
    'policyholder country',
    'policyholder nationality',
  ];

  const translations = {
    policyDocument: getString('paymentDetails.policyHolder.document'),
    policyCancellationStatus: getString(
      'paymentDetails.policyHolder.cancellationStatus'
    ),
    policy: getString('text.policy'),
    policyNumber: getString('tableListing.policyNumber'),
    approvalStatus: getString('text.approvalStatus'),
    policyStartDate: getString('text.policyStartDate'),
    policyEndDate: getString('text.policyEndDate'),
    insuredPerson: getString('tableListing.insuredPerson'),
    policyholderPassportNumber: getString(
      'paymentDetails.policyHolder.passportNumber'
    ),
    policyholderIdNumber: getString(
      'searchFieldPrintingAndShippingOption.policyHolderID'
    ),
    policyholderTaxId: getString(
      'searchFieldPrintingAndShippingOption.policyHolderTaxId'
    ),
    totalPremium: getString('text.totalPremium'),
    policyholderDob: getString('paymentDetails.policyHolder.dob'),
    policyholderGender: getString('paymentDetails.policyHolder.gender'),
    policyholderCountry: getString('paymentDetails.policyHolder.countryCode'),
    policyholderNationality: getString(
      'paymentDetails.policyHolder.nationalityCode'
    ),
  } as any;

  return (
    <div className="w-screen px-4 pl-24">
      <Table data-testid="policy-table" className="max-w-4xl">
        <TableHead className="w-full">
          <TableRow className="border-0 border-b-2 border-solid border-gray-200">
            {columns.map((column) => (
              <TableCell
                key={`header-${column}`}
                className="text-xs min-w-[160px]"
              >
                {translations[camelCase(column)]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any) => (
            <TableRow key={row.childId}>
              {columns.map((column) => (
                <TableCell key={column} className="text-xs border-0">
                  <PolicyTableCell
                    column={column}
                    row={row}
                    canEdit={canEdit}
                    handleEdit={handleEdit}
                    getDocument={getDocument}
                    data={data}
                    role={role}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default PolicyTable;
