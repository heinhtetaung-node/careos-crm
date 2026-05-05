/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useMatch, useParams } from 'react-router-dom';

import { useGetAllLeadScripts } from 'data/slices/leadDetails/scriptSlice';
import { useLazyGetOrderCommentsQuery } from 'data/slices/orderCommentSlice';
import {
  useGetAllOrderDocumentsByStreamingQuery,
  useGetOrderPolicyItemsQuery,
} from 'data/slices/orderSlice';
import CommentSectionContainer from 'presentation/components/CommentSection/CommentSection';
import ScriptSection from 'presentation/components/ScriptSection';
import useGetScript from 'presentation/hooks/getScript';
import { uploadDocument } from 'presentation/redux/actions/document';
import { clearComment } from 'presentation/redux/actions/order/comment';
import {
  createOrderDocument,
  deleteDocument,
} from 'presentation/redux/actions/order/document';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

import CommentTextBox from './CommentTextbox';
import DocumentSection from './DocumentSection';
import HistoryLog from './HistoryLog';
import ShipmentDocumentSection from './ShipmentDocumentSection';

import { getString } from '../../theme/localization';
import CustomTab from '../common/details/CustomTab';
import { PRODUCTS } from 'config/TypeFilter';
import { checkProductIsHealth } from 'shared/constants/productOptions';
import QcTab from 'presentation/QcTab';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { UserRoleID } from '../ProtectedRouteHelper';
import clsx from 'clsx';

interface ActivityTabProps {
  enablePreviewModalDraggable?: boolean;
  isDocPanelDisabled?: boolean;
  isEnabledForReplaceDoc?: boolean;
}

