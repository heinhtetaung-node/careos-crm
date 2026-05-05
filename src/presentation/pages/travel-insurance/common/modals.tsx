import React, { useEffect, useState } from 'react';

import useSnackbar from 'utils/snackbar';

import { Button } from '@alphafounders/ui';

import Select from 'presentation/components/controls/Select';

import { useCancelOrderPoliciesMutation } from 'data/slices/orderSlice';
import { getString } from 'presentation/theme/localization';
import { yesNoOptions } from 'shared/helper/selectOptions';

interface ModalProps {
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
}

const CancelPolicyModal = ({ handleModal, refetch, modalInfo }: ModalProps) => {
  const { type, uid } = modalInfo;

  const [policyStatus, setPolicyStatus] = useState<{ id: number } | null>(null);

  const [cancelPolicy, { isLoading, isError, isSuccess, error }] =
    useCancelOrderPoliciesMutation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  useEffect(() => {
    if (isError) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: (error as any)?.data?.message ?? '',
        })
      );
    }
    if (isSuccess) {
      showSuccessSnackbar(getString('text.updateInsuranceSuccessfully'));
      setTimeout(() => {
        refetch();
      }, 500);
    }
    if (isSuccess || isError) {
      handleModal({
        ...modalInfo,
        show: false,
      });
    }
  }, [isError, error, isSuccess]);

  return (
    <div className="flex flex-col px-2" data-testid="cancel-policy-modal">
      <div className="flex gap-3">
        <Select
          fixedLabel
          label={getString('paymentDetails.policyHolder.cancellationStatus')}
          placeholder={getString('package.selectPlaceholder')}
          options={yesNoOptions}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedOption: any = yesNoOptions.filter(
              (opt: any) => opt.id === parseInt(selectedId as string)
            )[0];

            if (selectedOption?.id !== policyStatus?.id) {
              setPolicyStatus(selectedOption);
            }
          }}
          value={policyStatus?.id}
        />
      </div>
      <div className="flex justify-end mt-5">
        <Button
          disabled={
            isLoading || !uid || !policyStatus || policyStatus?.id === 1
          }
          text={getString('text.update')}
          onClick={() => cancelPolicy({ policyId: uid })}
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
const SendPolicyEmailModal = ({ handleModal, modalInfo }: ModalProps) => {
  const { type } = modalInfo;
  return (
    <div className="flex flex-col px-2" data-testid="send-policy-email-modal">
      <div className="flex gap-3">
        <p className="text-md">{getString('travel.confirmationText')}</p>
      </div>
      <div className="flex justify-end mt-5">
        <Button
          disabled
          text={getString('text.send')}
          onClick={() => 'send policy email'}
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
export default function OrderModals({
  modalInfo,
  handleModal,
  refetch,
}: Readonly<ModalProps>) {
  const handleRefetch = () => setTimeout(() => refetch(), 1000);

  switch (modalInfo.type) {
    case 'cancel-policy':
      return (
        <CancelPolicyModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    case 'send-policy-email':
      return (
        <SendPolicyEmailModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    default:
      return null;
  }
}
