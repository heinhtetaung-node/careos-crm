import { EditIcon } from '@alphafounders/icons';
import { makeStyles } from '@material-ui/core/styles';
import Timeline from '@material-ui/lab/Timeline';
import React, { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import CustomContent from './CustomContent';
import CustomTimelineItem from './CustomTimelineItem';

const useStyles = makeStyles(() => ({
  timeline: {
    flex: 0,
  },
  scroll: {
    padding: '10px 15px',
  },
}));

export interface IComment {
  name: string;
  createTime: string;
  text: string;
  logType: string;
}

export interface ICommentSection {
  comments: IComment[];
  loadMore: () => any;
  hasMore: boolean;
}

export enum LogTypes {
  COMMENT = 'comment',
  ACTIVITY = 'activity',
  SCRIPT = 'script',
}

function CommentSection({
  comments,
  hasMore,
  loadMore,
}: Readonly<ICommentSection>) {
  const classes = useStyles();

  const _comments = useMemo(() => comments, [comments]);

  return (
    <InfiniteScroll
      hasMore={hasMore}
      height={400}
      next={loadMore}
      dataLength={_comments.length}
      loader={<h4>Loading...</h4>}
      className={classes.scroll}
    >
      <Timeline className={classes.timeline} data-testid="comment-section">
        {_comments.map(
          ({
            name,
            createTime,
            text,
            logType = LogTypes.COMMENT,
            ...rest
          }: IComment) => {
            if (logType === LogTypes.ACTIVITY) {
              return (
                <CustomTimelineItem
                  key={`${name}-${createTime}`}
                  icon={<EditIcon />}
                >
                  <CustomContent
                    name={name}
                    time={createTime}
                    content={text}
                    logType={LogTypes.ACTIVITY}
                    {...rest}
                  />
                </CustomTimelineItem>
              );
            }
            return (
              <CustomTimelineItem key={`${name}-${createTime}`}>
                <CustomContent
                  name={name}
                  time={createTime}
                  content={text}
                  logType={LogTypes.COMMENT}
                />
              </CustomTimelineItem>
            );
          }
        )}
      </Timeline>
    </InfiniteScroll>
  );
}

export default CommentSection;
