import React from 'react';

import {
  isCanCreateLead,
  healthLeadImportColumns,
  healthLeadImportColumnsWithType,
  healthLeadImportRequiredColumns,
  healthLeadImportShouldNotHaveColumns,
  healthLeadImportMaximumLimit,
} from './ImportHealthLeadPageHelper';

import './index.scss';
import LeadImportPage from 'presentation/pages/shared/LeadImportPage';
import { PRODUCTS } from 'config/TypeFilter';

function ImportLeadPage() {
  return (
    <LeadImportPage
      tableName="healthLeadImport"
      canCreateLead={isCanCreateLead}
      historyFilter={`product="${PRODUCTS.HEALTH_PRODUCT_INSURANCE}"`}
      sourceFilter={{
        filter: `product="${PRODUCTS.HEALTH_PRODUCT_INSURANCE}"`,
        pageSize: 100,
      }}
      validationProps={{
        template: healthLeadImportColumns,
        requiredColumns: healthLeadImportRequiredColumns,
        templateWithType: healthLeadImportColumnsWithType,
        shouldNotHaveColumns: healthLeadImportShouldNotHaveColumns,
        maximumUpload: healthLeadImportMaximumLimit,
      }}
    />
  );
}

export default ImportLeadPage;
