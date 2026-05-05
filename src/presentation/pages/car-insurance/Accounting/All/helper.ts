export const SearchOptions = [
  {
    id: 1,
    title: 'text.orderId',
    value: '',
  },
  {
    id: 2,
    title: 'text.orderItemId',
    value: '',
  },
  {
    id: 3,
    title: 'carepay.contract.insuredPersonName',
    value: '',
  },
  {
    id: 4,
    title: 'text.licensePlate',
    value: '',
  },
  {
    id: 5,
    title: 'text.chassisNumber',
    value: '',
  },
  {
    id: 6,
    title: 'tableListing.policyNumber',
    value: '',
  },
];

export const CancellationStatusOptions = [
  {
    id: '1',
    title: 'cancellation.pendingContactCustomer',
    value: 'CANCELLATION_STATUS_CUSTOMER_CONTACT',
  },
  {
    id: '2',
    title: 'cancellation.pendingConfirmationCustomer',
    value: 'CANCELLATION_STATUS_CUSTOMER_CONFIRM',
  },
  {
    id: '3',
    title: 'cancellation.pendingPolicyReturn',
    value: 'CANCELLATION_STATUS_CUSTOMER_POLICY_RETURN',
  },
  {
    id: '4',
    title: 'cancellation.pendingCancelSubmission',
    value: 'CANCELLATION_STATUS_INSURER_CONTACT',
  },
  {
    id: '5',
    title: 'cancellation.pendingCancelConfirmationSubmission',
    value: 'CANCELLATION_STATUS_INSURER_CONFIRM',
  },
  {
    id: '6',
    title: 'cancellation.pendingRefund',
    value: 'CANCELLATION_STATUS_CUSTOMER_REFUND',
  },
  {
    id: '7',
    title: 'cancellation.completed',
    value: 'CANCELLATION_STATUS_COMPLETED',
  },
  {
    id: '8',
    title: 'cancellation.changeOrderCompleted',
    value: 'CANCELLATION_STATUS_CHANGE_ORDER_COMPLETED',
  },
  {
    id: '9',
    title: 'cancellation.customerRefundAndChangeOrderCompleted',
    value: 'CANCELLATION_STATUS_CUSTOMER_REFUND_AND_CHANGE_ORDER_COMPLETED',
  },
  {
    id: '10',
    title: 'cancellation.customerRefundCompleted',
    value: 'CANCELLATION_STATUS_CUSTOMER_REFUND',
  },
];

export const initialFilter = {
  search: { key: '', value: '' },
  premiumRemittanseStatus: '',
  premiumReturnStatus: '',
  cancellationStatus: '',
};
