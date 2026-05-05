import { Grid, makeStyles } from '@material-ui/core';
import { UseLazyQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  QueryDefinition,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import _isEmpty from 'lodash/isEmpty';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import CustomPagination from 'presentation/components/controls/CustomPagination';
import Pagination from 'presentation/components/controls/OldPagination';
import DataTable from 'presentation/components/DataTable';
import { canDownload } from 'presentation/pages/car-insurance/leads/ImportLeadPage/ImportLeadPageHelper';
import useOrderWithInsurers from 'presentation/pages/car-insurance/orders/useOrderWithInsurers';
import handleFailedPackageClick from 'shared/helper/csvImportHelper';
import { IPageState } from 'shared/interfaces/common/table';

import {
  getOrderByField,
  INITIAL_ITEM_PER_PAGE,
  initialPageState,
  ITEM_PER_PAGE_LIST,
  prevPageHandle,
  SORT_TABLE_TYPE,
  getCustomAction,
  changeSortStatus,
  getOrderConfigsOrderBy,
} from './helper';

export interface Column {
  id: string;
  field?: string;
  label: string | React.JSX.Element;
  minWidth?: number;
  align?: 'right' | 'center' | 'left';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
  disabled?: boolean;
  customField?: boolean;
  customFieldClass?: string;
  icon?: JSX.Element;
  clickable?: boolean;
  onClick?: (data?: any) => void;
  headerClass?: string;
  transform?: (data: { data: any }) => React.ReactNode;
  iconClass?: string;
}
export interface HookParams {
  tableType:
    | 'leads'
    | 'autoAssignImport'
    | 'package'
    | 'carSubModel'
    | 'customerProfile'
    | 'autoAssignConfigs'
    | 'curatedCar'
    | 'massLeadImport'
    | 'discountsImport'
    | 'discountsApproval'
    | 'carModel'
    | 'carBrand'
    | 'discountsVoucher'
    | 'discountsCampaign'
    | 'orderHistory'
    | 'orderConfigs'
    | 'allCustomerProfile'
    | 'massStatusChange'
    | 'customersMerge'
    | 'allCarePay'
    | 'pendingCancelSubmission'
    | 'pendingCancelSubmissionV2'
    | 'team'
    | 'carePayContract'
    | 'user'
    | 'sources'
    | 'carePayTransaction'
    | 'leadHistory'
    | 'approvalHistory'
    | 'all-leads'
    | 'all-orders'
    | 'all-accounting'
    | 'healthLeadImport'
    | 'refunds'
    | 'redbook';
  listPageToken: string[];
  queryParams: IPageState;
}

const useStyles = makeStyles(() => ({
  paging: {
    float: 'right',
    margin: '20px 0',
  },
}));

function useTableList(
  tableType: HookParams['tableType'],
  columns: Column[],
  initialSearchCondition: any,
  mainFunction: UseLazyQuery<
    QueryDefinition<
      any,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        any,
        FetchBaseQueryMeta
      >,
      string,
      any,
      string
    >
  >,
  selected?: string | string[],
  handleSelect?: (id: string | any) => void,
  fetchOnUpdate: Array<any> = [], // fetch table APi on update of given values
  isExpandable: boolean = false,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  ExpandableComponent: (data: any) => React.JSX.Element = () => <></>,
  openIds: string[] = [],
  setOpenIds = (_id: any) => {},
  scrollableTable: boolean = false,
  handleCustomClick: (data: any, scroll: number) => void = () => {}
) {
  const [callableFunction, { data, isFetching }] = mainFunction();
  const classes = useStyles();
  const { data: user } = useGetAuthenticateQuery();
  const tableRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState<IPageState>(
    initialSearchCondition || initialPageState
  );

  const [perPage, setPerPage] = useState<number>(
    scrollableTable ? 10000 : INITIAL_ITEM_PER_PAGE
  );
  const [isCustomPaging] = useState<boolean>(true);
  const [rowData, setRowData] = useState<any>();
  const [columnsSetting, setColumnSetting] = useState(columns);

  let tableData = data?.imports ? data.imports : [];
  const { orderDataWithInsurers: orderAll } = useOrderWithInsurers(
    data?.orders
  );

  const nextToken = data?.nextPageToken ? data.nextPageToken : '';
  const listToken = data?.listPageToken ? data.listPageToken : [];
  const totalItem = data?.total ?? null;
  const filter = data?.filter || '';
  const pageIndex = data?.pageIndex || 0;
  const showDeleted =
    data?.showDeleted ?? initialSearchCondition?.showDeleted ?? true;

  /* 😭 */
  if (
    ['pendingCancelSubmission', 'pendingCancelSubmissionV2'].includes(
      tableType
    ) &&
    !data?.imports
  ) {
    tableData = orderAll ?? [];
  }

  if (tableType === 'team' && data) {
    tableData = data.teams ?? [];
  }

  if (tableType === 'user' && data) {
    tableData = data.users ?? [];
  }

  if (tableType === 'sources' && data) {
    tableData = data.sourcesWithScore ?? [];
  }

  const disabledEdit = [
    'leads',
    'orderHistory',
    'leadHistory',
    'approvalHistory',
    'all-orders',
    'healthLeadImport',
    'refunds',
  ].includes(tableType);
  const disableEditIcon = ['pendingCancelSubmissionV2'];
  const isSelectable = [
    'autoAssignConfigs',
    'discountsApproval',
    'orderConfigs',
    'allCarePay',
    'carePayContract',
    'user',
    'carePayTransaction',
    'all-leads',
  ].includes(tableType);
  const shouldUseOldPagination = [
    'autoAssignConfigs',
    'discountsApproval',
    'orderConfigs',
    'allCustomerProfile',
    'customersMerge',
    'allCarePay',
    'pendingCancelSubmission',
    'pendingCancelSubmissionV2',
    'team',
    'sources',
  ].includes(tableType);
  const isDownloadable = [
    'leads',
    'package',
    'carSubModel',
    'customerProfile',
    'autoAssignImport',
    'massLeadImport',
    'curatedCar',
    'discountsImport',
    'carModel',
    'carBrand',
    'redbook',
    'massStatusChange',
    'healthLeadImport',
  ].includes(tableType);

  const tableColumnsMap: any = {
    pendingCancelSubmission: [
      'orderItemId',
      'policyNumber',
      'refundAccountDocument',
      'idCardDocument',
    ],
    pendingCancelSubmissionV2: [
      'orderItemId',
      'changeOrderIcon',
      'viewDocumentIcon',
      'refundAccountDocument',
      'idCardDocument',
    ],
    'all-accounting': ['id', 'policyNumber'],
    'all-leads': ['id'],
  };

  const fixedColumns = tableColumnsMap[tableType] || [];

  const hideBottomPagination = [
    'pendingCancelSubmission',
    'pendingCancelSubmissionV2',
  ].includes(tableType);
  const isRedirectable = ['discountsApproval', 'allCustomerProfile'].includes(
    tableType
  );

  const canDownloadStatus =
    canDownload(user?.role ?? '') ||
    ['carePayContract', 'allCarePay', 'carePayTransaction'].includes(tableType);

  useEffect(() => {
    const param = initialSearchCondition || initialPageState;

    setPageState({ ...param, currentPage: 1 });
    callableFunction({
      queryParams: param,
      listPageToken: listToken,
      tableType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchCondition.filter, initialSearchCondition?.showDeleted]);

  useEffect(() => {
    if (!fetchOnUpdate.filter((val) => val)?.length) return;
    const newPageState = {
      ...pageState,
      filter: filter || initialSearchCondition.filter,
    };

    if (pageState.currentPage === 1) {
      newPageState.pageToken = '';
    }
    callableFunction({
      queryParams: newPageState,
      listPageToken: listToken,
      tableType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...fetchOnUpdate]);

  const handlePageChange = useCallback(
    async (page: number, _tokenPage?: string | null, isPrev?: boolean) => {
      const newPageState = {
        ...pageState,
        filter: filter || initialSearchCondition.filter,
        currentPage: page,
      };
      const pageFrom = (page - 1) * perPage;
      if (isPrev) {
        const pageToken = prevPageHandle(listToken, page);
        if (pageToken) {
          newPageState.pageToken = pageToken.token;
        }
      }
      if (page === 1) {
        newPageState.pageToken = '';
        delete newPageState?.pageFrom;
      }

      if (
        page > 1 &&
        [
          'pendingCancelSubmission',
          'pendingCancelSubmissionV2',
          'carePayContract',
          'all-orders',
        ].includes(tableType)
      ) {
        newPageState.pageFrom = pageFrom;
      }
      setPageState(newPageState);
      await callableFunction({
        queryParams: newPageState,
        listPageToken: listToken,
        tableType,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, initialSearchCondition.filter, listToken, pageState, tableType]
  );

  const handlePerPageChange = useCallback(
    async (itemsPerPage: number) => {
      setPerPage(itemsPerPage);
      const newPageState = {
        ...pageState,
        filter: filter || initialSearchCondition.filter,
        pageSize: itemsPerPage,
        pageToken: '',
        currentPage: 1,
      };
      setPageState(newPageState);
      await callableFunction({
        queryParams: newPageState,
        listPageToken: listToken,
        tableType,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, initialSearchCondition.filter, listToken, pageState, tableType]
  );

  useMemo(() => {
    setPageState((prevState) => ({
      ...prevState,
      pageToken: nextToken,
      currentPage: pageIndex,
      filter: filter || '',
      showDeleted: showDeleted || null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextToken, pageIndex]);

  const findSortColumn = useCallback(
    async (newColumns: Column[], columnId: string) => {
      const findColumnSort = newColumns.find((item) => item.field === columnId);
      const newPageState: IPageState = {
        ...pageState,
        currentPage: 1,
        pageToken: '',
        orderBy:
          tableType === 'orderConfigs'
            ? getOrderConfigsOrderBy(
                columnId,
                findColumnSort?.sorting as SORT_TABLE_TYPE
              )
            : getOrderByField(
                columnId,
                findColumnSort?.sorting as SORT_TABLE_TYPE
              ),
      };
      setPageState(newPageState);

      await callableFunction({
        queryParams: newPageState,
        listPageToken: listToken,
        tableType,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listToken, pageState, tableType]
  );

  const sortColumnHandle = useCallback(
    async (columnId: string) => {
      let newColumns = [...columnsSetting];
      newColumns = newColumns.map((item) => ({
        ...item,
        sorting:
          item.field === columnId
            ? changeSortStatus(item.sorting as SORT_TABLE_TYPE)
            : SORT_TABLE_TYPE.NONE,
      }));
      await findSortColumn(newColumns, columnId).catch((err) =>
        console.log(err)
      );
      setColumnSetting(newColumns);
    },
    [columnsSetting, findSortColumn]
  );

  const getDownloadLinkUrl = useCallback(
    (name: string) => {
      getCustomAction(name, tableType);
    },
    [tableType]
  );

  function PaginationComponent({
    className: _classes,
    testId = `${tableType}-top-pagination-component`,
    paginationStyle,
  }: {
    testId?: string;
    className?: string;
    paginationStyle?: string;
  }) {
    if (totalItem > 0 || shouldUseOldPagination) {
      const page = pageState?.currentPage || 1;
      return (
        <div className={clsx(_classes)} data-testid={testId}>
          <Pagination
            totalItem={totalItem}
            page={Number(page)}
            pageSize={perPage}
            options={ITEM_PER_PAGE_LIST}
            changePage={handlePageChange}
            changePerPage={(event) =>
              handlePerPageChange(Number(event.target.value))
            }
            addClass="custom-pagination"
            paginationStyle={paginationStyle}
          />
        </div>
      );
    }
    return (
      <div
        className={clsx(_classes, { 'top-pagination': _isEmpty(_classes) })}
        data-testid={testId}
      >
        <CustomPagination
          page={pageState.currentPage as number}
          perPage={perPage}
          pageSizes={ITEM_PER_PAGE_LIST}
          nextToken={pageState.pageToken}
          onChangePage={handlePageChange}
          onChangePerPage={handlePerPageChange}
          isLoading={isFetching}
          tableType={tableType}
        />
      </div>
    );
  }

  const handleDownloadFailedPackageFromURI = (failedData: any) => {
    window.open(`${failedData?.downloadLink}?errorFile=true`, '_blank');
  };

  function TableComponent({
    ActionCellElements,
    actionCellTitle,
    ExpandableComponentParams,
    fontSize,
    paddingStyle,
    paginationStyle,
    scrollableHeight,
    clickedRow,
    currentScroll,
  }: Readonly<{
    actionCellTitle?: string;
    ActionCellElements?: ({ row }: any) => JSX.Element;
    ExpandableComponentParams?: any;
    fontSize?: string;
    paddingStyle?: string;
    paginationStyle?: string;
    scrollableHeight?: string;
    clickedRow?: string;
    currentScroll?: number;
  }>) {
    return (
      <Grid
        item
        xs={12}
        lg={12}
        className="table-hooks-content"
        ref={tableRef}
        data-testid={`${tableType}-table-component`}
      >
        <DataTable
          disableEditIcon={disableEditIcon.includes(tableType)}
          currentPage={pageState.currentPage as number}
          columns={columnsSetting}
          originalData={tableData}
          sortData={tableData}
          isCustomPaging={isCustomPaging}
          perPage={perPage}
          isLoading={isFetching}
          isDownloadable={isDownloadable}
          sortTable={sortColumnHandle}
          disabledEdit={disabledEdit}
          isSelectable={isSelectable}
          selected={selected}
          handleSelect={handleSelect}
          openEditModal={(item: any) => {
            setRowData({ ...item, time: Date.now() });
          }}
          customAction={getDownloadLinkUrl}
          canDownload={canDownloadStatus}
          handleFailedPackageClick={
            tableType === 'customerProfile'
              ? handleDownloadFailedPackageFromURI
              : handleFailedPackageClick
          }
          actionCellTitle={actionCellTitle}
          ActionCellElements={ActionCellElements} // ActionElement prop will be used to add custom elements for actions on first column of table
          isRedirectable={isRedirectable}
          isExpandable={isExpandable}
          ExpandableComponent={ExpandableComponent}
          ExpandableComponentParams={ExpandableComponentParams}
          openIds={openIds}
          setOpenIds={setOpenIds}
          tableType={tableType}
          fixedColumns={fixedColumns}
          fontSize={fontSize}
          paddingStyle={paddingStyle}
          scrollableHeight={scrollableHeight}
          handleCustomClick={handleCustomClick}
          clickedRow={clickedRow}
          currentScroll={currentScroll}
        />
        {!scrollableTable && !hideBottomPagination && (
          <PaginationComponent
            className={classes.paging}
            testId=""
            paginationStyle={paginationStyle}
          />
        )}
      </Grid>
    );
  }

  return {
    rowDataClick: rowData,
    tableData,
    TopComponent: PaginationComponent,
    TableComponent,
    setColumnSetting,
    refetch: () =>
      callableFunction({
        queryParams: pageState,
        listPageToken: listToken,
        tableType,
      }),
  };
}

export default useTableList;
