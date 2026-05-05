import {
  DownloadFileIcon,
  BlueEditIcon as EditIcon,
  FolderOpenIcon,
} from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import {
  TableSortLabel,
  Card,
  CardContent,
  withStyles,
  Collapse,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import clsx from 'clsx';
import { uniqueId } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import withIcon from 'presentation/HOCs/WithIconHOC';

import WithTableScrollHoc from '../../HOCs/WithTableScroll';
import { getString } from '../../theme/localization';
import Checkbox from '../controls/Checkbox';
import SkeletonTableRow from '../leads/SkeletonTableRow';
import { RenderCustomValue } from './RenderCustomValue';

import './DataTable.scss';
import getApiEndpoint from 'utils/endpointHelper';

const DEFAULT_PER_PAGE_TABLE = 5;
const ITEM_PER_PAGE_LIST = [5, 10, 25];

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

const TableContainer = styled(MuiTableContainer)`
  &&& {
    .MuiTableCell-head {
      vertical-align: center;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .MuiTableSortLabel-root {
      vertical-align: top;
    }
    .MuiTableBody-root {
      .Mui-checked {
        color: ${(props) => props?.theme?.palette?.primary?.main};
      }
    }
  }
`;

function RenderIconCell({
  row,
  isDownloadable,
  onClickHandle,
  isSelectable,
  isRedirectable,
  selected,
  handleSelect,
  editClickHandle,
  isDisabled,
}: any) {
  if (isDownloadable) {
    return (
      <Button
        className="bg-primary rounded-[50%] p-2"
        disabled={isDisabled}
        text=""
        icon={
          <DownloadFileIcon
            className="cursor-pointer"
            fillColor="white"
            fontSize="large"
          />
        }
        id="data-download-btn"
        onClick={() => !isDisabled && onClickHandle(row)}
      />
    );
  }

  if (isSelectable) {
    if (isRedirectable && row?.status !== 'PENDING') return null;

    let checkCondition =
      typeof selected === 'string'
        ? selected === row.configId
        : selected.includes(row.configId);

    if (row?.childItems?.length > 0) {
      const selectedChildren = row.childItems.filter((child: any) =>
        selected.includes(child.childId)
      );
      checkCondition = selectedChildren.length === row.childItems.length;
    }

    return (
      <Checkbox
        label=""
        checked={checkCondition}
        onChange={() => handleSelect(row?.configId, row)}
        id="data-checkbox"
        disabled={row?.isNotSelectable}
      />
    );
  }

  if (isRedirectable) {
    const redirectUri = getApiEndpoint(`${row.id}`);
    return (
      // eslint-disable-next-line jsx-a11y/control-has-associated-label
      <a href={redirectUri} target="_blank" rel="noreferrer">
        <FolderOpenIcon fontSize="large" id="data-redirect" />
      </a>
    );
  }

  return (
    <EditIcon
      className="cursor-pointer"
      onClick={() => editClickHandle(row)}
      id="data-edit-btn"
      fontSize="large"
    />
  );
}

function TableLoadingSkeleton({
  columns,
  rows,
  isLoading,
}: Readonly<{
  columns: any[];
  rows: any[];
  isLoading: boolean;
}>) {
  if (!rows.length && !isLoading) {
    return (
      <TableRow>
        <TableCell
          id="data-no-data"
          align={columns.length > 15 ? 'left' : 'center'}
          colSpan={columns.length + 1}
        >
          <div className="flex w-48 justify-center items-center">
            {getString('text.noData')}
          </div>
        </TableCell>
      </TableRow>
    );
  }
  return (
    <SkeletonTableRow
      testId="data-table-skeleton"
      row={4}
      column={columns.length + 1}
    />
  );
}

function DataTable({
  disableEditIcon = false,
  columns,
  originalData,
  openEditModal,
  disabledEdit,
  isSelectable,
  selected,
  handleSelect,
  isCustomPaging,
  perPage,
  isLoading,
  isDownloadable,
  sortTable,
  tableRefContainer,
  customAction,
  canDownload,
  handleFailedPackageClick,
  checkDownloadable = () => true,
  ActionCellElements,
  isRedirectable, // to make column redirectable
  isExpandable = false,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  ExpandableComponent = null,
  ExpandableComponentParams = {},
  openIds = [],
  setOpenIds = () => true,
  tableType = undefined,
  fixedColumns = [],
  fontSize = null,
  paddingStyle = null,
  handleCustomClick = (id: string, currentScroll?: number) => {},
  scrollableHeight = null,
  clickedRow,
  currentScroll,
}: any) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PER_PAGE_TABLE);
  const [rows, setRows] = useState(originalData);

  const handleChangePage = (event: unknown, newPage: number) => {
    setOpenIds([]);
    setPage(newPage);
  };

  useMemo(() => {
    setRowsPerPage(perPage || DEFAULT_PER_PAGE_TABLE);
  }, [perPage]);

  useMemo(() => {
    setRows(originalData);
  }, [originalData]);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const editClickHandle = useCallback(
    (row: any) => {
      openEditModal(row);
    },
    [openEditModal]
  );

  const onClickHandle = useCallback(
    (row: { downloadLink: any }) => {
      customAction(row.downloadLink);
    },
    [customAction]
  );

  const showArrow = (id: string) => {
    if (!openIds.includes(id))
      return <KeyboardArrowRightIcon color="primary" />;
    return <KeyboardArrowDownIcon color="primary" />;
  };

  const expandChildComponent = (openId: string) => {
    const otherOpenIds = openIds.filter((id: any) => id !== openId);
    if (openIds.includes(openId)) {
      setOpenIds(otherOpenIds);
      return;
    }
    setOpenIds([...openIds, openId]);
  };

  const renderTableCell = (
    column: any,
    extraClass: Record<string, string> = {}
  ) => (
    <TableCell
      key={column.id}
      align={column.align}
      // eslint-disable-next-line react/forbid-component-props
      style={{
        minWidth: column.minWidth,
        ...(extraClass || {}),
      }}
      className={clsx([
        fontSize && `text-[${fontSize}]`,
        ...(paddingStyle ? [paddingStyle] : []),
      ])}
    >
      <TableSortLabel
        active={!column.disabled}
        disabled={column.disabled}
        direction={column.sorting === 'asc' ? 'desc' : 'asc'}
        onClick={() => sortTable(column.field)}
        id="data-sort-btn"
        IconComponent={
          column.sorting === 'none' ? withIcon(SyncAltIcon) : ArrowUpwardIcon
        }
        className={clsx(column.headerClass, 'capitalize')}
      >
        {typeof column.label === 'string' ? (
          getString(column.label)
        ) : (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{column.label}</>
        )}
      </TableSortLabel>
    </TableCell>
  );

  useEffect(() => {
    if (clickedRow) {
      tableRefContainer.current.scrollTo(0, currentScroll);
    }
  }, [clickedRow]);

  return (
    <Card data-testid="data-table">
      <CardContent className={classes.cardContent}>
        <TableContainer
          className={clsx([
            'data-table-container table-scrollbar',
            scrollableHeight && `h-[${scrollableHeight}]`,
          ])}
          style={scrollableHeight ? { height: scrollableHeight } : {}}
          ref={tableRefContainer}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {ExpandableComponentParams.isAllSelectable && (
                  <TableCell
                    component="div"
                    className="remove-border-bottom w-14"
                  >
                    <ActionCellElements rows={rows} />
                  </TableCell>
                )}
                {disabledEdit || tableType === 'all-leads' ? null : (
                  <StickyTableCell>
                    <TableCell
                      component="div"
                      className="remove-border-bottom remove-padding sticky-table-cell"
                    >
                      &nbsp;&nbsp;&nbsp;
                    </TableCell>

                    {columns
                      .filter((column: any) => fixedColumns.includes(column.id))
                      .map((column: any) =>
                        renderTableCell(column, {
                          borderBottom: 'none',
                        })
                      )}
                  </StickyTableCell>
                )}
                {columns
                  .filter((column: any) => !fixedColumns.includes(column.id))
                  .map((column: any) => renderTableCell(column))}
              </TableRow>
            </TableHead>
            <TableBody
              className={clsx([scrollableHeight && 'overflow-scroll'])}
            >
              {rows.length
                ? rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: any, key: number) => {
                      const uniqueKey = `row-${key}`;
                      return (
                        <>
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={uniqueId('data-table-row_')}
                            onClick={() =>
                              handleCustomClick(
                                row.id,
                                tableRefContainer.current.scrollTop
                              )
                            }
                            id={`row-${row?.id?.toString()?.split('/')?.[1]}`}
                          >
                            {!disabledEdit && (
                              <StickyTableCell
                                className={
                                  isDownloadable ||
                                  isSelectable ||
                                  ActionCellElements
                                    ? 'w-14'
                                    : 'w-auto'
                                }
                              >
                                {!disableEditIcon && (
                                  <TableCell
                                    component="div"
                                    className="remove-border-bottom remove-padding sticky-table-cell"
                                  >
                                    {ActionCellElements &&
                                    !ExpandableComponentParams?.isAllSelectable ? (
                                      <ActionCellElements row={row} />
                                    ) : (
                                      // eslint-disable-next-line react/jsx-no-useless-fragment
                                      !['all-accounting'].includes(
                                        tableType
                                      ) && (
                                        <>
                                          {row?.childItems &&
                                          row?.childItems?.length < 1 ? null : (
                                            <RenderIconCell
                                              row={row}
                                              isDisabled={
                                                !checkDownloadable(row)
                                              }
                                              isDownloadable={isDownloadable}
                                              isSelectable={isSelectable}
                                              isRedirectable={isRedirectable}
                                              selected={selected}
                                              handleSelect={handleSelect}
                                              editClickHandle={editClickHandle}
                                              onClickHandle={onClickHandle}
                                              style={{ minWidth: 0 }}
                                            />
                                          )}
                                        </>
                                      )
                                    )}
                                  </TableCell>
                                )}
                                {columns
                                  .filter((column: any) =>
                                    fixedColumns.includes(column.id)
                                  )
                                  .map((column: any) => {
                                    if (
                                      tableType === 'pendingCancelSubmission' &&
                                      column.id === 'refundAccountDocument' &&
                                      [
                                        'CANCELLATION_STATUS_CUSTOMER_CONTACT',
                                        'CANCELLATION_STATUS_CUSTOMER_CONFIRM',
                                      ].includes(row?.cancellationStatus)
                                    ) {
                                      return (
                                        <TableCell
                                          key={column.id}
                                          style={{
                                            borderBottom: 'none',
                                            minWidth: 0,
                                          }}
                                        />
                                      );
                                    }
                                    return (
                                      <TableCell
                                        key={column.id}
                                        align="left"
                                        style={{
                                          borderBottom: 'none',
                                          minWidth: column.minWidth,
                                        }}
                                      >
                                        {column?.transform
                                          ? column?.transform(row)
                                          : row[column.id]}
                                      </TableCell>
                                    );
                                  })}
                              </StickyTableCell>
                            )}
                            {isExpandable && (
                              <TableCell>
                                {row?.childItems?.length > 0 && (
                                  <IconButton
                                    data-testid="expand-row-button"
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() =>
                                      expandChildComponent(uniqueKey)
                                    }
                                  >
                                    {showArrow(uniqueKey)}
                                  </IconButton>
                                )}
                              </TableCell>
                            )}
                            {columns.map((column: any) => {
                              const value = row[column.id];
                              const title = row?.[column?.tooltipId] ?? value;

                              if (fixedColumns.includes(column.id)) {
                                return null;
                              }

                              return (
                                <TableCell
                                  className={clsx([
                                    fontSize && ` text-[${fontSize}]`,
                                    ...(paddingStyle ? [paddingStyle] : []),
                                  ])}
                                  key={uniqueId('data-table-column_')}
                                  align={column.align}
                                  title={column.noTooltip ? '' : title}
                                  onClick={() =>
                                    column.clickable
                                      ? onClickHandle(row)
                                      : undefined
                                  }
                                >
                                  <>
                                    {RenderCustomValue({
                                      value: column.transform
                                        ? column.transform(row)
                                        : value,
                                      row,
                                      id: column.id,
                                      isDownloadable,
                                      isSelectable,
                                      handleFailedPackageClick,
                                      isRedirectable,
                                      column,
                                      tableType,
                                      classes,
                                    })}
                                    {column.customField &&
                                      canDownload &&
                                      column.clickable &&
                                      column.icon && (
                                        <div
                                          className={column.customFieldClass}
                                        >
                                          <span
                                            data-testid={`${column.id}-iconBtn`}
                                            className={clsx(
                                              'mx-2 cursor-pointer',
                                              column?.iconClass
                                            )}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={() =>
                                              column?.onClick?.(row)
                                            }
                                            onClick={() =>
                                              column?.onClick?.(row)
                                            }
                                          >
                                            {column.icon}
                                          </span>
                                        </div>
                                      )}
                                  </>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                          <TableRow
                            className={clsx([
                              'bg-primary-light',
                              !openIds.includes(uniqueKey) && 'hidden',
                            ])}
                          >
                            <TableCell
                              colSpan={columns.length + (disabledEdit ? 1 : 2)}
                            >
                              <Collapse
                                className=""
                                in={openIds.includes(uniqueKey)}
                                timeout="auto"
                                unmountOnExit
                              >
                                {isExpandable && row.childItems?.length > 0 && (
                                  <ExpandableComponent
                                    {...ExpandableComponentParams}
                                    data={row.childItems}
                                    selected={selected}
                                    handleSelect={handleSelect}
                                    parentId={row.configId}
                                  />
                                )}
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })
                : TableLoadingSkeleton({ rows, isLoading, columns })}
            </TableBody>
          </Table>
        </TableContainer>
        {!isCustomPaging && (
          <TablePagination
            rowsPerPageOptions={ITEM_PER_PAGE_LIST}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default WithTableScrollHoc(DataTable);
