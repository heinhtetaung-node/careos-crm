import { Button } from '@alphafounders/ui';
import { uploadDocumentViaDocumentService } from '@careos/utils';
import {
  useDeleteOrderItemDocumentMutation,
  useLazyGetAccountingOrderItemDocumentsQuery,
  useUploadOrderItemDocumentMutation,
} from 'data/slices/cancellationSlice';
import { useUploadDocumentFileMutation } from 'data/slices/transactionSlice';
import { Form, Formik } from 'formik';
import DetailViewNumberInput from 'presentation/components/common/FormikFields/DetailViewNumberInput';
import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';
import FormikRadioField from 'presentation/components/common/FormikFields/FormikRadioField';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import CustomAutocomplete from 'presentation/components/common/FormikFields/LeadAutocomplete';
import UploadComponent from 'presentation/components/common/UploadComponent';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import { Checkbox as MuiCheckbox } from '@material-ui/core';
import { Option } from 'presentation/components/FilterPanel/Filters/interface';
import CommonModal from 'presentation/components/modal/CommonModal';
import { getString } from 'presentation/theme/localization';
import React, { useEffect, useState } from 'react';
import { yesNoOptions } from 'shared/helper/selectOptions';
import {
  formatBoolean,
  NewDateFormatters,
  parseDate,
} from 'shared/helper/utilities';
import { currencyToMoney, moneyToCurrency, satangToBaht } from 'utils/currency';
import * as Yup from 'yup';
import { refundCalculationMethods } from '../../Accounting/All/config';
import {
  bankLists,
  checkDisableInsurerAmount,
  feesStructures,
  getRefundAmountField,
  omitFieldsIfNotChange,
  refundMethodOptions,
  refundProviderOptions,
  urgentRefundReasonOptions,
} from '../All/helper';
import useCancellationPaymentDetails from '../All/useCancellationPaymentDetails';

type Props = Readonly<{
  onClose: () => void;
  row?: any;
  updateCancellationStatus: (data: any) => Promise<void>;
  isSuccess?: boolean;
  isError?: boolean;
  error?: any;
  setOpenClosePopup: (open: boolean) => void;
  handleOpenFile: (fileName: string) => void;
  isRefundCalculationMethodRequired?: boolean;
}>;

