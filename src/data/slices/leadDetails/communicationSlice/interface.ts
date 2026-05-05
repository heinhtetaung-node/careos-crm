import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';

export interface CommunicationHistory {
  id: number;
  createBy: string;
  createTime: string;
  deleteTime: string | null;
  name: string;
  updateTime: string | null;
  duration?: string;
  communicationType: string;
}

export interface Email {
  body: string;
  bodyText: string;
  cc: string[];
  createTime: string;
  deleteTime: null | string;
  emailAddress: string;
  emailIndex: number;
  name: string;
  parentId: string;
  read: boolean;
  subject: string;
  type: string;
  updateTime: null | string;
}

export type EmailResponse = QueryReturnValue<{
  mails: Email[];
  nextPageToken: string;
}>;

export interface Sms {
  createBy: string;
  createTime: string;
  message: string;
  name: string;
  phone: string;
  phoneIndex: number;
  status: string;
  title: string;
  updateTime: string;
}

export type SmsResponse = QueryReturnValue<{
  smses: Sms[];
  nextPageToken: string;
}>;

export type CallResponse = QueryReturnValue<{
  createBy: string;
  createTime: string;
  deleteTime: string;
  name: string;
  updateTime: string;
}>;

export type ParticipantResponse = {
  nextPageToken: string;
  participants: {
    createBy: string;
    createTime: string;
    deleteTime: null | string;
    destination: { lead: { lead: string; phoneIndex: number } };
    joinTime: string;
    name: string;
    outgoing: boolean;
    phone: string;
    state: string;
    updateTime: string;
  }[];
};
