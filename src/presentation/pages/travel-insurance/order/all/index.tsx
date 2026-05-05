import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import useSnackbar from 'utils/snackbar';

import { UserRoles } from 'config/constant';
import { PRODUCTS } from 'config/TypeFilter';
import { getString } from 'presentation/theme/localization';
import { OrderFilters } from 'presentation/pages/car-insurance/orders/filter.helper';
import {
  getNewValue,
  getSearch,
} from 'presentation/pages/car-insurance/orders/useOrderSearch';
import {
  useLazyGetOrderItemDocumentsQuery,
  useLazySearchOrdersQuery,
} from 'data/slices/orderSlice';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { initialPageState } from 'data/slices/importSlices/helper';
import { OrderType } from 'shared/constants/orderType';
import {
  buildFilter,
  getQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import { filterMap, getFilter } from 'data/gateway/api/resource/order';

import sortParams from 'presentation/pages/car-insurance/orders/table.helper';
import useTableList from 'presentation/hooks/useTableList';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import FileBrowseModal from 'presentation/components/modal/FileBrowseModal';

import {
  defaultModalState,
  initialFilter,
  initialFilterValues,
} from './helper';
import { getColumns, fields } from './config';

import PolicyTable from './PolicyTable';
import OrderModals from '../../common/modals';

const ActionComponent = () => <span>&nbsp;</span>;

export default function TravelAllOrdersView() {
  const [filterURI, setFilterURI] = useState<string>(initialFilter);
  const [initialSelect, setInitialSelect] = useState(initialFilterValues);
  const [openIds, setOpenIds] = useState(undefined);
  const [modal, setModal] = useState(defaultModalState);
  const [isPreviewModal, setPreviewModal] = useState(false);
  const [currentDocument, setCurrentDocuments] = useState([]);

  const currentUser = useGetUserSelector();

  const handleModal = (data: any) => {
    const info: any = {
      ...defaultModalState,
      ...data,
      title: `${getString('text.orderId')} ${data.orderId}`,
    };

    setModal({
      ...info,
      uid: data.childId ?? '',
    });
  };

  const column = useMemo(
    () => getColumns(currentUser.role as UserRoles, handleModal),
    [currentUser]
  );

  const [orderAllColSettings, setOrderAllColSettings] = useState(column);

  const handleResetFilter = useCallback(() => {
    setInitialSelect(initialFilterValues);
    setFilterURI(initialFilter);
  }, []);

  const [getDocument, { isLoading: isGettingDocuments, data: allDocuments }] =
    useLazyGetOrderItemDocumentsQuery();

  const handleSubmit = useCallback(
    (payload: any, newPageState?: any, columnId?: string) => {
      const search = getSearch(payload);
      const newPayload = getNewValue(payload, search);
      const filters = buildFilter(newPayload, filterMap(OrderType.Travel), []);

      filters.push(
        payload.isCancelled
          ? OrderFilters.ORDER_IS_NOT_CANCELLED
          : OrderFilters.ORDER_IS_CANCELLED
      );

      const fieldToAlter: { [type: string]: string } = {
        'order.data.travelers[].nationalId': newPayload.search.policyHolderId,
        'order.data.travelers[].passportNumber':
          newPayload.search.policyHolderPassport,
        'order.data.travelers[].taxId': newPayload.search.policyHolderTaxId,
        'customerPhones[].phone': newPayload.search.travelCustomerPhone,
        'customerEmails[].email': newPayload.search.travelCustomerEmail,
      };
      const filterMultipleSearch = ['order.data.customer.emails.keyword'];

      Object.keys(fieldToAlter).forEach((key: string) => {
        if (!fieldToAlter[key]) return null;

        if (filterMultipleSearch.includes(key)) {
          return filters.push(`${key} in ("${fieldToAlter[key]}")`);
        }
        return filters.push(`${key}="${fieldToAlter[key]}"`);
      });

      const queryParts = getQueryParts(
        PRODUCTS.TRAVEL_PRODUCT_INSURANCE,
        getFilter(payload, filters),
        newPageState.pageSize ?? 15,
        newPageState.currentPage ?? 1,
        sortParams(
          columnId as string,
          setOrderAllColSettings,
          orderAllColSettings as any
        )
      );

      setFilterURI(
        `${queryParts
          .filter(
            (query) =>
              !query.includes('product') &&
              !query.includes('page_size') &&
              !query.includes('type')
          )
          .join('&')
          .replace('filter=', '')}`
      );
    },
    []
  );
  const { showErrorSnackbar } = useSnackbar();

  initialPageState.orderBy = 'order.createTime desc';
  delete initialPageState.pageToken;

  const { TableComponent, TopComponent, refetch } = useTableList(
    'all-orders',
    orderAllColSettings,
    {
      ...initialPageState,
      filter: filterURI,
      product: PRODUCTS.TRAVEL_PRODUCT_INSURANCE.split('/')[1],
      type: 'travel-allOrders',
    },
    useLazySearchOrdersQuery,
    undefined,
    undefined,
    [],
    true,
    PolicyTable,
    openIds,
    setOpenIds
  );

  const handleCloseModal = () => handleModal(defaultModalState);

  useEffect(() => {
    if (allDocuments?.documents?.length) {
      setPreviewModal(true);
      setCurrentDocuments(allDocuments?.documents);
    }
  }, [allDocuments, isGettingDocuments]);

  useEffect(() => {
    if (allDocuments && !allDocuments?.documents?.length) {
      setPreviewModal(false);
      setCurrentDocuments([]);
      showErrorSnackbar(getString('order.shipping.policyDocsNotUploaded'));
    }
  }, [allDocuments]);

  return (
    <div data-testid="travel-all-listing-page">
      <Helmet title="Travel Insurance - All Orders Page" />
      <div className="flex flex-row">
        <FilterPanel
          fields={fields}
          initialValues={initialSelect}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
          assignType={OrderType.All}
          isOrderPage
        />
      </div>

      <div className="flex flex-col mt-2 px-2 bg-white ">
        <div className="flex grow-0 basis-full flex-wrap mb-2 justify-end">
          <TopComponent />
        </div>
      </div>

      <div className="mt-1">
        <TableComponent
          ExpandableComponentParams={{
            handleEdit: handleModal,
            getDocument,
            role: currentUser.role,
            isAllSelectable: true,
          }}
          ActionCellElements={ActionComponent}
        />
      </div>
      <FileBrowseModal
        isLoading={isGettingDocuments}
        openDialog={isPreviewModal}
        handleCloseDialog={() => {
          setPreviewModal(false);
          setPreviewModal(false);
          setCurrentDocuments([]);
        }}
        documents={
          currentDocument?.map((doc: any) => ({
            ...doc,
            type: DocumentType.DOCUMENT_TYPE_OTHERS,
          })) ?? []
        }
        isOtherDocuments
        disabledFileDeleted
        disabledFileUpload
      />
      {modal.show && modal.type && (
        <CommonModal
          maxWidth={(modal.size as any) ?? 'xs'}
          titleCenter={modal.titleCenter ?? false}
          title={modal.title}
          isShowCloseBtn
          open={modal.show}
          handleCloseModal={handleCloseModal}
          dataTestId="orders-modal"
        >
          <OrderModals
            {...{
              refetch,
              handleModal,
              modalInfo: modal,
            }}
          />
        </CommonModal>
      )}
    </div>
  );
}
