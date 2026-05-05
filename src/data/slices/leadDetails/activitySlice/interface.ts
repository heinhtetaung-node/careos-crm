import {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';

import { CommentProps } from '../commentsSlice/interface';
import { ScriptResponseType } from '../scriptSlice/interface';

export type Activities = Activity[];

export type Remark = {
  remark: string;
  type?: string;
};

export type ActivityType = 'script' | 'remark' | 'comment';
export type Activity = {
  comment?: CommentProps;
  script?: ScriptResponseType;
  remark?: Remark;
  type?: ActivityType;
};

// FETCH ACTIVITIES
export interface FetchActivityRequestProps {
  leadId: string;
}

export interface FetchActivityResponsePayload {
  data?: ResponseData;
  error?: FetchBaseQueryError;
  meta?: FetchBaseQueryMeta;
}

export type ResponseData = {
  activities: Activities;
  nextPageToken: string;
};

export type ResourceHistory = {
  baseRecords: Record<string, unknown>;
  nextPageToken: string;
  patches: any;
};

export type ResourceHistoryRequest = {
  queryParams: {
    leadId: string;
    pageToken: string;
    pageSize: number;
  };
};
