import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/styles';
import _find from 'lodash/find';
import React, { PropsWithChildren } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useGetIntegrationResultQuery } from 'data/slices/insurerIntegrationSlice';
import { IntegrationResultTransformResponse } from 'data/slices/insurerIntegrationSlice/types';
import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import { getString } from 'presentation/theme/localization';

import Spinner from '../Spinner';

const columns = [
  {
    id: 'no',
    title: 'order.historyLog.submission.no',
  },
  {
    id: 'requestDate',
    title: 'order.historyLog.submission.requestDate',
  },
  {
    id: 'action',
    title: 'order.historyLog.submission.action',
  },
  {
    id: 'status',
    title: 'order.historyLog.submission.status',
  },
  {
    id: 'responseMessage',
    title: 'order.historyLog.submission.responseMessage',
    minWidth: 300,
  },
  {
    id: 'responseDate',
    title: 'order.historyLog.submission.responseDate',
  },
];

const TableCell = withStyles({
  root: {
    '&.MuiTableCell-body:not(:nth-child(1))': {
      overflowWrap: 'break-word',
    },
  },
})(MuiTableCell);

const timeMap = {
  requestDate: 'requestTime',
  responseDate: 'responseTime',
};

function RenderTableBody({
  submissions,
  isFetching,
  children,
  isError,
}: PropsWithChildren<{
  submissions: IntegrationResultTransformResponse['submissions'] | undefined;
  isFetching: boolean;
  isError: boolean;
}>) {
  if (isFetching) {
    return (
      <TableBody>
        <TableRow>
          <TableCell>
            <Spinner />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  if (isError) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center">
            {getString('order.historyLog.errorMessage')}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {submissions?.length === 0 ? (
        <TableRow>
          <TableCell align="center" colSpan={6}>
            {getString('text.noData')}
          </TableCell>
        </TableRow>
      ) : (
        children
      )}
    </TableBody>
  );
}

export default function SubmissionTable() {
  const { orderId } = useParams();
  const { pathname } = useLocation();
  const { data } = useGetOrderItemsQuery({ orderId: orderId! });

  const humanId = pathname.split('/')[4];

  // get specific item regarding to humanId.
  const { item: { name: policy = '' } = {} } =
    _find(data?.items, ({ item }) => item.humanId === humanId) || {};
  const {
    data: integrationResult,
    isFetching,
    isError,
  } = useGetIntegrationResultQuery({ policy }, { skip: !policy });

  return (
    <TableContainer data-testid="submission-table">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{getString(column.title)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <RenderTableBody
          isError={isError}
          isFetching={isFetching}
          submissions={integrationResult?.submissions}
        >
          {integrationResult?.submissions.map((submission) => (
            <TableRow key={submission.name}>
              {columns.map((column) => {
                const value = submission[column.id as keyof typeof submission];
                if (
                  column.id === 'requestDate' ||
                  column.id === 'responseDate'
                ) {
                  const time =
                    submission[timeMap[column.id] as keyof typeof submission];

                  return (
                    <TableCell
                      style={{ minWidth: `${column.minWidth ?? ''}px` }}
                      key={column.id}
                    >
                      <div>{value}</div>
                      <div>({time})</div>
                    </TableCell>
                  );
                }
                return (
                  <TableCell
                    style={{ minWidth: `${column.minWidth ?? ''}px` }}
                    key={column.id}
                  >
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </RenderTableBody>
      </Table>
    </TableContainer>
  );
}
