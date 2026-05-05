import { Button } from '@alphafounders/ui';
import React from 'react';

import { UploadFileIcon } from 'presentation/components/icons';
import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

import usePurchaseButton from './usePurchaseButton';

interface PurchaseButtonProps {
  lead: Lead;
  disabled?: boolean;
}

function PurchaseButton({
  lead,
  disabled = false,
}: Readonly<PurchaseButtonProps>) {
  const { isButtonLoading, handleCreateOrder } = usePurchaseButton({ lead });

  return (
    <Button
      text={getString('leadStatus.purchased')}
      loadingText={getString('text.loading')}
      isLoading={isButtonLoading}
      className="px-4 h-10 normal-case mr-1"
      disabled={disabled}
      icon={<UploadFileIcon className="mr-1" />}
      onClick={handleCreateOrder}
    />
  );
}

export default PurchaseButton;
