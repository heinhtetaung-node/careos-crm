import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TimelineContent } from '@material-ui/lab';
import Timeline from '@material-ui/lab/Timeline';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { LogTypes } from 'presentation/components/common/details/CommentSection';
import CustomContent from 'presentation/components/common/details/CustomContent';
import CustomTimelineItem from 'presentation/components/common/details/CustomTimelineItem';
import { getString } from 'presentation/theme/localization';

interface AllActivitiesProps {
  activitiesProps: {
    loadMore: () => void;
    state: any;
    hasMore?: boolean;
  };
}

function AllActivities({ activitiesProps }: AllActivitiesProps) {
  const { loadMore, state, hasMore } = activitiesProps;

  const useStyles = makeStyles((theme) => ({
    title: {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
    content: {
      backgroundColor: theme.palette.info.light,
      padding: theme.spacing(1),
    },
    timeline: {
      flex: 0,
    },
    scroll: {
      padding: '10px 15px',
    },
    remarkContent: {
      padding: 0,
    },
  }));
  const classes = useStyles();

  function renderActivityItem(activity: any) {
    let content;
    if (activity.type === 'script') {
      content = (
        <CustomTimelineItem
          key={`${activity.script.name}-${activity.script.createTime}`}
        >
          <CustomContent
            name={activity.createBy}
            time={activity.script.createTime}
            content={activity.script.text}
            logType={LogTypes.SCRIPT}
          />
        </CustomTimelineItem>
      );
    } else if (activity.type === 'comment') {
      content = (
        <CustomTimelineItem
          key={`${activity.comment.name}-${activity.comment.createTime}`}
        >
          <CustomContent
            name={activity.createBy}
            time={activity.comment.createTime}
            content={activity.comment.text}
            logType={LogTypes.COMMENT}
          />
        </CustomTimelineItem>
      );
    } else {
      content = (
        <CustomTimelineItem>
          <TimelineContent className={classes.remarkContent}>
            <Typography className={classes.title} variant="body1">
              {getString('text.remarkOnLead')}
            </Typography>
            <Typography className={classes.content} variant="body1">
              {activity.remark}
            </Typography>
          </TimelineContent>
        </CustomTimelineItem>
      );
    }
    return content;
  }

  return (
    <InfiniteScroll
      hasMore={hasMore ?? state.nextPageToken.length > 10}
      height={400}
      next={loadMore}
      dataLength={state.activities.length}
      loader={<h4>Loading...</h4>}
      className={classes.scroll}
    >
      <Timeline className={classes.timeline}>
        {state.activities.map((activity: any) => renderActivityItem(activity))}
      </Timeline>
    </InfiniteScroll>
  );
}

export default AllActivities;
