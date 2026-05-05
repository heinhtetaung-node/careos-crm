import React from 'react';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import DocumentCompleteButton from 'presentation/components/OrderDetailPage/DocumentCompleteButton';
import QcStatusButtons from 'presentation/components/QcDetailPage/QcStatusButtons';
import QcTabs from 'presentation/components/QcDetailPage/QcTabs';
import QcDetailPageLayout from 'presentation/components/common/QcDetailPageLayout';
import { PRODUCTS } from 'config/TypeFilter';
import { useParams } from 'react-router-dom';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

function QcDetailPage({
  hideHeaderIcon,
}: Readonly<{ hideHeaderIcon?: boolean }>) {
  const { orderId } = useParams();
  const { data: user } = useGetAuthenticateQuery();

  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const isOrderCancelled = orderDetail?.order?.isCancelled ?? false;

  const isQcAgent = user?.role === UserRoleID.QualityControl;
  const isAdminRole = [UserRoleID.Admin, UserRoleID.SuperAdmin].includes(
    user?.role as UserRoleID
  );
  const showDocumentButton = isQcAgent || isAdminRole;

  const additionalStatusButtons = (
    <>
      {showDocumentButton && (
        <DocumentCompleteButton
          orderId={orderId!}
          isDisabled={isOrderCancelled}
        />
      )}
      <QcStatusButtons orderId={orderId!} />
    </>
  );

  return (
    <QcDetailPageLayout
      productType={PRODUCTS.CAR_PRODUCT_INSURANCE}
      hideHeaderIcon={hideHeaderIcon}
      additionalStatusButtons={additionalStatusButtons}
    >
      <QcTabs />
    </QcDetailPageLayout>
  );
}

export default QcDetailPage;
