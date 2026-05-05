import { FileCopyIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import React from 'react';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import CopyEmailDialog from 'presentation/components/dialogs/CopyEmailDialog/CopyEmailDialog';
import { getString } from 'presentation/theme/localization';

import { useCopyButton } from './useCopyButton';

interface CopyButtonProps {
  orderPolicy: Record<string, any>;
  orderData: OrderDataResponse | undefined;
  showEmailModal?: boolean;
  variant?: 'primary' | 'secondary' | 'custom';
  className?: string;
}

export default function CopyButton({
  orderPolicy,
  orderData,
  showEmailModal = false,
  variant = 'secondary',
  className = '',
}: CopyButtonProps) {
  const {
    isLoading,
    isError,
    isEmailModalOpen,
    emailContent,
    handleClick,
    closeEmailModal,
  } = useCopyButton({
    orderPolicy,
    orderData,
    showEmailModal,
  });

  const buttonText = showEmailModal
    ? getString('copyPolicy.getEmailButton')
    : '';
  const icon = showEmailModal ? undefined : <FileCopyIcon />;
  const loadingText = showEmailModal
    ? getString('text.loading')
    : getString('copyPolicy.keepBrowserFocus');

  return (
    <>
      <Button
        dataTestId={showEmailModal ? 'btn-insurer-email' : 'copy-policy-button'}
        className={showEmailModal ? `ml-2 ${className}` : 'ml-1'}
        variant={variant}
        icon={icon}
        text={buttonText}
        onClick={handleClick}
        isLoading={isLoading}
        loadingText={loadingText}
      />

      {showEmailModal && (
        <CopyEmailDialog
          isOpen={isEmailModalOpen}
          onClose={closeEmailModal}
          isLoading={isLoading}
          data={emailContent}
          isError={isError}
        />
      )}
    </>
  );
}
