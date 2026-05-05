import { AddAppointmentPayload } from '../leadDetailSlices/appointmentSlice';

export interface CallSummaryModalPayload {
  parent: string;
  remark?: string;
  comment: string;
  rejectionReason?: string;
  policyExpiryDate?: string;
  leadStatus: string;
  currentEvent?: string;
  upcomingEvent?: {
    calendar: string;
    event: AddAppointmentPayload['payload'];
  };
}
