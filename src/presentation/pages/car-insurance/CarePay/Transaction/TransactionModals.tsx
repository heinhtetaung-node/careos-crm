/* eslint-disable eqeqeq */
import { SuccessIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { uploadDocumentViaDocumentService } from '@careos/utils';
import _get from 'lodash/get';
import React, { useEffect, useMemo, useState } from 'react';
import UploadComponent from 'presentation/components/common/UploadComponent';
import { useGetDocumentDetailsQuery } from 'data/slices/documentUploadSlice';
import {
  useCreateDirectPaymentMutation,
  useRefundTransactionMutation,
  useSendSMSMutation,
  useUpdateFollowupMutation,
  useUpdateFollowupStatusMutation,
  useUpdateSMSStatusMutation,
  useUploadDocumentFileMutation,
} from 'data/slices/transactionSlice';
import Datepicker from 'presentation/components/common/Datepicker';
import Input from 'presentation/components/controls/Input';
import Select from 'presentation/components/controls/Select';
import CopyToClipboard from 'presentation/components/CopyToClipboard';
import { PreviewFile } from 'presentation/components/modal/FileBrowseModal';
import Spinner from 'presentation/components/Spinner';
import {
  getLanguage,
  getString,
  LANGUAGES,
} from 'presentation/theme/localization';
import { NewDateFormatters } from 'shared/helper/utilities';
import { RefundPayload } from 'data/slices/transactionSlice/interface';
import { useGetAllBanksQuery } from 'data/slices/cancellationSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';

import useSnackbar from 'utils/snackbar';

import {
  OpnAccountRecipientOptions,
  PaymentLinkStatusOptions,
  PaymentTransactionStatusOptions,
  QCOptions,
  RefundMethodOptions,
  SMSScheduleOptions,
} from './helper';
import PaymentHistoryModal from './PaymentHistoryModal';

import { PaymentMethodOptions } from '../common/helper';

function UpdateStatusModal({
  modalInfo,
  handleModal,
  refetch,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
}>) {
  const [payData, setPayData] = useState<any>({
    slip: null,
    status: null,
    paymentDate: null,
    paymentMethod: null,
  });

  const { ISODate } = NewDateFormatters();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [
    updateFollowupStatus,
    {
      isLoading: updatingStatus,
      isSuccess: updatedStatusSuccessfully,
      isError: isUpdateStatusError,
      error: updateStatusError,
    },
  ] = useUpdateFollowupStatusMutation();
  const [uploadDocumentFile] = useUploadDocumentFileMutation();
  const [
    createDirectPayment,
    {
      isLoading: updatingPayment,
      isSuccess: updatedPaymentSuccessfully,
      isError: isUpdatePaymentError,
      error: updatePaymentError,
    },
  ] = useCreateDirectPaymentMutation();

  const { type, label, shouldAskForSlip, uid } = modalInfo;
  const error = updatePaymentError || updateStatusError;
  const isError = isUpdatePaymentError || isUpdateStatusError;
  const isLoading = updatingPayment || updatingStatus;
  const isSuccess = updatedPaymentSuccessfully || updatedStatusSuccessfully;
  const paymentOptions = PaymentTransactionStatusOptions;

  const isSelectedPaid =
    paymentOptions.filter(
      (opt) => opt.id == payData?.status?.id && opt.value === 'PAID'
    ).length > 0;

  const shouldShowAccount = ['BANK_TRANSFER', 'EDC', 'VEDC'].includes(
    payData?.paymentMethod?.value
  );

  const isDisabled =
    (shouldAskForSlip &&
      isSelectedPaid &&
      Object.entries(payData)
        .map((pay) => pay[1] !== null)
        .some((_: boolean) => _ === false)) ||
    (shouldShowAccount && !payData?.account) ||
    isLoading ||
    !payData.status;

  const handleUpdateStatus = async () => {
    if (modalInfo.shouldAskForSlip && isSelectedPaid) {
      let documentData = null;
      try {
        const data = (await uploadDocumentFile({
          file: payData.slip,
          uid,
        })) as any;

        const { document, uploadUrl } = data.data;
        documentData = document;

        await uploadDocumentViaDocumentService(
          uploadUrl,
          payData.slip.originalFile
        );
      } catch (_err) {
        showErrorSnackbar(
          getString('text.errorMessage', {
            message: getString('text.uploadFailed'),
          })
        );
        return;
      }

      const directPaymentPayload: any = {
        slip: documentData.name,
        payment_date: ISODate(payData.paymentDate),
        payment_method: payData.paymentMethod?.value,
      };

      if (shouldShowAccount && payData.account) {
        directPaymentPayload.service_provider = payData.account?.value;
      }
      await createDirectPayment({
        data: directPaymentPayload,
        uid,
      });

      return;
    }

    await updateFollowupStatus({
      uid,
      type: payData.status.value,
    });
  };
  const handlePayData = (data: any) => setPayData({ ...payData, ...data });

  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      showSuccessSnackbar(getString('paymentStatus.successful'));
      refetch();
    }
    if (isError) {
      const { message = '' } = (error as any).data;
      showErrorSnackbar(
        getString('text.errorMessage', {
          message,
        })
      );
    }
    if (isSuccess || isError) {
      handleModal({
        ...modalInfo,
        show: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSuccess, isError]);

  return (
    <div className="flex flex-col py-4" data-testid="status-modal">
      <Select
        fixedLabel
        data-testid="select-status"
        label={getString('text.status')}
        name="status"
        placeholder={getString('package.selectPlaceholder')}
        options={label === 'status' ? paymentOptions : QCOptions}
        onChange={(e) => {
          let status = null;
          const statusId = e.target.value;
          if (label === 'status') {
            status = paymentOptions.find((opt) => opt.id == statusId);
          } else {
            status = QCOptions.find((opt) => opt.id == statusId);
          }
          handlePayData({ status });
        }}
        value={payData?.status?.id}
      />
      {isSelectedPaid && shouldAskForSlip ? (
        <div className="flex flex-col">
          <Datepicker
            textFieldProps={{
              label: `${getString('transactionSlipModal.paymentDate')}*`,
              className: 'my-3',
              name: 'payment-date',
              dataTestId: 'payment-date',
              placeholder: getString('package.selectPlaceholder'),
            }}
            minDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 20))
            }
            maxDate={new Date()}
            dateFormat="dd/MM/yyyy"
            onChange={(date: any) => handlePayData({ paymentDate: date })}
            dateValue={payData?.paymentDate}
          />
          <div className="flex flex-row gap-2">
            <Select
              fixedLabel
              name="paymentMethod"
              label={`${getString('transactionSlipModal.paymentMethod')}*`}
              placeholder={getString('package.selectPlaceholder')}
              options={PaymentMethodOptions.filter(
                (method) => !['QR_CODE', 'ONLINECARD'].includes(method.value)
              )}
              onChange={(e) =>
                handlePayData({
                  paymentMethod: PaymentMethodOptions.find(
                    (opt) => opt.id == e.target.value
                  ),
                })
              }
              value={payData?.paymentMethod?.id}
            />
            {shouldShowAccount && (
              <Select
                fixedLabel
                label={`${getString('transactionSlipModal.account')}*`}
                placeholder={getString('package.selectPlaceholder')}
                options={OpnAccountRecipientOptions}
                onChange={(e) =>
                  handlePayData({
                    account: OpnAccountRecipientOptions.find(
                      (opt) => opt.id == e.target.value
                    ),
                  })
                }
                value={payData?.account?.id}
              />
            )}
          </div>
          <UploadComponent
            slip={payData.slip}
            setSlip={(file: any) => handlePayData({ slip: file })}
          />
        </div>
      ) : null}
      <div className="flex justify-end mt-5">
        <Button
          isLoading={isLoading}
          disabled={isDisabled}
          text={getString('text.update')}
          onClick={handleUpdateStatus}
          className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
        />
        <Button
          disabled={isLoading}
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
}

