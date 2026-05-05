import MultiInputFieldWithType from 'presentation/components/controls/MultiInputFieldWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

export const MAX_CUSTOMERS = 2;
export interface ActionComponentProps {
  row: Record<string, any>;
  selectedCustomers: Array<string>;
  onSelect: (id: string) => void;
}
export const columns: Column[] = [
  {
    id: 'customerID',
    field: 'customerID',
    label: getString('leadDetailFields.customerId'),
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'name',
    field: 'name',
    label: getString('text.name'),
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'phoneNumber',
    field: 'phoneNumber',
    label: getString('text.phoneNumber'),
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createdOn',
    field: 'createdOn',
    label: getString('text.createdOn'),
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

export const initialValuesOfFilter = {
  search: [],
};
export const fields: IFilterFormField[] = [
  {
    InputComponent: MultiInputFieldWithType,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      limit: 3,
      options: [
        {
          type: 'text',
          name: 'phone',
          title: getString('text.phone'),
          placeholder: getString('text.enterPhoneNumber'),
        },
        {
          type: 'number',
          name: 'customerId',
          title: getString('text.customerId'),
          placeholder: getString('text.enterFieldPlaceholder', {
            field: getString('text.customerId'),
          }),
        },
        {
          type: 'text',
          name: 'name',
          title: getString('text.name'),
          placeholder: getString('text.enterLastName'),
        },
      ],
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];
