import { SuccessIcon } from '@alphafounders/icons';
import clsx from 'clsx';
import React from 'react';

import CommonModal from '../CommonModal';

interface SuccessModalProps {
  className?: string;
  isOpen: boolean;
  text: string;
  handleClose: (status: boolean) => void;
}

export default function SuccessModal({
  className,
  isOpen,
  handleClose,
  text,
}: SuccessModalProps) {
  return (
    <CommonModal
      dataTestId="success-modal"
      className={clsx('p-4', className)}
      open={isOpen}
      handleCloseModal={() => handleClose(false)}
    >
      <div className="text-center">
        <SuccessIcon />
        <h3>{text}</h3>
      </div>
    </CommonModal>
  );
}
