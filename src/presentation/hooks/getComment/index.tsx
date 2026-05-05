import _isEmpty from 'lodash/isEmpty';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import WebSocketGateway from 'data/gateway/websocket';
import LeadDetail from 'data/repository/leadDetail/cloud';
import { useLazyGetCommentsQuery } from 'data/slices/leadDetails/commentsSlice';
import { CommentProps } from 'data/slices/leadDetails/commentsSlice/interface';
import { useLazyGetUserByUserIdQuery } from 'data/slices/userSlice';
import { LeadType } from 'presentation/components/ActivitySection/ActivityTab.helper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

const resetCommentsScrollbarObservable = new Subject<void>();

export function resetCommentsScrollbar() {
  resetCommentsScrollbarObservable.next();
}

export default function useGetComment() {
  const lead = useGetLeadSelector();
  const dispatch = useDispatch();

  const previousCommentLength = useRef<number | undefined>();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [currentLead, setCurrentLead] = useState(lead);

  const [getComment, _info] = useLazyGetCommentsQuery();
  const [getUser] = useLazyGetUserByUserIdQuery();

  const hasMore = useMemo(
    () => currentLead.type === LeadType.RETAINER || nextPageToken !== '',
    [currentLead, nextPageToken]
  );

  const getNext = async (leadId: string, pageToken: string) => {
    const response = await getComment({
      leadId,
      commentsParam: { pageToken, pageSize: 5 },
    });
    setNextPageToken(response.data?.nextPageToken);
    return response.data?.comments ?? [];
  };

  const loadMore = async () => {
    if (hasMore && nextPageToken === '') {
      const rootLead = await LeadDetail.getLeadDetailById(
        currentLead.root.split('/')[1]
      ).toPromise();
      setCurrentLead(rootLead);
      const moreComments = await getNext(rootLead.name, '');
      setComments((prevComments) => [...prevComments, ...moreComments]);
    } else {
      const moreComments = await getNext(
        currentLead.name,
        nextPageToken as string
      );
      setComments((prevComments) => [...prevComments, ...moreComments]);
    }
  };

  useEffect(() => {
    if (_info.isError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.fetchingCommentFailed'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_info.isError]);

  useEffect(() => {
    if (
      hasMore &&
      (comments.length < 5 || previousCommentLength.current === comments.length)
    ) {
      loadMore();
    }
    previousCommentLength.current = comments.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  useEffect(() => {
    const subscription = resetCommentsScrollbarObservable.subscribe(
      async () => {
        const resetComments = await getNext(lead.name, '');
        setComments(resetComments);
      }
    );
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // websocket subscription
  useEffect(() => {
    const ws = WebSocketGateway.getInstance()
      .subscribe(`lead/v1alpha2/${lead.name}/comments/*`)
      ?.pipe(map((event) => event.body));
    const subscription = ws?.subscribe(async (resp: any) => {
      const newComment = { ...resp };

      if (!_isEmpty(resp?.createBy)) {
        const response = await getUser(resp.createBy);
        if (!_isEmpty(response?.data)) {
          newComment.name = `${response.data?.firstName} ${response.data?.lastName}`;
        } else {
          newComment.name = '-';
        }
      } else {
        newComment.name = '-';
      }

      setComments((prev) => [newComment, ...prev]);
    });
    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    commentsData: { comments },
    loadMore,
    hasMore,
    ..._info,
  };
}
