import { PhoneResponse } from 'data/slices/customerSlice/types';
import { PhoneNumber } from 'shared/types/customer';

import { syncCustomerAndLeadPhones } from './helpers';

const customerPhones: PhoneResponse[] = [
  {
    name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/6a7dcc97-678f-4c2f-87ee-2db97b0938ed',
    createTime: '2023-03-17T03:39:41.178127Z',
    updateTime: '2023-03-17T03:39:41.178127Z',
    deleteTime: null,
    phone: '+66987771110',
  },
  {
    name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/d02ab09d-d9db-42cf-a68c-9140a713f41d',
    createTime: '2023-03-16T06:48:26.389461Z',
    updateTime: '2023-03-16T06:48:26.389461Z',
    deleteTime: null,
    phone: '+66659735635',
  },
];

const leadPhones: PhoneNumber[] = [
  {
    phone: '+66987771110',
    status: 'unverified',
  },
  {
    phone: '+66979469396',
    status: 'unverified',
  },
];

test('Should syncCustomerAndLeadPhones not return duplicate phone', () => {
  expect(syncCustomerAndLeadPhones(customerPhones, leadPhones)).toStrictEqual([
    {
      phone: '+66659735635',
      status: 'unverified',
    },
  ]);
});
