import {
  getLastDiscount,
  getLastInvoicePrice,
  getLastPackagePrice,
  isValidDate,
} from './InsurerInfoSection.helper';

describe('renewal order prices', () => {
  it('should convert to satang to baht if lead is from careos', () => {
    const annotations = {
      '@immutable/product-car/last-discount': 100000,
      '@immutable/product-car/last-invoice-price': 1789600,
      '@immutable/product-car/last-package-price': 1725000,
      '@immutable/product-car/original-order':
        'https://staging-crm.sabye-songkran.com/orders/1c996e57-317f-420f-a92d-25440b05265e',
      'product-car/insurer-accepted': 'ACCEPTED',
    };
    const invP = getLastInvoicePrice(annotations);
    expect(invP).toBe('17,896');
    const pkgP = getLastPackagePrice(annotations);
    expect(pkgP).toBe('17,250');
    const disP = getLastDiscount(annotations);
    expect(disP).toBe('1,000');
  });

  it('should not convert to satang to baht if lead is from nana', () => {
    const annotations = {
      '@immutable/product-car/last-discount': 1000,
      '@immutable/product-car/last-invoice-price': 32646,
      '@immutable/product-car/last-package-price': 32645.7,
      '@immutable/product-car/original-order':
        'https://staging-nana2.rabbitinternet.com/car-insurance/orders/read-only/167777',
      'migrated-as-non-purchased-renewal': true,
      'product-car/insurer-accepted': 'UNSPECIFIED',
    };
    const invP = getLastInvoicePrice(annotations);
    expect(invP).toBe(32646);
    const pkgP = getLastPackagePrice(annotations);
    expect(pkgP).toBe(32645.7);
    const disP = getLastDiscount(annotations);
    expect(disP).toBe(1000);
  });
});

describe('isValidDate', () => {
  it('returns false for empty values', () => {
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate('')).toBe(false);
  });

  it('returns true for valid Date or date string', () => {
    expect(isValidDate(new Date('2026-01-01'))).toBe(true);
    expect(isValidDate('2026-01-01')).toBe(true);
  });

  it('returns false for invalid date values', () => {
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate(new Date('invalid'))).toBe(false);
  });
});
