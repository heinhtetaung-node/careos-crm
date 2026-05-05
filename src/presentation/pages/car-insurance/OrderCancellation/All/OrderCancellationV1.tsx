import { Tab } from '@alphafounders/ui';
import type { TabData } from '@alphafounders/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import { CANCELLATION_INITIAL_VALUES } from 'presentation/pages/car-insurance/orders/filter.helper';
import { getString } from 'presentation/theme/localization';

import StatusDialog from 'presentation/components/common/StatusDialog';
import {
  useGetAllBanksQuery,
  useLazyGetAllCancellationsQuery,
  useUpdateCancellationStatusMutation,
} from 'data/slices/cancellationSlice';
import { clearComment } from 'presentation/redux/actions/order/comment';
import { useLazyGetOrderCommentsQuery } from 'data/slices/orderCommentSlice';

import CommentSectionContainer from 'presentation/components/CommentSection/CommentSection';
import CommonModal from 'presentation/components/modal/CommonModal';
import CommentTextBox from 'presentation/components/ActivityOrderSection/CommentTextbox';

import { currencyToMoney, moneyToCurrency } from 'utils/currency';
import { useFlags } from 'flagsmith/react';

import FeatureFlags from 'config/flagsmithConfig';
import useSnackbar from 'utils/snackbar';

import CancellationStatusUpdateModal from './CancellationStatusUpdateModal';

import {
  TabIds,
  TabIdsWithStatusMapping,
  fields,
  getFields,
  initialFilter,
  pendingOnCustomer,
  tabConfig,
  initialStatusData,
  bankLists,
  prepareFilter,
  uploadDocumentSlipOrID,
} from './helper';

import ViewDocumentsContainer from '../../CarePay/common/ViewDocumentsContainer';
import { useUploadDocumentFileMutation } from 'data/slices/transactionSlice';
import { useLazySearchOrdersQuery } from 'data/slices/orderSlice';

