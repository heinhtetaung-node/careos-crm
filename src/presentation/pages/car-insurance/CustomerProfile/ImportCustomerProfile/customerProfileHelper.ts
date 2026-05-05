import { CustomerDetailSourceTypes } from 'data/slices/importSlices/interface';
import {
  TemplateWithType,
  Column,
} from 'presentation/components/modal/ImportModal/index.helper';
import customerProfileTemplate from 'shared/constants/csvCustomerProfile';

export const columns: Column[] = [
  {
    id: 'status',
    field: 'status',
    label: 'customerProfile.status',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createTime',
    field: 'createTime',
    label: 'customerProfile.importDate',
    minWidth: 100,
    sorting: 'desc',
  },
  {
    id: 'updateTime',
    field: 'updateTime',
    label: 'customerProfile.lastUpdate',
    minWidth: 100,
    sorting: 'desc',
  },
  {
    id: 'filename',
    field: 'filename',
    label: 'customerProfile.fileName',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createBy',
    field: 'createBy',
    label: 'customerProfile.importedBy',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'imported',
    field: 'imported',
    label: 'customerProfile.importedRows',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

export const customerProfileRequiredColumns: string[] = [
  'id',
  'firstname',
  'phone',
];

export const customerProfileTemplateWithDataTypes: TemplateWithType[] =
  customerProfileTemplate.map((template) => {
    let dataType = 'string';
    if (template === 'id') {
      dataType = 'string|number';
    }
    return { name: template, dataType };
  });

export const customerDetailSource = [
  {
    id: 0,
    title: 'NANA',
    value: CustomerDetailSourceTypes.NANA,
  },
  {
    id: 1,
    title: 'BTS',
    value: CustomerDetailSourceTypes.BTS,
  },
  {
    id: 2,
    title: 'CareShop',
    value: CustomerDetailSourceTypes.CARE_SHOP,
  },
  {
    id: 3,
    title: 'ADB',
    value: CustomerDetailSourceTypes.ADB,
  },
];
