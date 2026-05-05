import React from 'react';

import Controls from 'presentation/components/controls/Control';
import {
  getPreferredTypeValue,
  getValueVoluntaryInsuranceType,
} from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { insurerTypeOptions } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';

interface PreferredTypeProps {
  value: any;
  handleSelectChange: (value: any) => void;
  isDisabled?: boolean;
}

function PreferredType({
  value,
  handleSelectChange,
  isDisabled = false,
}: PreferredTypeProps) {
  if (isDisabled) {
    return <span>{getPreferredTypeValue(value)}</span>;
  }
  return (
    <Controls.Autocomplete
      data-testid="preferred-type-insurer"
      options={insurerTypeOptions}
      placeholder=""
      name="preferredType"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        handleSelectChange(
          getValueVoluntaryInsuranceType(event.target.value as any)
        );
      }}
      multiple
    />
  );
}

export default PreferredType;
