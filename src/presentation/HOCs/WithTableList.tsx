import { Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import CustomPagination from 'presentation/components/controls/CustomPagination';
import DataTable from 'presentation/components/DataTable';
import { canDownload } from 'presentation/pages/car-insurance/leads/ImportLeadPage/ImportLeadPageHelper';
import handleFailedPackageClick from 'shared/helper/csvImportHelper';
import { IPageState } from 'shared/interfaces/common/table';

import {
  defineState,
  getOrderByField,
  INITIAL_ITEM_PER_PAGE,
  initialPageState,
  ITEM_PER_PAGE_LIST,
  prevPageHandle,
  SORT_TABLE_TYPE,
  getCustomAction,
} from './WithTableListHelper';

export interface Column {
  id: string;
  field?: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'center' | 'left';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
  tooltipId?: string; // Key value of column to show as tooltip
  disabled?: boolean;
  transform?: (data: any) => any;
}

const useStyles = makeStyles(() => ({
  paging: {
    float: 'right',
    margin: '20px 0',
  },
}));

const TableDataHOC = (
  Component: React.ComponentType<any>,
  tableType: string,
  columns: Column[],
  initialSearchCondition?: any
) => {
  const WrappedComponent: React.FC<any> = (props: any) => {
    const classes = useStyles();
    const { data: user } = useGetAuthenticateQuery();
    const tableRef = useRef<HTMLDivElement>(null);
    const [pageState, setPageState] = useState<IPageState>(
      initialSearchCondition || initialPageState
    );
    const [perPage, setPerPage] = useState<number>(INITIAL_ITEM_PER_PAGE);
    const [isCustomPaging] = useState<boolean>(true);
    const [rowData, setRowData] = useState<any>();
    const [columnsSetting, setColumnSetting] = useState(columns);
    const tableData = props?.tableState?.listReducer?.data || [];
    const nextToken = props?.tableState?.listReducer?.pageToken || '';
    const isLoading = props?.tableState?.listReducer?.isFetching || false;
    const listToken = props?.tableState?.listReducer?.listPageToken || [];
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { filter, pageIndex, showDeleted } = props?.tableState?.listReducer;
    const disabledEdit = tableType === 'leads';
    const isDownloadable = [
      'package',
      'carSubModel',
      'customerProfile',
    ].includes(tableType);
    const canDownloadStatus = canDownload(user?.role ?? '');
    const showTopPagination = tableType === 'leads';

    // eslint-disable-next-line consistent-return
    const actionGetData = () => {
      if (tableType === 'user') return props.getUsers;
      if (tableType === 'team') return props.getTeams;
      if (tableType === 'leadSource') return props.getLeadSource;
      if (tableType === 'leads') return props.getImportLead;
      if (tableType === 'myLeads') return props.getMyLeads;
      if (tableType === 'package') return props.getPackageImport;
      if (tableType === 'customerProfile')
        return props.getCustomerProfileImport;
      if (tableType === 'carSubModel') return props.getCarSubModelImport;
      return undefined;
    };

    useEffect(() => {
      const getData = actionGetData();
      const param = initialSearchCondition || initialPageState;
      getData(param);
    }, []);

    const handlePageChange = (
      page: number,
      tokenPage: string | null,
      isPrev?: boolean
    ) => {
      const newPageState = {
        ...pageState,
        currentPage: page,
      };
      if (isPrev) {
        const pageToken = prevPageHandle(listToken, page);
        if (pageToken) {
          newPageState.pageToken = pageToken.token;
        }
      }
      if (page === 1) {
        newPageState.pageToken = '';
      }
      setPageState(newPageState);
      const getData = actionGetData();
      getData(newPageState);
    };

    const handlePerPageChange = (itemsPerPage: number) => {
      setPerPage(itemsPerPage);
      const newPageState = {
        ...pageState,
        pageSize: itemsPerPage,
        pageToken: '',
        currentPage: 1,
      };
      setPageState(newPageState);
      const getData = actionGetData();
      getData(newPageState);
    };

    useMemo(() => {
      setPageState((prevState) => ({
        ...prevState,
        pageToken: nextToken,
        currentPage: pageIndex,
        filter: filter || '',
        showDeleted: showDeleted || null,
      }));
    }, [nextToken, pageIndex]);

    const findSortColumn = (newColumns: Column[], columnId: string) => {
      const findColumnSort = newColumns.find((item) => item.field === columnId);
      const newPageState: IPageState = {
        ...pageState,
        currentPage: 1,
        pageToken: '',
        orderBy: getOrderByField(
          columnId,
          findColumnSort?.sorting as SORT_TABLE_TYPE
        ),
      };
      const getData = actionGetData();
      getData(newPageState);
      setPageState(newPageState);
    };

    const changeSortStatus = (status: SORT_TABLE_TYPE) => {
      if (status === SORT_TABLE_TYPE.NONE) return SORT_TABLE_TYPE.ASC;
      if (status === SORT_TABLE_TYPE.ASC) return SORT_TABLE_TYPE.DESC;
      return SORT_TABLE_TYPE.NONE;
    };

    const sortColumnHandle = (columnId: string) => {
      let newColumns = [...columnsSetting];
      newColumns = newColumns.map((item) => ({
        ...item,
        sorting:
          item.field === columnId
            ? changeSortStatus(item.sorting as SORT_TABLE_TYPE)
            : SORT_TABLE_TYPE.NONE,
      }));
      findSortColumn(newColumns, columnId);
      setColumnSetting(newColumns);
    };

    const getDownloadLinkUrl = (name: string) => {
      getCustomAction(name, tableType);
    };

    const topPagination = (
      <div className="top-pagination">
        <CustomPagination
          page={pageState.currentPage as number}
          perPage={perPage}
          pageSizes={ITEM_PER_PAGE_LIST}
          nextToken={pageState.pageToken}
          onChangePage={handlePageChange}
          onChangePerPage={handlePerPageChange}
          isLoading={isLoading}
        />
      </div>
    );

    return (
      <Component top={topPagination} {...props} rowDataClick={rowData}>
        <Grid item xs={12} lg={12} className="table-hoc-content" ref={tableRef}>
          {showTopPagination ? (
            <div className="top-pagination">
              <CustomPagination
                page={pageState.currentPage as number}
                perPage={perPage}
                pageSizes={ITEM_PER_PAGE_LIST}
                nextToken={pageState.pageToken}
                onChangePage={handlePageChange}
                onChangePerPage={handlePerPageChange}
                isLoading={isLoading}
              />
            </div>
          ) : null}
          <DataTable
            currentPage={pageState.currentPage as number}
            columns={columnsSetting}
            originalData={tableData}
            sortData={tableData}
            isCustomPaging={isCustomPaging}
            perPage={perPage}
            isLoading={isLoading}
            isDownloadable={isDownloadable}
            sortTable={sortColumnHandle}
            disabledEdit={disabledEdit}
            openEditModal={(item: any) => {
              setRowData({ ...item, time: Date.now() });
            }}
            customAction={getDownloadLinkUrl}
            canDownload={canDownloadStatus}
            handleFailedPackageClick={handleFailedPackageClick}
          />
          <div className={classes.paging}>
            <CustomPagination
              page={pageState.currentPage as number}
              perPage={perPage}
              pageSizes={ITEM_PER_PAGE_LIST}
              nextToken={pageState.pageToken}
              onChangePage={handlePageChange}
              onChangePerPage={handlePerPageChange}
              isLoading={isLoading}
            />
          </div>
        </Grid>
      </Component>
    );
  };
  const mapStateToProps = (state: any) => ({
    tableState: state[defineState(tableType)],
  });
  const mapDispatchToProps = (dispatch: any) =>
    bindActionCreators({}, dispatch);

  return connect(mapStateToProps, { mapDispatchToProps })(WrappedComponent);
};

export default TableDataHOC;
