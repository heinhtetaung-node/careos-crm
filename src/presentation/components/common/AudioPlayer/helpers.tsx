import React, { MouseEvent } from 'react';

interface DurationProps {
  seconds: number | null;
}

function Duration({ seconds }: DurationProps) {
  if (seconds === null) return null;

  const pad = (number: number) => `0${number}`.slice(-2);
  const format = (_seconds: number) => {
    if (!_seconds && _seconds !== 0) {
      return '-:--';
    }

    const date = new Date(_seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }
    return `${pad(mm)}:${ss}`;
  };

  return <time dateTime={`P${Math.round(seconds)}S`}>{format(seconds)}</time>;
}

export function getMousePositionInElement(
  e: MouseEvent,
  elem: HTMLElement
): number {
  if (!e || !elem) return 0;
  const clickPositionInPage = e.pageX;
  const barStart = elem.getBoundingClientRect().left + window.scrollX;
  return clickPositionInPage - barStart;
}

export default Duration;
