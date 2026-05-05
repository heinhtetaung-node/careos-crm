import React from 'react';
import { Divider } from '@alphafounders/ui';

interface FormSectionProps {
  children: React.ReactNode;
}

function FormSection({ children }: FormSectionProps) {
  return (
    <>
      {children}
      <Divider variant="secondary" pattern="dash" />
    </>
  );
}

export default FormSection;
