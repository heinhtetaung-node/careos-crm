import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseUrls = {
  salesFlow: process.env.VITE_API_ENDPOINT ?? '',
  kratos: process.env.VITE_KRATOS_URL ?? '',
  bff: process.env.VITE_GATEWAY_ENDPOINT ?? '',
  goBff: process.env.VITE_GO_GATEWAY_ENDPOINT ?? '',
};

export const basePaths = {
  gff: 'api/gff/v1alpha1',
  address: 'api/address/v1alpha1',
  user: 'api/user/v1alpha1',
  assignedUser: 'api/gff/v1alpha1/users',
  order: 'api/order/v1alpha1',
  lead: 'api/lead/v1alpha2',
  motor: 'api/car-package/v1alpha1',
  insurers: 'api/car/v1alpha1',
  customer: 'api/customer/v1alpha1',
  searchSvc: 'api/lead-search/v1alpha1/search',
  searchAccoungingSvc: 'api/lead-search/v1alpha1/accountings:search',
  searchCancellationSvc: 'api/lead-search/v1alpha1/search/cancellations',
  searchRefunds: 'api/lead-search/v1alpha1/search/refunds',
  genericPackageSvc: 'api/rc-mock-api/v1/search',
  cars: 'api/bff/api/cars',
  rejections: 'api/reject/v1alpha1',
  import: 'api/lead-import/v1alpha1/imports',
  view: 'api/view/v1alpha1',
  calendar: 'api/calendar/v1alpha1',
  mailer: 'api/mailer/v1alpha1',
  careAi: 'api/careai/v1',
  sms: 'api/sms/v1alpha1',
  call: 'api/call/v1alpha1',
  callv1: 'api/call/v1',
  car: 'api/car/v1alpha1',
  shipment: 'api/order-shipment/v1alpha1',
  assignment: 'api/assign/v1alpha1',
  autoAssign: 'api/autoassign/v1alpha1',
  documents: 'api/document/v1alpha1/documents',
  financialtransaction: 'api/financialtransaction/v1alpha3',
  notification: 'api/notification/v1',
  discount: 'api/discount/v1alpha1',
  team: 'api/team/v1alpha1',
  history: 'api/history/v1alpha1',
  document: 'api/document/v1alpha1/',
  dashboard: 'api/dashboard/v1',
};

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrls.salesFlow,
  prepareHeaders: (headers) => headers,
  credentials: 'include',
});

// Initialize an empty api service that we'll inject endpoints into later as needed
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: () => ({}),
});
