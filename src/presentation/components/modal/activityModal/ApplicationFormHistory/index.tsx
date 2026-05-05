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
import React, { useMemo } from 'react';

import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';

import { useStylesCommunication } from '../CommunicationTable';
import Copy from '../PaymentHistory/copyButton';
import { displayTimestamp } from '../PaymentHistory/helper';
import { useFetchSMSesQuery } from 'data/slices/leadDetails/smsSlice';

function ApplicationFormHistory({ id }: { id: string }) {
  const classes = useStylesCommunication();

  const { data, isLoading } = useFetchSMSesQuery({
    leadId: id,
  });

  const renderCopyIcon = (row: any) => {
    if (row?.appFormLink && row.appFormLink !== '') {
      return (
        <Copy
          {...row}
          messageText={getString('text.copyMessageContract')}
          copyText={row.appFormLink}
        />
      );
    }
    return <span className="flex items-center justify-center no-link">-</span>;
  };

  const renderClickableLink = (row: any) => {
    if (row?.appFormLink) {
      return (
        <span>
          {addLink(
            row.appFormLink,
            row.appFormLink.match(/https?:\/\/[^\s]+/g)?.[0]
          )}
        </span>
      );
    }
    return <span>-</span>;
  };

  const formattedAppFormHistory = useMemo(
    () =>
      data?.smses
        ?.filter((sms: any) => sms.title === 'application-form')
        .map((history: any, index: number) => ({
          ...history,
          id: index + 1,
          createTime: history.createTime,
          appFormLink: history.message,
        })),
    [data?.smses]
  );

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
      field: 'applicationFormLink',
      headerName: getString('text.applicationFormLink'),
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
        <Table aria-label="simple table" className="table-fixed">
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

          {isLoading || isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Spinner />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : formattedAppFormHistory?.length ? (
            <TableBody data-testid="contract-history-table-body-row">
              {formattedAppFormHistory.map((item: any) => (
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
              <TableCell align="center" colSpan={columns.length}>
                {getString('text.noData')}
              </TableCell>
            </TableRow>
          )}
        </Table>
      </TableContainer>
    </Grid>
  );
}

export default ApplicationFormHistory;
