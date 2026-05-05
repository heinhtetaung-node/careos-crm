interface CommunicationBase {
  name: string;
  createTime: string;
  createBy: string;
  updateTime?: string;
  deleteTime?: string;
}

export enum CommunicationType {
  SMS = 'sms',
  EMAIL = 'email',
  CALL = 'call',
}

export interface SmsCommunication extends CommunicationBase {
  phoneIndex: number;
  message: string;
  status: string;
}

export interface EmailCommunication extends CommunicationBase {
  subject: string;
  body: string;
  bodyText: string;
  type: string;
  parentId: string;
}

export interface CallCommunication extends CommunicationBase {
  duration: number;
  recording: string;
}

export type Communication<T> = {
  type: CommunicationType;
  communication: T;
};
