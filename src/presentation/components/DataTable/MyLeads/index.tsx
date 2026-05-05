/* eslint-disable react/forbid-component-props */
/* eslint-disable react-hooks/exhaustive-deps */
import { StarIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import {
  Card,
  CardContent,
  Checkbox,
  TableSortLabel,
  withStyles,
} from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import NotificationsIcon from '@material-ui/icons/Notifications';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import Skeleton from '@material-ui/lab/Skeleton';
import { createStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { uniqueId } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import withIcon from 'presentation/HOCs/WithIconHOC';

import { getShimmerArray, IData } from './DataTableMyLeadHelper';

import WithTableScrollHoc from '../../../HOCs/WithTableScroll';
import { getString } from '../../../theme/localization';
import CopyToClipboard from '../../CopyToClipboard';

import './DataTableMyLead.scss';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  cardContent: {
    padding: 0,
    paddingBottom: '0 !important',
  },
  container: {
    maxHeight: 440,
  },
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
});

const StickyTableCell = withStyles((theme) => ({
  head: {
    left: 0,
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 2,
  },
  body: {
    backgroundColor: '#fff',
    left: 0,
    position: 'sticky',
    textAlign: '-webkit-center',
  } as any,
}))(TableCell);

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      border: `1px solid ${theme.palette.background.paper}`,
      fontSize: '9px',
      fontWeight: 'normal',
      backgroundColor: '#ea4548',
      height: '18px',
      lineHeight: '14px',
      padding: '1px 3px 1px 4px',
      borderRadius: '15px',
      color: '#ffffff',
    },
  })
)(Badge);

enum CHECKED_ROW {
  SOME_ITEMS = 'SOME_ITEM',
  ALL = 'ALL',
  NONE = 'NONE',
}

type HumanIds = {
  id: string;
  humanId: string;
};

type NotificationBadgeProps = {
  row: {
    highlightColor?: string;
    leadDetailId: string;
    unreadMessage: number;
  };
  isHighlightedLeadEnabled: boolean;
};

function NotificationBadge({
  isHighlightedLeadEnabled,
  row,
}: Readonly<NotificationBadgeProps>) {
  return (
    <TableCell
      className={clsx('sticky-cell sticky-cell-body text-center', {
        'bg-highlighted-blue':
          isHighlightedLeadEnabled && row.highlightColor === 'blue',
        'bg-white': !isHighlightedLeadEnabled || row.highlightColor !== 'blue',
      })}
      key={uniqueId('data-table-mylead-column-lead-column_')}
    >
      <Link
        to={`/leads/${row.leadDetailId}?message=true`}
        className="table-cell-link unread-message"
        target="_blank"
      >
        <StyledBadge badgeContent={row.unreadMessage} max={999}>
          <NotificationsIcon />
        </StyledBadge>
      </Link>
    </TableCell>
  );
}

