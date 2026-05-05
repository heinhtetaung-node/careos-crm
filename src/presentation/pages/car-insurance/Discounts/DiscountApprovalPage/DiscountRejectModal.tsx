import { Grid } from '@material-ui/core';
import React, { useCallback, useState, ChangeEvent } from 'react';

import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import Controls from 'presentation/components/controls/Control';
import CommonModal from 'presentation/components/modal/CommonModal';
import { getString } from 'presentation/theme/localization';

export default function DiscountRejectModal({
  isModalOpen,
  onModalClose,
  handleReject,
}: {
  isModalOpen: boolean;
  onModalClose: () => void;
  handleReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const closeModal = useCallback(() => onModalClose(), []);

  const handleChangeReason = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value),
    []
  );

  return (
    <CommonModal
      title={`${getString('menu.discounts.reasonOfRejection')}`}
      isHeaderCenter
      open={isModalOpen}
      handleCloseModal={closeModal}
      isShowCloseBtn
    >
      <Grid container>
        <Grid item xs={12}>
          <CommonTextField
            dataTestId="reject-modal-message"
            label={`${getString('text.reason')}`}
            placeholder={`${getString('menu.discounts.reasonOfRejection')}`}
            minRows={6}
            value={reason}
            multiline
            onChange={handleChangeReason}
            className="mt-2 mb-2"
          />
        </Grid>
        <Grid item xs={12}>
          <Controls.Button
            data-testid="reject-modal-submit"
            color="primary"
            onClick={() => handleReject(reason)}
            disabled={reason.length <= 0}
            text={getString('text.save')}
          />
        </Grid>
      </Grid>
    </CommonModal>
  );
}