export default function CreateRefundModal({
  onClose,
  row,
  updateCancellationStatus,
  isSuccess = false,
  isError = false,
  error,
  setOpenClosePopup,
  handleOpenFile,
  isRefundCalculationMethodRequired = true,
}: Props) {
  const {
    usedCreditShell,
    availableCreditShell,
    refundData,
    paidCharges,
    accountingData,
    totalCancellationFee,
    processingFee,
    discountProRate,
    voucherValue,
  } = useCancellationPaymentDetails(
    row?.orderItemId?.split('-')[0],
    row?.item?.name,
    true,
    isSuccess,
    isError,
    error,
    setOpenClosePopup
  );
  const [getAccountingOrderItemDocuments, { data: orderItemDocuments }] =
    useLazyGetAccountingOrderItemDocumentsQuery();
  const [deleteOrderItemDocument] = useDeleteOrderItemDocumentMutation();
  const [fixedData, setFixedData] = useState<Record<string, boolean>>({
    refund_service_provider: true,
    refund_method: true,
  });
  const setFieldsTouched = (field: string, isTouched: boolean) =>
    setFixedData((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  const [initialValues, setInitialValues] = useState<any>({});
  const { DDMMYYYY } = NewDateFormatters('Asia/Bangkok');

  const getMoneyValue = (money: { units: string; nanos: number }) =>
    money?.units ? moneyToCurrency(money) : 0;

  useEffect(() => {
    if (!refundData?.refunds || !accountingData) {
      return;
    }
    const values = {
      cancellationContactDate:
        accountingData?.cancellationCustomerContactTime &&
        parseDate(
          DDMMYYYY(accountingData?.cancellationCustomerContactTime),
          'dd/MM/yyyy'
        ),
      policyEndDate:
        accountingData?.policyEndTime &&
        parseDate(DDMMYYYY(accountingData?.policyEndTime), 'dd/MM/yyyy'),
      customerReceivePolicy: formatBoolean(
        accountingData?.customerReceivedPolicy,
        'Yes',
        'No'
      ),
      policyReturnDate:
        accountingData?.policyReturnTime &&
        parseDate(DDMMYYYY(accountingData?.policyReturnTime), 'dd/MM/yyyy'),
      cancellationContactedDateInsurer:
        accountingData?.cancellationInsurerContactTime &&
        parseDate(
          DDMMYYYY(accountingData?.cancellationInsurerContactTime),
          'dd/MM/yyyy'
        ),
      urgentRefund: formatBoolean(accountingData?.urgentRefund, 'Yes', 'No'),
      urgentRefundReason: accountingData?.urgentRefundReason ?? '',
      refundCalculationMethod: accountingData?.refundCalculationMethod ?? '',
      commissionClawback: getMoneyValue(accountingData?.commissionClawback),
      ...(accountingData?.refundInsurerAmount !== null
        ? {
            refundAmountFromInsurer: getMoneyValue(
              accountingData?.refundInsurerAmount
            ),
          }
        : {}),
      refundAmountCustomer: getMoneyValue(accountingData?.refundAmountCustomer),
      bankAccountNumber: accountingData?.refundAccountNo ?? '',
      bankName: accountingData?.refundBank ?? '',
      slip: null,
      documentId: null,
      cancellationEmailFromInsurer: null,
      urgentRefundForm: null,

      grossPremium:
        parseFloat(String(row?.grossPremium).replace(/,/g, '')) || 0,
      invoicedAmount: satangToBaht(accountingData?.invoicedAmount),
      totalCancellationFee,
      refundServiceProvider:
        accountingData?.refundServiceProvider &&
        accountingData?.refundServiceProvider !== 'SERVICE_PROVIDER_UNSPECIFIED'
          ? accountingData?.refundServiceProvider
          : 'KASIKORN',
      refundMethod:
        accountingData?.refundMethod &&
        accountingData?.refundMethod !== 'PAYMENT_METHOD_UNSPECIFIED'
          ? accountingData?.refundMethod
          : 'BANK_TRANSFER',
      isRefund: false,
    };

    if (accountingData?.refundAccountDocument) {
      values.slip = {
        ...accountingData?.refundAccountDocument,
        display_name: accountingData?.refundAccountDocument,
        content_type: getString('cancellation.popup.bankAccount'),
      };
    }
    if (accountingData?.idCardDocument) {
      values.documentId = {
        ...accountingData?.idCardDocument,
        display_name: accountingData?.idCardDocument,
        content_type: getString('cancellation.popup.idCard'),
      };
    }
    if (accountingData?.urgentRefundFormDocument) {
      values.urgentRefundForm = {
        ...accountingData?.urgentRefundFormDocument,
        display_name: accountingData?.urgentRefundFormDocument,
        content_type: getString('cancellation.popup.urgentRefundForm'),
      };
    }
    if (accountingData?.cancellationEmailWithInsurer) {
      values.cancellationEmailFromInsurer = {
        ...accountingData?.cancellationEmailWithInsurer,
        display_name: accountingData?.cancellationEmailWithInsurer,
        content_type: getString(
          'cancellation.popup.cancellationEmailFromInsurer'
        ),
      };
    }

    setInitialValues({
      ...values,
      filled: true,
      processingFeeChecked: !accountingData?.waiveProcessingFee,
      cancellationFeeChecked: !accountingData?.waiveCancellationFee,
      discountProRateChecked: !accountingData?.waiveDiscountFee,
      voucherChecked: !accountingData?.waiveVoucherFee,
    });
  }, [accountingData, refundData]);

  useEffect(() => {
    if (totalCancellationFee > 0) {
      setInitialValues((prev: any) => ({
        ...prev,
        totalCancellationFee,
      }));
    }
  }, [totalCancellationFee]);

  const [otherDocuments, setOtherDocuments] = useState<any[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const existingOtherDocuments = orderItemDocuments?.documents?.filter(
    (document: any) => !documentsToDelete.includes(document.name)
  );

  useEffect(() => {
    getAccountingOrderItemDocuments({
      orderId: row?.item?.name?.split('/items')[0],
      itemId: row?.item?.name,
      type: 'DOCUMENT_TYPE_ACCOUNTING_OTHERS',
    });
  }, [row]);

  const refundSchema = Yup.object().shape({
    urgentRefund: Yup.string().required(getString('errors.requiredFormField')),
    urgentRefundReason: Yup.string().when('urgentRefund', {
      is: 'Yes',
      then: (schema) => schema.required(getString('errors.requiredFormField')),
      otherwise: (schema) => schema.nullable(),
    }),
    refundAmountFromInsurer: Yup.number()
      .typeError(getString('errors.invalidData'))
      .required(getString('errors.requiredFormField'))
      .positive(
        getString('errors.greaterThan', {
          fieldOne: 'Refund Amount',
          fieldTwo: '0',
        })
      ),
    refundMethod: Yup.string().required(getString('errors.requiredFormField')),
    refundServiceProvider: Yup.string().required(
      getString('errors.requiredFormField')
    ),
    bankAccountNumber: Yup.string().when('refundMethod', {
      is: 'BANK_TRANSFER',
      then: (schema) =>
        schema
          .required(getString('errors.requiredFormField'))
          .matches(/^\d+$/, getString('errors.invalidData'))
          .min(10, getString('errors.invalidValue')),
      otherwise: (schema) => schema.nullable(),
    }),
    bankName: Yup.string().when('refundMethod', {
      is: 'BANK_TRANSFER',
      then: (schema) =>
        schema.required(getString('errors.requiredFormField')).oneOf(
          bankLists.map((item) => item.name),
          getString('errors.invalidData')
        ),
      otherwise: (schema) => schema.nullable(),
    }),
    slip: Yup.object().required(),
    documentId: Yup.object().required(),
    urgentRefundForm: Yup.object().when('urgentRefund', {
      is: 'Yes',
      then: (schema) => schema.required(getString('errors.requiredFormField')),
      otherwise: (schema) => schema.nullable(),
    }),
    ...(isRefundCalculationMethodRequired
      ? {
          refundCalculationMethod: Yup.string()
            .required(getString('errors.requiredFormField'))
            .oneOf(
              refundCalculationMethods.map((item) => item.value),
              getString('errors.requiredFormField')
            ),
        }
      : {}),
  });

  const saveSchema = Yup.object().shape({
    bankAccountNumber: Yup.string().when('refundMethod', {
      is: 'BANK_TRANSFER',
      then: (schema) =>
        schema
          .matches(/^\d+$/, getString('errors.invalidData'))
          .min(10, getString('errors.invalidValue')),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const validationSchema = Yup.lazy((values: any) =>
    values?.isRefund ? refundSchema : saveSchema
  );

  const [uploadDocumentFile] = useUploadDocumentFileMutation();
  const [uploadOrderItemDocument] = useUploadOrderItemDocumentMutation();

  const handleSubmitForm = async (data: any) => {
    const uploadIfExists = async (file: any, uid: string) => {
      if (!file?.size) return null;
      const {
        data: { uploadUrl, document },
      } = await uploadDocumentFile({
        file: {
          content_type: file.content_type,
          display_name: file.display_name,
          size: 0,
        },
        uid,
      });
      await uploadDocumentViaDocumentService(uploadUrl, file.originalFile);
      return document;
    };

    const [
      slipDocument,
      idCardDocument,
      urgentRefundFormDocument,
      cancellationEmailDocument,
    ] = await Promise.all([
      uploadIfExists(data?.slip, row?.orderItemId),
      uploadIfExists(data?.documentId, row?.orderItemId),
      uploadIfExists(data?.urgentRefundForm, row?.orderItemId),
      uploadIfExists(data?.cancellationEmailFromInsurer, row?.orderItemId),
    ]);

    if (otherDocuments.length > 0) {
      const otherFilesNames = await Promise.all(
        otherDocuments.map((document) =>
          uploadIfExists(document, row?.orderItemId)
        )
      );

      otherFilesNames.map((file) =>
        uploadOrderItemDocument({
          orderId: row?.item?.name?.split('/items')[0],
          itemId: `items${row?.item?.name?.split('/items')[1]}`,
          file,
        })
      );
    }

    if (documentsToDelete.length > 0) {
      await Promise.all(
        documentsToDelete.map((documentId) =>
          deleteOrderItemDocument({
            documentId,
          })
        )
      );
    }

    const feesPayload = isRefundCalculationMethodRequired
      ? {
          waive_processing_fee: !data?.processingFeeChecked,
          waive_cancellation_fee: !data?.cancellationFeeChecked,
          waive_discount_fee: !data?.discountProRateChecked,
          waive_voucher_fee: !data?.voucherChecked,
        }
      : {};
    const payload = {
      commission_clawback:
        data?.commissionClawback || data?.commissionClawback === 0
          ? {
              ...currencyToMoney(data?.commissionClawback as unknown as number),
            }
          : undefined,
      refund_calculation_method: data?.refundCalculationMethod ?? undefined,
      cancellation_customer_contact_time: data?.cancellationContactDate || null,
      policy_end_time: data?.policyEndDate || null,
      refund_account_no: data?.bankAccountNumber || undefined,
      refund_bank: data?.bankName || undefined,

      refund_account_document: slipDocument?.name ?? '',
      id_card_document: idCardDocument?.name ?? '',
      urgent_refund_form_document: urgentRefundFormDocument?.name ?? '',
      cancellation_email_with_insurer: cancellationEmailDocument?.name ?? '',

      policy_return_time: data?.policyReturnDate || null,
      cancellation_insurer_contact_time:
        data?.cancellationContactedDateInsurer || null,

      refund_insurer_amount: getRefundAmountField(
        data?.refundAmountFromInsurer,
        currencyToMoney
      ),
      refund_amount_customer: getRefundAmountField(
        data?.refundAmountCustomer,
        currencyToMoney
      ),

      refund_customer_time: data?.refundDate ?? null,

      customer_received_policy: data?.customerReceivePolicy
        ? data?.customerReceivePolicy === 'Yes'
        : undefined,
      urgent_refund: data?.urgentRefund
        ? data?.urgentRefund === 'Yes'
        : undefined,
      urgent_refund_reason: data?.urgentRefundReason || undefined,
      refund_service_provider: data?.refundServiceProvider ?? undefined,
      refund_method: data?.refundMethod ?? undefined,
    };

    const fieldsToUpdate = omitFieldsIfNotChange(payload, fixedData);

    if (JSON.stringify(fieldsToUpdate) === '{}') {
      setOpenClosePopup(false);
      return;
    }

    await updateCancellationStatus({
      request: { ...fieldsToUpdate, ...feesPayload },
      parent: row?.orderItemName,
      createRefund: Boolean(data?.isRefund),
    });
  };

  const isDisabledButtonAndInsurerAmount = checkDisableInsurerAmount(
    availableCreditShell,
    usedCreditShell,
    paidCharges?.length
  );

  if (!accountingData || !initialValues?.filled) {
    return null;
  }

  return (
    <CommonModal
      maxWidth="sm"
      titleCenter
      title={getString('cancellation.popup.createRefundTitle', {
        orderItemId: row?.orderItemId,
      })}
      isShowCloseBtn
      open
      handleCloseModal={onClose}
      dataTestId="update-modal"
      className="px-2 cancellation-comment-container flex flex-col gap-2"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm}
        validateOnBlur
        validateOnChange
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
          submitForm,
        }) => (
          <Form className="flex flex-col gap-2">
            <InputContainer
              title={getString('cancellation.popup.cancellationContactedDate')}
              error={
                touched.cancellationContactDate
                  ? (errors?.cancellationContactDate as string | undefined)
                  : undefined
              }
            >
              <DatePickerWithThaiYear
                className={`border border-solid rounded-sm py-1 mb-2 ${
                  touched.cancellationContactDate &&
                  errors.cancellationContactDate
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                name="cancellationContactDate"
                value={values.cancellationContactDate ?? null}
                onChangeDate={(date: any) => {
                  setFieldValue('cancellationContactDate', date);
                  setFieldsTouched('cancellation_customer_contact_time', true);
                }}
                placeholder="dd/mm/yyyy"
              />
            </InputContainer>

            <InputContainer
              title={getString('cancellation.popup.policyEndDate')}
              error={
                touched.policyEndDate
                  ? (errors?.policyEndDate as string | undefined)
                  : undefined
              }
            >
              <DatePickerWithThaiYear
                className={`border border-solid rounded-sm py-1 mb-2 ${
                  touched.policyEndDate && errors.policyEndDate
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                name="policyEndDate"
                value={values.policyEndDate}
                onChangeDate={(date: any) => {
                  setFieldValue('policyEndDate', date);
                  setFieldsTouched('policy_end_time', true);
                }}
                placeholder="dd/mm/yyyy"
              />
            </InputContainer>

            <FormikRadioField
              name="customerReceivePolicy"
              title={getString('cancellation.popup.customerReceivePolicy')}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue('customerReceivePolicy', e.target.value);
                setFieldsTouched('customer_received_policy', true);
              }}
              row
              key="customerReceivePolicy"
              value={values.customerReceivePolicy}
              error={
                touched.customerReceivePolicy
                  ? (errors?.customerReceivePolicy as string | undefined)
                  : undefined
              }
              options={yesNoOptions}
            />

            {values.customerReceivePolicy === 'Yes' && (
              <InputContainer
                title={getString('cancellation.popup.policyReturnDate')}
                showAsterisk
                error={
                  touched.policyReturnDate
                    ? (errors?.policyReturnDate as string | undefined)
                    : undefined
                }
              >
                <DatePickerWithThaiYear
                  className={`border border-solid rounded-sm py-1 mb-2 ${
                    touched.policyReturnDate && errors.policyReturnDate
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                  name="policyReturnDate"
                  value={values.policyReturnDate}
                  onChangeDate={(date: any) => {
                    setFieldValue('policyReturnDate', date);
                    setFieldsTouched('policy_return_time', true);
                  }}
                  placeholder="dd/mm/yyyy"
                />
              </InputContainer>
            )}

            <InputContainer
              title={getString(
                'cancellation.popup.cancellationContactedDateInsurer'
              )}
              error={
                touched.cancellationContactedDateInsurer
                  ? (errors.cancellationContactedDateInsurer as
                      | string
                      | undefined)
                  : undefined
              }
            >
              <DatePickerWithThaiYear
                className={`border border-solid rounded-sm py-1 mb-2 ${
                  touched.cancellationContactedDateInsurer &&
                  errors.cancellationContactedDateInsurer
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                name="cancellationContactedDateInsurer"
                value={values.cancellationContactedDateInsurer}
                onChangeDate={(date: any) => {
                  setFieldValue('cancellationContactedDateInsurer', date);
                  setFieldsTouched('cancellation_insurer_contact_time', true);
                }}
                placeholder="dd/mm/yyyy"
              />
            </InputContainer>

            <FormikRadioField
              name="urgentRefund"
              title={getString('cancellation.urgentRefund')}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue('urgentRefund', e.target.value);
                setFieldsTouched('urgent_refund', true);
              }}
              row
              value={values.urgentRefund}
              options={yesNoOptions}
            />

            {values.urgentRefund === 'Yes' && (
              <CustomAutocomplete
                name="urgentRefundReason"
                title={getString('cancellation.urgentRefundReason')}
                showAsterisk
                key="urgentRefundReason"
                value={values.urgentRefundReason}
                error={
                  touched.urgentRefundReason
                    ? (errors.urgentRefundReason as string | undefined)
                    : undefined
                }
                handleUpdate={({ selections }) => {
                  if (selections) {
                    setFieldValue(
                      'urgentRefundReason',
                      (selections as Option).value
                    );
                    setFieldsTouched('urgent_refund_reason', true);
                  }
                }}
                options={urgentRefundReasonOptions.map(({ title, value }) => ({
                  id: value,
                  title,
                  value,
                }))}
                multiple={false}
              />
            )}

            <CustomAutocomplete
              showAsterisk={isRefundCalculationMethodRequired}
              name="refundCalculationMethod"
              title={getString('cancellation.popup.refundCalculationMethod')}
              key="refundCalculationMethod"
              value={values.refundCalculationMethod}
              error={
                touched.refundCalculationMethod
                  ? (errors.refundCalculationMethod as string | undefined)
                  : undefined
              }
              handleUpdate={({ selections }) => {
                if (selections) {
                  setFieldValue(
                    'refundCalculationMethod',
                    (selections as Option).value
                  );
                  setFieldsTouched('refund_calculation_method', true);
                }
              }}
              options={refundCalculationMethods.map((item) => ({
                id: item.value,
                title: item.label,
                value: item.value,
              }))}
              multiple={false}
            />

            <DetailViewNumberInput
              name="commissionClawback"
              title={getString('cancellation.popup.commissionClawback')}
              value={values.commissionClawback}
              handleUpdate={() => {}}
              onValueChange={(val) => {
                setFieldValue('commissionClawback', val.floatValue);
                setFieldsTouched('commission_clawback', true);
              }}
              thousandSeparator
              isDisabled={false}
              error={
                touched.commissionClawback
                  ? (errors.commissionClawback as string | undefined)
                  : undefined
              }
            />

            <DetailViewNumberInput
              name="refundAmountFromInsurer"
              title={getString('cancellation.popup.refundAmountFromInsurer')}
              showAsterisk
              value={values.refundAmountFromInsurer}
              onValueChange={(val) => {
                setFieldValue('refundAmountFromInsurer', val.floatValue);
                setFieldsTouched('refund_insurer_amount', true);
              }}
              thousandSeparator
              isDisabled={isDisabledButtonAndInsurerAmount}
              handleUpdate={() => {}}
              error={
                touched.refundAmountFromInsurer
                  ? (errors.refundAmountFromInsurer as string | undefined)
                  : undefined
              }
            />

            <DetailViewNumberInput
              name="refundAmountCustomer"
              title={getString('cancellation.popup.refundAmountToCustomer')}
              showAsterisk
              value={values.refundAmountCustomer}
              onValueChange={(val) => {
                setFieldValue('refundAmountCustomer', val.floatValue);
                setFieldsTouched('refund_amount_customer', true);
              }}
              thousandSeparator
              isDisabled
              handleUpdate={() => {}}
              error={
                touched.refundAmountCustomer
                  ? (errors.refundAmountCustomer as string | undefined)
                  : undefined
              }
            />

            <CustomAutocomplete
              showAsterisk
              name="refundServiceProvider"
              title={getString('cancellation.popup.refundServiceProviderTitle')}
              value={values.refundServiceProvider}
              error={
                touched.refundServiceProvider
                  ? (errors?.refundServiceProvider as string | undefined)
                  : undefined
              }
              handleUpdate={({ selections }) => {
                if (selections) {
                  setFieldValue(
                    'refundServiceProvider',
                    (selections as Option).value
                  );
                  setFieldsTouched('refund_service_provider', true);
                }
              }}
              options={refundProviderOptions}
              multiple={false}
            />
            <CustomAutocomplete
              showAsterisk
              name="refundMethod"
              title={getString('cancellation.popup.refundMethodTitle')}
              value={values.refundMethod}
              error={
                touched.refundMethod
                  ? (errors?.refundMethod as string | undefined)
                  : undefined
              }
              handleUpdate={({ selections }) => {
                if (selections) {
                  setFieldValue('refundMethod', (selections as Option).value);
                  setFieldsTouched('refund_method', true);
                }
              }}
              options={refundMethodOptions}
              multiple={false}
            />

            {values.refundMethod === 'BANK_TRANSFER' && (
              <>
                <DetailViewTextField
                  name="bankAccountNumber"
                  title={getString('cancellation.popup.bankAccountNumber')}
                  showAsterisk
                  value={values.bankAccountNumber}
                  setFormikValue={(payload: number) => {
                    setFieldValue('bankAccountNumber', payload);
                    setFieldsTouched('refund_account_no', true);
                  }}
                  isDisabled={false}
                  textFieldError={false}
                  error={
                    touched.bankAccountNumber
                      ? (errors.bankAccountNumber as string | undefined)
                      : undefined
                  }
                />

                <CustomAutocomplete
                  name="bankName"
                  title={getString('cancellation.bankName')}
                  showAsterisk
                  value={values.bankName}
                  error={
                    touched.bankName
                      ? (errors.bankName as string | undefined)
                      : undefined
                  }
                  handleUpdate={({ selections }) => {
                    if (selections) {
                      setFieldValue('bankName', (selections as Option).value);
                      setFieldsTouched('refund_bank', true);
                    }
                  }}
                  options={bankLists?.map((item) => ({
                    id: item.value,
                    title: item.label,
                    value: item.name,
                  }))}
                  multiple={false}
                />
              </>
            )}

            {[
              {
                name: 'grossPremium',
                title: getString('cancellation.popup.grossPremium'),
                value: values.grossPremium,
                error: touched.grossPremium
                  ? (errors.grossPremium as string | undefined)
                  : undefined,
              },
              {
                name: 'invoicedAmount',
                title: getString('cancellation.popup.invoiceAmount'),
                value: values.invoicedAmount,
                error: touched.invoicedAmount
                  ? (errors.invoicedAmount as string | undefined)
                  : undefined,
              },
              {
                name: 'waiveFees',
                title: getString(
                  'cancellation.waiveCancellationAndProcessingFee'
                ),
                value: accountingData?.waiveFees?.toString(),
              },
              ...(isRefundCalculationMethodRequired
                ? []
                : [
                    {
                      name: 'totalCancellationFee',
                      title: getString(
                        'cancellation.popup.totalCancellationFee'
                      ),
                      value: values.totalCancellationFee,
                      error: touched.totalCancellationFee
                        ? (errors.totalCancellationFee as string | undefined)
                        : undefined,
                    },
                  ]),
              {
                name: 'usedCreditShell',
                title: getString('cancellation.popup.usedCreditShell'),
                value: usedCreditShell,
              },
              {
                name: 'availableCreditShell',
                title: getString('cancellation.popup.availableCreditShell'),
                value: availableCreditShell,
              },
            ].map((field) => {
              if (field.name === 'waiveFees' && field.value === 'true') {
                return (
                  <div
                    key={field.name}
                    className="flex items-center pl-3 gap-2 font-semibold bg-warning text-white rounded-2xl p-1"
                  >
                    {getString(
                      'cancellation.waiveCancellationAndProcessingFee'
                    )}
                  </div>
                );
              }
              return (
                <DetailViewNumberInput
                  key={field.name}
                  name={field.name}
                  title={field.title}
                  value={field.value}
                  onValueChange={() => {}}
                  thousandSeparator
                  isDisabled
                  handleUpdate={() => {}}
                  error={field.error}
                  showAsterisk={false}
                />
              );
            })}

            {isRefundCalculationMethodRequired &&
              feesStructures(
                processingFee,
                totalCancellationFee,
                discountProRate,
                voucherValue
              ).map((field) => (
                <div key={field.name} className="pt-2">
                  <div className="-mb-8">
                    <MuiCheckbox
                      checked={values[field.checkedName]}
                      onChange={(e) => {
                        setFieldValue(field.checkedName, e.target.checked);
                      }}
                      color="primary"
                      size="small"
                      className="p-1"
                    />
                  </div>
                  <DetailViewNumberInput
                    name={field.name}
                    title={` \u00A0 \u00A0 ${getString(field.titleKey)}`}
                    value={field.value}
                    isReadOnly
                    thousandSeparator
                    isDisabled={!values[field.checkedName]}
                    handleUpdate={() => {}}
                    error={
                      touched[field.name]
                        ? (errors[field.name] as string | undefined)
                        : undefined
                    }
                    showAsterisk={false}
                  />
                </div>
              ))}

            <UploadComponent
              title={getString('cancellation.popup.bankAccount')}
              slip={values.slip ?? undefined}
              setSlip={(file: any) => {
                setFieldValue('slip', file);
                setFieldsTouched('refund_account_document', true);
              }}
              error={Boolean(errors?.slip)}
              openFile={() => handleOpenFile(values.slip?.display_name)}
              deleteFile={() => {
                setFieldValue('slip', undefined);
                setFieldsTouched('refund_account_document', true);
              }}
            />

            <UploadComponent
              title={getString('cancellation.popup.idCard')}
              slip={values.documentId ?? undefined}
              setSlip={(file: any) => {
                setFieldValue('documentId', file);
                setFieldsTouched('id_card_document', true);
              }}
              error={Boolean(errors?.documentId)}
              openFile={() => handleOpenFile(values.documentId?.display_name)}
              deleteFile={() => {
                setFieldValue('documentId', undefined);
                setFieldsTouched('id_card_document', true);
              }}
            />

            <UploadComponent
              title={getString(
                'cancellation.popup.cancellationEmailFromInsurer'
              )}
              slip={values.cancellationEmailFromInsurer ?? undefined}
              setSlip={(file: any) => {
                setFieldValue('cancellationEmailFromInsurer', file);
                setFieldsTouched('cancellation_email_with_insurer', true);
              }}
              openFile={() =>
                handleOpenFile(
                  values.cancellationEmailFromInsurer?.display_name
                )
              }
              deleteFile={() => {
                setFieldValue('cancellationEmailFromInsurer', undefined);
                setFieldsTouched('cancellation_email_with_insurer', true);
              }}
            />

            <UploadComponent
              title={getString('cancellation.popup.urgentRefundForm')}
              slip={values.urgentRefundForm ?? undefined}
              setSlip={(file: any) => {
                setFieldValue('urgentRefundForm', file);
                setFieldsTouched('urgent_refund_form_document', true);
              }}
              error={Boolean(errors.urgentRefundForm)}
              openFile={() =>
                handleOpenFile(values.urgentRefundForm?.display_name)
              }
              deleteFile={() => {
                setFieldValue('urgentRefundForm', undefined);
                setFieldsTouched('urgent_refund_form_document', true);
              }}
            />

            {existingOtherDocuments?.map((document: any) => (
              <UploadComponent
                key={`existing-${document.name}`}
                title={document.document}
                slip={{
                  ...document,
                  display_name: `documents/${document.name?.split('documents/')[1]}`,
                  content_type: `${getString('cancellation.popup.otherDocument')} - ${document.label}`,
                }}
                setSlip={(file: any) => {
                  setOtherDocuments([file, ...otherDocuments]);
                  setDocumentsToDelete([...documentsToDelete, document.name]);
                }}
                openFile={() => handleOpenFile(document.document)}
              />
            ))}

            {otherDocuments.map((slip, index) => (
              <UploadComponent
                key={`new-${slip?.display_name}`}
                title={getString('cancellation.popup.otherDocument')}
                slip={{
                  ...slip,
                  value: '',
                }}
                setSlip={(file: any) => {
                  const updatedOtherDocuments = otherDocuments;
                  updatedOtherDocuments[index] = file;
                  setOtherDocuments([...updatedOtherDocuments]);
                }}
                error={Boolean(errors.urgentRefundForm)}
              />
            ))}

            {(existingOtherDocuments?.length ?? 0) +
              (otherDocuments?.length ?? 0) <
              5 && (
              <UploadComponent
                title={getString('cancellation.popup.otherDocument')}
                slip={undefined}
                setSlip={(file: any) => {
                  if (otherDocuments.length > 5) return;
                  setOtherDocuments([...otherDocuments, file]);
                  setFieldsTouched('otherDocument', true);
                }}
                error={false}
              />
            )}

            <div className="py-4 flex flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="primary"
                className="uppercase h-10 px-6 mr-2 font-sans"
                dataTestId="approve-btn"
                onClick={() => {
                  setFieldValue('isRefund', false);
                  submitForm();
                }}
                text={getString('cancellation.popup.save')}
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                variant="primary"
                className="uppercase h-10 px-6 mr-2 font-sans"
                dataTestId="approve-btn"
                onClick={() => {
                  setFieldValue('isRefund', true);
                }}
                text={getString('cancellation.popup.saveAndCreateRefund')}
                disabled={isSubmitting || isDisabledButtonAndInsurerAmount}
              />
              <Button
                variant="secondary"
                className="uppercase h-9 px-6 font-sans"
                dataTestId="close-btn"
                onClick={onClose}
                text={getString('text.cancel')}
              />
            </div>
          </Form>
        )}
      </Formik>
    </CommonModal>
  );
}
