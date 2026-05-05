import { makeStyles } from '@material-ui/core/styles';
import Timeline from '@material-ui/lab/Timeline';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import CustomContent from 'presentation/components/common/details/CustomContent';
import CustomTimelineItem from 'presentation/components/common/details/CustomTimelineItem';

interface ScriptContainerProps {
  loadMore: () => void;
  data: any;
  hasMore: boolean;
}

const useStyles = makeStyles(() => ({
  timeline: {
    flex: 0,
  },
  scroll: {
    padding: '10px 15px',
  },
}));

export default function ScriptContainer({
  loadMore,
  data,
  hasMore,
}: ScriptContainerProps) {
  const classes = useStyles();

  return (
    <InfiniteScroll
      hasMore={hasMore}
      height={400}
      next={loadMore}
      dataLength={data.length}
      loader={<h4>Loading...</h4>}
      className={classes.scroll}
    >
      <Timeline className={classes.timeline} data-testid="script-section">
        {data?.map(({ createBy, createTime, text }: any) => (
          <CustomTimelineItem key={`${createBy}-${createTime}`}>
            <CustomContent
              name={createBy}
              time={createTime}
              content={text}
              logType="script"
            />
          </CustomTimelineItem>
        ))}
      </Timeline>
    </InfiniteScroll>
  );
}
