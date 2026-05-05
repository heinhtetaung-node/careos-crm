import { emailResponseProps } from './types';

import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadActionTypes {
  GET_LIST_EMAIL = '[LeadsDetail] GET_LIST_EMAIL',
  GET_LIST_EMAIL_SUCCESS = '[LeadsDetail] GET_LIST_EMAIL_SUCCESS',
  GET_LIST_EMAIL_FAIL = '[LeadsDetail] GET_LIST_EMAIL_FAIL',

  GET_MAIL_READ_COUNT = '[LeadsDetail] GET_MAIL_READ_COUNT',
  GET_MAIL_READ_COUNT_SUCCESS = '[LeadsDetail] GET_MAIL_READ_COUNT_SUCCESS',
  GET_MAIL_READ_COUNT_FAILURE = '[LeadsDetail] GET_MAIL_READ_COUNT_FAILURE',
  INCREMENT_MAIL_READ_COUNT = '[LeadsDetail] INCREMENT_MAIL_READ_COUNT',
  DECREMENT_MAIL_READ_COUNT = '[LeadsDetail] DECREMENT_MAIL_READ_COUNT',

  GET_ATTACHMENT = '[LeadsDetail] GET_ATTACHMENT',
  GET_ATTACHMENT_SUCCESS = '[LeadsDetail] GET_ATTACHMENT_SUCCESS',
  GET_ATTACHMENT_FAIL = '[LeadsDetail] GET_ATTACHMENT_FAIL',

  ADD_ATTACHMENT = '[LeadsDetail] ADD_ATTACHMENT',
  ADD_ATTACHMENT_SUCCESS = '[LeadsDetail] ADD_ATTACHMENT_SUCCESS',
  ADD_ATTACHMENT_FAIL = '[LeadsDetail] ADD_ATTACHMENT_FAIL',

  UPLOAD_ATTACHMENT = '[LeadsDetail] UPLOAD_ATTACHMENT',
  UPLOAD_ATTACHMENT_SUCCESS = '[LeadsDetail] UPLOAD_ATTACHMENT_SUCCESS',
  UPLOAD_ATTACHMENT_FAIL = '[LeadsDetail] UPLOAD_ATTACHMENT_FAIL',

  SEND_EMAIL = '[LeadsDetail] SEND_EMAIL',
  SEND_EMAIL_SUCCESS = '[LeadsDetail] SEND_EMAIL_SUCCESS',
  SEND_EMAIL_FAIL = '[LeadsDetail] SEND_EMAIL_FAIL',

  UPDATE_EMAIL_INFORMATION = '[LeadsDetail] UPDATE_EMAIL_INFORMATION',
  UPDATE_EMAIL_INFORMATION_SUCCESS = '[LeadsDetail] UPDATE_EMAIL_INFORMATION_SUCCESS',
  UPDATE_EMAIL_INFORMATION_FAILURE = '[LeadsDetail] UPDATE_EMAIL_INFORMATION_FAILURE',
}

export const getListEmail = (payload?: any, leadId?: string): IAction<any> => ({
  type: LeadActionTypes.GET_LIST_EMAIL,
  payload: { ...payload, leadId },
});

export const getListEmailSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_LIST_EMAIL_SUCCESS,
  payload,
});

export const getListEmailFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_LIST_EMAIL_FAIL,
  payload,
});

export const getAttachment = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_ATTACHMENT,
  payload,
});

export const getAttachmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_ATTACHMENT_SUCCESS,
  payload,
});

export const getAttachmentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_ATTACHMENT_FAIL,
  payload,
});

export const addAttachment = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.ADD_ATTACHMENT,
  payload,
});

export const addAttachmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.ADD_ATTACHMENT_SUCCESS,
  payload,
});

export const uploadAttachment = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.UPLOAD_ATTACHMENT,
  payload,
});

export const uploadAttachmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.UPLOAD_ATTACHMENT_SUCCESS,
  payload,
});

export const uploadAttachmentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.UPLOAD_ATTACHMENT_FAIL,
  payload,
});

export const addAttachmentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.ADD_ATTACHMENT_FAIL,
  payload,
});

export const sendEmail = (payload?: any, leadId?: string): IAction<any> => ({
  type: LeadActionTypes.SEND_EMAIL,
  payload: { ...payload, leadId },
});

export const sendEmailSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.SEND_EMAIL_SUCCESS,
  payload,
});

export const sendEmailFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.SEND_EMAIL_FAIL,
  payload,
});

export const updateEmailInformation = (payload?: {
  mailId: string;
}): IAction<any> => ({
  type: LeadActionTypes.UPDATE_EMAIL_INFORMATION,
  payload,
});

export const updateEmailInformationSuccess = (
  payload?: emailResponseProps
): IAction<any> => ({
  type: LeadActionTypes.UPDATE_EMAIL_INFORMATION_SUCCESS,
  payload,
});

export const updateEmailInformationFailure = (
  payload?: string
): IAction<any> => ({
  type: LeadActionTypes.UPDATE_EMAIL_INFORMATION_FAILURE,
  payload,
});

export const mailReadCountIncrement = (): IAction<any> => ({
  type: LeadActionTypes.INCREMENT_MAIL_READ_COUNT,
});

export const mailReadCountDecrement = (): IAction<any> => ({
  type: LeadActionTypes.DECREMENT_MAIL_READ_COUNT,
});

export const getMailReadCount = (args?: {
  payload?: any;
  orderLeadId?: string;
}): IAction<any> => {
  const { payload, orderLeadId } = args ?? {};

  return {
    type: LeadActionTypes.GET_MAIL_READ_COUNT,
    payload: { ...payload, orderLeadId },
  };
};

export const getMailReadCountSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS,
  payload,
});
export const getMailReadCountFailure = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_MAIL_READ_COUNT_FAILURE,
  payload,
});
