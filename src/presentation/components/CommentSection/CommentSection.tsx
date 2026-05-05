/* eslint-disable consistent-return */
import _, { differenceBy } from 'lodash';
import React, { useState, useEffect } from 'react';

import CommentSection, { IComment } from '../common/details/CommentSection';

interface CommentContainerProps {
  loadMore: () => void;
  data: any;
  hasMore?: boolean;
  isReached?: boolean;
}

export default function CommentContainer({
  loadMore,
  data,
  hasMore,
  isReached,
}: Readonly<CommentContainerProps>) {
  const [comments, setComments] = useState<IComment[]>([]);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!data?.comments || data?.comments?.length <= 0) return;

    setComments((prevComments) => {
      if (prevComments.length <= 0) return data.comments;
      const newComments = differenceBy(data.comments, prevComments, 'text');
      if (newComments.length > 0) setLoading(true);

      const sortedArray = _.orderBy(
        [...newComments, ...prevComments],
        'updateTime',
        'desc'
      );
      return sortedArray;
    });

    setLoading(false);
  }, [isReached, data.comments]);
  useEffect(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReached, comments.length]);

  if (loading) return <div>Loading...</div>;
  return (
    <CommentSection
      comments={comments}
      loadMore={loadMore}
      hasMore={isReached ? false : (hasMore ?? data?.nextPageToken !== '')}
    />
  );
}
