import { DiscountRulesTypes } from 'data/slices/importSlices/interface';
import {
  TemplateWithType,
  Column,
} from 'presentation/components/modal/ImportModal/index.helper';
import { getString } from 'presentation/theme/localization';

export const columns: Column[] = [
  {
    id: 'createTime',
    field: 'createTime',
    label: 'menu.discounts.dateTime',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'filename',
    field: 'filename',
    label: 'menu.discounts.fileName',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'status',
    field: 'status',
    label: 'menu.discounts.status',
    minWidth: 100,
    sorting: 'desc',
  },
  {
    id: 'createBy',
    field: 'createBy',
    label: 'menu.discounts.importedBy',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

export const discountFileUploadTypes = [
  {
    id: 0,
    title: getString('menu.discounts.byCarModel'),
    value: DiscountRulesTypes.CAR_NON_PREMIUM,
  },
  {
    id: 1,
    title: getString('menu.discounts.byPremium'),
    value: DiscountRulesTypes.CAR_PREMIUM,
  },
];

// Type "1" is Premium whereas type "0" is car-model
export const discountsRequiredColumns: (type: number) => string[] = (type) =>
  // eslint-disable-next-line eqeqeq
  type == 1
    ? ['Premium', 'Type']
    : ['Car Brand ID', 'Car model ID', 'Repair type'];

export const discountsTemplateWithDataTypes: (
  type: number
) => TemplateWithType[] = (type) =>
  discountsRequiredColumns(type).map((template) => {
    let dataType = 'number';
    if (['Type', 'Repair type'].includes(template)) {
      dataType = 'string';
    }
    return { name: template, dataType };
  });
