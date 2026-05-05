import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  closePeerConnection,
  getPeerConnection,
  startPeerConnection,
} from 'presentation/pages/car-insurance/LeadDetailsPage/WebRTC';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import {
  calling,
  endCall,
  getCallParticipants,
  setCallAudioStream,
  subscribeLeadUpdates,
} from 'presentation/redux/actions/leads/detail';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';

/**
 * A reusable hook that establishes a call connection to a lead.
 *
 * @param leadName Resource name of the lead (e.g. leads/406bc07a-8360-41be-be66-2b7b216e72b5)
 * @deprecated
 */
export default function useCall(leadName?: string) {
  const dispatch = useDispatch();
  const { callState } = useAppSelector((state) => ({
    callState: state.leadsDetailReducer.callReducer.data,
  }));

  const callStatus: CallStatus = useMemo(
    () => callState.callStatus,
    [callState]
  );

  const cancelCall = () => {
    dispatch(endCall(callState.callName));
    closePeerConnection();
  };

  const handleTrackEvent = (event: { streams: readonly MediaStream[] }) => {
    dispatch(setCallAudioStream(event.streams[0]));
  };

  const startUpCall = (phoneIndex: number) => {
    startPeerConnection(handleTrackEvent).then(() => {
      dispatch(
        calling({
          peerConnection: getPeerConnection(),
          phoneIndex,
        })
      );
    });
  };

  useEffect(() => {
    if (leadName) {
      const leadId = getLeadIdFromLeadName(leadName);
      dispatch(
        subscribeLeadUpdates({
          leadName: leadId,
        })
      );

      dispatch(getLead({ leadId }));
      dispatch(
        getCallParticipants({
          pageSize: 1,
          filter: `destination.lead.lead="${leadName}"`,
        })
      );
    }
  }, [dispatch, leadName]);

  return {
    callStatus,
    cancelCall,
    startUpCall,
  };
}
