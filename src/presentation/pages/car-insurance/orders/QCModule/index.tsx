import { Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import {
  buildFilter,
  getQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import { filterMap, getFilter } from 'data/gateway/api/resource/order';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import OrderListing from 'presentation/components/OrderListingTable';
import { columnQC } from 'presentation/components/OrderListingTable/helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { QCModuleActions } from 'presentation/redux/actions/orders/qc';
import { getString } from 'presentation/theme/localization';
import { AdminRoles, OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';
import Schemas from 'shared/helper/Schemas';

import { INITIAL_VALUES, QCFilters, OrderFilters } from '../filter.helper';
import sortParams, {
  handleReset,
  HandleResetProps,
  modifyQueryWithFilter,
} from '../table.helper';
import { getNewValue, getSearch } from '../useOrderSearch';
import useOrderWithInsurers from '../useOrderWithInsurers';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';
import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';

function QCModulePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const pageState = {
    pageSize,
    currentPage,
  };
  const PRODUCT_TYPE = 'car-insurance';
  const [qcColumnSettings, setQcColumnSettings] = useState(columnQC);
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);
  const [cancelledOrders, setCancelledOrders] = useState(false);
  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();

  const qcBy = `order.qcBy="${user?.name}"`;

  const [
    getQcOrders,
    { data: ordersData, isLoading: isOrderDataLoading, originalArgs },
  ] = useLazySearchOrdersQuery();
  const { orderDataWithInsurers: orderQCs } = useOrderWithInsurers(
    ordersData?.orders
  );

  const dispatch = useDispatch();

  const refetchRef = React.useRef<any>();

  const handleSortAndSearch = (
    values: any,
    newPageState?: any,
    columnId?: string
  ) => {
    setSearchValue(values);
    dispatch(clearItemAssign());
    const search = getSearch(values);
    const payload = getNewValue(values, search);
    let filters = buildFilter(payload, filterMap(OrderType.QC), []);
    if (user?.role === UserRoleID.QualityControl) {
      filters = !filters.includes(qcBy) ? [...filters, qcBy] : filters;
    }
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    const queryParts = getQueryParts(
      PRODUCT_TYPE,
      getFilter(payload, filters),
      newPageState?.pageSize ?? pageSize,
      newPageState?.currentPage ?? currentPage,
      sortParams(columnId as string, setQcColumnSettings, qcColumnSettings)
    );

    setCurrentPage(newPageState?.currentPage ?? 1);

    const { refetch } = getQcOrders({
      params: `${queryParts.join('&')}`,
      assignedTo: 'qcAgent',
    });
    refetchRef.current = refetch;
  };

  const handleFilterReset = React.useCallback(() => {
    const filters = [];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }

    let payload: HandleResetProps = {
      setColumnsSetting: setQcColumnSettings,
      setCurrentPage,
      refetch: getQcOrders,
      productType: PRODUCT_TYPE,
      interestedColumn: 'policyStartDate',
      assignedTo: 'qcAgent',
      filters,
    };
    payload = modifyQueryWithFilter(
      payload,
      [qcBy],
      user?.role === UserRoleID.QualityControl
    );
    handleReset(payload);
    dispatch(clearItemAssign());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelledOrders, getQcOrders]);

  useEffect(() => {
    handleSortAndSearch(
      searchVal,
      { pageSize: 15, currentPage: 1 },
      'policyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (ordersData) {
      dispatch({
        type: QCModuleActions.GET_QC_MODULE_SUCCESS,
        payload: {
          data: ordersData,
        },
      });
    }
  }, [dispatch, ordersData]);

  const isAdmin = user && AdminRoles.includes(user.role as UserRoleID);

  const fields: IFilterFormField[] = [
    ...QCFilters(TeamRole.QualityControl, isAdmin ?? false),
    {
      InputComponent: Controls.Select,
      inputProps: {
        name: 'preferredDeliveryOption',
        label: getString('order.shipping.preferredDeliveryOption'),
        placeholder: getString('text.select'),
        options: getNewShippingMethodsOptions().map(
          ({ value, title }, index) => ({
            id: index + 1,
            value,
            title,
          })
        ),
        filterType: 'detail',
        selectField: 'value',
        fixedLabel: true,
        responsive: {
          xs: 6,
          md: 3,
        },
        hasSelectAll: true,
      },
    },
  ];
  return (
    <Grid container spacing={6} data-testid="order-qc-module-page">
      <Helmet title={getString('titleTag.orderQC')} />
      <Grid item xs={12}>
        <FilterPanel
          originalArgs={originalArgs}
          fields={fields}
          initialValues={INITIAL_VALUES}
          onSubmit={handleSortAndSearch}
          onReset={handleFilterReset}
          onChangeValue={handleChange}
          assignType={OrderType.QC}
          validationSchema={Schemas.searchOrder}
          noAgentAssignment={!isAdmin}
          isOrderPage
          cancelledOrders={cancelledOrders}
          onCancelledOrders={onCancelledOrders}
          showCancelledCheckbox
        />
      </Grid>
      <Grid item xs={12}>
        <OrderListing
          columnSettings={qcColumnSettings}
          orders={orderQCs}
          handleChangePageCurrent={handleChangePageCurrent}
          handleColumnSort={(columnId: string) => {
            handleSortAndSearch(searchVal, '', columnId);
          }}
          isDisableExpand
          isLoading={isUserLoading || isOrderDataLoading || !orderQCs}
          totalItem={ordersData?.total || 0}
          pageState={pageState}
        />
      </Grid>
    </Grid>
  );
}
export default QCModulePage;
