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

import { useLazyNewGetContractHistoryQuery } from 'data/slices/leadDetailSlices/contractHistorySlice';
import { useGetLeadContractDetailsQuery } from 'data/slices/leadSlice';
import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';
import CustomPagination from 'presentation/components/controls/CustomPagination';
import Spinner from 'presentation/components/Spinner';
import { showContractMessage } from 'presentation/pages/car-insurance/CreateContractPage/types';
import { getString } from 'presentation/theme/localization';

import { ITEM_PER_PAGE_LIST } from '../activityTable/activityTable.helper';
import { useStylesCommunication } from '../CommunicationTable';
import Copy from '../PaymentHistory/copyButton';
import { displayTimestamp } from '../PaymentHistory/helper';

function ContractHistory({ id }: { id: string }) {
  const classes = useStylesCommunication();
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isLoading } = useGetLeadContractDetailsQuery(id);
  const [pageTokens, setPageTokens] = useState<any>({});

  const [
    getContractHistory,
    { data: contractHistory, isLoading: contractHistoryLoading },
  ] = useLazyNewGetContractHistoryQuery();

  useEffect(() => {
    let nextToken = contractHistory?.nextPageToken;
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
    getContractHistory(payload);
  }, [id, perPage, getContractHistory, currentPage]);

  const renderCopyIcon = (row: any) => {
    if (row?.contractLink && row.contractLink !== '') {
      return (
        <Copy
          {...row}
          messageText={getString('text.copyMessageContract')}
          copyText={showContractMessage(
            data?.customerInformation?.customerName || '',
            data?.customerInformation?.humanId || '',
            data?.quoteInformation?.licensePlate || '',
            row.contractLink
          )}
        />
      );
    }
    return <span className="flex items-center justify-center no-link">-</span>;
  };

  const renderClickableLink = (row: any) => {
    if (row?.contractLink) {
      return (
        <span>
          {addLink(
            showContractMessage(
              data?.customerInformation?.customerName || '',
              data?.customerInformation?.humanId || '',
              data?.quoteInformation?.licensePlate || '',
              row.contractLink
            ),
            row.contractLink
          )}
        </span>
      );
    }
    return <span>-</span>;
  };

  const formattedContractHistory = useMemo(() => {
    const startCount = (currentPage - 1) * perPage;

    return contractHistory?.contracts?.map((history, index) => ({
      ...history,
      id: index + 1 + startCount,
      createTime: history.createdTime,
      contractLink: history.link,
    }));
  }, [contractHistory, perPage, currentPage]);

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
      width: 120,
      valueFormatter: ({ createTime }: any) =>
        displayTimestamp({ value: createTime }),
      disableClickEventBubbling: true,
    },
    {
      field: 'contractLink',
      headerName: getString('text.contractLink'),
      flex: 1,
      width: 440,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderClickableLink,
      renderJSX: true,
    },
    {
      field: 'expireTime',
      headerName: getString('text.paymentExpireTime'),
      flex: 1,
      width: 100,
      align: 'center',
      valueFormatter: ({ expireTime }: any) =>
        expireTime ? displayTimestamp({ value: expireTime }) : '-',
      disableClickEventBubbling: true,
    },
  ];

  return (
    <Grid
      item
      container
      xs={12}
      md={12}
      data-testid="contract-history-table"
      className="contract-history"
    >
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          aria-label="simple table"
          className={clsx(
            formattedContractHistory &&
              formattedContractHistory.length > 0 &&
              'table-fixed'
          )}
        >
          <TableHead>
            <TableRow data-testid="contract-history-table-headers-row">
              {columns.map((item) => (
                <TableCell
                  width={item.width}
                  key={item.headerName}
                  className={clsx(
                    classes.tHead,
                    item.field === 'expireTime' && 'text-center'
                  )}
                  data-testid={`contract-history-table-${item.field}`}
                >
                  {item.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {contractHistoryLoading || isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : formattedContractHistory?.length ? (
            <TableBody data-testid="contract-history-table-body-row">
              {formattedContractHistory.map((item: any) => (
                <TableRow className={classes.tRow} key={item?.createTime}>
                  {columns.map((column: any) =>
                    column.renderJSX ? (
                      <TableCell>
                        {column.renderCell.bind(null, item)()}
                      </TableCell>
                    ) : column.valueFormatter ? (
                      <TableCell align={column?.align}>
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
        data-testid="contract-history-table-pagination"
      >
        <CustomPagination
          page={currentPage}
          perPage={perPage}
          pageSizes={ITEM_PER_PAGE_LIST}
          nextToken={contractHistory?.nextPageToken}
          onChangePage={(val) => {
            setCurrentPage(val);
          }}
          onChangePerPage={(val) => {
            setPerPage(val);
            setCurrentPage(1);
          }}
          isLoading={contractHistoryLoading}
          // totalItem={contractHistory.totalCount}
        />
      </div>
    </Grid>
  );
}

export default ContractHistory;
