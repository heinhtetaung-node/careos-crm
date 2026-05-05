import type { ToastOptions } from 'react-toastify';

export enum NotificationTypes {
  LEAD_ASSIGNMENT = 'types/leadAssignment',
  APPOINTMENT = 'types/appointment',
  QC_FAILED = 'types/orderQcFailed',
  QC_FIXED = 'types/orderQcFixed',
  DOCUMENT_ATTACHED = 'types/documentAdded',
  EMAIL_REPLIED = 'types/mail',
  DISCOUNT_REQUEST = 'types/discountRequestDecided',
  APPROVAL_REQUEST = 'types/discountRequestCreated',
  CONTRACT_SIGNED = 'types/contractSigned',
}
export enum AttachedDocumentTypes {
  DOCUMENT_TYPE_ID_CARD = 'DOCUMENT_TYPE_ID_CARD',
  DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENSE = 'DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENCE',
  DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENSE = 'DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENCE',
  DOCUMENT_TYPE_VEHICLE_REGISTRATION = 'DOCUMENT_TYPE_VEHICLE_REGISTRATION',
  DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT',
  DOCUMENT_TYPE_VEHICLE_PICTURE_BACK = 'DOCUMENT_TYPE_VEHICLE_PICTURE_BACK',
  DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT',
  DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT',
  DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE = 'DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE',
  DOCUMENT_TYPE_PAYMENT_SLIP = 'DOCUMENT_TYPE_PAYMENT_SLIP',
  DOCUMENT_TYPE_OTHERS = 'DOCUMENT_TYPE_OTHERS',
}
interface ReadNotificationPayload {
  notificationId: string;
  readTime: string;
  type: NotificationTypes;
}
export interface NotificationToastProps {
  toastProps: ToastOptions;
  closeToast: () => void;
  handleRead?: (data: ReadNotificationPayload) => void;
  flag?: Record<string, boolean>;
}
export interface NotificationActionProps {
  handleClose: () => void;
  handleOpen: () => void;
  closeBtnText?: string;
  openBtnText?: string;
}

export enum DiscountRequestTypes {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export interface NotificationListDataProps {
  title: string;
  date?: string;
  from?: string;
  to?: string;
  isNew?: boolean;
  id: string;
  name: string;
  type: NotificationTypes;
  details: Record<string, string>;
  description: string | null;
  url: string | null;
  status?: DiscountRequestTypes;
}
export interface NotificationListProps {
  today: NotificationListDataProps[];
  older: NotificationListDataProps[];
  total: number;
  unRead: number;
  token?: string;
}

export interface AddNotificationPayload {
  data: NotificationListDataProps;
}
export interface NotificationListTemplatePayload {
  data: NotificationListProps;
  setPageToken: (data: string) => void;
  handleRead?: NotificationToastProps['handleRead'];
  flags?: NotificationToastProps['flag'];
}
export interface NotificationListPayload {
  data: NotificationListDataProps;
  isNew?: boolean;
  handleRead?: NotificationToastProps['handleRead'];
  isNewLayout: boolean;
}
export interface NotificationProps {
  addNotification: ({ data }: AddNotificationPayload) => void;
  NotificationContainer: JSX.Element;
  NotificationList: JSX.Element;
}
