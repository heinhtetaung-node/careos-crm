import { transformPaymentOptionToSelectedData } from './helper';

describe('transformPaymentOptionToSelectedData', () => {
  it('should correctly transform data', () => {
    const result = transformPaymentOptionToSelectedData(
      {
        discountType: 'car_discount',
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
      } as any,
      { campaignName: 'campagin' } as any
    );
    expect(result).toStrictEqual({
      campaignName: 'campagin',
      cardProvider: undefined,
      discountPercentage: undefined,
      discountType: 'car_discount',
      numberOfInstallment: undefined,
      paymentMethod: 'QR_CODE',
      paymentOption: 'FULL_PAYMENT',
    });
  });
  it('should remove campagin data if discount type is rcl', () => {
    const result = transformPaymentOptionToSelectedData(
      {
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        discountType: 'DISCOUNT_TYPE_RCL',
      } as any,
      { campaignName: 'campagin' } as any
    );
    expect(result).toStrictEqual({
      campaignName: undefined,
      cardProvider: undefined,
      discountPercentage: undefined,
      discountType: 'DISCOUNT_TYPE_RCL',
      numberOfInstallment: undefined,
      paymentMethod: 'QR_CODE',
      paymentOption: 'FULL_PAYMENT',
    });
  });

  it('should remove discountType if discountType is empty', () => {
    const result = transformPaymentOptionToSelectedData(
      {
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        discountType: '',
      } as any,
      { campaignName: 'campagin' } as any
    );
    expect(result).toStrictEqual({
      campaignName: undefined,
      cardProvider: undefined,
      discountPercentage: undefined,
      discountType: undefined,
      numberOfInstallment: undefined,
      paymentMethod: 'QR_CODE',
      paymentOption: 'FULL_PAYMENT',
    });
  });
});
