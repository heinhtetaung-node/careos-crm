export interface CreatePaymentSubmitProps {
  firstMonthAdditional?: number;
  firstMonth: number;
  followingMonth: number;
  paymentOption: number;
  paymentMethod: number;
  issuingBank: number;
  installmentPlan: number;
  installmentDate: string;
}
