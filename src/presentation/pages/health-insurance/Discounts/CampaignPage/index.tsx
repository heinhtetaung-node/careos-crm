import React from 'react';
import DiscountCampaignPage from 'presentation/pages/car-insurance/Discounts/CampaignPage';
import { PRODUCTS } from 'config/TypeFilter';

function HealthDiscountCampaignPage() {
  return <DiscountCampaignPage product={PRODUCTS.HEALTH_PRODUCT_INSURANCE} />;
}
export default HealthDiscountCampaignPage;
