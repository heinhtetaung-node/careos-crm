import { OrderFilters } from 'presentation/pages/car-insurance/orders/filter.helper';
import { getString } from 'presentation/theme/localization';

export const initialFilterValues = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  insuranceCompany: '',
  approvalStatus: '',
  travelType: '',
  destinationCountry: '',
  isCancelled: false,
};

export const initialFilter = OrderFilters.ORDER_IS_CANCELLED;

export const SearchOptions = [
  { id: 1, title: getString('text.select'), value: '', disabled: true },
  {
    id: 6,
    title: getString('searchFieldPrintingAndShippingOption.orderId'),
    value: 'id',
  },
  {
    id: 2,
    title: getString('searchFieldPrintingAndShippingOption.policyHolderName'),
    value: 'policyHolderName',
  },
  {
    id: 2,
    title: getString(
      'searchFieldPrintingAndShippingOption.policyHolderPassport'
    ),
    value: 'policyHolderPassport',
  },
  {
    id: 7,
    title: getString('searchFieldPrintingAndShippingOption.policyHolderID'),
    value: 'policyHolderId',
  },
  {
    id: 8,
    title: getString('searchFieldPrintingAndShippingOption.policyHolderTaxId'),
    value: 'policyHolderTaxId',
  },
  {
    id: 3,
    title: getString('searchFieldLeadOption.customerName'),
    value: 'customerName',
  },
  {
    id: 4,
    title: getString('searchFieldLeadOption.customerPhone'),
    value: 'travelCustomerPhone',
  },
  {
    id: 5,
    title: getString('searchFieldLeadOption.customerEmail'),
    value: 'travelCustomerEmail',
  },
];

export const OrderDateTypeOptions = [
  { id: 1, title: getString('text.select'), value: '', disabled: true },
  {
    id: 2,
    title: getString('dateTypeLeadOption.createOn'),
    value: 'createTime',
  },
  {
    id: 3,
    title: getString('dateTypeLeadOption.updateOn'),
    value: 'updateTime',
  },
  {
    id: 5,
    title: getString('dateTypeLeadOption.policyStartOn'),
    value: 'policyStartTime',
  },
];
export const InsuranceCompanyOptions = [
  { id: 2, title: getString('longInsurers.6'), value: 'insurers/6' },
  { id: 3, title: getString('longInsurers.34'), value: 'insurers/34' },
  { id: 4, title: getString('longInsurers.17'), value: 'insurers/17' },
];
export const TravelTypeOptions = [
  { id: 1, title: getString('text.annual'), value: 'Annual' },
  { id: 2, title: getString('text.single'), value: 'Single' },
];
export const DestinationCountryOptions = [
  { id: 1, title: 'CHE', value: 'CHE' },
  { id: 2, title: 'NLD', value: 'NLD' },
  { id: 3, title: 'DNK', value: 'DNK' },
  { id: 4, title: 'ITA', value: 'ITA' },
];

export const defaultModalState = {
  title: '',
  type: '',
  show: false,
  size: 'xs',
  titleCenter: false,
  data: {},
};
