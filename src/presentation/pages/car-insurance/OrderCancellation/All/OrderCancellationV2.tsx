import { Button } from '@alphafounders/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import { CANCELLATION_INITIAL_VALUES } from 'presentation/pages/car-insurance/orders/filter.helper';
import { getString } from 'presentation/theme/localization';

import StatusDialog from 'presentation/components/common/StatusDialog';
import { clearComment } from 'presentation/redux/actions/order/comment';
import { useLazyGetOrderCommentsQuery } from 'data/slices/orderCommentSlice';

import CommentSectionContainer from 'presentation/components/CommentSection/CommentSection';
import CommonModal from 'presentation/components/modal/CommonModal';
import CommentTextBox from 'presentation/components/ActivityOrderSection/CommentTextbox';

import { currencyToMoney } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import CancellationStatusUpdateModal from './CancellationStatusUpdateModal';

import {
  fields,
  initialFilterV2,
  pendingOnCustomer,
  initialStatusDataV2,
  prepareFilter,
  cancellationV2Columns,
  getFieldsV2,
  omitFieldsIfNotChange,
} from './helper';

import ViewDocumentsContainer from '../../CarePay/common/ViewDocumentsContainer';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';
import CreateRefundModal from '../CreateRefund';
import {
  useLazyGetAccountingOrderItemDocumentsQuery,
  useUpdateCancellationStatusMutation,
} from 'data/slices/cancellationSlice';
import Dialog from 'presentation/components/common/Dialog';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

