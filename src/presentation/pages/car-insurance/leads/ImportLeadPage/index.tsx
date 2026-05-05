import React from 'react';

import {
  isCanCreateLead,
  leadImportColumns,
  leadImportColumnsWithType,
  leadImportRequiredColumns,
  leadImportOptionalColumns,
  leadImportMaximumLimit,
} from './ImportLeadPageHelper';

import './index.scss';
import LeadImportPage from 'presentation/pages/shared/LeadImportPage';
import { PRODUCTS } from 'config/TypeFilter';

function ImportLeadPage() {
  return (
    <LeadImportPage
      tableName="leads"
      canCreateLead={isCanCreateLead}
      historyFilter={`status!="WAITING_UPLOAD" importType="LEAD" product="${PRODUCTS.CAR_PRODUCT_INSURANCE}"`}
      sourceFilter={{
        filter: 'product in ("products/car-insurance")',
        pageSize: 100,
      }}
      validationProps={{
        template: leadImportColumns,
        requiredColumns: leadImportRequiredColumns,
        optionalColumns: leadImportOptionalColumns,
        templateWithType: leadImportColumnsWithType,
        maximumUpload: leadImportMaximumLimit,
      }}
    />
  );
}

export default ImportLeadPage;
