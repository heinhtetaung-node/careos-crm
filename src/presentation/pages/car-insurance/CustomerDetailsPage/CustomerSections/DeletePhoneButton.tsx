import React, { useEffect } from 'react';
import { Button } from '@alphafounders/ui';

import useSnackbar from 'utils/snackbar';
import useAddPhone from 'presentation/components/modal/LeadDetailsModal/PhoneModal/useAddPhone';
import CommonModal from 'presentation/components/modal/CommonModal';

import { useDeletePhoneNumberMutation } from 'data/slices/customerSlice';
import { getString } from 'presentation/theme/localization';

const DeletePhoneButton = ({
  phoneData,
  onSuccess,
  handleDeleteModal,
  isDisabled = false,
  isDeleteModal = false,
  isCustomer = false,
}: {
  phoneData: { name: string; phone: string };
  onSuccess?: () => void;
  handleDeleteModal: () => void;
  isDeleteModal: boolean;
  isDisabled?: boolean;
  isCustomer?: boolean;
}) => {
  const [
    deletePhone,
    { isLoading: isRemovingPhone, isSuccess, isError, error },
  ] = useDeletePhoneNumberMutation();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  useEffect(() => {
    if (isRemovingPhone) {
      return;
    }
    if (isError) {
      showErrorSnackbar((error as unknown as any)?.data?.message);
    }
    if (!isSuccess) {
      return;
    }
    handleDeleteModal();
    showSuccessSnackbar(getString('text.phoneRemoveSuccess'));
    onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, isRemovingPhone]);

  const { removePhoneFromLead, status } = useAddPhone();
  const { name, phone } = phoneData;
  const { isLoading: isRemovingPhoneFromLead } = status;

  const isLoading = isRemovingPhone || isRemovingPhoneFromLead;

  const handleDelete = async () => {
    if (isCustomer) {
      await deletePhone({ phone: name });
      return null;
    }
    await removePhoneFromLead(phone, () => onSuccess?.());
    return null;
  };

  return (
    <CommonModal
      dataTestId="deletePhoneModal"
      isShowCloseBtn
      title={getString('text.phoneDeleteConfirm')}
      titleCenter
      open={isDeleteModal}
      handleCloseModal={handleDeleteModal}
      maxWidth="sm"
    >
      <p className="text-center py-6">
        <b className="uppercase">{getString('warningModal.warning')}:</b>{' '}
        {getString('text.phoneNumber')}{' '}
        <span className="text-red-500 font-bold">{phone}</span>{' '}
        {getString('warningModal.removeWarning')}
      </p>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          className="p-3 mr-3"
          disabled={isLoading}
          text={getString('text.cancel')}
          onClick={() => handleDeleteModal()}
        />
        <Button
          dataTestId="confirmDeleteButton"
          variant="primary"
          className="p-3"
          isLoading={isLoading}
          disabled={isLoading || isDisabled}
          text={getString('text.continue')}
          onClick={handleDelete}
        />
      </div>
    </CommonModal>
  );
};

export default DeletePhoneButton;
