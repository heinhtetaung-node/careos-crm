import { Typography } from '@material-ui/core';
import React from 'react';

import { useGetCommunicationHistoryQuery } from 'data/slices/leadDetails/communicationSlice/communicationSlice';
import AudioPlayer from 'presentation/components/common/AudioPlayer';

import { getAudioFiles } from './helpers';

interface QcCallsProps {
  orderDetail: any;
}

function QcCalls({ orderDetail }: QcCallsProps) {
  const { lead } = orderDetail;
  const leadId = lead && lead.split('/')[1];

  const { data: communicationHistory, isLoading: communicationHistoryLoading } =
    useGetCommunicationHistoryQuery(
      { leadId },
      {
        skip: leadId == null,
        refetchOnMountOrArgChange: true,
      }
    );

  if (communicationHistoryLoading)
    return <Typography>Audio loading...</Typography>;

  const audioFiles =
    communicationHistory && getAudioFiles(communicationHistory);

  return <AudioPlayer color="primary" audios={audioFiles || []} />;
}

export default QcCalls;
