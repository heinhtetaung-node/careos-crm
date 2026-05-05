import { EditIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import React from 'react';

import { StatusMapping } from './config';
import TextStatus from 'presentation/components/OrderListingTable/TextStatus';
import { getString } from 'presentation/theme/localization';

function TransactionStatus({
  data,
  handleEdit,
  status,
  disabled = false,
}: Readonly<{
  data: any;
  handleEdit?: (data: any) => void;
  status:
    | 'SUCCESSFUL'
    | 'PAID'
    | 'PENDING'
    | 'CANCELED_CHANGE_ORDER'
    | 'CANCELLED'
    | 'OVERDUE';
  disabled?: boolean;
}>) {
  const statusMapping: StatusMapping = {
    SUCCESSFUL: getString('text.paid'),
    PAID: getString('text.paid'),
    PENDING: getString('menu.carePay.pending'),
    CANCELLED: getString('menu.carePay.canceled.main'),
    CANCELED_CHANGE_ORDER: getString('menu.carePay.canceled.changeOrder'),
    OVERDUE: getString('menu.carePay.overdue'),
  };

  return (
    <Button
      dataTestId="edit-btn"
      className="bg-transparent flex items-center flex-row-reverse"
      text={
        <TextStatus
          isDownloadable={false}
          label={
            Object.keys(statusMapping).includes(status)
              ? statusMapping[status]
              : status
          }
          status={status}
          type="text"
          fontBold
        />
      }
      onClick={() => (!disabled && data.canEdit ? handleEdit?.(data) : null)}
      icon={
        status !== 'SUCCESSFUL' && data.canEdit && !disabled ? (
          <EditIcon className="ml-2 text-xs cursor-pointer" />
        ) : undefined
      }
    />
  );
}

export default TransactionStatus;
