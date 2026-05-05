export interface Option {
  initialAmount: string;
  subsequentAmount: string;
  feeAmount: string;
  discountAmount: string;
  discountRate: number;
  netPremiumAmount: string;
  discountType: string;
  paymentMethod: string;
  paymentOption: string;
  installment: number;
  issuingBank: string | null;
  discount?: {
    type: string;
    percentage: number;
    amount: string;
  } | null;
}

export interface FullPayment {
  name: string;
  options: Option[];
}

export interface PaymentInfo {
  name: string;
  options: Option[];
}

export interface RabbitCareInstallment {
  name: string;
  options: PaymentInfo[];
}

export interface CardProviders {
  shortName: string;
  displayName: string;
  name: string;
}

export interface CreditCardInstallment {
  name: string;
  cards: Record<string, PaymentInfo[]>;
  cardProviders: CardProviders[];
}
