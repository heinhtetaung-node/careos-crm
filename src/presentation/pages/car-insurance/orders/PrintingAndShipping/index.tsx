import { Grid } from '@material-ui/core';
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import { getQueryParts } from 'data/gateway/api/resource/leadSearch';
import { clearSelected } from 'data/slices/orderPolicySlice/selectionsSlice';
import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import OrderListing from 'presentation/components/OrderListingTable';
import { printingAndShippingSetting } from 'presentation/components/OrderListingTable/helper';
import { getString } from 'presentation/theme/localization';

import { getShippingFilter } from './helper';
import ShippingFilterActionPanel from './ShippingFilterActionPanel';

import {
  INITIAL_VALUES_PRINTING_AND_SHIPPING,
  OrderFilters,
} from '../filter.helper';
import sortParams, { handleReset } from '../table.helper';
import useOrderWithInsurers from '../useOrderWithInsurers';

function PrintingAndShipping() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const PRODUCT_TYPE = 'car-insurance';
  const pageState = {
    pageSize,
    currentPage,
  };
  const [columnSetting, setColumnSetting] = useState(
    printingAndShippingSetting
  );
  const [getShipmentOrders, { data, isLoading, originalArgs }] =
    useLazySearchOrdersQuery();
  const [searchVal, setSearchValue] = useState(
    INITIAL_VALUES_PRINTING_AND_SHIPPING
  );
  const [cancelledOrders, setCancelledOrders] = useState(false);

  const { orderDataWithInsurers: orderShipment } = useOrderWithInsurers(
    data?.orders
  );

  const clearSelections = () => {
    dispatch(clearSelected());
    dispatch(clearItemAssign());
  };

  const handleSortAndSearch = (
    values: any,
    newPageState?: any,
    columnId?: string
  ) => {
    setSearchValue(values);
    // format payload
    const filters: Array<string> = [getShippingFilter(values)];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    const queryParts = getQueryParts(
      PRODUCT_TYPE,
      filters,
      newPageState?.pageSize ?? pageSize,
      newPageState?.currentPage ?? currentPage,
      sortParams(columnId as string, setColumnSetting, columnSetting)
    );

    setCurrentPage(newPageState?.currentPage ?? 1);
    getShipmentOrders({ params: `${queryParts.join('&')}` }, true);
    clearSelections();
  };

  useEffect(() => {
    handleSortAndSearch(
      searchVal,
      { currentPage: 1, pageSize: 15 },
      'earliestPolicyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCancelledOrders = useCallback(() => {
    setCancelledOrders((cancelledState) => !cancelledState);
  }, []);

  const handleFilterReset = useCallback(() => {
    const filters: Array<string> = [];
    if (cancelledOrders) onCancelledOrders();
    filters.push(OrderFilters.ORDER_IS_CANCELLED);

    handleReset({
      setColumnsSetting: setColumnSetting,
      setCurrentPage,
      refetch: getShipmentOrders,
      productType: PRODUCT_TYPE,
      filters,
    });
    clearSelections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelledOrders, getShipmentOrders]);

  const handleChangePageCurrent = (newPageState: any) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleSortAndSearch(searchVal, newPageState);
    clearSelections();
  };

  return (
    <Grid container spacing={6} data-testid="printing-and-shipping">
      <Helmet title={getString('titleTag.orderPrintingAndShipping')} />
      <Grid item xs={12}>
        <ShippingFilterActionPanel
          originalArgs={originalArgs}
          handleSortAndSearch={handleSortAndSearch}
          handleReset={handleFilterReset}
          orders={orderShipment}
          cancelledOrders={cancelledOrders}
          onCancelledOrders={onCancelledOrders}
        />
      </Grid>
      <Grid item xs={12}>
        <OrderListing
          columnSettings={columnSetting}
          policyTableType="shipment"
          orders={orderShipment}
          showChassisNumber
          hasUpdateOptions
          handleChangePageCurrent={handleChangePageCurrent}
          handleColumnSort={(columnId: string) => {
            handleSortAndSearch(searchVal, '', columnId);
          }}
          isLoading={isLoading}
          totalItem={data?.total || 0}
          pageState={pageState}
          noDetailPage
          hasCheckbox={false}
          expandAsDefault
        />
      </Grid>
    </Grid>
  );
}
export default PrintingAndShipping;
