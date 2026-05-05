import { CallState } from 'presentation/hooks/useCareosCall';

export const shouldShowCallButton = (state: CallState) =>
  ['idle', 'connecting', 'ringing', 'ended'].includes(state);
export const shouldDisableCallButton = (state: CallState) =>
  ['connecting', 'ringing', 'incall'].includes(state);
export const shouldShowHangupButton = (state: CallState) =>
  ['ringing', 'incall', 'reconnecting'].includes(state);
