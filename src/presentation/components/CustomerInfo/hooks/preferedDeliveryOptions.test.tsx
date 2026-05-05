import { getDeliveryOptionsHandler } from '__mocks__/handlers/deliveryOptionsHandler';
import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';

import { useDeliveryOptions } from './preferedDeliveryOptions';

test('Should useDeliveryOptions response with expected data', async () => {
  server.use(getDeliveryOptionsHandler());

  const { result, waitForNextUpdate } = renderHook(() => useDeliveryOptions());

  await waitForNextUpdate();

  expect((result.current as any).deliveryOptionsSelect).toStrictEqual([
    {
      id: 0,
      name: 'deliveryOptions/digital-delivery',
      title: 'qc.digitalDelivery',
    },
    {
      id: 1,
      name: 'deliveryOptions/kerry-standard',
      title: 'qc.kerryStandard',
    },
    {
      id: 2,
      name: 'deliveryOptions/kerry-express',
      title: 'qc.kerryExpress',
    },
  ]);
});
