import { CommonAPIResponse } from '../types';

export interface IntegrationResultPayload {
  policy: string;
}

export enum SubmissionStatusValue {
  PENDING = 'STATUS_PENDING',
  FAILED = 'STATUS_FAILED',
  SUCCESS = 'STATUS_SUCCESS',
}

export type Submission = {
  name: string;
  result: string;
  action: string;
  status: SubmissionStatusValue;
} & CommonAPIResponse;

export interface IntegrationResultResponse {
  submissions: Submission[];
  nextPageToken: string;
}

export interface TransformSubmission {
  no: number;
  name: string;
  requestDate: string;
  requestTime: string;
  action: string;
  status: string;
  responseMessage: string;
  responseMessageRaw: string;
  responseDate: string;
  responseTime: string;
}

export interface IntegrationResultTransformResponse {
  submissions: TransformSubmission[];
}
