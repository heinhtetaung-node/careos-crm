import { Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Helmet from 'react-helmet';

import {
  buildFilter,
  getQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import { filterMap, getFilter } from 'data/gateway/api/resource/order';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import OrderListing from 'presentation/components/OrderListingTable';
import {
  Column,
  columnSettings,
} from 'presentation/components/OrderListingTable/helper';
import { getString } from 'presentation/theme/localization';
import { OrderType } from 'shared/constants/orderType';
import Schemas from 'shared/helper/Schemas';

import {
  INITIAL_VALUES,
  getFields,
  OrderFilters,
  HealthFilterFields,
  preferDeliveryOptionField,
} from '../filter.helper';
import sortParams, { handleReset } from '../table.helper';
import { getSearch, getNewValue } from '../useOrderSearch';
import useOrderWithInsurers from '../useOrderWithInsurers';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

function OrderAllPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const pageState = {
    pageSize,
    currentPage,
  };

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isHealth = useMemo(
    () => globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct]
  );

  const PRODUCT_TYPE = globalProduct.split('/')[1];
  const [orderAllColSettings, setOrderAllColSettings] =
    useState(columnSettings);
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);
  const [cancelledOrders, setCancelledOrders] = useState(false);

  const [getAllOrders, { data: ordersData, isLoading: isOrderDataLoading }] =
    useLazySearchOrdersQuery();
  const { orderDataWithInsurers: orderAll } = useOrderWithInsurers(
    ordersData?.orders
  );

  const handleSortAndSearch = (
    values: any,
    newPageState?: any,
    columnId?: string
  ) => {
    setSearchValue(values);
    const search = getSearch(values);
    const payload = getNewValue(values, search);
    const filters = buildFilter(payload, filterMap(OrderType.All), []);

    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }

    const queryParts = getQueryParts(
      PRODUCT_TYPE,
      getFilter(payload, filters),
      newPageState?.pageSize ?? pageSize,
      newPageState?.currentPage ?? currentPage,
      sortParams(
        columnId as string,
        setOrderAllColSettings,
        orderAllColSettings
      )
    );

    const clonnedQueryParts = [...queryParts];

    setCurrentPage(newPageState?.currentPage ?? 1);
    getAllOrders({ params: `${clonnedQueryParts.join('&')}` });
  };

  const handleFilterReset = useCallback(() => {
    const filters = [];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    handleReset({
      setColumnsSetting: setOrderAllColSettings,
      setCurrentPage,
      refetch: getAllOrders,
      productType: PRODUCT_TYPE,
      filters,
      initialQueryPayload: isHealth ? '' : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelledOrders, getAllOrders, isHealth]);

  useEffect(() => {
    handleSortAndSearch(
      searchVal,
      { pageSize: 15, currentPage: 1 },
      isHealth ? 'orderId' : 'earliestPolicyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHealth) {
      setOrderAllColSettings(
        orderAllColSettings.reduce((acc: Column[], col) => {
          if (['licensePlate', 'insurancePackage'].includes(col.id)) {
            return acc;
          }
          if (col.id === 'earliestPolicyStartDate') {
            acc.push({ ...col, isNotSorting: true });
          } else if (col.id === 'orderId') {
            acc.push({ ...col, sorting: 'asc' });
          } else {
            acc.push(col);
          }
          return acc;
        }, [])
      );
    } else {
      setOrderAllColSettings(
        orderAllColSettings.filter(
          (col) => !['shippingAddress'].includes(col.id)
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHealth, globalProduct]);

  const handleChange = (formValue: any) => {
    setSearchValue(formValue);
  };

  const handleChangePageCurrent = (newPageState: any) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleSortAndSearch(searchVal, newPageState);
  };

  const onCancelledOrders = useCallback(() => {
    setCancelledOrders((cancelledState) => !cancelledState);
  }, []);

  const fields: IFilterFormField[] = useMemo(() => {
    const baseFields: IFilterFormField[] = [
      ...getFields({ isAdmin: true }),
      preferDeliveryOptionField,
    ];

    if (isHealth) {
      return HealthFilterFields(baseFields);
    }

    return baseFields;
  }, [globalProduct, isHealth]);

  return (
    <Grid container spacing={6} data-testid="all-list-order">
      <Helmet title={getString('titleTag.orderAll')} />
      <Grid item xs={12}>
        <FilterPanel
          fields={fields}
          initialValues={INITIAL_VALUES}
          onSubmit={handleSortAndSearch}
          onReset={handleFilterReset}
          onChangeValue={handleChange}
          assignType={OrderType.All}
          validationSchema={Schemas.searchOrder}
          isOrderPage
          cancelledOrders={cancelledOrders}
          onCancelledOrders={onCancelledOrders}
          showCancelledCheckbox
        />
      </Grid>
      <Grid item xs={12}>
        <OrderListing
          columnSettings={orderAllColSettings}
          orders={orderAll}
          handleChangePageCurrent={handleChangePageCurrent}
          handleColumnSort={(columnId: string) => {
            handleSortAndSearch(searchVal, '', columnId);
          }}
          isLoading={isOrderDataLoading}
          totalItem={ordersData?.total || 0}
          pageState={pageState}
          hasCheckbox={false}
        />
      </Grid>
    </Grid>
  );
}
export default OrderAllPage;
