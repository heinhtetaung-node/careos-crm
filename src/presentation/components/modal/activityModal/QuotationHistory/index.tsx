import {
  useMediaQuery,
  useTheme,
  Grid,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useMemo } from 'react';

import { useGetQuotationHistoryQuery } from 'data/slices/leadDetailSlices/quotationHistorySlice';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

import Download from './downloadButton';
import { displayTimestamp } from './helper';

import { useStylesCommunication } from '../CommunicationTable';

const useStyles = makeStyles({
  centerText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function QuotationHistory({ id }: { id?: string }) {
  const classes = useStylesCommunication();
  const classesNew = useStyles();
  const { breakpoints } = useTheme();
  const flexibleWidth = useMediaQuery(breakpoints.up('lg'));

  const { data: quotationHistory, isLoading: quotationHistoryLoading } =
    useGetQuotationHistoryQuery(id ?? skipToken, {
      refetchOnMountOrArgChange: true,
    });

  const handleDownload = (documentName: string) => {
    downloadFileFromBlobURL(documentName);
  };

  const renderDownloadIcon = (row: any) => {
    if (row?.document && row.document !== '') {
      return <Download {...row} onClick={handleDownload} />;
    }
    return <span className={classesNew.centerText}>-</span>;
  };

  const renderClickableLink = (row: any) => {
    if (row?.link) {
      return (
        <a href={row.link} target="_blank" rel="noopener noreferrer">
          {row.link}
        </a>
      );
    }
    return <span>-</span>;
  };

  const formattedQuotationHistory = useMemo(
    () =>
      quotationHistory?.quotations.map((history, index) => ({
        ...history,
        id: index + 1,
      })),
    [quotationHistory]
  );

  const columns = [
    {
      field: 'download',
      flex: flexibleWidth ? 1 : undefined,
      width: 50,
      disableClickEventBubbling: true,
      renderCell: renderDownloadIcon,
      renderJSX: true,
    },
    {
      field: 'id',
      headerName: getString('text.noDots'),
      flex: flexibleWidth ? 1 : undefined,
      width: 100,
      disableClickEventBubbling: true,
    },
    {
      field: 'createTime',
      headerName: getString('text.quotationCreateTime'),
      flex: flexibleWidth ? 2.5 : undefined,
      width: 250,
      valueFormatter: ({ createTime }: any) =>
        displayTimestamp({ value: createTime }),
      disableClickEventBubbling: true,
    },
    {
      field: 'link',
      headerName: getString('text.quotationLink'),
      flex: flexibleWidth ? 3 : undefined,
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderClickableLink,
      renderJSX: true,
    },
    {
      field: 'expireTime',
      headerName: getString('text.quotationExpireTime'),
      flex: flexibleWidth ? 2 : undefined,
      width: 200,
      valueFormatter: ({ expireTime }: any) =>
        displayTimestamp({ value: expireTime }),
      disableClickEventBubbling: true,
    },
  ];

  return (
    <Grid
      item
      container
      xs={12}
      md={12}
      data-testid="quotation-history-table"
      className="quotation-history"
    >
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow data-testid="quotation-history-table-headers-row">
              {columns.map((item) => (
                <TableCell
                  width={item.width}
                  key={item.headerName}
                  className={classes.tHead}
                  data-testid={`quotation-history-table-${item.field}`}
                >
                  {item.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {quotationHistoryLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : formattedQuotationHistory?.length ? (
            formattedQuotationHistory.map((item: any) => (
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
            ))
          ) : (
            <TableRow className={classes.tRow}>
              <TableCell align="center" colSpan={columns.length + 1}>
                {getString('text.noData')}
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
    </Grid>
  );
}

export default QuotationHistory;