function CancellationAllPage() {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const { data: banks } = useGetAllBanksQuery({});
  const [orderAllColSettings, setOrderAllColSettings] =
    useState(pendingOnCustomer());

  const [currentTab, setCurrentTab] = useState<TabData['id']>(
    TabIds.PENDING_ON_CUSTOMER
  );
  const [isOpen, setIsOpen] = useState(false);

  const [statusData, setStatusData] = useState<any>(initialStatusData);
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  const [documentList, setDocumentList] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>();
  const [isOpenDocument, setIsOpenDocument] = useState<boolean>(false);
  const [isOpenComments, setIsOpenComments] = useState<boolean>(false);
  const [selectedHumanId, setSelectedHumanId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isReached, setIsReached] = useState(false);
  const [uploadDocumentFile] = useUploadDocumentFileMutation();

  const flags = useFlags([
    FeatureFlags.BROK_243_SWITCH_CANCELLATION_ENDPOINT_20240905_temp,
  ]);

  const switchCancellationEndpoint =
    flags[FeatureFlags.BROK_243_SWITCH_CANCELLATION_ENDPOINT_20240905_temp]
      ?.enabled;

  const handleOpenDocument = (
    refundAccountDocument: string,
    idCardDocument: string,
    orderItemId: string
  ) => {
    if (refundAccountDocument || idCardDocument) {
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
      setSelectedDocument(refundAccountDocument || idCardDocument);
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

  const {
    rowDataClick,
    TableComponent: TabContent,
    TopComponent,
  } = useTableList(
    'pendingCancelSubmission',
    pendingOnCustomer(handleOpenDocument, handleOpenComments) as any,
    currentFilter,
    switchCancellationEndpoint
      ? useLazyGetAllCancellationsQuery
      : useLazySearchOrdersQuery
  );
  const [updateCancellationStatus, { isSuccess, isError }] =
    useUpdateCancellationStatusMutation();

  useEffect(() => {
    if (currentTab === TabIds.PENDING_CONFIRMATION_ON_CUSTOMER) {
      setStatusData({
        ...statusData,
        ...(rowDataClick?.accounting?.policyEndTime
          ? { policyEndDate: rowDataClick?.accounting?.policyEndTime }
          : {
              policyEndDate: '',
            }),
        ...(rowDataClick?.accounting?.refundAccountNo
          ? { bankAccountNumber: rowDataClick?.accounting?.refundAccountNo }
          : {
              bankAccountNumber: '',
            }),
        ...(rowDataClick?.accounting?.refundBank
          ? {
              bankName: bankLists.find(
                (bank) => bank.name === rowDataClick?.accounting?.refundBank
              )?.value,
            }
          : {
              bankName: '',
            }),
        ...([true, false].includes(
          rowDataClick?.accounting?.customerReceivedPolicy
        )
          ? {
              customerReceivePolicy:
                rowDataClick?.accounting?.customerReceivedPolicy,
            }
          : {
              customerReceivePolicy: null,
            }),
        ...(rowDataClick?.accounting?.refundAccountDocument
          ? {
              slip: {
                display_name: rowDataClick?.accounting?.refundAccountDocument,
              },
            }
          : {}),
      } as any);
    }
    if (currentTab === TabIds.PENDING_CANCEL_CONFIRMATION_SUBMITSSION) {
      setStatusData({
        ...statusData,
        ...(rowDataClick?.accounting?.refundCalculationMethod &&
        rowDataClick?.accounting?.refundCalculationMethod !==
          'REFUND_CALCULATION_METHOD_UNSPECIFIED'
          ? {
              refundCalculationMethod:
                rowDataClick?.accounting?.refundCalculationMethod,
            }
          : {
              refundCalculationMethod: '',
            }),
        ...(rowDataClick?.accounting?.refundInsurerAmount
          ? {
              refundAmountFromInsurer: moneyToCurrency(
                rowDataClick?.accounting?.refundInsurerAmount
              ),
            }
          : {
              refundAmountFromInsurer: '',
            }),
        ...(rowDataClick?.accounting?.refundAmountCustomer
          ? {
              refundAmountToCustomer: moneyToCurrency(
                rowDataClick?.accounting?.refundAmountCustomer
              ),
            }
          : {
              refundAmountToCustomer: '',
            }),
      } as any);
    }
    if (currentTab === TabIds.COMPLETED) {
      setStatusData({
        ...statusData,
        ...(rowDataClick?.accounting?.commissionClawback
          ? {
              commissionClawback: moneyToCurrency(
                rowDataClick?.accounting?.commissionClawback
              ),
            }
          : {
              commissionClawback: '',
            }),
      } as any);
    }
    setIsOpen(rowDataClick !== undefined);
  }, [rowDataClick]);

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      showSuccessSnackbar(
        getString('cancellation.popup.updateStatusSuccessfully')
      );
      setStatusData(initialStatusData);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isOpen) {
      setStatusData(initialStatusData);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isError) {
      showErrorSnackbar(getString('cancellation.popup.updateStatusFailed'));
    }
  }, [isError]);

  useEffect(() => {
    switch (currentTab) {
      case TabIds.PENDING_ON_CUSTOMER:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_CUSTOMER_CONTACT"`,
        });
        break;
      case TabIds.PENDING_CONFIRMATION_ON_CUSTOMER:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_CUSTOMER_CONFIRM"`,
        });
        break;
      case TabIds.PENDING_POLICY_RETURN:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_CUSTOMER_POLICY_RETURN"`,
        });
        break;
      case TabIds.PENDING_CANCEL_SUBMITSSION:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_INSURER_CONTACT"`,
        });
        break;
      case TabIds.PENDING_CANCEL_CONFIRMATION_SUBMITSSION:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_INSURER_CONFIRM"`,
        });
        break;
      case TabIds.PENDING_REFUND:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_CUSTOMER_REFUND"`,
        });
        break;
      case TabIds.COMPLETED:
        setCurrentFilter({
          ...currentFilter,
          filter: `item.isCancelled=true accounting.cancellationStatus="CANCELLATION_STATUS_COMPLETED"`,
        });
        break;
      default:
    }
  }, [currentTab]);

  const updateStatus = async () => {
    const orderItemId = rowDataClick?.orderItemName;
    let payload = {};
    const bankId = banks?.banks?.find(
      (b: { shortName: string }) => b.shortName === statusData?.bankName
    )?.name;
    let slipDocument = { name: '' };
    let documentIdDocument = { name: '' };
    if (currentTab === TabIds.PENDING_CONFIRMATION_ON_CUSTOMER) {
      if (statusData?.slip?.size) {
        slipDocument = await uploadDocumentSlipOrID({
          type: 'slip',
          orderItemId,
          showErrorSnackbar,
          statusData,
          uploadDocumentFile,
        });
      }

      if (statusData?.documentId?.size) {
        documentIdDocument = await uploadDocumentSlipOrID({
          type: 'documentId',
          orderItemId,
          showErrorSnackbar,
          statusData,
          uploadDocumentFile,
        });
      }
    }

    switch (currentTab) {
      case TabIds.PENDING_ON_CUSTOMER:
        payload = {
          cancellation_customer_contact_time:
            statusData?.cancellationContactedDate,
        };
        break;
      case TabIds.PENDING_CONFIRMATION_ON_CUSTOMER:
        payload = {
          policy_end_time: statusData?.policyEndDate || undefined,
          refund_account_no: statusData?.bankAccountNumber || undefined,
          refund_bank: bankId || undefined,
          customer_received_policy: statusData?.customerReceivePolicy
            ? JSON.parse(statusData?.customerReceivePolicy)
            : undefined,
          refund_account_document: slipDocument?.name || undefined,
          id_card_document: documentIdDocument?.name || undefined,
        };
        break;
      case TabIds.PENDING_POLICY_RETURN:
        payload = {
          policy_return_time: statusData?.policyReturnDate,
        };
        break;
      case TabIds.PENDING_CANCEL_SUBMITSSION:
        payload = {
          cancellation_insurer_contact_time:
            statusData?.cancellationContactedDateInsurer,
        };
        break;
      case TabIds.PENDING_CANCEL_CONFIRMATION_SUBMITSSION:
        payload = {
          refund_calculation_method:
            statusData?.refundCalculationMethod || undefined,
          refund_insurer_amount: statusData?.refundAmountFromInsurer
            ? {
                ...currencyToMoney(
                  statusData?.refundAmountFromInsurer as unknown as number
                ),
              }
            : undefined,
          refund_amount_customer: statusData?.refundAmountToCustomer
            ? {
                ...currencyToMoney(
                  statusData?.refundAmountToCustomer as unknown as number
                ),
              }
            : undefined,
        };
        break;
      case TabIds.PENDING_REFUND:
        payload = {
          refund_customer_time: statusData?.refundDate,
          actual_refund_amount_customer: currencyToMoney(
            statusData?.actualRefundAmountToCustomer as unknown as number
          ),
        };
        break;
      case TabIds.COMPLETED:
        payload = {
          commission_clawback: statusData?.commissionClawback
            ? {
                ...currencyToMoney(
                  statusData?.commissionClawback as unknown as number
                ),
              }
            : undefined,
        };
        break;
      default:
        break;
    }

    updateCancellationStatus({
      request: payload,
      parent: orderItemId,
    });
  };

  const checkDisabledUpdateBtn = () => {
    switch (currentTab) {
      case TabIds.PENDING_ON_CUSTOMER:
        return !statusData?.cancellationContactedDate;
      case TabIds.PENDING_CONFIRMATION_ON_CUSTOMER:
        return !(
          statusData?.policyEndDate ||
          statusData?.bankAccountNumber ||
          statusData?.bankName ||
          statusData?.customerReceivePolicy ||
          statusData?.slip?.size ||
          statusData?.documentId?.size
        );
      case TabIds.PENDING_POLICY_RETURN:
        return !statusData?.policyReturnDate;
      case TabIds.PENDING_CANCEL_SUBMITSSION:
        return !statusData?.cancellationContactedDateInsurer;
      case TabIds.PENDING_CANCEL_CONFIRMATION_SUBMITSSION:
        return !(
          statusData?.refundCalculationMethod ||
          statusData?.refundAmountFromInsurer ||
          statusData?.refundAmountToCustomer
        );
      case TabIds.PENDING_REFUND:
        return !(
          statusData?.refundDate && statusData?.actualRefundAmountToCustomer
        );
      case TabIds.COMPLETED:
        return !statusData?.commissionClawback;
      default:
        return true;
    }
  };

  const handleSubmit = useCallback(
    (payload: any, newPageState?: any, columnId?: string) => {
      const tabFilter = `item.isCancelled=true accounting.cancellationStatus="${TabIdsWithStatusMapping[currentTab as TabIds]}" `;
      prepareFilter(
        payload,
        orderAllColSettings,
        setOrderAllColSettings,
        setCurrentFilter,
        currentFilter,
        newPageState,
        columnId,
        tabFilter
      );
    },
    [currentTab]
  );

  const handleResetFilter = useCallback(() => {
    setCurrentFilter({
      ...currentFilter,
      filter: `item.isCancelled=true accounting.cancellationStatus="${TabIdsWithStatusMapping[currentTab as TabIds]}"`,
    });
  }, [currentTab]);

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

  return (
    <div data-testid="cancellation-page">
      <StatusDialog
        isOpen={isOpenDocument}
        setIsOpen={setIsOpenDocument}
        content={
          <ViewDocumentsContainer
            ActionButtons={<></>}
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
      <StatusDialog
        maxWidth="xl"
        id="cancellation-popup"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        blueTitle={getString('cancellation.popup.headerTitle', {
          orderItemId: rowDataClick?.orderItemId,
        })}
        content={
          <CancellationStatusUpdateModal
            fields={fields()}
            currentTab={currentTab}
            setStatusData={setStatusData}
            updateStatus={updateStatus}
            checkDisabledUpdateBtn={checkDisabledUpdateBtn}
            setIsOpen={setIsOpen}
            statusData={statusData}
            setOpenClosePopup={setIsOpen}
            setFixedData={() => {}}
          />
        }
      />
      <div className="grid mb-2">
        <FilterPanel
          fields={getFields() as any}
          initialValues={CANCELLATION_INITIAL_VALUES}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
          collapseButton={false}
        />
      </div>
      <div className="grid">
        <Tab tabs={tabConfig} onTabChange={(tab) => setCurrentTab(tab?.id)}>
          <div className="flex flex-col bg-white relative">
            <div className="flex p-4 justify-end">
              <div>
                <TopComponent />
              </div>
            </div>
            <TabContent />
          </div>
        </Tab>
      </div>
    </div>
  );
}

export default CancellationAllPage;
