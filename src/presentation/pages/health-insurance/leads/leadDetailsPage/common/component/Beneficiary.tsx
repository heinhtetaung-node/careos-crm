import React from 'react';
import SectionRenderer from 'presentation/components/common/FormikFields/SectionRenderer';
import useBeneficiary from '../hook/useBeneficiary';
import { getString } from 'presentation/theme/localization';

interface BeneficiaryProps {
  isFieldDisabled?: boolean;
  isHealthOrder?: boolean;
}
export const BeneficiarySection = ({
  isFieldDisabled = false,
  isHealthOrder = false,
}: BeneficiaryProps) => {
  const { dataSchema: beneficiarySchema } = useBeneficiary({
    isDisabled: isFieldDisabled,
    isHealthOrder,
    beneficiaryIndex: 0, // Primary beneficiary
  });
  const { dataSchema: beneficiaryAdditionalSchema } = useBeneficiary({
    isDisabled: isFieldDisabled,
    isHealthOrder,
    beneficiaryIndex: 1, // Additional beneficiary
  });

  return (
    <div>
      <SectionRenderer
        config={{ title: getString('healthLead.beneficiary') }}
        dataSchema={beneficiarySchema}
      />
      <SectionRenderer
        config={{ title: getString('healthLead.beneficiaryAdditional') }}
        dataSchema={beneficiaryAdditionalSchema}
      />
    </div>
  );
};
