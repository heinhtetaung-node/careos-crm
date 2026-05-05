import _isEmpty from 'lodash/isEmpty';

const invalidCampaignDiscountType = ['DISCOUNT_TYPE_RCL', ''];

export interface SelectedPaymentInfo {
  paymentMethod: string;
  paymentOption: string;
  numberOfInstallment: number;
  cardProvider?: string;
  discountType?: string;
  discountPercentage?: number;
  campaignName?: string;
}

export const transformPaymentOptionToSelectedData = (
  option: SelectedPaymentInfo,
  existingFormValue: SelectedPaymentInfo
) => ({
  ...existingFormValue,
  paymentMethod: option.paymentMethod,
  paymentOption: option.paymentOption,
  numberOfInstallment: option.numberOfInstallment,
  cardProvider: option.cardProvider,
  discountType: _isEmpty(option.discountType) ? undefined : option.discountType,
  discountPercentage: option.discountPercentage,
  campaignName: invalidCampaignDiscountType.includes(option.discountType ?? '')
    ? undefined
    : existingFormValue.campaignName,
});
