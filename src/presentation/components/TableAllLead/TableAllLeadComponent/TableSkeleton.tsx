/* eslint-disable react/forbid-component-props */
import { FolderOpenIcon } from '@alphafounders/icons';
import { TableBody, TableCell as MuiTableCell } from '@material-ui/core';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { Skeleton } from '@material-ui/lab';
import { createStyles, withStyles } from '@material-ui/styles';
import { uniqueId } from 'lodash';
import React from 'react';

import { IconWrapper } from 'presentation/components/OrderListingTable/index.styles';
import { TableRow } from 'presentation/components/OrderListingTable/TableData';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { Color } from 'presentation/theme/variants';

import { StickyTableCell } from '../../table/TableStyledComponent';
import { Column, shimmerArray } from '../TableAllLead.helper';

interface IProps {
  page: number;
  rowsPerPage: number;
  tableType: string;
  pageState: any;
  configTable: Column[];
  isOrderListingTable?: boolean;
}

const TableCell = withStyles(() =>
  createStyles({
    root: {
      paddingLeft: '36px !important',
    },
  })
)(MuiTableCell);

function TableSkeleton({
  page,
  rowsPerPage,
  tableType,
  pageState,
  configTable,
  isOrderListingTable = false,
}: IProps) {
  return (
    <TableBody data-testid="table-skeleton">
      {shimmerArray(pageState.pageSize).length ? (
        shimmerArray(pageState.pageSize)
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row: any) => (
            <TableRow
              className="hover-row"
              hover
              role="checkbox"
              tabIndex={-1}
              key={uniqueId('table-skeleton-row_')}
            >
              <StickyTableCell>
                {tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT ? (
                  <TableCell component="div" className="remove-padding">
                    <Skeleton animation="wave" className="skeleton-box" />
                  </TableCell>
                ) : null}
                {isOrderListingTable && (
                  <TableCell
                    className="remove-padding"
                    align="center"
                    component="div"
                  >
                    <IconWrapper>
                      <StarBorderIcon color="primary" />
                    </IconWrapper>
                  </TableCell>
                )}
                <TableCell
                  className="remove-padding"
                  align="center"
                  component="div"
                >
                  {isOrderListingTable ? (
                    <IconWrapper showBackground>
                      <FolderSharedIcon style={{ color: Color.WHITE }} />
                    </IconWrapper>
                  ) : (
                    <FolderOpenIcon fontSize="large" />
                  )}
                </TableCell>
              </StickyTableCell>

              {configTable.map((column: any) => {
                const value = row[column.id];
                return (
                  <TableCell
                    key={uniqueId('table-skeleton-column_')}
                    align={column.align}
                    title={value}
                  >
                    <Skeleton animation="wave" className="skeleton-box" />
                  </TableCell>
                );
              })}
            </TableRow>
          ))
      ) : (
        <TableRow>null</TableRow>
      )}
    </TableBody>
  );
}

export default TableSkeleton;
