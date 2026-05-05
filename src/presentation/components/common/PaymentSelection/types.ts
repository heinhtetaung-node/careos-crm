interface Option {
  text: string;
  value: any;
}

export interface PaymentSelectionProps {
  isLoading?: boolean;
  paymentOptions: Option[];
  paymentMethods?: Option[];
  installmentPlans?: Option[];
  issuingBanks?: Option[];
  isFullPayment?: boolean;
  isCustomPackage?: boolean;
  isReadOnly?: boolean;
}
