import React from 'react';

import SectionRenderer from 'presentation/components/common/FormikFields/SectionRenderer';
import { getString } from 'presentation/theme/localization';

import useCustomer from '../hook/useCustomer';

interface CustomerProps {
  isFieldDisabled?: boolean;
  isPartiallyDisabled?: boolean;
}

function Customer({
  isFieldDisabled = false,
  isPartiallyDisabled = false,
}: CustomerProps) {
  const { dataSchema: customerSchema } = useCustomer({
    isDisabled: isFieldDisabled,
    isPartiallyDisabled,
  });

  return (
    <SectionRenderer
      config={{ title: getString('text.customer') }}
      dataSchema={customerSchema}
    />
  );
}

export default Customer;
