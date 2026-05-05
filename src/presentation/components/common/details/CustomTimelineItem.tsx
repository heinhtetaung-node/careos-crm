import { makeStyles } from '@material-ui/core/styles';
import CommentIcon from '@material-ui/icons/Comment';
import {
  TimelineSeparator,
  TimelineContent,
  TimelineConnector,
} from '@material-ui/lab';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineItem from '@material-ui/lab/TimelineItem';
import React from 'react';

interface CustomTimelineItemProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function CustomTimelineItem({ icon, children }: CustomTimelineItemProps) {
  const useStyles = makeStyles((theme) => ({
    timeline: {
      flex: 0,
    },
    timelineItem: {
      flex: 0,
    },
    indicator: {
      backgroundColor: 'black',
    },
    title: {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
    content: {
      padding: theme.spacing(1),
    },
    time: {
      paddingTop: theme.spacing(1),
    },
  }));
  const classes = useStyles();

  return (
    <TimelineItem className={classes.timelineItem}>
      <TimelineSeparator>
        <TimelineDot>{icon}</TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>{children}</TimelineContent>
    </TimelineItem>
  );
}

CustomTimelineItem.defaultProps = {
  icon: <CommentIcon />,
  children: <></>,
};

export default CustomTimelineItem;
