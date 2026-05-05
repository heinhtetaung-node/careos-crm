import { Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import {
  buildFilter,
  getQueryParts as getOrderApprovalQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import {
  filterMap,
  getFilter as getOrderApprovalFilter,
} from 'data/gateway/api/resource/order';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import OrderListing from 'presentation/components/OrderListingTable';
import { approvalColumnSetting as columnsSetting } from 'presentation/components/OrderListingTable/helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';
import { AdminRoles, OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';
import Schemas from 'shared/helper/Schemas';

import {
  INITIAL_VALUES,
  approvalFilters,
  OrderFilters,
} from '../filter.helper';
import sortParams, {
  handleReset,
  HandleResetProps,
  modifyQueryWithFilter,
} from '../table.helper';
import {
  getSearch as getOrderApprovalSearch,
  getNewValue,
} from '../useOrderSearch';
import useOrderWithInsurers from '../useOrderWithInsurers';

import Controls from 'presentation/components/controls/Control';

type PageState = {
  currentPage: number;
  pageSize: number;
};

function OrderApprovalPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const PRODUCT_TYPE = 'car-insurance';
  const pageState = {
    pageSize,
    currentPage,
  };
  // trigger, result
  const [getApprovalOrders, { data, isLoading, originalArgs }] =
    useLazySearchOrdersQuery();
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);
  const [cancelledOrders, setCancelledOrders] = useState(false);

  const { orderDataWithInsurers: orderApproval } = useOrderWithInsurers(
    data?.orders
  );

  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();
  const [approvalColumnsSetting, setApprovalColumnsSetting] =
    useState(columnsSetting);

  const approvalBy = `items[].approvalBy="${user?.name}"`;

  const dispatch = useDispatch();

  const handleOrderApprovalSortAndSearch = (
    values: any,
    newPageState?: PageState,
    columnId?: string
  ) => {
    setSearchValue(values);
    dispatch(clearItemAssign());
    // format payload
    const search = getOrderApprovalSearch(values);
    const payload = getNewValue(values, search);
    let filters = buildFilter(payload, filterMap(OrderType.Approval), []);
    if (user?.role === UserRoleID.ProblemCase) {
      filters = !filters.includes(approvalBy)
        ? [...filters, approvalBy]
        : filters;
    }
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    const queryParts = getOrderApprovalQueryParts(
      PRODUCT_TYPE,
      getOrderApprovalFilter(payload, filters),
      newPageState?.pageSize ?? pageSize,
      newPageState?.currentPage ?? currentPage,
      sortParams(
        columnId as string,
        setApprovalColumnsSetting,
        approvalColumnsSetting
      )
    );

    setCurrentPage(newPageState?.currentPage ?? 1);
    getApprovalOrders({
      params: `${queryParts.join('&')}`,
      roles: [`"${UserRoleID.ProblemCase}"`],
      assignedTo: 'approvalBy',
    });
  };

  const handleFilterReset = useCallback(() => {
    const filters = [];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    let payload: HandleResetProps = {
      setColumnsSetting: setApprovalColumnsSetting,
      setCurrentPage,
      refetch: getApprovalOrders,
      productType: PRODUCT_TYPE,
      filters,
    };
    payload = modifyQueryWithFilter(
      payload,
      [approvalBy],
      user?.role === UserRoleID.ProblemCase
    );
    handleReset(payload);
    dispatch(clearItemAssign());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelledOrders, getApprovalOrders]);

  useEffect(() => {
    handleOrderApprovalSortAndSearch(
      searchVal,
      {
        pageSize: 15,
        currentPage: 1,
      },
      'earliestPolicyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCurrentPageChange = (newPageState: PageState) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleOrderApprovalSortAndSearch(searchVal, newPageState);
  };

  const onCancelledOrders = useCallback(() => {
    setCancelledOrders((cancelledState) => !cancelledState);
  }, []);

  const handleFilterFormValueChange = <T extends typeof INITIAL_VALUES>(
    formValue: T
  ) => {
    setSearchValue(formValue);
  };

  const isAdmin = user && AdminRoles.includes(user.role as UserRoleID);

  const fields: IFilterFormField[] = [
    ...approvalFilters(TeamRole.ProblemCase, isAdmin ?? false),
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
    <Grid container spacing={6} data-testid="order-approval-page">
      <Helmet title={getString('titleTag.orderApproval')} />
      <Grid item xs={12}>
        <FilterPanel
          fields={fields}
          originalArgs={originalArgs}
          initialValues={INITIAL_VALUES}
          onSubmit={handleOrderApprovalSortAndSearch}
          onReset={handleFilterReset}
          onChangeValue={handleFilterFormValueChange}
          assignType={OrderType.Approval}
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
          policyTableType="approval"
          columnSettings={approvalColumnsSetting}
          orders={orderApproval}
          showChassisNumber
          hasUpdateOptions
          handleChangePageCurrent={handleCurrentPageChange}
          handleColumnSort={(columnId: string) => {
            handleOrderApprovalSortAndSearch(searchVal, pageState, columnId);
          }}
          isLoading={isLoading || isUserLoading}
          totalItem={data?.total || 0}
          pageState={pageState}
          noDetailPage
          hasCheckbox={false}
        />
      </Grid>
    </Grid>
  );
}
export default OrderApprovalPage;
