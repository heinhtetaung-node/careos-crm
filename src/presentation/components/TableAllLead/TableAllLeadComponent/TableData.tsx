import { FolderOpenIcon, PlayIcon } from '@alphafounders/icons';
import { TableCell, TableRow, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { uniqueId } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';

import CopyToClipboard from 'presentation/components/CopyToClipboard';
import { IData } from 'presentation/components/DataTable/MyLeads/DataTableMyLeadHelper';
import {
  Checkbox,
  StickyTableCell,
} from 'presentation/components/table/TableStyledComponent';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';

import { Column } from '../TableAllLead.helper';
import { store } from 'presentation/redux/store';

interface IProps {
  leadData: any;
  page: number;
  rowsPerPage: number;
  tableType: string;
  changeCheckedItem: (
    event: React.ChangeEvent<HTMLInputElement>,
    item: IData
  ) => void;
  handleVoiceModal: (payload: string) => void;
  configTable: Column[];
}

const useStyles = makeStyles({
  statusGreen: {
    color: '#1AA886',
    '&:before': {
      content: '""',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: '2px solid #1AA886',
      display: 'inline-block',
      margin: '-1px 8px',
    },
  },
  statusOrange: {
    color: '#FF9D00',
    '&:before': {
      content: '""',
      width: '12px',
      height: '12px',
      'border-radius': '50%',
      border: '2px solid #FF9D00',
      display: 'inline-block',
      margin: '-1px 8px',
    },
  },
  statusGray: {
    color: '#A9A9A9',
    '&:before': {
      content: '""',
      width: '12px',
      height: '12px',
      'border-radius': '50%',
      border: '2px solid #A9A9A9',
      display: 'inline-block',
      margin: '-1px 8px',
    },
  },
});

const TableData: React.FC<IProps> = ({
  leadData,
  page,
  rowsPerPage,
  tableType,
  changeCheckedItem,
  configTable,
  handleVoiceModal,
}) => {
  const classes = useStyles();
  const noneRejectedStatus = (rejections: any[]) => {
    const isPending = !!rejections.find((item) => !item.decideTime);
    return isPending ? classes.statusOrange : classes.statusGreen;
  };
  const globalProduct = (store.getState() as any).typeSelectorReducer
    .globalProductSelectorReducer.data;

  return leadData
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((row: any) => (
      <TableRow
        key={row.leadDetailId}
        className="hover-row"
        hover
        role="checkbox"
        tabIndex={-1}
      >
        <StickyTableCell>
          {tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT ||
          tableType === TABLE_LEAD_TYPE.LEAD_REJECTION ? (
            <TableCell component="div" className="remove-padding">
              <Checkbox
                disabled={row.optOutCalls}
                checked={row.isChecked}
                onChange={(event) => {
                  changeCheckedItem(event, row);
                }}
                data-cy="checkbox-lead"
              />
            </TableCell>
          ) : null}
          <TableCell
            align="center"
            component="div"
            className="remove-padding pl-[36px]"
          >
            <Link
              to={`${
                globalProduct === 'products/health-insurance' ? '/health' : ''
              }/leads/${row.leadDetailId}`}
              target="_blank"
            >
              <FolderOpenIcon fontSize="large" />
            </Link>
          </TableCell>
          {tableType === TABLE_LEAD_TYPE.LEAD_REJECTION ? (
            <TableCell
              align="center"
              component="div"
              className="remove-padding"
              data-testid="voice-modal-btn"
              onClick={() => {
                handleVoiceModal(row.leadDetailId);
              }}
            >
              <PlayIcon fontSize="large" />
            </TableCell>
          ) : null}
        </StickyTableCell>

        {configTable.map((column: any) => {
          const value = row[column.id];

          if (column.id === 'leadStatus') {
            return (
              <TableCell
                key={uniqueId('table-data-column_')}
                align={column.align}
                title={value}
                className={
                  row.isRejected
                    ? classes.statusGray
                    : noneRejectedStatus(row.rejections)
                }
              >
                {value}
                {column.customField && column.icon}
              </TableCell>
            );
          }
          if (column.id === 'leadId') {
            return (
              <TableCell
                key={uniqueId('data-table-mylead-column_')}
                align={column.align}
                title={column.noTooltip ? '' : value}
              >
                <CopyToClipboard text={value} />
              </TableCell>
            );
          }

          return (
            <TableCell
              key={uniqueId('table-data-rejected_')}
              align={column.align}
              title={value}
              className={clsx({
                'whitespace-normal':
                  column.id === 'rejectedDate' ||
                  column.id === 'rejectionReason',
                'whitespace-nowrap':
                  column.id !== 'rejectedDate' &&
                  column.id !== 'rejectionReason',
              })}
            >
              {value}
              {column.customField && column.icon}
            </TableCell>
          );
        })}
      </TableRow>
    ));
};

export default TableData;
