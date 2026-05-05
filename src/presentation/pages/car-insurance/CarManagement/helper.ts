import { Column } from 'presentation/HOCs/WithTableList';

export const importColumns: Column[] = [
  {
    id: 'createTime',
    field: 'createTime',
    label: 'text.importDate',
    minWidth: 150,
    sorting: 'desc',
  },
  {
    id: 'filename',
    field: 'filename',
    label: 'package.importFileName',
    minWidth: 150,
    sorting: 'none',
    noTooltip: false,
    disabled: true,
  },
  {
    id: 'status',
    field: 'status',
    label: 'text.importStatus',
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createBy',
    field: 'createBy',
    label: 'text.importedBy',
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
];

export const importedCuratedCarTemplate = [
  'insurance_company_id',
  'model_id',
  'car_year',
  'engine_size',
  'no_of_door',
  'cab_type',
  'sub_model_id',
  'sub_model_year_id',
  'sub',
  'description',
  'sum_insured_default',
  'sum_insured_min',
  'sum_insured_max',
  'is_enable',
];

export const importedCuratedCarRequireColumn = [
  'insurance_company_id',
  'model_id',
  'car_year',
  'engine_size',
  'no_of_door',
  'sum_insured_default',
  'sum_insured_min',
  'sum_insured_max',
  'is_enable',
];

export const importedCuratedCarTemplateWithDatatype = [
  { name: 'insurance_company_id', dataType: 'number' },
  { name: 'model_id', dataType: 'number' },
  { name: 'car_year', dataType: 'number' },
  { name: 'engine_size', dataType: 'number' },
  { name: 'no_of_door', dataType: 'number' },
  { name: 'cab_type', dataType: 'string' },
  { name: 'sub_model_id', dataType: 'number' },
  { name: 'sub_model_year_id', dataType: 'number' },
  { name: 'sub', dataType: 'string' },
  { name: 'description', dataType: 'string' },
  { name: 'sum_insured_default', dataType: 'number' },
  { name: 'sum_insured_min', dataType: 'number' },
  { name: 'sum_insured_max', dataType: 'number' },
  { name: 'is_enable', dataType: 'zeroOneBool' },
];

export const importedCuratedCarMaximumUpload = 10000;

export const anotherConstant = [];
