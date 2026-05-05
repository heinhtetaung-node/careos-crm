import React, { useEffect } from 'react';
import { selectCareosCall } from 'data/slices/callSlice';
import { useSelector } from 'react-redux';

function CallTimer({ onTimeTick }: { onTimeTick?: (tick: number) => void }) {
  const { timer } = useSelector(selectCareosCall);
  useEffect(() => {
    onTimeTick?.(timer);
  }, [timer]);
  const formatSecond = (val: number) => {
    const min = Math.floor(val / 60);
    const second = val % 60;
    return `${min.toString().padStart(2, '0')}:${second
      .toString()
      .padStart(2, '0')}`;
  };
  return <div data-testid="call-time">{formatSecond(timer)}</div>;
}
export default CallTimer;
