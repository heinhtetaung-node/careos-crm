import { columns } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/customerProfileHelper';

export const orderMassStatusChangetemplate = [
  'ShortID',
  'Value',
  'ApplicationNumber',
  'Comment',
];

export const orderMassStatusChangeRequiredColumns = ['ShortID', 'Value'];

export const orderMassStatusChangeTemplateWithDataType =
  orderMassStatusChangetemplate.map((template) => ({
    name: template,
    dataType: 'string',
  }));

export const massStatusChangeColumns = columns
  .filter((col) => col.id !== 'updateTime' && col.id !== 'effectiveDate')
  .map((col) => {
    const updatedCol = { ...col };
    updatedCol.label = col.label.replace('customerProfile', 'massAssign');
    return updatedCol;
  });
