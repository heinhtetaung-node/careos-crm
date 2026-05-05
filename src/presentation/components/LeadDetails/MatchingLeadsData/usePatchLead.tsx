import { Button } from '@alphafounders/ui';
import { PatchIcon } from '@alphafounders/icons';
import React from 'react';

import { useLazyGetLeadByIDQuery } from 'data/slices/leadSlice';
import useAddEmail from 'presentation/components/modal/LeadDetailsModal/EmailModal/useAddEmail';
import useAddPhone from 'presentation/components/modal/LeadDetailsModal/PhoneModal/useAddPhone';

type PatchLeadButtonProps = {
  leadId: string;
  field: string;
  testId: string;
  value: string;
  patchLeadDisabled: boolean;
};

function usePatchLead() {
  const [getLeadById] = useLazyGetLeadByIDQuery();
  const { addEmail, status: addEmailStatus } = useAddEmail();
  const { addPhone, status: addPhoneStatus } = useAddPhone();

  async function handleCopyData(leadId: string, field: string) {
    const leadData = await getLeadById(leadId.split('/')[1]);

    if (!leadData.error && leadData.data) {
      if (field === 'phone') {
        const { primaryPhoneIndex } = leadData.data.data;
        const phoneToPatch =
          leadData?.data?.data?.customerPhoneNumber[primaryPhoneIndex].phone;

        if (phoneToPatch) {
          addPhone(phoneToPatch, false);
        }
      }

      if (field === 'email') {
        const emailToPatch =
          leadData?.data?.data?.customerEmail[
            leadData?.data?.data?.customerEmail?.length - 1
          ];

        if (emailToPatch) {
          addEmail(emailToPatch);
        }
      }
    }
  }

  function PatchLeadButton({
    leadId,
    field,
    testId,
    value,
    patchLeadDisabled,
  }: Readonly<PatchLeadButtonProps>) {
    return (
      <div
        data-testid={`${testId}-${leadId}`}
        className="flex items-center justify-between"
      >
        <span>{value}</span>
        <Button
          className="uppercase bg-primary text-white px-2 h-7 font-sans"
          onClick={() => handleCopyData(leadId, field)}
          dataTestId={`patch-lead-button-${field}`}
          text=""
          icon={<PatchIcon width="16" height="16" fill="white" />}
          isLoading={
            field === 'email'
              ? addEmailStatus.isLoading
              : addPhoneStatus.isLoading
          }
          disabled={patchLeadDisabled}
        />
      </div>
    );
  }

  return {
    PatchLeadButton,
  };
}

export default usePatchLead;
