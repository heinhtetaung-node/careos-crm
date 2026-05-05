import {
  checkPaymentValidation,
  convertValueTo,
  DiscountType,
  mapDiscountType,
} from './helper';

describe('convertValueTo', () => {
  describe('type "amount" - converts percentage to amount', () => {
    const testCases = [
      {
        value: 10,
        totalAmount: '1000',
        expected: 100,
        description: '10% of 1000 = 100',
      },
      {
        value: 5.5,
        totalAmount: '2000',
        expected: 110,
        description: '5.5% of 2000 = 110',
      },
      {
        value: 0,
        totalAmount: '1000',
        expected: 0,
        description: '0% of 1000 = 0',
      },
    ];

    testCases.forEach(({ value, totalAmount, expected, description }) => {
      it(description, () => {
        expect(convertValueTo('amount', value, totalAmount)).toBe(expected);
      });
    });
  });

  describe('type "percent" - converts amount to percentage', () => {
    const testCases = [
      {
        value: 100,
        totalAmount: '1000',
        expected: 10,
        description: '100 out of 1000 = 10%',
      },
      {
        value: 150.5,
        totalAmount: '2000',
        expected: 7.53,
        description: '150.5 out of 2000 = 7.53%',
      },
      {
        value: 0,
        totalAmount: '1000',
        expected: 0,
        description: '0 out of 1000 = 0%',
      },
    ];

    testCases.forEach(({ value, totalAmount, expected, description }) => {
      it(description, () => {
        expect(convertValueTo('percent', value, totalAmount)).toBe(expected);
      });
    });
  });

  describe('unknown types - returns original value', () => {
    const testCases = [
      { type: 'unknown', value: 100, expected: 100 },
      { type: '', value: 50, expected: 50 },
      { type: 'whole', value: 75, expected: 75 },
      { type: 'fixed', value: 123.45, expected: 123.45 },
    ];

    testCases.forEach(({ type, value, expected }) => {
      it(`type "${type}" returns ${value}`, () => {
        expect(convertValueTo(type, value, '1000')).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    const edgeCases = [
      {
        description: 'empty total amount',
        args: ['amount', 10, ''],
        expected: 0,
      },
      {
        description: 'zero total amount division',
        args: ['percent', 100, '0'],
        expected: Infinity,
      },
    ];

    edgeCases.forEach(({ description, args, expected }) => {
      it(`handles ${description}`, () => {
        expect(
          convertValueTo(
            args[0] as string,
            args[1] as number,
            args[2] as string
          )
        ).toBe(expected);
      });
    });
  });
});

describe('mapDiscountType', () => {
  it('should map unrecognized discountType to none', () => {
    const result = mapDiscountType('DISCOUNT_TYPE_RCL');
    expect(result).toBe('none');
  });

  it('should map recognized discountType to accordingly', () => {
    const result = mapDiscountType('campaign_discount');
    expect(result).toBe('campaign_discount');
  });
});

describe('checkPaymentValidation', () => {
  it('should validate required fields for non-car discount', async () => {
    const validData = {
      discountType: DiscountType.campaignDiscount,
      campaignName: 'Summer Sale',
      discountPercent: 10,
      discountAmount: 100,
    };

    await expect(checkPaymentValidation.validate(validData)).resolves.toEqual(
      validData
    );
  });

  it('should allow optional fields for car discount', async () => {
    const validData = {
      discountType: DiscountType.carDiscount,
      campaignName: null,
      discountPercent: null,
      discountAmount: null,
    };

    await expect(checkPaymentValidation.validate(validData)).resolves.toEqual(
      validData
    );
  });

  it('should reject missing required fields for non-car discount', async () => {
    const invalidData = {
      discountType: DiscountType.campaignDiscount,
    };

    await expect(
      checkPaymentValidation.validate(invalidData)
    ).rejects.toThrow();
  });

  it('should require discountType field', async () => {
    const invalidData = {
      campaignName: 'Test',
      discountPercent: 10,
      discountAmount: 100,
    };

    await expect(
      checkPaymentValidation.validate(invalidData)
    ).rejects.toThrow();
  });
});
