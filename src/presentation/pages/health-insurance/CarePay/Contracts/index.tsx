import { PRODUCTS } from 'config/TypeFilter';
import ContractListingPage from 'presentation/pages/car-insurance/CarePay/Contracts';
import React from 'react';

function HealthContractListingPage() {
  return <ContractListingPage product={PRODUCTS.HEALTH_PRODUCT_INSURANCE} />;
}
export default HealthContractListingPage;
