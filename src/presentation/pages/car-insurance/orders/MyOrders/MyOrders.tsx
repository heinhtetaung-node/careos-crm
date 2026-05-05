import { Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import {
  buildFilter,
  getQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import { filterMap, getFilter } from 'data/gateway/api/resource/order';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import Loader from 'presentation/components/Loader';
import OrderListing from 'presentation/components/OrderListingTable';
import { salesColumnSettings } from 'presentation/components/OrderListingTable/helper';
import useOrderWithInsurers from 'presentation/pages/car-insurance/orders/useOrderWithInsurers';
import { OrderType } from 'shared/constants/orderType';
import Schemas from 'shared/helper/Schemas';

import {
  INITIAL_VALUES,
  getFields,
  preferDeliveryOptionField,
} from '../filter.helper';
import sortParams, { handleReset } from '../table.helper';
import { getNewValue, getSearch } from '../useOrderSearch';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { HealthFilterFields } from 'presentation/pages/car-insurance/orders/filter.helper';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';

const useTableStyles = makeStyles({
  root: {
    '& table thead': {
      '& :not(th.MuiTableCell-root.MuiTableCell-head.MuiTableCell-stickyHeader:first-child)':
        {
          zIndex: 0,
        },
      '& th.MuiTableCell-root.MuiTableCell-head.MuiTableCell-stickyHeader:first-child':
        {
          zIndex: 1,
        },
    },
  },
});

const modifyColumnsBasedOnProductType = (productType: string) => {
  const columnsToFilterOut =
    productType === 'health-insurance'
      ? ['licensePlate', 'earliestPolicyStartDate', 'insurancePackage']
      : ['policyStartDate', 'shippingAddress'];

  return salesColumnSettings.filter(
    (col) => !columnsToFilterOut.includes(col.id)
  );
};

export default function MyOrders() {
  const tableClasses = useTableStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const pageState = {
    pageSize,
    currentPage,
  };

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isHealth = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const PRODUCT_TYPE = globalProduct.split('/')[1];
  const [orderAllColSettings, setOrderAllColSettings] =
    useState(salesColumnSettings);
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);

  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();

  const [getAllOrders, { data, isLoading: isOrderDataLoading }] =
    useLazySearchOrdersQuery();

  const { orderDataWithInsurers: ordersData } = useOrderWithInsurers(
    data?.orders as any
  );

  const convertBy = `order.convertBy="${user?.name}"`;

  const handleSortAndFilter = (
    searchParams: any,
    newPageState?: any,
    columnId?: string
  ) => {
    setSearchValue(searchParams);
    const search = getSearch(searchParams);
    const payload = getNewValue(searchParams, search);
    const filters = buildFilter(payload, filterMap(OrderType.All), []);
    filters.push(convertBy);
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

    setCurrentPage(newPageState?.currentPage ?? 1);
    getAllOrders({ params: `${queryParts.join('&')}` });
  };

  useEffect(() => {
    handleSortAndFilter(
      searchVal,
      { pageSize: 15, currentPage: 1 },
      isHealth ? 'policyStartDate' : 'earliestPolicyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHealth]);

  useEffect(() => {
    const updatedColumns = modifyColumnsBasedOnProductType(PRODUCT_TYPE);
    setOrderAllColSettings(updatedColumns);
  }, [PRODUCT_TYPE]);

  const fields = (): IFilterFormField[] => {
    const baseFields: IFilterFormField[] = [
      ...getFields({}),
      preferDeliveryOptionField,
    ];
    if (isHealth) {
      return HealthFilterFields(baseFields);
    }
    return baseFields;
  };

  const handleChange = (formValue: any) => {
    setSearchValue(formValue);
  };

  const handleChangePageCurrent = (newPageState: any) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleSortAndFilter(searchVal, newPageState);
  };

  if (!ordersData || isOrderDataLoading || isUserLoading) {
    return <Loader />;
  }

  return (
    <Grid
      container
      spacing={6}
      id="my-orders-listing"
      className={tableClasses.root}
    >
      <Helmet title="Order - My orders" />
      <Grid item xs={12}>
        <FilterPanel
          fields={fields()}
          initialValues={INITIAL_VALUES}
          onSubmit={handleSortAndFilter}
          onReset={() => {
            handleReset({
              setColumnsSetting: setOrderAllColSettings,
              setCurrentPage,
              refetch: getAllOrders,
              productType: PRODUCT_TYPE,
              filters: [convertBy],
            });
          }}
          onChangeValue={handleChange}
          assignType={OrderType.All}
          validationSchema={Schemas.searchOrder}
          isOrderPage
        />
      </Grid>
      <Grid item xs={12}>
        <OrderListing
          columnSettings={orderAllColSettings}
          orders={ordersData}
          handleChangePageCurrent={handleChangePageCurrent}
          handleColumnSort={(columnId: string) => {
            handleSortAndFilter(searchVal, '', columnId);
          }}
          isLoading={isOrderDataLoading}
          totalItem={data?.total || 0}
          pageState={pageState}
        />
      </Grid>
    </Grid>
  );
}
