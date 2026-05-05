import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import QcCalls from './index';

const mockedOrderDetailResponse = {
  order: {
    lead: 'leads/dac19c15-c92c-4806-93d6-8a6d7e247103',
    data: {},
  },
};

test.skip('Render QC with history calls audio', async () => {
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/api/call/v1alpha1/calls/:callId/recording`,
      () =>
        HttpResponse.json({
          participants: [
            {
              name: 'calls/c7b19607-b8b9-451f-a80c-cadbadb5f272/participants/17759309-f559-4f78-b692-899a8d0c1b55',
              createTime: '2022-06-09T04:03:21.969175Z',
              updateTime: '2022-06-09T04:03:28.401819Z',
              deleteTime: '2022-06-09T04:03:39.249669Z',
              createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
              destination: {
                lead: {
                  lead: 'leads/dac19c15-c92c-4806-93d6-8a6d7e247103',
                  phoneIndex: 0,
                },
              },
              outgoing: true,
              phone: '+66943739024',
              joinTime: '2022-06-09T04:03:28.383516Z',
              state: 'JOINED',
            },
            {
              name: 'calls/ada36ae1-5e46-4ecf-9417-06bcbb4a651c/participants/b4bd1f21-b404-4bf0-a81e-083c4d993825',
              createTime: '2022-06-09T03:58:52.181845Z',
              updateTime: '2022-06-09T03:58:52.475089Z',
              deleteTime: null,
              createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
              destination: {
                lead: {
                  lead: 'leads/dac19c15-c92c-4806-93d6-8a6d7e247103',
                  phoneIndex: 0,
                },
              },
              outgoing: true,
              phone: '+66943739024',
              joinTime: null,
              state: 'RINGING',
            },
            {
              name: 'calls/a5e68c73-0220-457a-801a-099120cd10e3/participants/47ccfb35-3a65-4562-acf1-043f1217e331',
              createTime: '2022-06-09T03:58:28.196530Z',
              updateTime: '2022-06-09T03:58:28.497784Z',
              deleteTime: null,
              createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
              destination: {
                lead: {
                  lead: 'leads/dac19c15-c92c-4806-93d6-8a6d7e247103',
                  phoneIndex: 0,
                },
              },
              outgoing: true,
              phone: '+66943739024',
              joinTime: null,
              state: 'RINGING',
            },
            {
              name: 'calls/449f4111-a341-4f0b-aff6-2fe2334db7cf/participants/b23c5856-b650-491a-9cca-988f09c65a35',
              createTime: '2022-06-09T03:58:06.826650Z',
              updateTime: '2022-06-09T03:58:07.146508Z',
              deleteTime: null,
              createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
              destination: {
                lead: {
                  lead: 'leads/dac19c15-c92c-4806-93d6-8a6d7e247103',
                  phoneIndex: 0,
                },
              },
              outgoing: true,
              phone: '+66943739024',
              joinTime: null,
              state: 'RINGING',
            },
          ],
        })
    )
  );

  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(<QcCalls orderDetail={mockedOrderDetailResponse.order} />);
  await waitFor(() => {
    expect(screen.getByTestId('audio-progress')).toBeTruthy();
  });
});
