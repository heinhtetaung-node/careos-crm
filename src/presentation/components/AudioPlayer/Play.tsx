import { IconButton, makeStyles } from '@material-ui/core';
import { PlayCircleFilled } from '@material-ui/icons';
import React from 'react';

interface IProps {
  handleClick: () => void;
}

const useStyles = makeStyles({
  root: {},
  icon: {
    width: '2.5em',
    height: '2.5em',
  },
});

function Play(props: IProps) {
  const classes = useStyles();
  const { handleClick } = props;

  return (
    <IconButton size="medium" onClick={handleClick}>
      <PlayCircleFilled data-testid="play" classes={{ root: classes.icon }} />
    </IconButton>
  );
}

export default Play;
