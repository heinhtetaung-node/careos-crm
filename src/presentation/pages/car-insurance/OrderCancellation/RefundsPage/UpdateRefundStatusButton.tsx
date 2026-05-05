import { useUpdateRefundStatusMutation } from 'data/slices/cancellationSlice';
import React, { useEffect, useState } from 'react';
import { RefundStatusOptions } from './helper';
import { EditIcon } from '@alphafounders/icons';
import clsx from 'clsx';
import Select from 'presentation/components/controls/Select';
import { getString } from 'presentation/theme/localization';
import CommonModal from 'presentation/components/modal/CommonModal';
import { Button } from '@alphafounders/ui';
import useSnackbar from 'utils/snackbar';

export function UpdateRefundStatusButton({ rowData }: any) {
  const [showModal, setShowModal] = useState(false);
  const [updateRefundStatus] = useUpdateRefundStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const handleUpdateRefundStatus = async () => {
    const status = RefundStatusOptions.find(
      (option) => option.id === selectedStatus
    )?.value;

    try {
      await updateRefundStatus({
        id: rowData.name,
        status: status!,
      }).unwrap();
      showSuccessSnackbar(
        getString('text.updated', { field: 'Refund status' })
      );
    } catch (error: any) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: error?.data?.message ?? '',
        })
      );
    } finally {
      setShowModal(false);
    }
  };

  // Reset selected status when modal is opened
  // This ensures that the previous selection does not persist when opening the modal again
  useEffect(() => {
    if (showModal) setSelectedStatus(null);
  }, [showModal]);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        type="button"
        aria-label="open document"
        className={clsx(
          'cursor-pointer bg-primary w-[32px] h-[32px] rounded-full flex item-center border-none justify-center p-0 pt-[3px]'
        )}
      >
        <EditIcon fillColor="white" className="w-6" />
      </button>

      <CommonModal
        maxWidth="xs"
        title={rowData.id}
        isShowCloseBtn
        handleCloseModal={() => setShowModal(false)}
        open={showModal}
      >
        <div className="flex flex-col py-4">
          <Select
            fixedLabel
            data-testid="select-status"
            label={getString('text.status')}
            name="status"
            placeholder={getString('package.selectPlaceholder')}
            options={RefundStatusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(Number(e.target.value))}
          />

          <div className="flex justify-end mt-5">
            <Button
              text={getString('text.update')}
              disabled={selectedStatus === null}
              onClick={handleUpdateRefundStatus}
              className="w-auto h-auto p-3 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
            />
            <Button
              text={getString('text.close')}
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
            />
          </div>
        </div>
      </CommonModal>
    </>
  );
}
