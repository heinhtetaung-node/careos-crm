import {
  TableHead,
  TableRow,
  TableCell as MuiTableCell,
  TableSortLabel,
} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import { createStyles, withStyles } from '@material-ui/styles';
import React from 'react';

import { StickyTableCell } from 'presentation/components/table/TableStyledComponent';
import withIcon from 'presentation/HOCs/WithIconHOC';
import { getString } from 'presentation/theme/localization';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

import { Column } from './helper';
import { TableCellContent } from './index.styles';

type IProp = {
  columnSettings: Column[];
  isDisableExpand: boolean | undefined;
  showCustomer?: boolean;
  showChassisNumber?: boolean;
  handleColumnSort?: (field: string) => void;
};

const headerOriginalLables = [
  'text.orderId',
  'text.policyId',
  'leadDetailFields.orderId',
  'tableListing.timeSinceQCApproved',
  'text.qcStatus',
];

const TableCell = withStyles(() =>
  createStyles({
    root: {
      '& span.text-ellipsis': {
        display: '-webkit-box',
        overflow: 'hidden',
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': 'vertical',
      },
    },
  })
)(MuiTableCell);

function TableHeader({
  columnSettings,
  isDisableExpand,
  showCustomer = true,
  showChassisNumber = false,
  handleColumnSort = () => null,
}: IProp) {
  const formatTableHeader = (label: string) => {
    if (headerOriginalLables.includes(label)) {
      return getString(label);
    }
    return capitalizeFirstLetter(getString(label));
  };

  const showTableHeaderCellContent = (column: Column) => {
    if (column.id === 'insuredPerson') {
      return (
        <TableCellContent>
          <span>{formatTableHeader(column.label)}</span>
          {showCustomer && <span>{`(${getString('text.customer')})`}</span>}
        </TableCellContent>
      );
    }

    if (column.id === 'licensePlate') {
      return (
        <TableCellContent>
          <span>{formatTableHeader(column.label)}</span>
          {showChassisNumber && <span>{getString('text.chassisNumber')}</span>}
        </TableCellContent>
      );
    }

    return formatTableHeader(column.label);
  };
  return (
    <TableHead data-testid="table-header">
      <TableRow>
        <StickyTableCell>
          <TableCell
            component="div"
            className="remove-border-bottom remove-padding"
          />
        </StickyTableCell>

        {/* Empty cell for collapse icon */}
        {!isDisableExpand && <TableCell />}

        {columnSettings.map((column: Column) => (
          <TableCell
            key={column.id}
            align={column.align}
            style={{ minWidth: column.minWidth }}
          >
            {column.isNotSorting ? (
              showTableHeaderCellContent(column)
            ) : (
              <TableSortLabel
                data-testid="table-sort-label"
                active={column.sorting !== undefined}
                direction={column.sorting === 'asc' ? 'desc' : 'asc'}
                onClick={() => {
                  handleColumnSort(column.id);
                }}
                style={{ minWidth: column.minWidth }}
                hideSortIcon={column.isNotSorting}
                IconComponent={
                  column.sorting === 'none'
                    ? withIcon(SyncAltIcon)
                    : ArrowUpwardIcon
                }
              >
                <span className="text-ellipsis">
                  {showTableHeaderCellContent(column)}
                </span>
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;
