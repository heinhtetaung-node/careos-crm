import React from 'react';
import { getLanguage } from 'presentation/theme/localization';
import { customImportedStatus } from 'data/slices/importSlices/helper';
import getApiEndpoint from 'utils/endpointHelper';
import { uniqueId } from 'lodash';
import clsx from 'clsx';
import { Button } from '@alphafounders/ui';
import { TableCell } from '@material-ui/core';
import { RedirectIcon } from '@alphafounders/icons';
import { ViewPurchaseIcon } from '../icons';
import TextStatus from '../OrderListingTable/TextStatus';

const currentLocale = getLanguage();

interface RenderCustomValueProps {
  value: any;
  row: any;
  id: string;
  isDownloadable?: boolean;
  handleFailedPackageClick?: (row: any) => void;
  isSelectable?: boolean;
  isRedirectable?: boolean;
  column?: any;
  tableType?: string;
  classes?: any;
}

export function RenderCustomValue({
  value,
  row,
  id,
  isDownloadable,
  handleFailedPackageClick,
  isSelectable,
  isRedirectable,
  column,
  tableType,
  classes,
}: RenderCustomValueProps) {
  const noneRejectedStatus = (rejections: any[]) => {
    if (!rejections || !Array.isArray(rejections)) {
      return classes.statusGreen;
    }
    const isPending = rejections.some((item) => !item.decideTime);
    return isPending ? classes.statusOrange : classes.statusGreen;
  };

  const renderStatus = () => {
    const isIcon = column.circleIcon ?? true;
    return (
      <TextStatus
        isDownloadable={isDownloadable}
        label={customImportedStatus(value) || value}
        status={value}
        type={isSelectable && isIcon && !isRedirectable ? 'circle' : 'text'}
        handleClick={() => handleFailedPackageClick?.(row) as any}
        tableType={tableType}
      />
    );
  };

  const renderFile = () => {
    const handleClick = column?.onClick ? () => column.onClick(row) : undefined;
    return (
      <Button
        id="data-file-icon"
        className="bg-primary rounded-full h-8 w-8 cursor-pointer content-center flex justify-center items-center"
        onClick={handleClick}
        text={<ViewPurchaseIcon />}
      />
    );
  };

  const renderRedirect = () => {
    const redirectUri = getApiEndpoint(`${row.leadName}`);
    return (
      <a
        id="data-redirect-icon"
        href={redirectUri}
        target="_blank"
        rel="noreferrer"
        className="no-underline text-black cursor-pointer flex content-center justify-center items-center"
      >
        <RedirectIcon className="h-4 w-4" fillColor="#005098" />
        {` ${value}`}
      </a>
    );
  };

  const renderLeadStatus = () => (
    <TableCell
      key={uniqueId('table-data-column_')}
      title={value}
      className={clsx('remove-border-bottom remove-padding', [
        row.isRejected
          ? classes.statusGray
          : noneRejectedStatus(row.rejections),
      ])}
    >
      {value}
    </TableCell>
  );

  const renderDefault = () =>
    (currentLocale === 'th' ? value?.shortnameTh : value?.shortnameEn) || value;

  switch (id) {
    case 'status':
      return renderStatus();
    case 'file':
      return renderFile();
    case 'leadId':
      return isRedirectable ? renderRedirect() : renderDefault();
    case 'leadStatus':
      return tableType === 'all-leads' ? renderLeadStatus() : renderDefault();
    default:
      return renderDefault();
  }
}
