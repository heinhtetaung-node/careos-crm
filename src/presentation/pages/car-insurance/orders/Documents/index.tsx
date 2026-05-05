import { Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import {
  buildFilter,
  getQueryParts as getOrderDocumentQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import {
  filterMap,
  getFilter as getOrderDocumentFilter,
} from 'data/gateway/api/resource/order';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import OrderListing from 'presentation/components/OrderListingTable';
import { columnDocumentsQC as columnsSetting } from 'presentation/components/OrderListingTable/helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import { AdminRoles, OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';
import Schemas from 'shared/helper/Schemas';

import {
  INITIAL_VALUES,
  documentsFilters,
  OrderFilters,
} from '../filter.helper';
import sortParams, {
  handleReset,
  HandleResetProps,
  modifyQueryWithFilter,
} from '../table.helper';
import {
  getSearch as getOrderDocumentSearch,
  getNewValue,
} from '../useOrderSearch';
import useOrderWithInsurers from '../useOrderWithInsurers';

const PRODUCT_TYPE = 'car-insurance';

function OrderDocumentsPage() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchVal, setSearchValue] = useState(INITIAL_VALUES);
  const [cancelledOrders, setCancelledOrders] = useState(false);

  const [documentColumnsSetting, setDocumentColumnsSetting] =
    useState(columnsSetting);
  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();
  const [
    getOrdersDocument,
    { data, isLoading: isOrdersDocumentLoading, originalArgs },
  ] = useLazySearchOrdersQuery();
  const { orderDataWithInsurers: orderDocuments } = useOrderWithInsurers(
    data?.orders
  );

  const documentBy = `order.documentBy="${user?.name}"`;
  const pageState = {
    pageSize,
    currentPage,
  };

  const handleOrdersDocumentSortAndSearch = React.useCallback(
    (values: any, newPageState?: typeof pageState, columnId?: string) => {
      setSearchValue(values);
      // format payload
      const search = getOrderDocumentSearch(values);
      const payload = getNewValue(values, search);
      let filters = buildFilter(payload, filterMap(OrderType.Document), []);
      if (user?.role === UserRoleID.DocumentsCollection) {
        filters = !filters.includes(documentBy)
          ? [...filters, documentBy]
          : filters;
      }
      if (!cancelledOrders) {
        filters.push(OrderFilters.ORDER_IS_CANCELLED);
      }
      const queryParts = getOrderDocumentQueryParts(
        PRODUCT_TYPE,
        getOrderDocumentFilter(payload, filters),
        newPageState?.pageSize ?? pageSize,
        newPageState?.currentPage ?? currentPage,
        sortParams(
          columnId as string,
          setDocumentColumnsSetting,
          documentColumnsSetting
        )
      );

      setCurrentPage(newPageState?.currentPage ?? 1);
      getOrdersDocument({
        params: `${queryParts.join('&')}`,
        assignedTo: 'documentAgent',
      });
    },
    [
      currentPage,
      cancelledOrders,
      documentBy,
      documentColumnsSetting,
      getOrdersDocument,
      pageSize,
      user?.role,
    ]
  );

  const handleCurrentPageChange = (newPageState: typeof pageState) => {
    setCurrentPage(newPageState?.currentPage);
    setPageSize(newPageState?.pageSize);
    handleOrdersDocumentSortAndSearch(searchVal, newPageState);
  };

  const handleFilterFormChange = <T extends typeof INITIAL_VALUES>(
    formValue: T
  ) => {
    setSearchValue(formValue);
  };

  const handleFilterReset = React.useCallback(() => {
    const filters = [];
    if (!cancelledOrders) {
      filters.push(OrderFilters.ORDER_IS_CANCELLED);
    }
    let payload: HandleResetProps = {
      setColumnsSetting: setDocumentColumnsSetting,
      setCurrentPage,
      refetch: getOrdersDocument,
      productType: PRODUCT_TYPE,
      assignedTo: 'documentAgent',
      filters,
    };
    payload = modifyQueryWithFilter(
      payload,
      [documentBy],
      user?.role === UserRoleID.DocumentsCollection
    );
    handleReset(payload);
    dispatch(clearItemAssign());
  }, [cancelledOrders, dispatch, documentBy, getOrdersDocument, user?.role]);

  const handleFilterSubmit = React.useCallback(
    (values: any) => {
      handleOrdersDocumentSortAndSearch(values, {
        currentPage: 1,
        pageSize: 15,
      });
      dispatch(clearItemAssign());
    },
    [dispatch, handleOrdersDocumentSortAndSearch]
  );

  useEffect(() => {
    handleOrdersDocumentSortAndSearch(
      searchVal,
      {
        pageSize: 15,
        currentPage: 1,
      },
      'policyStartDate'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCancelledOrders = useCallback(() => {
    setCancelledOrders((cancelledState) => !cancelledState);
  }, []);
  const isLoading = isUserLoading || isOrdersDocumentLoading;
  const isAdmin = user && AdminRoles.includes(user.role as UserRoleID);
  const fields: IFilterFormField[] = [
    ...documentsFilters(
      [TeamRole.DocumentsCollection, TeamRole.QualityControl],
      isAdmin ?? false
    ),
  ];
  return (
    <Grid container spacing={6} data-testid="order-document-page">
      <Helmet title={getString('titleTag.orderDocument')} />
      <Grid item xs={12}>
        <FilterPanel
          originalArgs={originalArgs}
          fields={fields}
          initialValues={INITIAL_VALUES}
          onSubmit={handleFilterSubmit}
          onReset={handleFilterReset}
          onChangeValue={handleFilterFormChange}
          assignType={OrderType.Document}
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
          columnSettings={documentColumnsSetting}
          orders={orderDocuments}
          handleChangePageCurrent={handleCurrentPageChange}
          isLoading={isLoading}
          isDisableExpand
          totalItem={data?.total}
          pageState={pageState}
          handleColumnSort={(columnId: string) => {
            handleOrdersDocumentSortAndSearch(
              searchVal,
              { currentPage: 1, pageSize: 15 },
              columnId
            );
          }}
        />
      </Grid>
    </Grid>
  );
}
export default OrderDocumentsPage;
