import React, { useState } from 'react';

import SectionRenderer from 'presentation/components/common/FormikFields/SectionRenderer';
import FixedDriverModal from 'presentation/components/modal/FixedDriverModal';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';

import usePolicyHolderInformation from './usePolicyHolderInformation';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import { SuccessIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';

interface PolicyHolderInformationProps {
  readonly isFieldDisabled: boolean;
}

function PolicyHolderInformation({
  isFieldDisabled,
}: PolicyHolderInformationProps) {
  const lead = useGetLeadSelector();

  const [showFixedDriverModal, setShowFixedDriverModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handlePolicyUploaded = () => {
    setIsOpen(true);
  };
  const { dataSchema } = usePolicyHolderInformation({
    isDisabled: isFieldDisabled,
    showFixedDriverModal,
    setShowFixedDriverModal,
    handlePolicyUploaded,
  });
  return (
    <>
      <MutationResponseDialog
        isOpen={isOpen}
        content={getString('text.policyHolderSwitchWarning')}
        title={getString('text.policyHolderInformation')}
        blueTitle={getString('text.updatedInformation')}
        setIsOpen={setIsOpen}
        id="policyHolderUpdated"
        icon={<SuccessIcon fontSize="large" className="mt-6" />}
        actionButton={
          <Button
            className="uppercase w-32 border-0 !border-primary mt-2 hover:opacity-90 h-10 text-white font-sans"
            onClick={() => setIsOpen(false)}
            dataTestId="address-btn"
            text={getString('text.close')}
          />
        }
      />
      <SectionRenderer
        config={{ title: getString('text.policyHolderInformation') }}
        dataSchema={dataSchema}
      />
      <FixedDriverModal
        openModal={showFixedDriverModal}
        handleCloseModal={() => setShowFixedDriverModal(false)}
        title={getString('fixedDriverModal.title')}
        leadData={lead}
        isDisabled={isFieldDisabled}
      />
    </>
  );
}

export default PolicyHolderInformation;