function UpdateSMSModal({
  modalInfo,
  handleModal,
  refetch,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
}>) {
  const [smsStatus, setSmsStatus] = useState(SMSScheduleOptions[0]);

  const { type } = modalInfo;
  const [updateSms, { isLoading, isError, isSuccess, error }] =
    useUpdateSMSStatusMutation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      showSuccessSnackbar(getString('paymentStatus.successful'));
      refetch();
    }
    if (isError) {
      const { message = '' } = (error as any).data;
      showErrorSnackbar(
        getString('text.errorMessage', {
          message,
        })
      );
    }
    if (isSuccess || isError) {
      handleModal({
        ...modalInfo,
        show: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSuccess, isError]);

  return (
    <div className="flex flex-col px-2" data-testid="sms-modal">
      <div className="flex gap-3">
        <Select
          fixedLabel
          label="Auto SMS flag"
          placeholder={getString('package.selectPlaceholder')}
          options={SMSScheduleOptions}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedOption: any = SMSScheduleOptions.find(
              (opt: any) => opt.id == selectedId
            );
            if (selectedOption.id !== smsStatus.id) {
              setSmsStatus(selectedOption);
            }
          }}
          value={smsStatus.id}
        />
      </div>
      <div className="flex justify-end mt-5">
        <Button
          text={getString('text.update')}
          isLoading={isLoading}
          disabled={isLoading}
          onClick={() =>
            updateSms({
              uid: modalInfo.uid,
              shouldSendSms: smsStatus.value !== 'false',
            })
          }
          className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
        />
        <Button
          disabled={isLoading}
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
}

