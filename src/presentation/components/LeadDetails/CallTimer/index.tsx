import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setTimer as setTimerValue } from 'presentation/redux/actions/leads/detail';
import { millisToMinutesAndSeconds } from 'shared/helper/utilities';

const ONE_SECOND = 1000;

interface CallTimerProps {
  showTimer: boolean;
  handleTimer?: (state: any) => void;
}

function CallTimer({ showTimer, handleTimer }: Readonly<CallTimerProps>) {
  const dispatch = useDispatch();
  const timerValue = useSelector(
    (state: any) => state.leadsDetailReducer.callReducer.data.timer || 0
  );

  const [timer, setTimer] = useState(timerValue);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>();

  useEffect(() => {
    if (showTimer) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer: number) => prevTimer + ONE_SECOND);
      }, ONE_SECOND);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    return () => clearInterval(timerRef.current);
  }, [showTimer]);

  useEffect(() => {
    handleTimer?.(timer);
    dispatch(setTimerValue(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  return (
    <div data-testid="call-time">
      {showTimer && millisToMinutesAndSeconds(timer)}
    </div>
  );
}

export default CallTimer;
