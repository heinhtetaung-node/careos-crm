import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { Observable } from 'rxjs';

import { server } from '__mocks__/server';
import { render, screen, waitFor, fireEvent } from '__tests__/rtl-test-utils';
import mockLeadComments from 'mock-data/LeadComments.mock';
import mockedLeadScripts from 'mock-data/LeadScripts.mock';
import mockUserData from 'mock-data/UserData.mock';

import ActivityTab from './ActivityTab';

var mockWs = new Observable((subscriber) =>
  subscriber.next({ body: { createBy: '' } })
);

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest
    .fn()
    .mockReturnValue('00000000-0000-0000-0000-000000000000'),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest
    .fn()
    .mockReturnValue({ id: '00000000-0000-0000-0000-000000000000' }),
}));

jest.mock('data/gateway/websocket', () => ({
  getInstance: jest.fn().mockReturnValue({
    subscribe: () => mockWs,
    getWs: () => mockWs,
  }),
}));

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
}));

describe('<ActivityTab Component/>', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/00000000-0000-0000-0000-000000000000/activities`,
        () => HttpResponse.json({ activities: [], nextPageToken: '' })
      )
    );
  });

  it('will fetch with root lead Id if comments from retainer lead run out', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        (_) =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Normal comment',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name/comments`,
        (_) =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Root comment',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name`,
        (_) =>
          HttpResponse.json({
            name: 'leads/root-lead-name',
            type: 'LEAD_TYPE_NEW',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/00000000-0000-0000-0000-000000000000/activities`,
        (_) => HttpResponse.json({ activities: [], nextPageToken: '' })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts`,
        (_) => HttpResponse.json({ scripts: [], nextPageToken: '' })
      )
    );
    const { container } = render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_RETAINER',
            },
          },
        },
      },
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();

      const commentButton = screen.queryByText(
        'lead.comment'
      ) as HTMLButtonElement;

      expect(commentButton).toBeInTheDocument();
      await userEvent.click(commentButton);
    });

    await fireEvent.scroll(
      container.querySelector('.infinite-scroll-component') as Element,
      {
        target: { scrollY: 100 },
      }
    );
    await waitFor(
      () => {
        expect(screen.getByText('Root comment')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('will be mounted correctly', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/:userId`,
        () => HttpResponse.json(mockUserData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts`,
        () => HttpResponse.json(mockedLeadScripts)
      )
    );

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 2000));

    render(<ActivityTab />);
    await waitFor(() => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();
    });
  });

  it('will not show loading... if lead is New and next page token is empty', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Updating Remark',
              },
            ],
            nextPageToken: '',
          })
      )
    );
    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it.skip('will fetch next data if next page token is present', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        ({ params }) => {
          const pageToken = params.pageToken as string;
          return HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text:
                  pageToken === 'next page token'
                    ? 'Next page comment'
                    : 'Normal comment',
              },
            ],
            nextPageToken:
              pageToken === 'next page token' ? '' : 'next page token',
          });
        }
      )
    );
    const { container } = render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();

      const commentButton = screen.queryByText(
        'lead.comment'
      ) as HTMLButtonElement;

      expect(commentButton).toBeInTheDocument();
      await userEvent.click(commentButton);
    });

    fireEvent.scroll(
      container.querySelector('.infinite-scroll-component') as Element,
      {
        target: { scrollY: 100 },
      }
    );
    await waitFor(
      () => {
        expect(screen.getAllByText('Next page comment').length).toBeGreaterThan(
          0
        );
      },
      { timeout: 2000 }
    );
  });

  it('will render the script section', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () =>
          HttpResponse.json({
            comments: [],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts`,
        () => HttpResponse.json(mockedLeadScripts)
      )
    );

    const { container } = render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();

      const scriptButton = screen.queryByText(
        'lead.script'
      ) as HTMLButtonElement;

      expect(scriptButton).toBeInTheDocument();
      await userEvent.click(scriptButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('script-section')).toBeInTheDocument();
      expect(screen.getByTestId('script-section').children.length).toBe(2);
      fireEvent.scroll(
        container.querySelector('.infinite-scroll-component') as Element,
        {
          target: { scrollY: 1000 },
        }
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('script-section').children.length).toBe(4);
    });
  });

  it('will render the script api returns error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () =>
          HttpResponse.json({
            comments: [],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts`,
        () =>
          HttpResponse.json(
            {
              message: 'Internal server error',
            },
            { status: 503 }
          )
      )
    );

    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();

      const scriptButton = screen.queryByText(
        'lead.script'
      ) as HTMLButtonElement;

      expect(scriptButton).toBeInTheDocument();
      await userEvent.click(scriptButton);
    });
    await waitFor(() => {
      expect(screen.getByTestId('script-section')).toBeInTheDocument();
      expect(screen.getByTestId('script-section').children.length).toBe(0);
    });
  });

  it('should show comment if ws msg is valid comment', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () => HttpResponse.json({ comments: [], nextPageToken: '' })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/:userId`,
        () => HttpResponse.json(mockUserData)
      )
    );
    mockWs = new Observable((subscriber) =>
      subscriber.next({
        body: { createBy: 'users/1234', text: 'test comment' },
        name: 'lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments/1234',
      })
    );
    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.getByText('test comment')).toBeInTheDocument()
    );
  });

  it('should not show comment if ws msg is not valid comment', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () => HttpResponse.json({ comments: [], nextPageToken: '' })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/:userId`,
        () => HttpResponse.json(mockUserData)
      )
    );
    mockWs = new Observable((subscriber) =>
      subscriber.next({
        body: { createBy: 'users/1234', text: 'test comment' },
        name: 'leads/lead-name',
      })
    );
    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();
    });
    expect(screen.queryByText('test comment')).not.toBeInTheDocument();
  });

  it('should not call user api if createBy is empty', async () => {
    const mockHandler = jest.fn(() => mockUserData);
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        () => HttpResponse.json({ comments: [], nextPageToken: '' })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/1234`,
        () => HttpResponse.json(mockHandler())
      )
    );
    mockWs = new Observable((subscriber) =>
      subscriber.next({
        body: { createBy: '', text: 'test comment' },
        name: 'leads/lead-name/comments',
      })
    );
    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_NEW',
            },
          },
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('will show loading... if lead is Retainer and comments from root is not fetched', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name`,
        (_) =>
          HttpResponse.json({
            name: 'leads/root-lead-name',
            type: 'LEAD_TYPE_NEW',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name/comments`,
        (_) =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Root comment',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/comments`,
        (_) =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Updating Remark',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/scripts`,
        (_) =>
          HttpResponse.json({
            comments: [
              {
                name: 'leads/bc76ef05-9248-43d3-a234-6d8b8841e6a0/comments/d66e3552-0393-468c-be16-42eae854530c',
                createTime: '2022-04-28T05:28:31.557136Z',
                updateTime: '2022-04-28T05:28:31.557136Z',
                deleteTime: null,
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                text: 'Updating Remark',
              },
            ],
            nextPageToken: '',
          })
      )
    );

    render(<ActivityTab />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/lead-name',
              root: 'leads/root-lead-name',
              type: 'LEAD_TYPE_RETAINER',
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByTestId('lead-activity-tab')).toBeInTheDocument();

      const commentButton = screen.queryByText(
        'lead.comment'
      ) as HTMLButtonElement;

      expect(commentButton).toBeInTheDocument();
      await userEvent.click(commentButton);
    });
  });
});