function UpdateDateModal({
  modalInfo,
  handleModal,
  refetch,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
}>) {
  const { type, dueDate, uid } = modalInfo;
  const [date, setDate] = useState(dueDate ?? null);

  const { ISODate } = NewDateFormatters();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [updateFollowup, { isLoading, isSuccess, isError, error }] =
    useUpdateFollowupMutation();

  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      showSuccessSnackbar(getString('paymentStatus.successful'));
      refetch();
    }
    if (isError) {
      const { message = '' } = (error as any).data;
      showErrorSnackbar(
        getString('text.errorMessage', {
          message,
        })
      );
    }
    if (isSuccess || isError) {
      handleModal({
        ...modalInfo,
        show: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSuccess, isError]);

  return (
    <div className="flex flex-col px-2" data-testid="dueDate-modal">
      <Datepicker
        textFieldProps={{
          label: `${getString('menu.carePay.dueDate')}`,
          className: 'my-3',
          name: 'due-date',
          dataTestId: 'due-date',
          placeholder: getString('package.selectPlaceholder'),
        }}
        minDate={new Date()}
        dateFormat="dd/MM/yyyy"
        onChange={(_date: any) => setDate(_date)}
        dateValue={date}
      />
      <div className="flex justify-end mt-5">
        <Button
          rounded
          dataTestId="dueDate-update-btn"
          text={getString('text.update')}
          isLoading={isLoading}
          disabled={isLoading && !!date}
          onClick={() =>
            updateFollowup({ uid, followup: { due_date: ISODate(date) } })
          }
          className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
        />
        <Button
          rounded
          disabled={isLoading}
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
}
function CreatePaymentLinkModal({
  modalInfo,
  handleModal,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
}>) {
  const [sendSMS, { isLoading, isError, isSuccess, error }] =
    useSendSMSMutation();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const { uid, sendSms } = modalInfo;
  const paymentUrl = `${process.env.VITE_QFLOW_URI}product/care-pay?tn=${uid}`;

  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      showSuccessSnackbar(getString('text.sendSmsSuccess'));
    }
    if (isError) {
      const { message = '' } = (error as any).data;
      showErrorSnackbar(
        getString('text.errorMessage', {
          message,
        })
      );
    }
    if (isSuccess || isError) {
      handleModal({
        ...modalInfo,
        show: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSuccess, isError]);

  return (
    <div
      className="px-2 rounded-sm flex flex-col"
      data-testid="createPaymentLink-modal"
    >
      <div className="flex flex-col my-4 bg-gray-100 p-4 justify-center items-center">
        <SuccessIcon className="w-12 h-12" />
        <span className="font-semibold mt-4">
          {getString('text.paymentLink')}:{' '}
        </span>
        <CopyToClipboard
          mainClassName="cursor-pointer hover:text-primary hover:underline"
          text={paymentUrl}
          iconColor="primary"
          fontSize="small"
        />
      </div>
      <Button
        isLoading={isLoading}
        disabled={!uid || isLoading || !sendSms}
        onClick={() => sendSMS({ uid, shouldSendSMS: sendSms })}
        text={`${getString('text.sendSms')}`}
        variant="primary"
        className="px-5 py-4 my-2"
      />
    </div>
  );
}

function TransactionSlipModal({
  modalInfo,
  handleModal,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
}>) {
  const { showErrorSnackbar } = useSnackbar();
  const { DDMMYYYY } = NewDateFormatters();
  const { type, data } = modalInfo;

  let docType = 'jpg';
  const {
    data: documentDetail,
    isFetching,
    isError,
    error: documentDetailError,
  } = useGetDocumentDetailsQuery(data.paySlipImageResource, {
    skip: !data.paySlipImageResource,
  });

  if (documentDetail?.contentType === 'application/pdf') {
    docType = 'pdf';
  }

  if (isError) {
    showErrorSnackbar(
      _get(
        documentDetailError,
        'data.message',
        getString('clipboard.apiFailure')
      )
    );
  }

  return (
    <div className="flex flex-col py-5" data-testid="transaction-slip-modal">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col pl-3 pr-5 border-solid border-x-0 border-y-0 border-r border-gray-100">
          <span className="block w-full font-bold text-md border-solid border-x-0 border-y-0 border-b border-gray-100 pb-2 text-left text-primary">
            {getString('transactionSlipModal.slip')}
          </span>
          <div className="h-full min-h-[350px] pt-4">
            {isFetching ? (
              <Spinner />
            ) : (
              <PreviewFile
                document={data?.paySlipImageResource ?? ''}
                docType={docType}
                className="w-full mt-4"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col px-2">
          <span className="block w-full font-bold text-md border-solid border-x-0 border-y-0 border-b border-gray-100 pb-2 text-left text-primary">
            {getString('transactionSlipModal.slipDetail')}
          </span>
          <div className="pt-4">
            {data.paymentMethod && (
              <div className="pb-2">
                <Input
                  value={getString(
                    `paymentMethodsCarepay.${data.paymentMethod}`
                  )}
                  label={getString('transactionSlipModal.paymentMethod')}
                  fixedLabel
                  disabled
                />
              </div>
            )}
            {data.paymentDate && (
              <div className="pb-2">
                <Input
                  value={DDMMYYYY(data.paymentDate)}
                  label={getString('transactionSlipModal.paymentDate')}
                  fixedLabel
                  disabled
                />
              </div>
            )}
            {data.transactionAmount && (
              <div className="pb-2">
                <Input
                  value={data.transactionAmount}
                  label={getString('transactionSlipModal.transactionAmount')}
                  fixedLabel
                  disabled
                />
              </div>
            )}
            {data.createdDate && (
              <div className="pb-2">
                <Input
                  value={data.createdDate}
                  label={getString('transactionSlipModal.createdDate')}
                  fixedLabel
                  disabled
                />
              </div>
            )}
            {data.updatedDate && (
              <div className="pb-2">
                <Input
                  value={data.updatedDate}
                  label={getString('transactionSlipModal.updateDate')}
                  fixedLabel
                  disabled
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-5">
        <Button
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
}

function PaymentStatusLinkModal({ modalInfo, handleModal }: any) {
  const [status, setStatus] = useState(PaymentLinkStatusOptions[0]);

  const { type } = modalInfo;
  return (
    <div className="flex flex-col px-2" data-testid="paymentStatusLink-modal">
      <div className="flex gap-3">
        <Select
          fixedLabel
          label="Auto SMS flag"
          placeholder={getString('package.selectPlaceholder')}
          options={PaymentLinkStatusOptions}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedOption: any = SMSScheduleOptions.find(
              (opt: any) => opt.id == selectedId
            );
            if (selectedOption.id !== status.id) {
              setStatus(selectedOption);
            }
          }}
          value={status.id}
        />
      </div>
      <div className="flex justify-end mt-5">
        <Button
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
        <Button
          text={getString('text.update')}
          onClick={undefined}
          disabled
          className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
        />
      </div>
    </div>
  );
}

const RefundModal = ({
  modalInfo,
  handleModal,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
}>) => {
  const [isLoading, setLoading] = useState(false);
  const [refundData, setRefundData] = useState<{
    slip: {
      content_type: string;
      display_name: string;
      size: number;
      originalFile: File;
    } | null;
    bankAccountNumber: string | null;
    refundDate: string | null;
    serviceProvider: string | null;
    paymentMethod: string | null;
  }>({
    slip: null,
    refundDate: null,
    serviceProvider: null,
    paymentMethod: null,
    bankAccountNumber: null,
  });

  const [uploadDocumentFile] = useUploadDocumentFileMutation();
  const [
    refundTransaction,
    { isLoading: refundingTransaction, isSuccess, isError, error },
  ] = useRefundTransactionMutation();
  const { data: BanksData, isLoading: isGettingBanks } = useGetAllBanksQuery(
    {}
  );

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const _isLoading = refundingTransaction || isLoading || isGettingBanks;
  const isDisabled =
    Object.values(refundData).some((value) => !value) ||
    (refundData.bankAccountNumber?.length ?? 0) < 10;
  const handleRefundData = (data: any) =>
    setRefundData({ ...refundData, ...data });

  const { type, id, creditId } = modalInfo;

  const handleDocUpload = async () => {
    if (!refundData?.slip) return null;

    let documentData = null;
    try {
      setLoading(true);
      const data = (await uploadDocumentFile({
        file: refundData.slip,
        uid: id,
      })) as any;

      const { document, uploadUrl } = data.data;
      documentData = document;

      await uploadDocumentViaDocumentService(
        uploadUrl,
        refundData.slip.originalFile
      );
    } catch (_err) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: getString('text.uploadFailed'),
        })
      );
      return null;
    }

    return documentData;
  };
  const { ISODate } = NewDateFormatters();

  const handleSubmit = async () => {
    const { refundDate, serviceProvider, paymentMethod, bankAccountNumber } =
      refundData;

    if (
      !refundDate ||
      !serviceProvider ||
      !paymentMethod ||
      !bankAccountNumber
    ) {
      return;
    }

    const documentData = await handleDocUpload();
    if (!documentData?.name) return;

    const refundPayload: RefundPayload = {
      parent: `${id}/${creditId}`,
      refund: {
        refund_date: ISODate(refundDate),
        document: documentData.name,
        bank: serviceProvider,
        paymentMethod,
        account_number: parseInt(bankAccountNumber),
      },
    };

    await refundTransaction(refundPayload);
  };

  const handleAccountNumber = (val: string) => {
    const bankAccountValidationRegex = /^\d{0,10}$/;
    if (val.length > 10) return;
    if (!bankAccountValidationRegex.test(val)) {
      showErrorSnackbar(
        getString('errors.invalidValueForFields_one', {
          fields: getString('text.bankAccountNumber'),
        })
      );
      return;
    }
    setRefundData({ ...refundData, bankAccountNumber: val });
  };

  useEffect(() => {
    if (refundingTransaction) return;
    setLoading(false);
    if (isSuccess) {
      showSuccessSnackbar(getString('text.success'));
      handleModal({ type, isShow: false });
      return;
    }
    if (isError) {
      if ((error as any).data.code == 3) {
        showErrorSnackbar(getString('errorMessage.invalidBank'));
        return;
      }
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: (error as any).data.message,
        })
      );
    }
  }, [refundingTransaction, isSuccess, isError, error]);

  const selectedLang = getLanguage();

  return (
    <div className="flex flex-col py-4" data-testid="refund-modal">
      <div className="flex flex-col gap-3">
        <Datepicker
          textFieldProps={{
            label: `${getString('text.refundDate')}`,
            name: 'refund-date',
            dataTestId: 'refund-date',
            placeholder: getString('package.selectPlaceholder'),
            required: true,
          }}
          minDate={
            new Date(new Date().setFullYear(new Date().getFullYear() - 20))
          }
          maxDate={new Date()}
          dateFormat="dd/MM/yyyy"
          onChange={(date: any) => handleRefundData({ refundDate: date })}
          dateValue={refundData?.refundDate ?? undefined}
        />

        <Autocomplete
          className="mt-2"
          options={
            BanksData?.banks?.map((bank: any) => ({
              id: bank.name,
              title:
                selectedLang === LANGUAGES.ENGLISH
                  ? bank.displayNameEn
                  : bank.displayNameTh,
              value: bank.name,
            })) ?? []
          }
          onChange={(_e: any, selection: any) =>
            setRefundData({
              ...refundData,
              serviceProvider: (selection as any)?.value,
            })
          }
          disableClearable
          optionTextKey="title"
          textFieldProps={{
            placeholder: getString('package.selectPlaceholder'),
            label: getString('text.destinationBank'),
            required: true,
          }}
        />

        <Autocomplete
          className="mt-2"
          options={RefundMethodOptions}
          onChange={(_e: any, selection: any) =>
            setRefundData({
              ...refundData,
              paymentMethod: (selection as any)?.value,
            })
          }
          disableClearable
          optionTextKey="title"
          textFieldProps={{
            placeholder: getString('package.selectPlaceholder'),
            label: getString('text.refundMethod'),
            required: true,
          }}
        />
        <CommonTextField
          onChange={(e: any) => handleAccountNumber(e.target.value)}
          placeholder={getString('text.enterFieldPlaceholder', {
            field: getString('text.bankAccountNumber'),
          })}
          value={refundData.bankAccountNumber}
          label={getString('text.bankAccountNumber')}
          required
        />

        <UploadComponent
          slip={refundData.slip as any}
          setSlip={(file: any) => handleRefundData({ slip: file })}
        />
      </div>

      <div className="flex justify-end mt-5">
        <Button
          text={getString('text.update')}
          onClick={handleSubmit}
          disabled={_isLoading || isDisabled}
          isLoading={_isLoading}
          className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
        />
        <Button
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
};

export default function UpdateModal({
  modalInfo,
  handleModal,
  handleSubModal,
  refetch,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
  handleSubModal?: (data: any) => void;
  refetch: () => void;
}>) {
  const handleRefetch = () => setTimeout(() => refetch(), 1000);

  switch (modalInfo.type) {
    case 'status':
      return (
        <UpdateStatusModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    case 'sms':
      return (
        <UpdateSMSModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    case 'due-date':
      return (
        <UpdateDateModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    case 'transaction-slip':
      return <TransactionSlipModal {...{ modalInfo, handleModal }} />;
    case 'payment-link':
      return <CreatePaymentLinkModal {...{ modalInfo, handleModal }} />;
    case 'payment-history':
      return (
        <PaymentHistoryModal {...{ modalInfo, handleModal, handleSubModal }} />
      );
    case 'payment-status-link':
      return <PaymentStatusLinkModal {...{ modalInfo, handleModal }} />;
    case 'refund':
      return <RefundModal {...{ modalInfo, handleModal }} />;
    default:
      return null;
  }
}
