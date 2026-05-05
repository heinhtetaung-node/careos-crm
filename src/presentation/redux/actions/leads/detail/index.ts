import { IAction } from 'shared/interfaces/common';
import {
  ISummaryCall,
  ISummaryCallModal,
} from 'shared/interfaces/common/lead/detail';

export enum LeadDetailActionTypes {
  CREATE_REJECTION = '[Leads] CREATE_REJECTION',
  CREATE_REJECTION_SUCCESS = '[Leads] CREATE_REJECTION_SUCCESS',
  CREATE_REJECTION_FAILED = '[Leads] CREATE_REJECTION_FAILED',

  INITIAL_CALL = '[Leads] INITIAL_CALL',
  CALLING = '[Leads] CALLING',
  CONNECTED_CALL = '[Leads] CONNECTED_CALL',
  SUBSCRIBE_CALL = '[Leads] SUBSCRIBE_CALL',
  JOIN_CALL = '[Leads] JOIN_CALL',
  FAILED_CALL = '[Leads] FAILED_CALL',
  END_CALL = '[Leads] END_CALL',
  CALL_TIMER = '[Leads] CALL_TIMER',

  GET_CALL_PARTICIPANTS = '[Leads] GET_CALL_PARTICIPANTS',
  GET_CALL_PARTICIPANTS_SUCCESS = '[Leads] GET_CALL_PARTICIPANTS_SUCCESS',
  GET_CALL_PARTICIPANTS_FAILURE = '[Leads] GET_CALL_PARTICIPANTS_FAILURE',

  HANDLE_SUMMARY_MODAL = '[Leads] HANDLE_SUMMARY_MODAL',
  HANDLE_SUMMARY_MODAL_SUCCESS = '[Leads] HANDLE_SUMMARY_MODAL_SUCCESS',
  HANDLE_SUMMARY_MODAL_FAILURE = '[Leads] HANDLE_SUMMARY_MODAL_FAILURE',

  GET_INSTALLMENT = '[Leads] GET_INSTALLMENT',
  GET_INSTALLMENT_SUCCESS = '[Leads] GET_INSTALLMENT_SUCCESS',
  GET_INSTALLMENT_FAILURE = '[Leads] GET_INSTALLMENT_FAILURE',

  SUBSCRIBE_LEAD_UPDATES = '[Leads] SUBSCRIBE_LEAD_UPDATES',
  SET_AUDIO_STREAM = '[Leads] SET_AUDIO_STREAM',
  SET_HAS_SHOWED_SUMMARY = '[Leads] SET_HAS_SHOWED_SUMMARY',
}

export const createRejection = (): IAction<undefined> => ({
  type: LeadDetailActionTypes.CREATE_REJECTION,
});

export const createRejectionSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailActionTypes.CREATE_REJECTION_SUCCESS,
  payload,
});

export const setCallAudioStream = (payload: any): IAction<any> => ({
  type: LeadDetailActionTypes.SET_AUDIO_STREAM,
  payload,
});

export const createRejectionFailed = (error: string): IAction<undefined> => ({
  type: LeadDetailActionTypes.CREATE_REJECTION_FAILED,
  error,
});

export const initialCall = () => ({
  type: LeadDetailActionTypes.INITIAL_CALL,
});

export const calling = (payload?: any): IAction<number> => ({
  type: LeadDetailActionTypes.CALLING,
  payload,
});

export const connectedCall = (payload?: any): IAction<any> => ({
  type: LeadDetailActionTypes.CONNECTED_CALL,
  payload,
});

export const subscribeCall = (payload: any): IAction<any> => ({
  type: LeadDetailActionTypes.SUBSCRIBE_CALL,
  payload,
});

export const joinCall = (): IAction<undefined> => ({
  type: LeadDetailActionTypes.JOIN_CALL,
});

export const setTimer = (payload: number): IAction<number> => ({
  type: LeadDetailActionTypes.CALL_TIMER,
  payload,
});

export const failedCall = (payload?: any): IAction<number> => ({
  type: LeadDetailActionTypes.FAILED_CALL,
  payload,
});

export const endCall = (payload?: any): IAction<any> => ({
  type: LeadDetailActionTypes.END_CALL,
  payload,
});

export const handleSummaryModal = (
  payload?: any
): IAction<ISummaryCallModal> => ({
  type: LeadDetailActionTypes.HANDLE_SUMMARY_MODAL,
  payload,
});

export const handleSummaryModalSuccess = (
  payload?: any
): IAction<ISummaryCallModal> => ({
  type: LeadDetailActionTypes.HANDLE_SUMMARY_MODAL_SUCCESS,
  payload,
});

export const handleSummaryModalFailure = (
  payload?: any
): IAction<ISummaryCallModal> => ({
  type: LeadDetailActionTypes.HANDLE_SUMMARY_MODAL_FAILURE,
  payload,
});

export const getInstallment = (payload?: any): IAction<ISummaryCall> => ({
  type: LeadDetailActionTypes.GET_INSTALLMENT,
  payload,
});

export const getInstallmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailActionTypes.GET_INSTALLMENT_SUCCESS,
  payload,
});

export const getInstallmentFailed = (error: string): IAction<any> => ({
  type: LeadDetailActionTypes.GET_INSTALLMENT_FAILURE,
  error,
});

export const getCallParticipants = (payload: any): IAction<number> => ({
  type: LeadDetailActionTypes.GET_CALL_PARTICIPANTS,
  payload,
});

export const getCallParticipantsSuccess = (payload: any): IAction<any> => ({
  type: LeadDetailActionTypes.GET_CALL_PARTICIPANTS_SUCCESS,
  payload,
});

export const getCallParticipantsFailure = (error: any): IAction<number> => ({
  type: LeadDetailActionTypes.GET_CALL_PARTICIPANTS_FAILURE,
  error,
});

export const subscribeLeadUpdates = (payload: {
  leadName: string;
}): IAction<any> => ({
  type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
  payload,
});

export const setHasShowedSummary = (payload: boolean): IAction<boolean> => ({
  type: LeadDetailActionTypes.SET_HAS_SHOWED_SUMMARY,
  payload,
});
