import { PRODUCTS } from 'config/TypeFilter';

const ProductOptions = [
  {
    id: 1,
    value: 'products/car-insurance',
    title: 'productionOptions.carInsurance',
  },
  {
    id: 2,
    value: 'products/health-insurance',
    title: 'productionOptions.healthInsurance',
  },
  {
    id: 3,
    value: 'products/travel-insurance',
    title: 'productionOptions.travelInsurance',
  },
];

export const checkProductIsHealth = (product: keyof typeof PRODUCTS) =>
  product === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

export default ProductOptions;