function ActivityTab({
  isDocPanelDisabled = false,
  enablePreviewModalDraggable = false,
  isEnabledForReplaceDoc = false,
}: Readonly<ActivityTabProps>) {
  const { orderId } = useParams();
  const { pathname } = useLocation();
  const { data: { documents: uploadedDocuments = [] } = {}, refetch } =
    useGetAllOrderDocumentsByStreamingQuery(
      {
        orderId: `orders/${orderId}`,
        queryParams: 'pageSize=50',
      },
      {}
    );
  const orderName = `orders/${orderId}/`;
  const [params, setParams] = useState<any>(null);
  const [isReached, setIsReached] = useState(false);
  const dispatch = useDispatch();

  const [fetchComments, { data: commentsDataSlice }] =
    useLazyGetOrderCommentsQuery();
  const commentsData = commentsDataSlice;
  const documentName = useAppSelector(
    (currentState) => currentState.documentReducer.data?._data?.document.name
  );
  const { data: user } = useGetAuthenticateQuery();

  const isSaleAgent = user?.role === UserRoleID.SalesAgent;

  const matchMyOrder = useMatch('/health/orders/my-orders/:id');
  const matchOrder = useMatch('/health/orders/:id');
  const matchOrderQC = useMatch('/health/orders/qc/:id');

  const routeMatchHealthOrderDetail =
    matchMyOrder ?? matchOrder ?? matchOrderQC;

  const order = useAppSelector((state) => state.order?.payload?.order);
  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const isOrderCancelled = orderDetail?.isCancelled ?? false;
  const { data: policyItems, refetch: refetchPolicyItems } =
    useGetOrderPolicyItemsQuery(orderId ?? '', {
      skip:
        (order?.product ?? orderDetail?.product) !==
        PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    });

  const healthPolicy = policyItems?.find(
    (item) => item.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE
  );

  const isOrderActionSuccess = useAppSelector(
    (state) => state.orderUploadDocumentReducer?.success
  );

  const isHealth = checkProductIsHealth(orderDetail?.product);

  const onUploadDocument = async (payload: any) => {
    const docPayload: Record<string, string> = {
      type: payload?.documentType,
      label: `${payload?.label}-${payload?.fileName}`,
      item: payload.item ?? null,
    };
    if (payload?.item) {
      docPayload.item = payload.item;
    }
    setParams(docPayload);

    dispatch(
      uploadDocument({
        contentType: payload?.file.type,
        displayName: payload?.fileName,
        file: payload?.file,
        size: 'MEDIUM',
      })
    );
  };

  const getCurrentDoc = (label: string) => {
    const currentDoc = uploadedDocuments.filter(
      (doc: any) => doc.label === label
    );
    if (!currentDoc[0]) return null;
    return currentDoc[0];
  };

  const onDeleteDocument = (label: string) => {
    const document = getCurrentDoc(label);
    if (document) {
      dispatch(deleteDocument(document.name));
    }
  };

  async function getData(pageToken: any = '') {
    await fetchComments({ orderId, pageToken });
  }

  const clearAllComment = async () => {
    dispatch(clearComment());
  };

  const clearAndGet = () => {
    clearAllComment();
    getData(commentsData?.nextPageToken ?? '');
  };

  useEffect(() => {
    clearAndGet();
  }, []);

  useEffect(() => {
    if (documentName) {
      dispatch(
        createOrderDocument({
          params: {
            ...params,
            document: documentName,
          },
          orderName,
        })
      );
    }
    clearAndGet();
  }, [documentName]);

  useEffect(() => {
    // Manually refetch after document uploaded or deleted.
    // Removed this after documents list query can invalidate from create order document slice.
    if (isOrderActionSuccess) refetch();
  }, [isOrderActionSuccess]);

  const loadMore = () => {
    if (commentsData?.nextPageToken !== '') {
      getData(commentsData.nextPageToken);
    }
  };

  const commentProps = {
    loadMore,
    getData,
    data: commentsData ?? [],
  };
  useEffect(() => {
    if (commentsData?.nextPageToken === '') {
      setIsReached(true);
    }
  }, [commentsData?.nextPageToken]);

  const { scripts: scriptsData } = useGetAllLeadScripts();
  const { loadMore: loadMoreScript, hasMore: hasMoreScript } = useGetScript(
    order?.lead?.split('leads/')[1]
  );

  const intialScriptData = { scripts: [], nextPageToken: '' };

  const scriptProps = {
    loadMore: loadMoreScript,
    hasMore: hasMoreScript,
    data: scriptsData ?? intialScriptData,
  };

  const policyDocumentSection = {
    label: getString('documentSection.policyDocuments'),
    component: (
      <ShipmentDocumentSection
        handleUploadDocument={onUploadDocument}
        handleDeleteDocument={onDeleteDocument}
        isDisabled={isDocPanelDisabled}
        isEnabledForReplaceDoc={isEnabledForReplaceDoc}
        healthPolicyId={healthPolicy?.humanId}
      />
    ),
  };

  const documentIsEditableBySaleAgent =
    isHealth &&
    isSaleAgent &&
    ![
      'ITEM_APPROVAL_STATUS_APPROVED',
      'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
    ].includes(healthPolicy?.approvalStatus ?? '');

  const customerDocumentSection = {
    label: getString('lead.document'),
    component: (
      <DocumentSection
        isDisabled={documentIsEditableBySaleAgent ? false : isDocPanelDisabled}
        isEnabledForReplaceDoc={isEnabledForReplaceDoc}
        enablePreviewModalDraggable={enablePreviewModalDraggable}
        handleUploadDocument={onUploadDocument}
        handleDeleteDocument={onDeleteDocument}
        documents={uploadedDocuments}
        allowPayslipDocument
        allowBookBankDocument
      />
    ),
  };

  const commentSection = {
    label: getString('order.comment'),
    component: (
      <>
        <CommentTextBox />
        <CommentSectionContainer {...commentProps} isReached={isReached} />
      </>
    ),
  };

  function getTabs() {
    const tabs = [customerDocumentSection];

    if (pathname.includes('approval') || routeMatchHealthOrderDetail) {
      customerDocumentSection.label = getString(
        'documentSection.customerDocuments'
      );
      tabs.push(policyDocumentSection);
    }

    if (pathname.includes('printing-and-shipping')) {
      tabs[0] = policyDocumentSection;
    }

    tabs.push(commentSection);
    if (pathname.includes('orders/qc')) {
      tabs.push({
        label: getString('lead.script'),
        component: <ScriptSection {...scriptProps} />,
      });
    }

    return tabs;
  }

  return (
    <div className="order-activity-container">
      {isHealth && (
        <div
          className={clsx({
            'opacity-70 cursor-not-allowed select-none': isOrderCancelled,
          })}
        >
          {isOrderCancelled && (
            <div className="w-full h-12 bg-white opacity-15 absolute" />
          )}
          <QcTab
            policy={healthPolicy}
            uploadedDocuments={uploadedDocuments}
            isSaleAgent={isSaleAgent}
            refetchPolicyItems={refetchPolicyItems}
          />
        </div>
      )}
      <HistoryLog />
      <CustomTab tabs={getTabs()} />
    </div>
  );
}

export default ActivityTab;
