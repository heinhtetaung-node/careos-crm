import { StarOutlineIcon } from '@alphafounders/icons';
import React from 'react';

import { useUpdateLeadStatusMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import Controls from 'presentation/components/controls/Control';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';

interface MarkImportantButton {
  isDisabled?: boolean;
}

function MarkImportantButton({
  isDisabled = false,
}: Readonly<MarkImportantButton>) {
  const lead = useGetLeadSelector();
  const [updateLeadStatus, { isLoading }] = useUpdateLeadStatusMutation();

  const handleClick = () => {
    updateLeadStatus({
      leadId: lead.name,
      payload: { important: !lead.important },
    });
  };

  return (
    <Controls.Button
      text={
        lead.important
          ? getString('text.removeStar')
          : getString('text.addStar')
      }
      className="px-2"
      variant={lead.important ? 'contained' : 'outlined'}
      color={lead.important ? 'secondary' : 'primary'}
      loading={isLoading}
      onClick={handleClick}
      icon={<StarOutlineIcon fillColor="#005098" fontSize="small" />}
      disabled={isDisabled}
    />
  );
}

export default MarkImportantButton;
