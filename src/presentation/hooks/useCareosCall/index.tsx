import { useEffect, useRef } from 'react';

import {
  hangUpCallAction,
  startCallAction,
  selectCareosCall,
} from 'data/slices/callSlice';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { useSelector } from 'react-redux';

export type CallState =
  | 'idle'
  | 'connecting'
  | 'ringing'
  | 'incall'
  | 'ended'
  | 'reconnecting';

type useCareosCallProps = {
  onStatusChange?: (status: CallState) => void;
};

export default function useCareosCall({ onStatusChange }: useCareosCallProps) {
  const mountedRef = useRef(false);
  const dispatch = useAppDispatch();
  const user = useGetUserSelector();
  const callstat = useSelector(selectCareosCall);

  useEffect(() => {
    if (mountedRef.current) {
      onStatusChange?.(callstat.status);
    } else {
      mountedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callstat.status]);

  const startCall = async (lead: string, phoneIndex: number) => {
    dispatch(
      startCallAction({
        lead,
        phoneIndex,
        agent: user.name,
      })
    );
  };

  const endCall = () => {
    dispatch(hangUpCallAction());
  };

  return {
    audio: callstat.audio,
    status: callstat.status,
    startCall,
    endCall,
  };
}
