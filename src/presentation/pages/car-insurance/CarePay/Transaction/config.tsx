import { EyeIcon, SlipIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import clsx from 'clsx';
import React from 'react';

import { carePayCommonConfig } from '../common/config';
import { UserRoles } from 'config/constant';
import { getString } from 'presentation/theme/localization';

import TransactionStatus from './TransactionStatus';

import { getUserRoleAccess } from '../common/helper';

// eslint-disable-next-line import/prefer-default-export
export const getColumns = (
  handleEdit: (data: any) => void,
  role: UserRoles,
  isHealth: boolean = false
) => {
  const { canUpdatePaymentStatus } = getUserRoleAccess(role);
  return [
    {
      id: 'order',
      field: 'order',
      label: getString('menu.carePay.goToOrder'),
      minWidth: 132,
      disabled: true,
      clickable: true,
      customField: true,
      iconClass:
        'opacity-20 flex items-center justify-center border-solid cursor-pointer w-min p-1 bg-primary text-white border-none rounded-full',
      transform: (data: any) => (
        <Button
          text=""
          dataTestId="view-order-btn"
          className={clsx(
            'bg-[] text-black text-xs flex justify-between items-center flex-row-reverse !rounded-[50px] px-1 py-1'
          )}
          disabled={!data?.orderId}
          onClick={() => window.open(`/${data?.orderId}`, '_blank')}
          icon={<FolderSharedIcon fontSize="small" />}
        />
      ),
    },
    {
      id: 'slip',
      field: 'slip',
      label: getString('menu.carePay.slip'),
      minWidth: 130,
      disabled: true,
      clickable: true,
      customField: true,
      iconClass:
        'flex items-center justify-center border-solid cursor-pointer w-min p-1 bg-primary text-white border-none rounded-full',
      transform: (data: any) => (
        <Button
          text=""
          dataTestId="view-slip-btn"
          className={clsx(
            'bg-[] text-black text-xs flex justify-between items-center flex-row-reverse !rounded-[50px] px-1 py-1'
          )}
          disabled={
            !data?.transactionSlipData?.paySlipImageResource || data.isDeleted
          }
          onClick={() =>
            handleEdit({
              ...data,
              type: 'transaction-slip',
              canEdit: false,
              show: true,
            })
          }
          icon={<SlipIcon fillColor="white" className="text-xs" />}
        />
      ),
    },
    {
      id: 'paymentLink',
      field: 'paymentLink',
      label: getString('menu.carePay.paymentLinkHistory'),
      minWidth: 166,
      disabled: false,
      clickable: true,
      customField: true,
      transform: (data: any) => (
        <Button
          className="text-xs flex justify-between items-center flex-row-reverse !rounded-[50px] px-1 py-1"
          text=""
          disabled={data.isDeleted}
          icon={<EyeIcon fillColor="white" />}
          onClick={() =>
            handleEdit({
              type: 'payment-history',
              show: true,
              ...data,
            })
          }
        />
      ),
    },
    {
      id: 'id',
      field: 'transaction.leadHumanId.keyword',
      label: getString('carepay.contract.leadId'),
      minWidth: 120,
      sorting: 'none',
      transform: (data: any) => (
        <div className="w-full text-center flex flex-col">
          <span>{data.id}</span>
          {data.gatewayReference !== '' && (
            <span className="text-xs text-secondary font-semibold">
              iCollection
            </span>
          )}
        </div>
      ),
    },
    carePayCommonConfig.find((config) => config.id === 'customerName'),
    carePayCommonConfig.find((config) => config.id === 'customerPhone'),
    {
      ...(!isHealth
        ? carePayCommonConfig.find((config) => config.id === 'license')
        : {}),
    },
    {
      id: 'amount',
      field: 'transaction.money.amount',
      label: getString('menu.carePay.amount'),
      minWidth: 130,
      sorting: 'none',
    },
    {
      id: 'paymentType',
      field: 'transaction.paymentOption.keyword',
      label: getString('menu.carePay.paymentType.root'),
      minWidth: 200,
      sorting: 'none',
    },
    {
      id: 'paymentStatus',
      field: 'paymentStatus',
      label: getString('menu.carePay.paymentStatus'),
      minWidth: 240,
      sorting: 'none',
      disabled: true,
      clickable: true,
      customField: true,
      iconClass: 'align-right absolute ml-2 right-0',
      transform: ({ paymentStatus: status, isDeleted, ...rest }: any) =>
        status !== '-' ? (
          <TransactionStatus
            data={{
              ...rest,
              role,
              type: 'paymentStatus',
              canEdit: canUpdatePaymentStatus && !isDeleted,
              show: true,
            }}
            disabled={
              !['FULL_PAYMENT', 'CREDIT_CARD_INSTALLMENT'].includes(
                rest.paymentOption
              ) ||
              getString('paymentMethodsCarepay.CREDIT_TERM') ===
                rest.paymentMethod ||
              status === 'SUCCESSFUL' ||
              isDeleted
            }
            handleEdit={handleEdit}
            status={status}
          />
        ) : (
          status
        ),
    },
    {
      id: 'paymentMethod',
      field: 'latestCharge.paymentMethod.keyword',
      label: getString('menu.carePay.paymentMethod'),
      minWidth: 170,
      sorting: 'none',
    },
    {
      id: 'createDate',
      field: 'transaction.createTime',
      label: getString('menu.carePay.createDate'),
      minWidth: 170,
      sorting: 'none',
    },
    {
      id: 'updateDate',
      field: 'transaction.updateTime',
      label: getString('menu.carePay.updateDate'),
      minWidth: 170,
      sorting: 'none',
    },
    {
      id: 'paymentDate',
      field: 'latestCharge.paymentDate',
      label: getString('menu.carePay.paymentDate'),
      minWidth: 200,
      sorting: 'none',
    },
  ];
};

export type StatusMapping = {
  SUCCESSFUL: string;
  PAID: string;
  PENDING: string;
  CANCELLED: string;
  CANCELED_CHANGE_ORDER: string;
  OVERDUE: string;
};
