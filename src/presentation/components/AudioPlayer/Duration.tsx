import React from 'react';

interface IProps {
  seconds: number | null;
}

const pad = (str: number) => {
  return `0${str}`.slice(-2);
};

const format = (seconds: number) => {
  if (!seconds && seconds !== 0) {
    return '-:--';
  }

  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());

  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${pad(mm)}:${ss}`;
};

function Duration(props: IProps) {
  const { seconds } = props;
  if (!seconds) {
    return null;
  }
  return <time dateTime={`P${Math.round(seconds)}S`}>{format(seconds)}</time>;
}

export default Duration;
