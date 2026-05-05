import CustomerMergeMock from 'mock-data/CustomerMerge.mock';
import { DragAndDropPayload } from 'presentation/components/DragAndDropList/helper';

export const columns = [
  { id: 'humanId', title: 'leadDetailFields.customerId' },
  { id: 'title', title: 'leadDetailFields.title' },
  { id: 'firstName', title: 'leadDetailFields.firstName' },
  { id: 'lastName', title: 'leadDetailFields.lastName' },
  { id: 'phone', title: 'leadDetailFields.phone' },
  { id: 'email', title: 'qc.email' },
];

export const initialCustomers = [
  CustomerMergeMock.customer1.customer,
  CustomerMergeMock.customer2.customer,
];

export const initialOrders: DragAndDropPayload[] = [
  { columnId: '1', rows: CustomerMergeMock.customer1.orders },
  { columnId: '2', rows: CustomerMergeMock.customer2.orders },
];

export const initialLeads: DragAndDropPayload[] = [
  { columnId: '1', rows: CustomerMergeMock.customer1.leads },
  { columnId: '2', rows: CustomerMergeMock.customer2.leads },
];
