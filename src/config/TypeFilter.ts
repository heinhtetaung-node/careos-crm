export const ProductTypeFilter = [
  {
    id: 1,
    value: 'products/car-insurance',
    title: 'Car Insurance',
  },
  {
    id: 2,
    value: 'products/health-insurance',
    title: 'Health Insurance',
  },
  {
    id: 3,
    value: 'products/travel-insurance',
    title: 'Travel Insurance',
  },
];

interface ObjectType {
  [key: string]: any;
}

export const PRODUCT_TYPE: ObjectType = {
  'products/car-insurance': 'Car Insurance',
  'products/health-insurance': 'Health Insurance',
  'products/travel-insurance': 'Travel Insurance',
};
export const PRODUCTS = {
  HEALTH_PRODUCT_INSURANCE: 'products/health-insurance',
  CAR_PRODUCT_INSURANCE: 'products/car-insurance',
  TRAVEL_PRODUCT_INSURANCE: 'products/travel-insurance',
};
export const LeadTypeFilter = [
  {
    id: 0,
    value: 'new',
    title: 'leadTypeFilter.new',
    leadType: 'LEAD_TYPE_NEW',
  },
  {
    id: 1,
    value: 'retainer',
    title: 'leadTypeFilter.retainer',
    leadType: 'LEAD_TYPE_RETAINER',
  },
  {
    id: 2,
    value: 'renewal',
    title: 'leadTypeFilter.renewal',
    leadType: 'LEAD_TYPE_RENEWAL',
  },
];
