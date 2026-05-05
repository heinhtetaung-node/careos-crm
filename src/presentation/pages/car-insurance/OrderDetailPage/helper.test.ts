import { CancellationReasons } from 'shared/constants/orderType';

import { cancellationReasons } from './helper';

test('test cancellation reason options', () => {
  expect(cancellationReasons()[0]).toMatchObject({
    id: 'customer_cancel_change_in_premium',
    value: CancellationReasons.CUSTOMER_CANCEL_CHANGE_IN_PREMIUM,
    title: 'order.cancellationReasons.changeInPremium',
  });
});