function CancellationAllPage() {
  const { showErrorSnackbar } = useSnackbar();
  const { data: user } = useGetAuthenticateQuery();
  const flags = useFlags([
    FeatureFlags.BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP,
  ]);
  const isRefundCalculationMethodRequired =
    flags[
      FeatureFlags
        .BROK_3264_UPDATE_CANCELLATION_RELATED_FEE_AND_FORMULA_20251114_TEMP
    ]?.enabled ?? false;
  const [orderAllColSettings, setOrderAllColSettings] =
    useState(pendingOnCustomer());
  const [statusData, setStatusData] = useState<any>(initialStatusDataV2);
  const [currentFilter, setCurrentFilter] = useState(initialFilterV2);
  const [selectedHumanId, setSelectedHumanId] = useState<string>('');
  const [documentList, setDocumentList] = useState<any[]>([]);
  const [isOpenDocument, setIsOpenDocument] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<string>();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isOpenComments, setIsOpenComments] = useState<boolean>(false);
  const [openChangeOrderForm, setOpenChangeOrderForm] = useState(false);
  const [rowDataClick, setRowDataClick] = useState<any>({});
  const [isReached, setIsReached] = useState(false);
  const [confirmationPopup, setConfirmationPopup] = useState(false);
  const [initialSelect, setInitialSelect] = useState(
    CANCELLATION_INITIAL_VALUES
  );
  const [fixedData, setFixedData] = useState<any>({});
  const handleSubmit = useCallback(
    (payload: any, newPageState?: any, columnId?: string) => {
      const payloadEdited = payload;
      if (
        payload?.paymentOption?.find(
          (p: any) => p.value === 'RABBIT_CARE_INSTALLMENT_DEBIT'
        )
      ) {
        payloadEdited.paymentMethod = 'DIRECT_DEBIT';
      }

      prepareFilter(
        payloadEdited,
        orderAllColSettings,
        setOrderAllColSettings,
        setCurrentFilter,
        currentFilter,
        newPageState,
        columnId,
        `${initialFilterV2.filter} `
      );
    },
    []
  );
  const [updateCancellationStatus, { isSuccess, isError, error }] =
    useUpdateCancellationStatusMutation();
  const [getAccountingOrderItemDocuments] =
    useLazyGetAccountingOrderItemDocumentsQuery();

  const [isSuccessOnce, setIsSuccessOnce] = useState(false);
  const [isErrorOnce, setIsErrorOnce] = useState(false);
  const [showLeadId, setShowLeadId] = useState<string>('');

  const handleResetFilter = useCallback(() => {
    setInitialSelect(CANCELLATION_INITIAL_VALUES);
    setCurrentFilter(initialFilterV2);
  }, []);

  useEffect(() => {
    setIsSuccessOnce(isSuccess);
    setTimeout(() => {
      setIsSuccessOnce(false);
    }, 2000);
  }, [isSuccess]);

  useEffect(() => {
    setIsErrorOnce(isError);
    setTimeout(() => {
      setIsErrorOnce(false);
    }, 2000);
  }, [isError]);

  const handleOpenDocument = async (
    refundAccountDocument: string,
    idCardDocument: string,
    urgentRefundFormDocument: string,
    cancellationEmailFromInsurer: string,
    orderItemId: string,
    orderItemName: string
  ) => {
    const orderItemDocuments = await getAccountingOrderItemDocuments({
      orderId: orderItemName.split('/item')[0],
      itemId: orderItemName,
    });
    const otherDocuments = orderItemDocuments?.data?.documents ?? [];

    if (
      [
        refundAccountDocument,
        idCardDocument,
        urgentRefundFormDocument,
        cancellationEmailFromInsurer,
        otherDocuments?.length > 0,
      ].some(Boolean)
    ) {
      setSelectedHumanId(orderItemId);
      const documents = [];
      if (refundAccountDocument) {
        documents.push({
          title: 'cancellation.popup.refundAccountDocument',
          value: refundAccountDocument,
        });
      }
      if (idCardDocument) {
        documents.push({
          title: 'cancellation.popup.idCardDocument',
          value: idCardDocument,
        });
      }
      if (urgentRefundFormDocument) {
        documents.push({
          title: 'cancellation.popup.urgentRefundForm',
          value: urgentRefundFormDocument,
        });
      }
      if (cancellationEmailFromInsurer) {
        documents.push({
          title: 'cancellation.popup.cancellationEmailFromInsurer',
          value: cancellationEmailFromInsurer,
        });
      }

      otherDocuments.forEach((document: any) => {
        documents.push({
          title: 'cancellation.popup.otherDocument',
          value: document?.document,
        });
      });

      setSelectedDocument(
        refundAccountDocument ??
          idCardDocument ??
          urgentRefundFormDocument ??
          cancellationEmailFromInsurer
      );
      setDocumentList(documents);
      setIsOpenDocument(true);
    } else {
      showErrorSnackbar(getString('carepay.contract.userNoDocument'));
    }
  };

  const handleOpenComments = (orderItemId: string, orderItemName: string) => {
    const orderId = orderItemName.split('/');
    setSelectedOrderId(orderId[1]);
    setSelectedHumanId(orderItemId);
    setIsOpenComments(true);
  };

  const [openRefundForm, setOpenRefundForm] = useState(false);

  const handleOpenRefundForm = (row: any) => {
    setRowDataClick(row);
    setOpenRefundForm(true);
  };

  const handleOpenChangeOrder = (data: any) => {
    setRowDataClick(data);
    setStatusData({
      grossPremium: data?.grossPremium ?? '0',
      invoiceAmount: data?.invoicedAmount ?? '0',
      refundAmountFromInsurer:
        data?.accounting?.refundInsurerAmount === null
          ? '0'
          : data?.refundAmountFromInsurer?.replace('-', ''),
      totalCancellationFee: data?.totalCancellationFee ?? '0',
      usedCreditShell: data?.usedCreditShell ?? '0',
      availableCreditShell: data?.availableCreditShell ?? '0',
      leadHumanId: data.attributes.orderHumanId,
      cancellationStatus: data?.cancellationStatus,
      commissionClawback: data?.commissionClawback ?? '0',
      refundCalculationMethod: data?.refundCalculationMethod ?? '',
      creditUsed: Boolean(data?.item?.creditUsed),
    });
    setOpenChangeOrderForm(true);
  };

  const { TableComponent: TabContent, TopComponent } = useTableList(
    'pendingCancelSubmissionV2',
    cancellationV2Columns(
      handleOpenDocument,
      handleOpenComments,
      handleOpenRefundForm,
      handleOpenChangeOrder,
      user?.role === UserRoleID.InboundAgent
    ) as any,
    currentFilter,
    useLazySearchOrdersQuery
  );

  const [fetchComments, { data: commentsData }] =
    useLazyGetOrderCommentsQuery();
  const dispatch = useDispatch();

  async function getData(pageToken: any = '') {
    if (!selectedOrderId) {
      return;
    }
    await fetchComments({ orderId: selectedOrderId, pageToken });
  }

  const loadMore = () => {
    if (commentsData?.nextPageToken !== '' && selectedOrderId) {
      getData(commentsData.nextPageToken);
    }
  };

  const clearAllComment = async () => {
    dispatch(clearComment());
  };

  const clearAndGet = () => {
    clearAllComment();
    getData(commentsData?.nextPageToken ?? '');
  };

  useEffect(() => {
    clearAndGet();
  }, [selectedOrderId]);

  const commentProps = useMemo(
    () => ({
      loadMore,
      getData,
      data: commentsData ?? [],
    }),
    [commentsData]
  );

  useEffect(() => {
    if (commentsData?.nextPageToken === '') {
      setIsReached(true);
    }
  }, [commentsData?.nextPageToken]);

  const handleUpdateStatus = async (
    onlySave: boolean = false,
    createRefund: boolean = false
  ) => {
    const orderItemId = rowDataClick?.orderItemName;

    const feesPayload = isRefundCalculationMethodRequired
      ? {
          waive_processing_fee: !statusData?.processingFeeChecked,
          waive_cancellation_fee: !statusData?.cancellationFeeChecked,
          waive_discount_fee: !statusData?.discountProRateChecked,
          waive_voucher_fee: !statusData?.voucherChecked,
        }
      : {};

    const payload = {
      commission_clawback: [undefined, null, '', '-'].includes(
        statusData?.commissionClawback?.commissionClawback ??
          statusData?.commissionClawback
      )
        ? undefined
        : {
            ...currencyToMoney(
              (statusData?.commissionClawback?.commissionClawback ??
                statusData?.commissionClawback) as unknown as number
            ),
          },
      refund_calculation_method:
        statusData?.refundCalculationMethod?.value ??
        statusData?.refundCalculationMethod ??
        undefined,

      refund_insurer_amount: [undefined, null, '', '-'].includes(
        statusData?.refundAmountFromInsurer
      )
        ? undefined
        : {
            ...currencyToMoney(
              statusData?.refundAmountFromInsurer as unknown as number
            ),
          },
    };

    try {
      const response = await updateCancellationStatus({
        request: {
          ...omitFieldsIfNotChange(payload, fixedData),
          ...feesPayload,
        },
        parent: orderItemId,
        ...(createRefund
          ? {
              createRefund: !onlySave,
            }
          : {
              changeOrder: !onlySave,
            }),
      });

      if (
        response?.data?.leadForChangeOrder &&
        rowDataClick?.accounting?.leadForChangeOrder === ''
      ) {
        setShowLeadId(response?.data?.leadForChangeOrder);
      }
    } catch (err) {
      console.error('Error updating cancellation status:', err);
    }
  };

  const handleOpenFile = (fileName: string) => {
    setSelectedDocument(fileName);
    setIsOpenDocument(true);
  };

  return (
    <div data-testid="cancellation-page">
      <Dialog
        open={Boolean(showLeadId)}
        handleToggle={() => setShowLeadId('')}
        data-testid="show-lead-id"
        title={getString('createNewLeadModal.title')}
        content={
          <p>
            {getString('createNewLeadModal.creationMessage', {
              leadHumanId: showLeadId,
            })}
          </p>
        }
      />
      {confirmationPopup && (
        <StatusDialog
          id="refund-confirmation-popup"
          isOpen={confirmationPopup}
          setIsOpen={setConfirmationPopup}
          blueTitle={getString('cancellation.popup.refundConfirmationTitle')}
          showCloseBtn
          showCloseBtnText={getString('text.no')}
          actionButtonShowFirst
          actionButton={
            <Button
              variant="primary"
              className="uppercase h-10 px-6 mr-2 font-sans"
              dataTestId="confirm-btn"
              text={getString('text.yes')}
              onClick={() => {
                setConfirmationPopup(false);
                setOpenRefundForm(true);
              }}
            />
          }
          content={
            <div className="text-center">
              <p className="text-lg font-semibold">
                {getString('cancellation.popup.refundConfirmationMessage', {
                  orderItemId: rowDataClick?.orderItemId,
                })}
              </p>
            </div>
          }
        />
      )}
      {openRefundForm && (
        <CreateRefundModal
          onClose={() => setOpenRefundForm(false)}
          row={rowDataClick}
          updateCancellationStatus={updateCancellationStatus as any}
          isSuccess={isSuccessOnce}
          isError={isErrorOnce}
          error={error}
          setOpenClosePopup={setOpenRefundForm}
          handleOpenFile={handleOpenFile}
          isRefundCalculationMethodRequired={isRefundCalculationMethodRequired}
        />
      )}
      <StatusDialog
        isOpen={isOpenDocument}
        setIsOpen={setIsOpenDocument}
        content={
          <ViewDocumentsContainer
            ActionButtons={null}
            selectedDocument={selectedDocument ?? ''}
            setSelectedDocument={setSelectedDocument as any}
            documents={documentList}
            unknownFileType
          />
        }
        id="contract-approval"
        maxWidth="md"
        width={1080}
        blueTitle={getString('cancellation.popup.headerTitleRefund', {
          orderItemId: selectedHumanId,
        })}
      />

      <StatusDialog
        maxWidth="xl"
        id="cancellation-popup"
        isOpen={openChangeOrderForm}
        setIsOpen={setOpenChangeOrderForm}
        blueTitle={getString('cancellation.popup.headerTitleV2', {
          orderItemId: rowDataClick?.orderItemId,
        })}
        content={
          <CancellationStatusUpdateModal
            orderItemId={rowDataClick?.item?.name}
            updateStatus={handleUpdateStatus}
            isSuccess={isSuccessOnce}
            isError={isErrorOnce}
            error={error}
            setOpenClosePopup={setOpenChangeOrderForm}
            fields={fields()}
            currentTab="tabv2"
            setStatusData={setStatusData}
            setIsOpen={setOpenChangeOrderForm}
            statusData={statusData}
            buttonText={getString('cancellation.popup.saveAndCreateNewLead')}
            extraButton={
              <Button
                variant="primary"
                className="uppercase h-10 px-6 mr-2 font-sans"
                dataTestId="approve-btn"
                text={getString('cancellation.popup.save')}
                onClick={() => handleUpdateStatus(true)}
              />
            }
            setFixedData={setFixedData}
            isRefundCalculationMethodRequired={
              isRefundCalculationMethodRequired
            }
          />
        }
      />
      <CommonModal
        maxWidth="sm"
        titleCenter
        title={getString('cancellation.popup.commentTitle', {
          orderItemId: selectedHumanId,
        })}
        isShowCloseBtn
        open={isOpenComments}
        handleCloseModal={() => setIsOpenComments(false)}
        dataTestId="update-modal"
        className="px-2 cancellation-comment-container"
      >
        <div className="my-4 text-left">
          <span className="border-0 border-b-2 border-solid border-primary font-md font-bold text-primary py-2 px-4">
            {getString('text.comment')}
          </span>
        </div>
        <div className="my-3">
          <CommentTextBox
            className="w-full min-h-[30px] p-2"
            orderId={selectedOrderId}
          />
        </div>
        <CommentSectionContainer {...commentProps} isReached={isReached} />
      </CommonModal>
      <div className="grid mb-2">
        <FilterPanel
          fields={getFieldsV2() as any}
          initialValues={initialSelect}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
        />
      </div>
      <div className="grid">
        <div className="flex flex-col bg-white relative overflow-scroll">
          <div className="flex p-4 justify-end">
            <div>
              <TopComponent />
            </div>
          </div>
          <TabContent />
        </div>
      </div>
    </div>
  );
}

export default CancellationAllPage;
