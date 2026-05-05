import { renderHook } from '@testing-library/react';
import _set from 'lodash/set';

import { OrderDetail } from 'mock-data/OrderDetail.mock';

import usePolicyHolderInfo from './usePolicyHolderInfo';

const OrderDetailWithNewTitle = _set(
  OrderDetail,
  'order.data.policyHolder.title',
  'MRS'
) as any;
test('should usePolicyHolderInfo hook return correct date format if there is one', () => {
  const {
    result: { current },
  } = renderHook(() => usePolicyHolderInfo(OrderDetailWithNewTitle, false));

  expect(current).toMatchObject({
    policyHolderDifferentitation: 'qc.customerIsInsuredPerson',
    policyHolderNameWithTitle:
      'policyholderTitle.mrs firstName updated lastName updated',
    correctPolicyHolderDOB: '21/01/2000',
  });
});

test('should usePolicyHolderInfo hook return - for empty date of birth value', () => {
  const modifiedOrderDetail = { ...OrderDetailWithNewTitle };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  delete modifiedOrderDetail.order.data.policyHolder.dateOfBirth;
  const {
    result: { current },
  } = renderHook(() => usePolicyHolderInfo(OrderDetail as any, false));

  expect(current).toMatchObject({
    policyHolderDifferentitation: 'qc.customerIsInsuredPerson',
    policyHolderNameWithTitle:
      'policyholderTitle.mrs firstName updated lastName updated',
    correctPolicyHolderDOB: '-',
  });
});
