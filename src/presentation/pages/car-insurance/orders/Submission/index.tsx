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
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import OrderListing from 'presentation/components/OrderListingTable';
import { submissionColumnSetting as columnsSetting } from 'presentation/components/OrderListingTable/helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';
import { AdminRoles, OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';
import Schemas from 'shared/helper/Schemas';

import {
  INITIAL_VALUES,
  OrderFilters,
  submissionFilters,
} from '../filter.helper';
import sortParams, { handleReset } from '../table.helper';
import { getSearch, getNewValue } from '../useOrderSearch';
import useOrderWithInsurers from '../useOrderWithInsurers';

const SubmissionAgents: UserRoleID[] = [
  UserRoleID.Submission,
  UserRoleID.QualityControl,
];

function OrderSubmissionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const PRODUCT_TYPE = 'car-insurance';
  const pageState = {
    pageSize,
    currentPage,
  };
  // trigger, result
  const [getSubmissionOrders, { data, isLoading, originalArgs }] =
    useLazySearchOrdersQuery();
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);
  const { orderDataWithInsurers: orderSubmission } = useOrderWithInsurers(
    data?.orders as any
  );

  const [submissionColumnsSetting, setSubmissionColumnsSetting] =
    useState(columnsSetting);
  const { data: user } = useGetAuthenticateQuery();

  const [cancelledOrders, setCancelledOrders] = useState(false);

  const isSubmissionAgents =
    user && SubmissionAgents.includes(user?.role as UserRoleID);

  const dispatch = useDispatch();

  const handleSortAndSearch = (
    values: any,
    newPageState?: any,
    columnId?: string
  ) => {
    const vals = { ...values };
    if (isSubmissionAgents) {
      vals.submissionBy = user?.name;
    }
    setSearchValue(vals);
    dispatch(clearItemAssign());
    // format payload
    const search = getSearch(vals);
    const payload = getNewValue(vals, search);
    const filters = buildFilter(payload, filterMap(OrderType.Submission), []);

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
        setSubmissionColumnsSetting,
        submissionColumnsSetting
      )
    );

    setCurrentPage(newPageState?.currentPage ?? 1);
    getSubmissionOrders({
      params: `${queryParts.join('&')}`,
      assignedTo: 'submissionBy',
      roles: [`"${UserRoleID.QualityControl}"`],
    });
  };

  const handleFilterReset = React.useCallback(() => {
    const filters = [];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    if (isSubmissionAgents) {
      filters.push(encodeURIComponent(`items[].submissionBy="${user?.name}"`));
    }
    const payload = {
      setColumnsSetting: setSubmissionColumnsSetting,
      setCurrentPage,
      refetch: getSubmissionOrders,
      productType: PRODUCT_TYPE,
      interestedColumn: 'earliestPolicyStartDate',
      initialQueryPayload: 'order_by=attributes.earliestPolicyStartDate desc',
      filters,
    };
    handleReset(payload);
    dispatch(clearItemAssign());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelledOrders, getSubmissionOrders]);

  useEffect(() => {
    handleSortAndSearch(
      searchVal,
      { pageSize: 15, currentPage: 1 },
      'earliestPolicyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePageCurrent = (newPageState: any) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleSortAndSearch(searchVal, newPageState);
  };

  const onCancelledOrders = useCallback(() => {
    setCancelledOrders((cancelledState) => !cancelledState);
  }, []);

  const handleChange = (formValue: any) => {
    setSearchValue(formValue);
  };

  const isAdmin = user && AdminRoles.includes(user.role as UserRoleID);
  const fields: IFilterFormField[] = [
    ...submissionFilters(
      [TeamRole.Submission, TeamRole.QualityControl],
      isAdmin ?? false
    ),
  ];
  return (
    <Grid container spacing={6} data-testid="order-submission-page">
      <Helmet title={getString('titleTag.orderSubmission')} />
      <Grid item xs={12}>
        <FilterPanel
          fields={fields}
          originalArgs={originalArgs}
          initialValues={INITIAL_VALUES}
          onSubmit={handleSortAndSearch}
          onReset={handleFilterReset}
          onChangeValue={handleChange}
          assignType={OrderType.Submission}
          validationSchema={Schemas.searchOrder}
          isOrderPage
          noAgentAssignment={!isAdmin}
          cancelledOrders={cancelledOrders}
          onCancelledOrders={onCancelledOrders}
          showCancelledCheckbox
        />
      </Grid>
      <Grid item xs={12}>
        <OrderListing
          policyTableType="submission"
          columnSettings={submissionColumnsSetting}
          orders={orderSubmission}
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
        />
      </Grid>
    </Grid>
  );
}
export default OrderSubmissionPage;
