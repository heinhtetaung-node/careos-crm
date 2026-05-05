import {
  Grid,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';

import { useLazyGetPaymentHistoryQuery } from 'data/slices/leadDetailSlices/paymentHistorySlice';
import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';
import CustomPagination from 'presentation/components/controls/CustomPagination';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';

import Copy from './copyButton';
import { displayTimestamp } from './helper';

import { ITEM_PER_PAGE_LIST } from '../activityTable/activityTable.helper';
import { useStylesCommunication } from '../CommunicationTable';

function PaymentHistory({ id }: { id?: string }) {
  const classes = useStylesCommunication();
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageTokens, setPageTokens] = useState<any>({});

  const [
    getPaymentHistory,
    { data: paymentHistory, isLoading: paymentHistoryLoading },
  ] = useLazyGetPaymentHistoryQuery();

  useEffect(() => {
    let nextToken = paymentHistory?.nextPageToken;
    // since we don't have previousToken from backend we just store token in state
    if (currentPage in pageTokens) {
      // use existing token for go previous items Case
      nextToken = pageTokens[currentPage];
    } else {
      // add new token to state for go next itmes Case
      setPageTokens({
        ...pageTokens,
        [currentPage]: nextToken || '',
      });
    }
    const payload = {
      leadId: id,
      nextPageToken: nextToken,
      perPage,
    };
    getPaymentHistory(payload);
  }, [id, perPage, getPaymentHistory, currentPage]);

  const renderCopyIcon = (row: any) => {
    if (row?.paymentLink && row.paymentLink !== '') {
      return (
        <Copy
          {...row}
          copyText={row.message}
          messageText={getString('text.copyMessageSuccess')}
        />
      );
    }
    return <span className="flex items-center justify-center no-link">-</span>;
  };

  const renderClickableLink = (row: any) => {
    if (row?.paymentLink) {
      return (
        <span className="mr-2">{addLink(row.message, row.paymentLink)}</span>
      );
    }
    return <span>-</span>;
  };

  const formattedPaymentHistory = useMemo(() => {
    const startCount = (currentPage - 1) * perPage;
    return paymentHistory?.paymentRecords.map((history, index) => ({
      ...history,
      id: index + 1 + startCount,
    }));
  }, [paymentHistory, perPage, currentPage]);

  const columns = [
    {
      field: 'copy',
      flex: 1,
      width: 20,
      disableClickEventBubbling: true,
      renderCell: renderCopyIcon,
      renderJSX: true,
    },
    {
      field: 'id',
      headerName: getString('text.noDots'),
      flex: 1,
      width: 50,
      disableClickEventBubbling: true,
    },
    {
      field: 'createTime',
      headerName: getString('text.paymentCreateTime'),
      flex: 1,
      width: 100,
      valueFormatter: ({ createTime }: any) =>
        displayTimestamp({ value: createTime }),
      disableClickEventBubbling: true,
    },
    {
      field: 'paymentLink',
      headerName: getString('text.paymentLink'),
      flex: 1,
      width: 420,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderClickableLink,
      renderJSX: true,
    },
    {
      field: 'expiryTime',
      headerName: getString('text.paymentExpireTime'),
      flex: 1,
      width: 100,
      valueFormatter: ({ expiryTime }: any) =>
        displayTimestamp({ value: expiryTime }),
      disableClickEventBubbling: true,
    },
    {
      field: 'status',
      headerName: getString('text.paymentHistoryStatus'),
      flex: 1,
      width: 100,
      disableClickEventBubbling: true,
      valueFormatter: ({ status }: { status: string }) =>
        status === 'ACTIVE' ? getString('text.paymentHistoryStatusSent') : '',
    },
  ];

  return (
    <Grid
      item
      container
      xs={12}
      md={12}
      data-testid="payment-history-table"
      className="payment-history"
    >
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          aria-label="simple table"
          className={clsx(
            formattedPaymentHistory &&
              formattedPaymentHistory.length > 0 &&
              'table-fixed'
          )}
        >
          <TableHead>
            <TableRow data-testid="payment-history-table-headers-row">
              {columns.map((item) => (
                <TableCell
                  width={item.width}
                  key={item.headerName}
                  className={classes.tHead}
                  data-testid={`payment-history-table-${item.field}`}
                >
                  {item.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {paymentHistoryLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : formattedPaymentHistory?.length ? (
            <TableBody data-testid="payment-history-table-body-row">
              {formattedPaymentHistory.map((item: any) => (
                <TableRow className={classes.tRow} key={item.createTime}>
                  {columns.map((column: any) =>
                    column.renderJSX ? (
                      <TableCell>
                        {column.renderCell.bind(null, item)()}
                      </TableCell>
                    ) : column.valueFormatter ? (
                      <TableCell>
                        {column.valueFormatter.bind(null, item)()}
                      </TableCell>
                    ) : (
                      <TableCell>{item[column.field]}</TableCell>
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableRow className={classes.tRow}>
              <TableCell align="center" colSpan={columns.length + 1}>
                {getString('text.noData')}
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
      <div
        className={classes.pagination}
        data-testid="payment-history-table-pagination"
      >
        <CustomPagination
          page={currentPage}
          perPage={perPage}
          pageSizes={ITEM_PER_PAGE_LIST}
          nextToken={paymentHistory?.nextPageToken}
          onChangePage={(val) => {
            setCurrentPage(val);
          }}
          onChangePerPage={(val) => {
            setPerPage(val);
            setCurrentPage(1);
          }}
          isLoading={paymentHistoryLoading}
          // totalItem={paymentHistory.totalCount}
        />
      </div>
    </Grid>
  );
}

export default PaymentHistory;
