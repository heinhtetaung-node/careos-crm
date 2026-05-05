export interface ISummaryCall {
  comment: string;
  approved: boolean;
  reason: string;
  parent?: string;
}

export interface ILeadDetail {
  createBy: string;
  text: string;
  leadId: string;
  mailId: string;
}

export interface ISaveAppointment {
  createBy: string;
  text: string;
  userId: string;
  mailId: string;
}

export interface IDeleteAppointment {
  userId: string;
  appointmentId: string;
}
export interface IScheduleModal {
  createBy: string;
  startDate: string;
}

export interface IUpdateLead {
  leadId: string;
  [key: string]: any;
}
export interface ILicensePlate {
  body: string;
  leadId: string;
}

export interface ICreateComment {
  leadId: string;
  text: string;
}

export interface IUpdateLeadStatus {
  leadId: string;
  status: string;
  comment: string;
}

export interface IPostLeadRejection {
  leadId: string;
  comment: string;
  reason: string;
}

export interface ISummaryCallModal {
  leadId: string;
  comment: string;
  status?: string;
  reason?: string;
  policyExpiryDate?: string;
}

export interface ISubscribeCall {
  callName: string;
  callParticipantName: string;
}
