import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import React, { useState } from 'react';

import CommonModal from 'presentation/components/modal/CommonModal';
import DeleteCouponModal from 'presentation/components/modal/LeadDetailsModal/deleteCouponModal';
import { getString } from 'presentation/theme/localization';
import './index.scss';

interface CouponTagProps {
  couponCode: string;
  leadStatus: string;
  isFieldDisabled?: boolean;
  displayOnly?: boolean;
}

const purchaseStatus = 'PURCHASE';

function CouponTag({
  couponCode,
  leadStatus,
  isFieldDisabled = false,
  displayOnly = false,
}: CouponTagProps) {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleClick = () => {
    if (leadStatus !== purchaseStatus) {
      return setShowConfirmModal(true);
    }
    return null;
  };

  return (
    <>
      <div className="coupon-tag" data-testid="coupon-tag">
        <div className="coupon-tag__code">
          <span>{couponCode}</span>
        </div>
        {!displayOnly && (
          <IconButton
            className="coupon-tag__icon"
            color="primary"
            aria-label="upload picture"
            component="span"
            onClick={() => handleClick()}
            disabled={isFieldDisabled}
          >
            <CancelIcon />
          </IconButton>
        )}
        <CommonModal
          title=""
          open={showConfirmModal}
          handleCloseModal={() => {
            setShowConfirmModal(false);
          }}
        >
          <DeleteCouponModal closeModal={setShowConfirmModal} />
        </CommonModal>
      </div>
      {leadStatus === purchaseStatus ? (
        <FormHelperText error>
          {getString('text.couponValidateMessage')}
        </FormHelperText>
      ) : (
        ''
      )}
    </>
  );
}

export default CouponTag;
