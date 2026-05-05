import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AnyObject } from 'yup';

const useStyles = makeStyles((theme: Theme) => ({
  Icon: {
    marginTop: 40,
    '&.vs-icon': {
      marginTop: 70,
    },
  },
  Square: {
    border: `2px solid ${theme?.palette?.common?.blue}`,
    position: 'relative',
    width: 20,
    height: 20,
    boxSizing: 'border-box',
    borderRadius: 4,
    marginTop: 10,
  },
  Item1: {
    width: 0,
    height: 0,
  },
  Item2: {
    position: 'absolute',
    top: -16,
    left: -5,
  },
  Item3: {
    top: -12,
    left: -10,
    backdropFilter: 'blur(20px)',
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 18,
    color: theme?.palette?.common?.blue,
  },
}));
function VSIcon({ customClass }: AnyObject) {
  const styles = useStyles();
  const { Square, Icon, Item1, Item2, Item3 } = styles;
  return (
    <div className={`${customClass} ${Icon}`}>
      <div className={`${Square} ${Item1}`}>
        <div className={`${Square} ${Item2}`} />
        <div className={`${Square} ${Item3}`}>V/S</div>
      </div>
    </div>
  );
}

export default VSIcon;
