import { Card, CardContent, Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableSkeleton from 'presentation/components/TableAllLead/TableAllLeadComponent/TableSkeleton';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  DEFAULT_PER_PAGE_TABLE,
  ITEM_PER_PAGE_LIST,
  Order,
  Column,
} from './helper';
import TableBlank from './TableBlank';
import TableData from './TableData';
import TableHeader from './TableHeader';

import WithTableScrollHoc from '../../HOCs/WithTableScroll';
import { destroyPage } from '../../redux/actions/page';
import Pagination from '../controls/OldPagination';
import { TableContainer } from '../table/TableStyledComponent';
import 'presentation/components/TableAllLead/TableAllLead.scss';

interface IProps {
  tableRefContainer: React.Ref<HTMLDivElement>;
  policyTableType?: 'all' | 'approval' | 'submission' | 'shipment';
  isDisableExpand?: boolean;
  isDisableLink?: boolean;
  isPolicyTable?: boolean;
  showCustomer?: boolean;
  showChassisNumber?: boolean;
  showStar?: boolean;
  columnSettings: Column[];
  orders: Order[];
  handleChangePageCurrent?: (newPageState: any) => void;
  isLoading?: boolean;
  totalItem?: number;
  pageState?: any;
  expandAsDefault?: boolean;
  noDetailPage?: boolean;
  hasCheckbox?: boolean;
  handleColumnSort?: (field: string) => void;
}

function OrderListing({
  tableRefContainer,
  policyTableType = 'all',
  isDisableExpand,
  isPolicyTable,
  isDisableLink,
  showCustomer = true,
  showChassisNumber = false,
  showStar = false,
  columnSettings,
  orders,
  handleChangePageCurrent = () => null,
  handleColumnSort = () => null,
  isLoading = false,
  totalItem = 0,
  pageState = null,
  noDetailPage = false,
  hasCheckbox = true,
  expandAsDefault = false,
}: IProps) {
  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);
  const [page] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PER_PAGE_TABLE);

  const handlePerPageChange = (itemsPerPage: number) => {
    setRowsPerPage(itemsPerPage);
    const newPageState = {
      ...pageState,
      pageSize: itemsPerPage,
      currentPage: 1,
    };

    handleChangePageCurrent(newPageState);
  };

  const handlePageChange = (pageId: number) => {
    const newPageState = {
      ...pageState,
      currentPage: pageId,
    };

    handleChangePageCurrent(newPageState);
  };

  useEffect(() => {
    return () => {
      dispatch(destroyPage());
    };
  }, [dispatch]);

  return (
    <Grid
      item
      xs={12}
      className="table-all-lead"
      ref={tableRef}
      data-testid="order-list-table"
    >
      <Card>
        <CardContent>
          <Grid item xs={12}>
            <TableContainer className="table-scrollbar" ref={tableRefContainer}>
              <Table stickyHeader aria-label="sticky table">
                <TableHeader
                  showCustomer={showCustomer}
                  showChassisNumber={showChassisNumber}
                  columnSettings={columnSettings}
                  isDisableExpand={isDisableExpand}
                  handleColumnSort={handleColumnSort}
                />
                {isLoading ? (
                  <TableSkeleton
                    configTable={columnSettings}
                    pageState={pageState}
                    tableType="orders_list"
                    page={page}
                    isOrderListingTable
                    rowsPerPage={rowsPerPage}
                  />
                ) : (
                  <TableBody>
                    {orders
                      ?.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      ?.map((order: Order) => (
                        <TableData
                          key={`row-${order.id ?? order.orderId}`}
                          columnsSettings={columnSettings}
                          order={order}
                          policyTableType={policyTableType}
                          isDisableExpand={isDisableExpand}
                          isPolicyTable={isPolicyTable}
                          showCustomer={showCustomer}
                          showChassisNumber={showChassisNumber}
                          showStar={showStar}
                          isDisableLink={isDisableLink ?? false}
                          noDetailPage={noDetailPage}
                          hasCheckbox={hasCheckbox}
                          expandAsDefault={expandAsDefault}
                        />
                      ))}

                    {!orders?.length && (
                      <TableBlank columnSettings={columnSettings} />
                    )}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={12} md={6} />
            <Grid item xs={12} md={6} className="footer-pagination">
              <Pagination
                totalItem={totalItem}
                pageSize={rowsPerPage}
                page={pageState?.currentPage}
                changePage={handlePageChange}
                options={ITEM_PER_PAGE_LIST}
                addClass="custom-pagination"
                changePerPage={(event) =>
                  handlePerPageChange(Number(event.target.value))
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
export default WithTableScrollHoc(OrderListing);
