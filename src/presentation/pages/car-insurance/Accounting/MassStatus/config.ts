import { columns } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/customerProfileHelper';

const templateTypeColumn = {
  id: 'templateType',
  field: 'templateType',
  label: 'text.templateType',
  minWidth: 100,
  sorting: 'none',
  disabled: true,
};

export const getColumns = () => {
  const defaultColumns = columns
    .filter((col: any) => col.id !== 'updateTime' && col.id !== 'effectiveDate')
    .map((col: any) => {
      const updatedCol = {
        ...col,
      };
      updatedCol.label = col.label.replace('customerProfile', 'massAssign');
      return updatedCol;
    });
  defaultColumns.splice(3, 0, templateTypeColumn); // add it right after filename column
  return defaultColumns;
};
