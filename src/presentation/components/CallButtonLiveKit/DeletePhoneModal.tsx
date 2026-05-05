import React from 'react';
import { Button } from '@alphafounders/ui';
import { getString } from 'presentation/theme/localization';
import CommonModal from '../modal/CommonModal';

export interface PhoneToDelete {
  phone: string;
  phoneIndex: number;
}

interface DeletePhoneModalProps {
  isOpen: boolean;
  phoneToDelete: PhoneToDelete | null;
  isRemovingPhone: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePhoneModal({
  isOpen,
  phoneToDelete,
  isRemovingPhone,
  onClose,
  onConfirm,
}: DeletePhoneModalProps) {
  return (
    <CommonModal
      dataTestId="deletePhoneModal"
      isShowCloseBtn
      title={getString('text.phoneDeleteConfirm')}
      titleCenter
      open={isOpen}
      handleCloseModal={onClose}
      maxWidth="sm"
    >
      <p className="text-center py-6">
        <b className="uppercase">{getString('warningModal.warning')}:</b>{' '}
        {getString('text.phoneNumber')}{' '}
        <span className="text-red-500 font-bold">{phoneToDelete?.phone}</span>{' '}
        {getString('warningModal.removeWarning')}
      </p>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          className="p-3 mr-3"
          disabled={isRemovingPhone}
          text={getString('text.cancel')}
          onClick={onClose}
        />
        <Button
          dataTestId="confirmDeleteButton"
          variant="primary"
          className="p-3"
          isLoading={isRemovingPhone}
          disabled={isRemovingPhone}
          text={getString('text.continue')}
          onClick={onConfirm}
        />
      </div>
    </CommonModal>
  );
}
