import { getProductType } from './helper';

test('Should get correct product type', () => {
  expect(getProductType('products/car-insurance')).toBe('Car Insurance');
  expect(getProductType('products/health-insurance')).toBe('Health Insurance');
  expect(getProductType('')).toBe('');
});
