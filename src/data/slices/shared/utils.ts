import { moneyToCurrency, numberToMoney } from 'utils/currency';

export const showMoneyFromUnit = (amount: any) =>
  amount?.units ? numberToMoney(moneyToCurrency(amount)) : '-';

export const showPaymentPlan = (paymentPlan: string, paymentMethod: string) =>
  paymentPlan === 'RABBIT_CARE_INSTALLMENT' && paymentMethod === 'DIRECT_DEBIT'
    ? 'DIRECT_DEBIT_INSTALLMENT'
    : paymentPlan || '-';
