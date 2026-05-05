import { withTheme } from '@material-ui/core';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { useLazyGetCallSummaryQuery } from 'data/slices/leadDetails/callSummarySlice';
import {
  ICallSummary,
  ICallSummaryProps,
} from 'data/slices/leadDetails/callSummarySlice/interface';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';
import { getString } from 'presentation/theme/localization';

import './index.scss';

const CallSummaryItem = withTheme(styled.div`
  border-right: 1px solid ${({ theme }) => theme.palette.info.main};

  span {
    display: block;
    padding: 2px 10px;
    line-height: 1;
    align-items: center;
    text-align: right;
  }

  &:last-child {
    border: none;
  }
`);

function CallSummarySection({ id }: ICallSummaryProps) {
  const [callSummary, setCallSummary] = useState<ICallSummary>({
    totalCall: 0,
    connectedCall: 0,
    totalCallMinutes: 0,
    totalCallSeconds: 0,
  });
  const callState = useAppSelector(
    (state) => state.leadsDetailReducer?.callReducer?.data
  );
  const [getCallSummary] = useLazyGetCallSummaryQuery();

  useEffect(() => {
    let mounted = true;
    async function fetchCallSummary() {
      const response = await getCallSummary({ id });
      const totalDuration =
        _.get(response, 'data.callSummary.totalDuration', 0) || 0;
      if (mounted) {
        setCallSummary({
          totalCall: _.get(response, 'data.callSummary.attempts', 0),
          connectedCall: _.get(response, 'data.callSummary.connects', 0),
          totalCallMinutes: Math.floor(totalDuration / 60),
          totalCallSeconds: totalDuration % 60,
        });
      }
    }
    if (
      callState.callStatus === CallStatus.Idle ||
      callState.callStatus === CallStatus.End
    ) {
      fetchCallSummary();
    }
    return () => {
      mounted = false;
    };
  }, [getCallSummary, id, callState.callStatus]);

  return (
    <div className="call-summary">
      <CallSummaryItem>
        <span>{getString('text.totalCall')}</span>
        <span>
          <b>{callSummary?.totalCall}</b>
        </span>
      </CallSummaryItem>
      <CallSummaryItem>
        <span>{getString('text.connectedCall')}</span>
        <span>
          <b>{callSummary?.connectedCall}</b>
        </span>
      </CallSummaryItem>
      <CallSummaryItem>
        <span>{getString('text.totalCallDuration')}</span>
        <span>
          <b>
            {`${callSummary?.totalCallMinutes} ${getString(
              'text.min'
            )} ${callSummary?.totalCallSeconds} ${getString('text.sec')} `}
          </b>
        </span>
      </CallSummaryItem>
    </div>
  );
}

export default CallSummarySection;
