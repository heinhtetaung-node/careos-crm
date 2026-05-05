export type InstallmentOptionResponse = {
  paymentOptions: {
    installments: number;
  }[];
};

export type PaymentOptionResponse = {
  paymentOptions: string[];
};

export type AvailableInstallment = {
  availablePlans: number[];
};
