import { SuccessIcon, WarningIcon } from '@alphafounders/icons';
import { Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';

import { useCreatePaymentMutation } from 'data/slices/leadDetailSlices/createPaymentSlice';
import { useGetLeadPaymentDetailsQuery } from 'data/slices/leadSlice';
import CopyButton from 'presentation/components/common/PaymentDialogActionButtons/CopyButton';
import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import NotFound from 'presentation/components/NotFound';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { getString } from 'presentation/theme/localization';
import { getPaymentMethod } from 'shared/helper/leadPaymentInformation';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { PaymentOption, PaymentOptions } from 'shared/types/lead';
import { bahtToSatang } from 'utils/currency';
import { format } from 'utils/datetime';

import CreatePaymentContent from './CreatePaymentContent';
import { CreatePaymentSubmitProps } from './types';

import { PatchParam } from '../LeadDetailsPage/leadUpdater/updateRules';

function CreatePaymentPage() {
  const leadId = getLeadIdFromPath();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<{
    icon: JSX.Element;
    message: string;
  } | null>(null);

  const [
    createPayment,
    {
      isLoading: isPaymentLoading,
      isError: isPaymentError,
      isSuccess: _isPaymentSuccess,
      error: paymentError,
    },
  ] = useCreatePaymentMutation();

  const { jsonUpdater } = useLeadUpdater();

  const { data, isLoading, isError } = useGetLeadPaymentDetailsQuery(leadId);

  useEffect(() => {
    if (!isPaymentError || !paymentError || !('data' in paymentError)) return;

    const paymentErrorData = paymentError.data as {
      code: number;
      message: string;
    };

    setPaymentErrorMsg(() => {
      if (
        paymentError.status === 409 &&
        ['already_paid', 'already_paid_online', 'already_purchased'].includes(
          paymentErrorData.message
        )
      ) {
        return {
          icon: <SuccessIcon fontSize="large" />,
          message: 'createPaymentError.alreadyPaid',
        };
      }
      const warningIcon = (
        <WarningIcon className="w-10 h-10" viewBox="0 0 60 60" />
      );
      if (
        paymentError.status === 400 &&
        paymentErrorData.message === 'has_unfilled_mandatory_fields'
      ) {
        return {
          icon: warningIcon,
          message: 'createPaymentError.mandatory',
        };
      }
      return {
        icon: warningIcon,
        message: getString(`errors.${paymentErrorData?.message}`),
      };
    });
  }, [paymentError, isPaymentError]);

  // TODO NEED TO UPDATE
  // There's an indexing issue here with the values.paymentOption because
  // the payment option can be null or excluded from the list entirely.
  const getSelectedInstallmentPlan = (values: CreatePaymentSubmitProps) => {
    if (data == null) return 1;
    let numberOfInstallments;
    if (values.paymentOption === PaymentOption.CREDIT_CARD_INSTALLMENT) {
      numberOfInstallments =
        data.paymentOptions.creditCardInstallment?.cardProviders[
          values.issuingBank
        ].installmentPlans[values.installmentPlan].numberOfInstallment;
    }
    if (values.paymentOption === PaymentOption.RABBIT_CARE_INSTALLMENT) {
      numberOfInstallments =
        data?.paymentOptions.rabbitCareInstallment?.installmentPlans[
          values.installmentPlan
        ].numberOfInstallment;
    }

    return numberOfInstallments ?? 1;
  };

  const handleCreatePayment = async (
    values: CreatePaymentSubmitProps,
    helpers: FormikHelpers<CreatePaymentSubmitProps>
  ): Promise<boolean> => {
    if (!isOpen) setIsOpen(true);

    const paymentOption = PaymentOption[
      values.paymentOption
    ] as keyof typeof PaymentOption;
    let paymentMethod = getPaymentMethod(
      data?.paymentOptions as PaymentOptions,
      values.paymentOption,
      values.paymentMethod,
      values.issuingBank,
      values.installmentPlan
    )?.paymentMethod;

    if (data?.packageDetails?.paymentMethod === 'DIRECT_DEBIT') {
      paymentMethod = 'DIRECT_DEBIT';
    }

    let cardProvider: string | undefined;
    if (paymentOption === 'CREDIT_CARD_INSTALLMENT')
      cardProvider =
        data?.paymentOptions.creditCardInstallment?.cardProviders[
          values.issuingBank
        ].name;

    const dueDateStr = values.installmentDate.split('/').reverse().join('-');
    const dueDate = new Date(dueDateStr).toISOString();
    const firstMonth = bahtToSatang(
      values.firstMonthAdditional ?? values.firstMonth
    );
    const followingMonth = bahtToSatang(values.followingMonth);
    const installmentPlan = Number(getSelectedInstallmentPlan(values));
    const response = await createPayment({
      payment_option: paymentOption ?? 'FULL_PAYMENT',
      payment_method: paymentMethod ?? 'ONLINECARD',
      installment_plan: installmentPlan,
      installment_amount: {
        first_month: firstMonth,
        next_month: followingMonth,
      },
      due_date: dueDate,
      card_provider: cardProvider,
      leadId,
    });

    // Temporary solution (Can move to BFF)
    try {
      const payload = [
        {
          path: '/checkout/paymentOption',
          op: 'add',
          value: paymentOption,
        },
        {
          path: '/checkout/paymentMethod',
          op: 'add',
          value: paymentMethod,
        },
        {
          path: '/checkout/installments',
          op: 'add',
          value: paymentOption !== 'FULL_PAYMENT' ? installmentPlan : 1,
        },
      ] as PatchParam[];

      await jsonUpdater(payload);
    } catch (error) {
      console.error('Error updating lead data:', error);
    }

    if ('error' in response) {
      return Promise.reject(new Error('Payment creation failed'));
    }
    const { message: responseMessage, paymentLink: responsePaymentLink } =
      response.data;
    setMessage(responseMessage);
    setPaymentLink(responsePaymentLink);

    // Resets the fields if payment has been successfully been made
    helpers.setFieldValue('paymentOption', 0);
    helpers.setFieldValue('paymentMethod', 0);
    return Promise.resolve(true);
  };

  if (isError) {
    return <NotFound />;
  }

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={
        {
          firstMonth: 0,
          firstMonthAdditional: 0,
          followingMonth: 0,
          installmentDate: format(new Date(), 'dd/MM/yyyy'),
          installmentPlan: 0,
          paymentMethod: 0,
          issuingBank: 0,
          paymentOption: 0,
        } as CreatePaymentSubmitProps
      }
      onSubmit={handleCreatePayment}
    >
      {() => (
        <>
          <MutationResponseDialog
            icon={
              paymentError && paymentErrorMsg ? (
                paymentErrorMsg?.icon
              ) : (
                <SuccessIcon fontSize="large" />
              )
            }
            isOpen={isOpen}
            isLoading={isPaymentLoading}
            isError={isPaymentError}
            setIsOpen={setIsOpen}
            title={
              isPaymentError ? undefined : getString('text.paymentCreated')
            }
            content={
              paymentError && paymentErrorMsg ? (
                <p className="font-bold text-lg">
                  {paymentErrorMsg?.message?.includes('PAYMENT_IS_ALREADY_PAID')
                    ? getString('errors.paymentIsAlreadyPaid')
                    : getString(paymentErrorMsg?.message)}
                </p>
              ) : (
                <div className="border-slate-300 border-radius-20 rounded-lg border-solid w-80 h-auto p-3 bg-slate-200 success-text whitespace-pre-wrap break-words text-left">
                  {addLink(message, paymentLink)}
                </div>
              )
            }
            showCloseBtn={!isPaymentError}
            actionButton={
              !isPaymentError ? (
                <CopyButton
                  successMessage={message}
                  successMessageAlert={getString('text.copyMessageSuccess')}
                />
              ) : undefined
            }
            id={isPaymentError ? 'error-dialog' : 'success-dialog'}
          />
          <CreatePaymentContent data={data} isLoading={isLoading} />
        </>
      )}
    </Formik>
  );
}

export default CreatePaymentPage;
