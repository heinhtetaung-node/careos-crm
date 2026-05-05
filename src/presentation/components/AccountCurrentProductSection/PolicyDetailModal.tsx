import React from 'react';

import Dialog from 'presentation/components/common/Dialog';
import { getString } from 'presentation/theme/localization';

import FieldRow from './FieldRow';

export interface PolicyDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  productType: string;
  data?: Record<string, any>;
}

// Field configurations for different product types
const carInsuranceFields = [
  { label: getString('leadDetailFields.brand'), key: 'brand' },
  { label: getString('leadDetailFields.model'), key: 'model' },
  { label: getString('leadDetailFields.sumInsured'), key: 'sumInsured' },
  { label: getString('leadDetailFields.licensePlate'), key: 'licensePlate' },
  { label: getString('leadDetailFields.insuranceType'), key: 'insuranceType' },
  {
    label: getString('foreignLead.policyExpirationDate'),
    key: 'expirationDate',
  },
  { label: getString('text.policyStartDate'), key: 'policyStartDate' },
  { label: getString('paymentDetails.totalPremium'), key: 'premiumAmount' },
  { label: getString('menu.carePay.paymentOption'), key: 'paymentOption' },
  { label: getString('menu.carePay.paymentMethod'), key: 'paymentMethod' },
  { label: getString('leadDetailFields.leadSource'), key: 'leadSource' },
];

const healthInsuranceFields = [
  { label: getString('leadDetailFields.sumInsured'), key: 'sumInsured' },
  { label: getString('leadDetailFields.productPlan'), key: 'planName' },
  { label: getString('text.policyStartDate'), key: 'policyStartDate' },
  {
    label: getString('foreignLead.policyExpirationDate'),
    key: 'expirationDate',
  },
  { label: getString('paymentDetails.totalPremium'), key: 'premiumAmount' },
  { label: getString('healthLead.beneficiaryName'), key: 'beneficiaryName' },
  {
    label: getString('healthLead.beneficiaryRelationship'),
    key: 'beneficiaryRelationship',
  },
  { label: getString('menu.carePay.paymentOption'), key: 'paymentOption' },
  { label: getString('menu.carePay.paymentMethod'), key: 'paymentMethod' },
  {
    label: getString('menu.accounting.cancellationStatus'),
    key: 'orderCancellationStatus',
  },
  {
    label: getString('cancellation.cancellationReason'),
    key: 'orderCancellationReason',
  },
  {
    label: getString('cancellation.orderCancelledOn'),
    key: 'orderCancellationDate',
  },
  { label: getString('leadDetailFields.leadSource'), key: 'leadSource' },
];

function PolicyDetailModal({
  open,
  onClose,
  orderId,
  productType,
  data,
}: Readonly<PolicyDetailModalProps>) {
  const isCarInsurance = productType === 'products/car-insurance';
  const fields = isCarInsurance ? carInsuranceFields : healthInsuranceFields;

  const productLabel = isCarInsurance
    ? getString('productionOptions.carInsurance')
    : getString('productionOptions.healthInsurance');

  const modalTitle = `Order #${orderId} - ${productLabel}`;

  const content = (
    <div className="flex flex-col">
      {fields.map((field) => (
        <FieldRow
          key={field.key}
          label={field.label}
          value={data?.[field.key]}
        />
      ))}
    </div>
  );

  return (
    <Dialog
      open={open}
      handleToggle={onClose}
      title={modalTitle}
      content={content}
      maxWidth="sm"
      fullWidth
    />
  );
}

export default PolicyDetailModal;
