import { mockCommentResponseSlice } from 'mock-data/OrderComment.mock';

import { getCommentData } from './helper';

test('Should getCommentData works', () => {
  const commentsData = getCommentData(mockCommentResponseSlice);
  expect(commentsData?.comments).toHaveLength(5);
  expect(commentsData).toEqual(
    expect.objectContaining({ nextPageToken: 'eyJwIjoyfQ==' })
  );
});
