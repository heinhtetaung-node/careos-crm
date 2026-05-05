import { CommunicationHistory } from 'data/slices/leadDetails/communicationSlice/interface';
import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

export const durationToMinutes = (duration: any) => {
  const minutes = duration?.minutes ?? 0;
  let seconds = duration?.seconds ?? 0;
  if (seconds < 10) seconds = `0${seconds}`;
  return `${minutes}:${seconds} ${getString('text.minutesAcronym')}`;
};

export const audioUrl = (callId: string) =>
  `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/${callId}/recording`;

export const getAudioFiles = (
  communicationHistory: CommunicationHistory[] | undefined
) => {
  if (!communicationHistory) return [];
  return communicationHistory?.reduce((result: any, item) => {
    if (item.communicationType === 'call') {
      const formatted = {
        duration: item?.duration ? durationToMinutes(item.duration) : '',
        url: '',
        date: format(new Date(item.createTime), 'dd/MM/yyyy (hh:mm:ss a)'),
      };
      const callId = item.name.split('/')[1];
      formatted.url = audioUrl(callId);
      formatted.duration = item.duration
        ? durationToMinutes(item.duration)
        : '';
      result.push(formatted);
    }
    return result;
  }, []);
};
