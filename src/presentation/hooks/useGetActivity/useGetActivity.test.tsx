// eslint-disable no-return-assign
import { http, HttpResponse } from 'msw';
import { Observable } from 'rxjs';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import useGetActivity from '.';

var mockSubscriber: any;

const mockWs = new Observable((subscriber) => {
  mockSubscriber = subscriber;
});

var mockAddActivity: jest.Mock;

jest.mock('data/gateway/websocket', () => ({
  getInstance: jest.fn().mockReturnValue({
    subscribe: () => mockWs,
    getWs: () => null,
  }),
}));

jest.mock('data/slices/leadDetails/activitySlice', () => {
  mockAddActivity = jest.fn().mockReturnValue({ type: 'mockaction' });
  return {
    ...jest.requireActual('data/slices/leadDetails/activitySlice'),
    addActivity: mockAddActivity,
  };
});

describe('Testing the activity hook', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/00000000-0000-0000-0000-000000000000/activities`,
        () => HttpResponse.json({ activities: [], nextPageToken: '' })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133`,
        () =>
          HttpResponse.json({
            name: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
            createTime: '2022-01-07T12:42:17.515462Z',
            updateTime: '2023-01-05T07:44:18.913736Z',
            deleteTime: null,
            createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
            humanId: 'danielb@rabbit.co.th',
            role: 'roles/admin',
            firstName: 'Daniel Boone',
            lastName: '-',
            annotations: {},
            loginTime: '2023-01-05T07:44:18.911706Z',
          })
      )
    );
  });

  it('Add remark from ws', async () => {
    renderHook(() => useGetActivity('00000000-0000-0000-0000-000000000000'));
    mockSubscriber.next({
      body: {
        name: 'leads/00000000-0000-0000-0000-000000000000',
        annotations: {
          remark: 'test',
        },
      },
      name: 'lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000',
      version: 2,
    });

    await waitFor(() => {
      expect(mockAddActivity).toHaveBeenCalledWith({
        activity: { createBy: '', remark: 'test', type: 'remark' },
      });
    });
  });

  it('Add comments from ws', async () => {
    renderHook(() => useGetActivity('00000000-0000-0000-0000-000000000000'));
    mockSubscriber.next({
      body: {
        name: 'leads/00000000-0000-0000-0000-000000000000/comments/7f2e23ad-3fff-428a-af36-49b89171d9e3',
        createTime: '2023-01-06T04:53:58.900455007Z',
        updateTime: '2023-01-06T04:53:58.900455007Z',
        deleteTime: null,
        createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
        text: 'test',
      },
      name: 'lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments/7f2e23ad-3fff-428a-af36-49b89171d9e3',
      version: 1,
    });

    await waitFor(() => {
      expect(mockAddActivity).toHaveBeenCalledWith({
        activity: {
          comment: {
            createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
            createTime: '2023-01-06T04:53:58.900455007Z',
            deleteTime: null,
            name: 'leads/00000000-0000-0000-0000-000000000000/comments/7f2e23ad-3fff-428a-af36-49b89171d9e3',
            text: 'test',
            updateTime: '2023-01-06T04:53:58.900455007Z',
          },
          createBy: 'Daniel Boone -',
          type: 'comment',
        },
      });
    });
  });

  it('Add comments from ws', async () => {
    renderHook(() => useGetActivity('00000000-0000-0000-0000-000000000000'));
    mockSubscriber.next({
      body: {
        name: 'leads/00000000-0000-0000-0000-000000000000/scripts/7f2e23ad-3fff-428a-af36-49b89171d9e3',
        createTime: '2023-01-06T04:53:58.900455007Z',
        updateTime: '2023-01-06T04:53:58.900455007Z',
        deleteTime: null,
        createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
        text: 'test',
      },
      name: 'lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts/7f2e23ad-3fff-428a-af36-49b89171d9e3',
      version: 1,
    });

    await waitFor(() => {
      expect(mockAddActivity).toHaveBeenCalledWith({
        activity: {
          script: {
            createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
            createTime: '2023-01-06T04:53:58.900455007Z',
            deleteTime: null,
            name: 'leads/00000000-0000-0000-0000-000000000000/scripts/7f2e23ad-3fff-428a-af36-49b89171d9e3',
            text: 'test',
            updateTime: '2023-01-06T04:53:58.900455007Z',
          },
          createBy: 'Daniel Boone -',
          type: 'script',
        },
      });
    });
  });
});
