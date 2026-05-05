import { EditIcon, SlipIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import clsx from 'clsx';
import { camelCase } from 'lodash';
import React, { ChangeEvent } from 'react';

import { UserRoles } from 'config/constant';
import { useGetPackageDetailsQuery } from 'data/slices/packageSlice';
import { useGetPriceDetailQuery } from 'data/slices/transactionSlice';
import { getString } from 'presentation/theme/localization';
import { numberToMoney, satangToBahtNumber } from 'utils/currency';

import TransactionStatus from './TransactionStatus';

import { getUserRoleAccess } from '../common/helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

function FollowupTableCell({
  column,
  row,
  handleEdit,
  role,
}: Readonly<{
  column: string;
  row: any;
  canEdit: boolean;
  handleEdit: (data: any) => void;
  data: any;
  role: UserRoles;
}>) {
  const { canSetUpSMS, canUpdatePaymentStatus, canUpdateDueDate } =
    getUserRoleAccess(role as UserRoles);

  const { isDeleted } = row;

  switch (camelCase(column)) {
    case 'paymentMethod':
      if (row.paymentMethod === '-') return row.paymentMethod;
      return getString(`paymentMethodsCarepay.${row?.paymentMethod}`);
    case 'paymentStatus':
      return (
        <TransactionStatus
          data={{
            ...row,
            type: 'f_paymentStatus',
            canEdit:
              canUpdatePaymentStatus &&
              row.paymentStatus !== 'PAID' &&
              !isDeleted,
            show: true,
          }}
          status={row.paymentStatus}
          handleEdit={
            canUpdatePaymentStatus && !isDeleted ? handleEdit : () => {}
          }
        />
      );
    case 'slip':
      return (
        // eslint-disable-next-line jsx-a11y/control-has-associated-label, react/button-has-type
        <button
          disabled={!row?.transactionSlipData?.paySlipImageResource}
          onClick={() =>
            handleEdit({
              ...row,
              type: 'transaction-slip',
              canEdit: false,
              show: true,
            })
          }
          className={clsx([
            'flex justify-center items-center w-8 h-8  rounded-full p-0',
            row?.transactionSlipData?.paySlipImageResource
              ? 'bg-primary'
              : 'bg-gray-300 border-0',
          ])}
        >
          <SlipIcon fillColor="white" />
        </button>
      );
    case 'dueDate': {
      const isAllowedToEdit = ['OVERDUE', 'PENDING'].includes(
        row.paymentStatus
      );

      if (!isAllowedToEdit) return row.dueDate;
      return (
        <Button
          disabled={!row?.dueDate}
          dataTestId="dueDate-btn"
          onClick={() =>
            handleEdit({
              ...row,
              type: 'due-date',
              canEdit: canUpdateDueDate,
              show: true,
            })
          }
          className={clsx([
            'flex justify-center items-center flex-row-reverse text-xs font-normal !text-[#4f4b66] w-auto p-0 bg-transparent',
          ])}
          icon={
            canUpdateDueDate && row?.dueDate ? (
              <EditIcon className="ml-2 text-xs h-5 w-5 cursor-pointer" />
            ) : undefined
          }
          text={row.dueDate}
        />
      );
    }
    case 'sms':
      return (
        <div className="flex items-center flex-start">
          <Button
            text={row.sendSms ? getString('text.yes') : getString('text.no')}
            dataTestId="edit-btn"
            className={clsx(
              'bg-transparent text-white text-xs flex justify-between items-center flex-row-reverse !rounded-[50px] px-2 py-1',
              {
                '!bg-green-500': row.sendSms,
                '!bg-red-500': !row.sendSms,
              }
            )}
            onClick={() =>
              canSetUpSMS &&
              handleEdit({
                ...row,
                type: 'sms',
                canEdit: canSetUpSMS && !isDeleted,
                show: true,
              })
            }
            icon={
              canSetUpSMS && !isDeleted ? (
                <EditIcon
                  fillColor="#FFFFFF"
                  className="ml-2 text-xs w-5 h-5 cursor-pointer"
                />
              ) : undefined
            }
          />
        </div>
      );

    default:
      return row[camelCase(column)];
  }
}

function FollowupTable({
  data,
  selected = [],
  handleSelect,
  parentId,
  handleEdit,
  canEdit,
  role,
}: Readonly<{
  data: any[];
  selected: string[];
  handleSelect: (
    id: string,
    row: any,
    singleSelect: boolean,
    parentId: string
  ) => void;
  handleEdit: (data: any) => void;
  parentId: string;
  canEdit: boolean;
  role: UserRoles;
}>) {
  const columns = [
    'sms',
    'Installment',
    'Amount',
    'Payment status',
    'assignedToUser',
    'Due date',
  ];

  const biggerColumns: string[] = [
    'sms',
    'Amount',
    'Payment status',
    'assignedToUser',
    'Due date',
  ];

  const translations = {
    slip: getString('menu.carePay.slip'),
    sms: getString('menu.carePay.smsSchedule'),
    installment: getString('menu.carePay.installment'),
    amount: getString('menu.carePay.amount'),
    paymentStatus: getString('menu.carePay.paymentStatus'),
    paymentMethod: getString('menu.carePay.paymentMethod'),
    assignedToUser: getString('menu.carePay.assignedToUser'),
    createDate: getString('menu.carePay.createDate'),
    updateDate: getString('menu.carePay.updateDate'),
    dueDate: getString('menu.carePay.dueDate'),
    paymentDate: getString('menu.carePay.paymentDate'),
  } as any;

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { data: packageDetailData } = useGetPackageDetailsQuery({
    packageId: `${data[0]?.packageId}${globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE ? ':getQuote' : ''}`,
  });

  const { data: priceDetailData } = useGetPriceDetailQuery(
    {
      priceId: packageDetailData?.priceResourceName,
    },
    {
      skip: packageDetailData?.priceResourceName === undefined,
    }
  );

  const getInvoiceAmount = (row: any) => {
    if (!priceDetailData) return '-';

    return numberToMoney(
      satangToBahtNumber(
        priceDetailData.price.priceDetail.installmentDetails.find(
          (installment) => installment.period === row.installment
        )?.paymentAmount ?? ''
      )
    );
  };

  return (
    <div className="w-screen px-4 pl-24">
      <Table data-testid="followup-table" className="max-w-4xl">
        <TableHead className="w-full">
          <TableRow className="border-0 border-b-2 border-solid border-gray-200">
            <TableCell />
            {columns.map((column) => (
              <TableCell
                key={`header-${column}`}
                className={clsx('text-xs', {
                  'min-w-[170px]': biggerColumns.includes(column),
                })}
              >
                {translations[camelCase(column)]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any) => (
            <TableRow key={row.childId}>
              <TableCell className="text-xs border-0">
                <input
                  data-testid="checkbox-followup"
                  type="checkbox"
                  checked={selected.includes(row.childId)}
                  onChange={(_event: ChangeEvent<HTMLInputElement>) =>
                    handleSelect(row.childId, data, true, parentId)
                  }
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column} className="text-xs border-0">
                  <FollowupTableCell
                    column={column}
                    row={{ ...row, amount: getInvoiceAmount(row) }}
                    canEdit={canEdit}
                    handleEdit={handleEdit}
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

export default FollowupTable;
