import React, { useEffect, useState } from 'react';

import {
  useGetAllOrderDocumentsByStreamingQuery,
  useGetOrderItemsQuery,
} from 'data/slices/orderSlice';
import CommonButton from 'presentation/components/LeadDetails/CommonButton';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { OrderDocumentStatus } from 'shared/constants/orderType';
import { checkProductIsHealth } from 'shared/constants/productOptions';

export default function DocumentCompleteButton({
  orderId,
  isDisabled = false,
}: {
  orderId: string;
  isDisabled?: boolean;
}) {
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  // DEMO TASK: ORDER-957 - Remove later
  const [requiredDocsValid, setRequiredDocsValid] = useState(false);

  // DEMO TASK: ORDER-957 - Remove later
  const { data: { documents: uploadedDocuments } = {} } =
    useGetAllOrderDocumentsByStreamingQuery(
      {
        orderId: `orders/${orderId}`,
        queryParams: 'pageSize=50',
      },
      {}
    );
  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );

  const { data: orderDetailSlice } = useGetOrderItemsQuery(
    {
      orderId,
    },
    {
      skip: !orderId,
    }
  );

  const { deliveryOption } = orderDetailSlice?.order?.data ?? {};
  const shipmentMethodValid = Boolean(deliveryOption);

  const docsComplete =
    (orderDetail?.documentStatus ?? orderDetail?.order?.documentStatus) ===
    OrderDocumentStatus.COMPLETE;

  useEffect(() => {
    if (uploadedDocuments) {
      const requiredDocs = checkProductIsHealth(orderDetail?.product)
        ? ['DOCUMENT_TYPE_ID_CARD', 'DOCUMENT_TYPE_APPLICATION_FORM']
        : ['DOCUMENT_TYPE_ID_CARD', 'DOCUMENT_TYPE_VEHICLE_REGISTRATION'];
      const countRequiredDoc = uploadedDocuments.filter((document: any) =>
        requiredDocs.includes(document.type)
      ).length;
      if (countRequiredDoc >= requiredDocs.length) {
        setRequiredDocsValid(true);
      } else {
        setRequiredDocsValid(false);
      }
    }
  }, [uploadedDocuments, orderDetail?.product]);

  const openUpdateModalHandle = () => {
    setOpenModalUpdate(true);
  };

  return (
    <CommonButton
      data-testid="update--doc-status-complete"
      type="update--order--doc-status"
      color="primary"
      isDisabled={
        docsComplete || !requiredDocsValid || !shipmentMethodValid || isDisabled
      }
      onClick={openUpdateModalHandle}
      docStatus={OrderDocumentStatus.COMPLETE}
      open={openModalUpdate}
      close={() => setOpenModalUpdate(false)}
      handleCloseModal={() => setOpenModalUpdate(false)}
      title=""
      modalClass="order-update-modal"
      hasGreyBg
    >
      {getString('text.complete')}
    </CommonButton>
  );
}
