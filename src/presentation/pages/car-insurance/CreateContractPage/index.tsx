import { SuccessIcon, ErrorIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { Formik, FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';

import { useCreateContractMutation } from 'data/slices/leadDetailSlices/ContractSlice';
import { useGetLeadContractDetailsQuery } from 'data/slices/leadSlice';
import CopyButton from 'presentation/components/common/PaymentDialogActionButtons/CopyButton';
import { addLink } from 'presentation/components/common/PaymentDialogActionButtons/helper';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import NotFound from 'presentation/components/NotFound';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { bahtToSatang } from 'utils/currency';
import { format, toDate } from 'utils/datetime';

import CreateContractContent from './CreateContractContent';
import { CreateContractSubmitProps, showContractMessage } from './types';

function CreateContractPage() {
  const leadId = getLeadIdFromPath();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [contractLink, setContractLink] = useState<string>('');

  const [
    createContract,
    { isLoading: isPaymentLoading, isError: isPaymentError },
  ] = useCreateContractMutation();
  const { data, isFetching, isError, refetch } =
    useGetLeadContractDetailsQuery(leadId);

  const getSelectedInstallmentPlan = useCallback(
    (values: CreateContractSubmitProps) =>
      data?.paymentOptions.rabbitCareInstallment?.installmentPlans[
        values.installmentPlan
      ].numberOfInstallment ?? 1,
    [data]
  );

  const onSubmit = useCallback(
    async (
      values: CreateContractSubmitProps,
      helpers: FormikHelpers<CreateContractSubmitProps>
    ): Promise<boolean> => {
      if (!isOpen) setIsOpen(true);

      const numberOfInstallments = getSelectedInstallmentPlan(values);

      const dueDateStr = values.installmentDate.split('/').reverse().join('-');
      const dueDate = new Date(dueDateStr).toISOString();
      values.endDate.setHours(7);
      const response = await createContract({
        // TODO HARDCODED for now
        // paymentInfo?.paymentMethods[values.paymentMethod] ||
        payment_method: 'QR_CODE',
        installment_plan: numberOfInstallments,
        coverage_end_date: data?.carQuoteInformation?.endDate ?? new Date(),
        due_date: dueDate,
        policy_holder_national_id: data?.customerInformation.customerId || '',
        leadId,
        installment_amount: {
          first_month: bahtToSatang(values.firstMonth),
          next_month: values.followingMonth
            ? bahtToSatang(values.followingMonth)
            : undefined,
        },
      });
      if ('error' in response) {
        return Promise.reject(response);
      }
      const { contractLink: responseContractLink } = response.data;
      setMessage(
        showContractMessage(
          data?.customerInformation.customerName || '',
          data?.customerInformation.humanId || '',
          data?.carQuoteInformation?.licensePlate || '',
          responseContractLink
        )
      );
      setContractLink(responseContractLink);

      // Resets the fields if payment has been successfully been made
      helpers.resetForm();
      return Promise.resolve(true);
    },
    [createContract, data, getSelectedInstallmentPlan, isOpen, leadId]
  );

  // Only refetches the data when the page is revisited
  useEffect(() => {
    if (data) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError || (!data && !isFetching)) {
    return <NotFound />;
  }

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={{
        firstMonth: 0,
        followingMonth: 0,
        endDate: data?.quoteInformation?.endDate
          ? toDate(new Date(data.quoteInformation.endDate))
          : toDate(new Date()),
        installmentDate: format(new Date(), 'dd/MM/yyyy'),
        installmentPlan: 0,
        paymentMethod: 0,
        issuingBank: 0,
        paymentOption: 0,
      }}
      onSubmit={onSubmit}
    >
      {({ submitForm }) => (
        <>
          {/* Body/Content */}
          <MutationResponseDialog
            icon={
              isPaymentError ? (
                <ErrorIcon fontSize="large" />
              ) : (
                <SuccessIcon fontSize="large" />
              )
            }
            isOpen={isOpen}
            isLoading={isPaymentLoading}
            isError={isPaymentError}
            setIsOpen={setIsOpen}
            title={
              isPaymentError
                ? getString('text.createContractFailed')
                : getString('text.contractCreated')
            }
            content={
              isPaymentError ? (
                getString('text.contractCreatedError')
              ) : (
                <div className="border-slate-300 border-radius-20 rounded-lg border-solid w-80 h-auto p-3 bg-slate-200 success-text whitespace-pre-wrap break-words text-left">
                  {addLink(message, contractLink)}
                </div>
              )
            }
            showCloseBtn={!isPaymentError && true}
            actionButton={
              isPaymentError ? (
                <Button
                  className="uppercase w-32 border-0 !bg-red-500 mt-2 hover:!bg-red-400 h-10 text-white font-sans"
                  onClick={submitForm}
                  dataTestId="tryagain-btn"
                  text={getString('text.tryAgain')}
                />
              ) : (
                <CopyButton
                  successMessage={message}
                  successMessageAlert={getString('text.copyMessageContract')}
                />
              )
            }
            id={isPaymentError ? 'error-dialog' : 'success-dialog'}
          />
          <CreateContractContent isLoading={isFetching} data={data} />
        </>
      )}
    </Formik>
  );
}

export default CreateContractPage;
