import type { AttachedDocumentTypes } from '@alphafounders/ui';
import { NotificationTypes } from '@alphafounders/ui';

export interface NotificationResponse {
  name: string;
  createTime: string;
  updateTime: string | null;
  deleteTime: string | null;
  type: NotificationTypes;
  payload: {
    customerName?: string;
    leadId?: string;
    lead?: string;
    order?: string;
    orderId?: string;
    description?: string;
    subject?: string;
    startTime?: string;
    fixTime?: string;
    endTime?: string;
    documentType?: AttachedDocumentTypes;
    earliestPolicyStartDate?: string;
    agent?: string;
    agentTeam?: string;
    signedOn?: string;
    product?: string;
  };
  readTime: string | null;
  nextPageToken: string;
  inbox: boolean;
}
export interface NotificationListPayload {
  pageSize?: number;
  user: string;
  nextPageToken?: string;
  pageFrom?: number;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  nextPageToken: string;
  unreadCount: number;
}

export interface ReadNotificationPayload {
  notificationId: string;
  readTime: string;
  type: NotificationTypes;
}
