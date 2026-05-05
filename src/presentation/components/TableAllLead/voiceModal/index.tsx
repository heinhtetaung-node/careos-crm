import { Box } from '@material-ui/core';
import React from 'react';

import Audio from '../../AudioPlayer';

interface IVoiceModal {
  callId: string;
}

const VoiceModal: React.FC<IVoiceModal> = ({ callId }) => {
  const audioUrl = `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/${callId}/recording`;

  return (
    <Box style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Audio src={audioUrl} />
    </Box>
  );
};

export default VoiceModal;
