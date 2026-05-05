import { TemplateWithType } from 'presentation/components/modal/ImportModal/index.helper';
import { Column } from 'presentation/HOCs/WithTableList';

import { columns } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/customerProfileHelper';

export const leadAutoAssignTemplate: string[] = ['Agent ID', 'CR%', 'Leads'];

export const leadColumns: () => Column[] = () => {
  const column = columns;
  column.splice(2, 1, {
    id: 'effectiveDate',
    field: 'effectiveDate',
    label: 'menu.autoAssignment.effectiveDate',
    minWidth: 100,
    disabled: true,
    sorting: 'none',
  });
  return column;
};

export const autoAssignTemplateWithDatatype: TemplateWithType[] =
  leadAutoAssignTemplate.map((template) => {
    const dataTypeOfNumber = ['Leads', 'CR%'];
    if (dataTypeOfNumber.includes(template)) {
      return {
        name: template,
        dataType: 'number',
      };
    }
    return { name: template, dataType: 'string' };
  });
