import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { formatE164, isPossiblePhoneNumber } from 'shared/helper/utilities';

export interface FilterPayload {
  search: {
    key: string;
    value: string;
  };
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
    id: 'email',
    field: 'email',
    label: getString('qc.email'),
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

export const CustomerSearchOptions = [
  { key: 0, title: getString('text.search'), value: '' },
  { key: 1, title: getString('text.customerId'), value: 'customerId' },
  { key: 2, title: getString('text.name'), value: 'name' },
  { key: 3, title: getString('text.phoneNumber'), value: 'phoneNumber' },
  { key: 4, title: getString('qc.email'), value: 'email' },
  { key: 5, title: getString('searchFieldLeadOption.leadId'), value: 'leadId' },
  { key: 6, title: getString('text.orderId'), value: 'orderId' },
];

export const filterFields: IFilterFormField[] = [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: CustomerSearchOptions,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.search'),
      responsive: {
        xs: 6,
        md: 6,
      },
    },
  },
];

export const tableInitialValues = {
  search: { key: '', value: '' },
};

export const formatFilterURI = (payload: FilterPayload) => {
  const { search } = payload;
  let filter = '';
  const phone = isPossiblePhoneNumber(search.value)
    ? formatE164(search.value)
    : search.value;
  switch (search.key) {
    case 'customerId':
      filter += `customer.humanId="${search.value}"`;
      break;
    case 'name':
      filter += `attributes.fullName.text:"${search.value}"`;
      break;
    case 'phoneNumber':
      filter += `phones[].phone="${phone}"`;
      break;
    case 'email':
      filter += `emails[].email="${search.value}"`;
      break;
    case 'leadId':
      filter += `attributes.leads="${search.value}"`;
      break;
    case 'orderId':
      filter += `attributes.orders="${search.value}"`;
      break;
    default:
      break;
  }

  return filter;
};
