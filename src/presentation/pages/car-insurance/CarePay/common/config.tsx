import { getString } from 'presentation/theme/localization';

// eslint-disable-next-line import/prefer-default-export
export const carePayCommonConfig = [
  {
    id: 'paymentChannel',
    field: 'paymentChannel',
    label: getString('menu.carePay.paymentChannel'),
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'customerName',
    field: 'customerName',
    label: getString('menu.carePay.customerName'),
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'customerPhone',
    field: 'customerPhone',
    label: getString('menu.carePay.customerPhone'),
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'license',
    field: 'license',
    label: getString('menu.carePay.licensePlate'),
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createDate',
    field: 'followup.createTime',
    label: getString('menu.carePay.createDate'),
    minWidth: 200,
    sorting: 'none',
  },
];
