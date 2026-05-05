import { IAction } from '../../../../../shared/interfaces/common';

export enum LeadRejectRecordingActions {
  GET_LEAD_REJECT_RECORDING = '[Leads] GET_LEAD_REJECT_RECORDING',
  GET_LEAD_REJECT_RECORDING_SUCCESS = '[Leads] GET_LEAD_REJECT_RECORDING_SUCCESS ',
  GET_LEAD_REJECT_RECORDING_FAILED = '[Leads] GET_LEAD_REJECT_RECORDING_FAILED',

  GET_LEAD_REJECT_PARTICIPANTS = '[Leads] GET_LEAD_REJECT_PARTICIPANTS',
  GET_LEAD_REJECT_PARTICIPANTS_SUCCESS = '[Leads] GET_LEAD_REJECT_PARTICIPANTS_SUCCESS',
  GET_LEAD_REJECT_PARTICIPANTS_FAILED = '[Leads] GET_LEAD_REJECT_PARTICIPANTS_FAILED',
}

export const getLeadRejectRecording = (payload?: any): IAction<any> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING,
  payload,
});

export const getLeadRejectRecordingSuccess = (payload: any): IAction<any> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING_SUCCESS,
  payload,
});

export const getLeadRejectRecordingFailed = (error: any): IAction<number> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING_FAILED,
  error,
});
export const getLeadRejectParticipants = (payload?: any): IAction<any> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS,
  payload,
});

export const getLeadRejectParticipantsSuccess = (
  payload: any
): IAction<any> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS_SUCCESS,
  payload,
});

export const getLeadRejectParticipantsFailed = (
  error: any
): IAction<number> => ({
  type: LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS_FAILED,
  error,
});
