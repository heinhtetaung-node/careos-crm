import { WarningIcon } from '@alphafounders/icons';
import React from 'react';

import CommonButton from 'presentation/components/common/Button/CommonButton';
import CommonModal from 'presentation/components/modal/CommonModal';
import WarningModal from 'presentation/components/modal/WarningModal';
import { getString } from 'presentation/theme/localization';

interface Props {
  isOpen?: boolean;
  toggleModal: (payload: boolean) => void;
  handleConfirm: () => void;
}

export default function Warning({
  isOpen = false,
  toggleModal,
  handleConfirm,
}: Props) {
  return (
    <CommonModal
      open={isOpen}
      handleCloseModal={() => toggleModal(false)}
      hasBorderRadius
      data-testid="shipment-warning-modal"
    >
      <WarningModal
        logo={<WarningIcon viewBox="0 0 60 60" />}
        title={getString('warningModal.warning')}
        description={
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: getString('text.notSelectedAllPoliciesErrorMsg'),
            }}
          />
        }
        button={
          <CommonButton
            className="mr-2"
            color="default"
            variant="contained"
            data-testid="shipment-warning-confirm-btn"
            onClick={handleConfirm}
          >
            {getString('text.confirmShipment')}
          </CommonButton>
        }
      />
    </CommonModal>
  );
}
