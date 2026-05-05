import {
  TemplateWithType,
  Column,
} from 'presentation/components/modal/ImportModal/index.helper';

import { columns } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/customerProfileHelper';

export const massLeadTemplate: string[] = ['Agent ID', 'Lead ID'];

export const massLeadTemplateWithDatatype: TemplateWithType[] =
  massLeadTemplate.map((template) => ({ name: template, dataType: 'string' }));

export const massLeadColumns: Column[] = columns
  .filter((col) => col.id !== 'updateTime' && col.id !== 'effectiveDate')
  .map((col) => {
    const updatedCol = { ...col };
    updatedCol.label = col.label.replace('customerProfile', 'massAssign');
    return updatedCol;
  });
