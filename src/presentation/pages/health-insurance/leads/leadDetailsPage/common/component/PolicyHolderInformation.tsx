import React, { useState } from 'react';

import SectionRenderer from 'presentation/components/common/FormikFields/SectionRenderer';
import { getString } from 'presentation/theme/localization';

import usePolicyHolderInformation from '../hook/usePolicyHolderInformation';

interface PolicyHolderInformationProps {
  readonly isFieldDisabled: boolean;
  readonly isPartiallyDisabled: boolean;
  readonly isHealthOrder?: boolean;
  readonly policyHolderType?: string;
}

function PolicyHolderInformation({
  isFieldDisabled,
  isPartiallyDisabled,
  isHealthOrder,
  policyHolderType,
}: PolicyHolderInformationProps) {
  const [policyHolderTypeUpdated, setPolicyHolderTypeUpdated] =
    useState<string>(policyHolderType ?? '');

  const customerIsPolicyHolder = policyHolderTypeUpdated === 'customer';

  const { dataSchema } = usePolicyHolderInformation({
    isDisabled: isFieldDisabled,
    isPartiallyDisabled,
    isHealthOrder,
    customerIsPolicyHolder,
    setPolicyHolderTypeUpdated,
  });

  return (
    <>
      <SectionRenderer
        config={{ title: getString('text.policyHolderInformation') }}
        dataSchema={dataSchema}
      />
    </>
  );
}

export default PolicyHolderInformation;
