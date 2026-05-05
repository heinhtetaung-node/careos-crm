import React, { useEffect, useState } from 'react';
import { Button } from '@alphafounders/ui';
import { getString } from 'presentation/theme/localization';
import { useUpdateLeadMutation } from 'data/slices/leadSlice';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import CommonModal from 'presentation/components/modal/CommonModal';

interface ApproveCreditTermButtonProps {
  disabled?: boolean;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leadHumanId: string;
  isLoading: boolean;
  isError: boolean;
  isApproved: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  leadHumanId,
  isLoading,
  isError,
  isApproved,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const title = isApproved
    ? getString('leadStatus.unapproveCreditTerm')
    : getString('leadStatus.approveCreditTerm');

  const confirmationMessage = isApproved
    ? getString('text.creditTermUnapproveConfirmation', { leadHumanId })
    : getString('text.creditTermApproveConfirmation', { leadHumanId });

  const actionButtonText = isApproved
    ? getString('text.unapprove')
    : getString('text.approve');

  return (
    <CommonModal open title={title} handleCloseModal={onClose}>
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <div className="flex flex-col gap-2 items-center text-lg font-medium text-gray-600 text-center">
          <span className="whitespace-pre">{confirmationMessage}</span>
        </div>

        {isError && (
          <div className="w-full p-3 bg-red-50 text-red-600 rounded-md text-center">
            {getString('text.error')}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            className="p-3 mx-1"
            variant="secondary"
            text={getString('text.cancelButton')}
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            className="p-3 mx-1"
            text={actionButtonText}
            isLoading={isLoading}
            onClick={onConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </CommonModal>
  );
}

export default function ApproveCreditTermButton({
  disabled,
}: ApproveCreditTermButtonProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lead = useGetLeadSelector();
  const currentUser = useGetUserSelector();

  const [updateLead, { isLoading, isError, isSuccess }] =
    useUpdateLeadMutation();

  const isApproved = !!lead.annotations?.credit_term_approved_at;

  const handleCreditTermAction = () => {
    updateLead({
      leadId: lead.name,
      data: {
        annotations: {
          credit_term_approved_at: isApproved ? null : new Date().toISOString(),
          credit_term_approved_by: isApproved ? null : currentUser.name,
        },
      },
    });
  };

  // Close modal on successful update
  useEffect(() => {
    if (isSuccess) {
      setIsModalOpen(false);
    }
  }, [isSuccess]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const buttonText = isApproved
    ? getString('text.approvedCreditTerm')
    : getString('text.pendingApproval');

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleCreditTermAction}
        leadHumanId={lead.humanId}
        isLoading={isLoading}
        isError={isError}
        isApproved={isApproved}
      />

      <Button
        text={buttonText}
        loadingText={getString('text.loading')}
        className="px-4 h-10 normal-case mr-1"
        disabled={disabled || isLoading}
        onClick={openModal}
      />
    </>
  );
}
