import React from 'react';

import SectionRenderer from 'presentation/components/common/FormikFields/SectionRenderer';
import { getString } from 'presentation/theme/localization';

import useCustomer from './useCustomer';

interface CustomerProps {
  isFieldDisabled?: boolean;
}

function Customer({ isFieldDisabled = false }: CustomerProps) {
  const { dataSchema: customerSchema } = useCustomer({
    isDisabled: isFieldDisabled,
  });

  return (
    <SectionRenderer
      config={{ title: getString('text.customer') }}
      dataSchema={customerSchema}
    />
  );
}

export default Customer;