export function DataTable({
  columns,
  originalData,
  perPage,
  isLoading,
  sortTable,
  handleDisableBtn,
  tableRefContainer,
  starButtonAction,
  updateSingleImportant,
  rows,
  setRows,
}: any) {
  const classes = useStyles();
  const [selectedAll, setSelectedAll] = useState<CHECKED_ROW>(CHECKED_ROW.NONE);

  const isHighlightedLeadEnabled = false;

  const getItemChecked = useCallback(
    (item: IData) => {
      handleDisableBtn(item);
    },
    [handleDisableBtn]
  );
  const setCheckedRow = (checked: CHECKED_ROW) => {
    let newRows = [...rows];
    if (checked === CHECKED_ROW.ALL) {
      newRows = newRows.map((item) => ({
        ...item,
        isChecked: true,
      }));
    }
    if (checked === CHECKED_ROW.NONE) {
      newRows = newRows.map((item) => ({
        ...item,
        isChecked: false,
      }));
    }
    setRows(newRows);
  };

  const noneRejectedStatus = (rejections: any[]) => {
    const isPending = !!rejections?.find((item) => !item.decideTime);
    return isPending ? classes.statusOrange : classes.statusGreen;
  };

  const handleSelectedCheckbox = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedAll(CHECKED_ROW.ALL);
      setCheckedRow(CHECKED_ROW.ALL);
    } else {
      setSelectedAll(CHECKED_ROW.NONE);
      setCheckedRow(CHECKED_ROW.NONE);
    }
  };
  const handleChangeCheckboxItem = (item: IData) => {
    if (!isLoading) {
      let passedItem = { ...item };
      const result = rows.map((row: IData) => {
        const newItem = { ...row };
        if (newItem.id === item.id) {
          newItem.isChecked = !newItem.isChecked;
          passedItem = { ...newItem };
          return newItem;
        }
        return newItem;
      });
      const countCheckedRows = result.filter((lead: IData) => lead.isChecked);
      if (countCheckedRows.length) {
        if (countCheckedRows.length === rows.length) {
          setSelectedAll(CHECKED_ROW.ALL);
        } else {
          setSelectedAll(CHECKED_ROW.SOME_ITEMS);
        }
      } else {
        setSelectedAll(CHECKED_ROW.NONE);
      }
      getItemChecked(passedItem);
      setRows(result);
    }
  };

  const handleSingleImportant = (
    leadId: string,
    isImportant: boolean,
    humanIds: HumanIds[]
  ) => {
    const body = {
      ids: [leadId],
      important: isImportant,
      humanIds,
    };
    updateSingleImportant(body);
  };

  const handleClickImportant = (itemId: string) => {
    if (!isLoading) {
      setSelectedAll(CHECKED_ROW.NONE);
      let newRows = [...rows];
      newRows = newRows.map((item) => {
        const newItem = { ...item };
        newItem.isChecked = false;
        if (item.fullLeadId === itemId) {
          newItem.important = !newItem.important;
          const humanIds = [
            {
              humanId: newItem.leadId,
              id: newItem.fullLeadId,
            },
          ];
          handleSingleImportant(itemId, newItem.important, humanIds);
        }
        return newItem;
      });
      setRows(newRows);
    }
  };
  useEffect(() => {
    setRows(originalData);
    setSelectedAll(CHECKED_ROW.NONE);
  }, [originalData]);

  useEffect(() => {
    if (!originalData.length) {
      const rowItems = getShimmerArray(perPage);
      const fakeRow: IData[] = [];
      rowItems.forEach(() => {
        const newRow: IData = {};
        columns.forEach((column: IData) => {
          newRow[column.id as string] = '';
        });
        fakeRow.push(newRow);
      });
      setRows(fakeRow);
    }
  }, []);

  useEffect(() => {
    const getItemsChecked = rows.filter((item: IData) => item.isChecked);
    starButtonAction(getItemsChecked);
  }, [JSON.stringify(rows)]);

  const renderImportantStar = (row: any) => {
    if (isLoading) {
      return <Skeleton animation="wave" />;
    }
    if (row.important) {
      return (
        <div className="outline-none table-cell-center">
          <Button
            text=""
            icon={<StarIcon fillColor="white" />}
            className="table-cell-icon bg-primary rounded-[50%] p-2"
            onClick={() => handleClickImportant(row.fullLeadId)}
            data-testid={`lead-star-important-${row.leadId}`}
          />
        </div>
      );
    }
    return (
      <div className="outline-none table-cell-center">
        <StarBorderIcon
          className="table-cell-icon"
          onClick={() => handleClickImportant(row.fullLeadId)}
          data-testid={`lead-star-unimportant-${row.leadId}`}
        />
      </div>
    );
  };

  const renderCheckbox = () => {
    if (isLoading) {
      return <Skeleton animation="wave" />;
    }
    return selectedAll === CHECKED_ROW.SOME_ITEMS ? (
      <Checkbox
        indeterminate
        inputProps={{
          'aria-label': 'indeterminate checkbox',
        }}
        onChange={() => handleSelectedCheckbox(false)}
      />
    ) : (
      <Checkbox
        checked={selectedAll === CHECKED_ROW.ALL}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          handleSelectedCheckbox(event.target.checked);
        }}
      />
    );
  };

  return (
    <Card className="data-table-container" data-testid="myLeads-dataTable">
      <CardContent className={classes.cardContent}>
        <TableContainer className="table-scrollbar" ref={tableRefContainer}>
          <Table
            stickyHeader
            aria-label="sticky table"
            className="data-table-container__table"
          >
            <TableHead data-testid="table-head">
              <TableRow>
                <StickyTableCell>
                  <TableCell
                    component="div"
                    className="remove-border-bottom remove-padding sticky-table-cell"
                  >
                    {renderCheckbox()}
                  </TableCell>
                  <TableCell
                    component="div"
                    className="remove-border-bottom remove-padding sticky-table-cell"
                  />
                  <TableCell
                    component="div"
                    className="remove-border-bottom remove-padding sticky-table-cell"
                  />
                </StickyTableCell>
                {columns.map((column: any, index: number) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    className={
                      index === 0 ? 'sticky-cell sticky-cell-header' : ''
                    }
                  >
                    {column.disabled ? (
                      <span>{getString(column.label)}</span>
                    ) : (
                      <TableSortLabel
                        data-testid={`table-head-${column.id}`}
                        active={column.sort !== false}
                        direction={column.sorting === 'asc' ? 'desc' : 'asc'}
                        onClick={() => sortTable(column.id)}
                        IconComponent={
                          column.sorting === 'none'
                            ? withIcon(SyncAltIcon)
                            : ArrowUpwardIcon
                        }
                      >
                        {getString(column.label)}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody data-testid="myLead-table-body">
              {rows.length ? (
                rows.slice(0, perPage).map((row: any) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={uniqueId('data-table-mylead-row_')}
                    className={clsx('hover-row', {
                      'bg-highlighted-blue':
                        isHighlightedLeadEnabled &&
                        row.highlightColor === 'blue',
                    })}
                    data-testid="myLead-table-row"
                  >
                    <StickyTableCell
                      className={clsx({
                        'bg-highlighted-blue':
                          isHighlightedLeadEnabled &&
                          row.highlightColor === 'blue',
                      })}
                    >
                      <TableCell
                        component="div"
                        className="remove-border-bottom remove-padding sticky-table-cell"
                      >
                        {!isLoading ? (
                          <Checkbox
                            checked={row.isChecked}
                            onChange={() => handleChangeCheckboxItem(row)}
                            data-testid="myLead-table-row-checkbox"
                          />
                        ) : (
                          <Skeleton animation="wave" />
                        )}
                      </TableCell>
                      <TableCell
                        component="div"
                        className="remove-border-bottom remove-padding sticky-table-cell"
                        data-testid={`lead-star-${row.leadId}`}
                      >
                        {renderImportantStar(row)}
                      </TableCell>
                      <TableCell
                        component="div"
                        className="remove-border-bottom remove-padding sticky-table-cell"
                      >
                        <div className="table-cell-center">
                          <Link
                            to={`/leads/${row.leadDetailId}`}
                            className="table-cell-link"
                            target="_blank"
                          >
                            <FolderSharedIcon className="table-cell-icon" />
                          </Link>
                        </div>
                      </TableCell>
                    </StickyTableCell>
                    {columns.map((column: any, index: number) => {
                      const value = row[column.id] || '';
                      if (column.id === 'leadStatus') {
                        return (
                          <TableCell
                            key={uniqueId('data-table-mylead-column-lead_')}
                            align={column.align}
                            title={value}
                            className={noneRejectedStatus(row.rejections)}
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
                            {isLoading ? (
                              <Skeleton animation="wave" />
                            ) : (
                              <CopyToClipboard text={value} />
                            )}
                          </TableCell>
                        );
                      }
                      return index === 0 ? (
                        <NotificationBadge
                          row={{
                            highlightColor: row.highlightColor,
                            leadDetailId: row.leadDetailId,
                            unreadMessage: row.unreadMessage,
                          }}
                          isHighlightedLeadEnabled={isHighlightedLeadEnabled}
                        />
                      ) : (
                        <TableCell
                          key={uniqueId('data-table-mylead-column_')}
                          align={column.align}
                          title={column.noTooltip ? '' : value}
                          className={
                            column.breakSpace
                              ? 'colum-break-spaces'
                              : value.toString()
                          }
                        >
                          {isLoading ? (
                            <Skeleton animation="wave" />
                          ) : (
                            <>
                              {value}
                              {column.customField && column.icon}
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="left" colSpan={columns.length + 1}>
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export const DataTableMyLead = WithTableScrollHoc(React.memo(DataTable));
