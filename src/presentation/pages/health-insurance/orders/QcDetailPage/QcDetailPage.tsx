import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import QcStatusButtons from './QcStatusButtons';
import QcTabs from './QcTabs';
import QcDetailPageLayout from 'presentation/components/common/QcDetailPageLayout';
import { PRODUCTS } from 'config/TypeFilter';

function QcDetailPage() {
  const { orderId } = useParams();
  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const isOrderCancelled = orderDetail?.order?.isCancelled ?? false;

  return (
    <QcDetailPageLayout
      productType={PRODUCTS.HEALTH_PRODUCT_INSURANCE}
      showBackButton
      additionalStatusButtons={
        <QcStatusButtons
          orderId={orderId!}
          isOrderCancelled={isOrderCancelled}
        />
      }
    >
      <QcTabs />
    </QcDetailPageLayout>
  );
}

export default QcDetailPage;
