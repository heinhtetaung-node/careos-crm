import { act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';
import useGetComment, {
  resetCommentsScrollbar,
} from 'presentation/hooks/getComment/index';

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(() => ({
    type: 'LEAD_TYPE_NEW',
    root: 'name/root',
    name: 'name/lead_name',
  })),
}));

describe('getCommentHook', () => {
  it.skip('should reset comments if resetCommentScrollBar is called', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/name/lead_name/comments`,
        () =>
          HttpResponse.json({
            comments: [
              {
                createBy: '',
              },
              {
                createBy: '',
              },
              {
                createBy: '',
              },
              {
                createBy: '',
              },
              {
                createBy: '',
              },
            ],
            nextPageToken: 'nextPageToken',
          })
      )
    );
    const { result } = renderHook(useGetComment);
    await (result.current as any).loadMore();
    expect((result.current as any).commentsData.comments.length).toBe(10);
    act(() => resetCommentsScrollbar());
    await waitFor(() => {
      expect((result.current as any).commentsData.comments.length).toBe(5);
    });
  });
});
