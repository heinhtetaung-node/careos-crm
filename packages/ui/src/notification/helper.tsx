import clsx from 'clsx';
import moment from 'moment';
import React from 'react';

import useUIContext from '../Context/useUIContext';
import {
  CalenderIcon,
  ArrowRightCircleIcon,
  DocumentIcon,
  EmailIcon,
} from '@alphafounders/icons';

import {
  NotificationTypes,
  NotificationListDataProps,
  AttachedDocumentTypes,
  DiscountRequestTypes,
} from './types';

export function GetDocumentTitle(type = '') {
  const { t } = useUIContext();

  const documentTypeMap: Record<string, string> = {
    [AttachedDocumentTypes.DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENSE]:
      'notification.titles.firstNamedDrivingLicense',
    [AttachedDocumentTypes.DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENSE]:
      'notification.titles.secondNamedDrivingLicense',
    [AttachedDocumentTypes.DOCUMENT_TYPE_PAYMENT_SLIP]:
      'notification.titles.paymentSlip',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE]:
      'notification.titles.vehicleDashcamPicture',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_BACK]:
      'notification.titles.vehicleBackPicture',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT]:
      'notification.titles.vehicleFrontPicture',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT]:
      'notification.titles.vehicleLeftPicture',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT]:
      'notification.titles.vehicleRightPicture',
    [AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_REGISTRATION]:
      'notification.titles.vehicleRegistration',
    [AttachedDocumentTypes.DOCUMENT_TYPE_ID_CARD]: 'notification.titles.idCard',
    [AttachedDocumentTypes.DOCUMENT_TYPE_OTHERS]:
      'notification.titles.otherDocument',
  };

  if (!type || !documentTypeMap[type]) return null;
  return `${t(documentTypeMap[type])} ${t('notification.attached')}`;
}
export function getDiscountApprovalTitle(status?: DiscountRequestTypes) {
  const titleMap: Record<DiscountRequestTypes, string> = {
    [DiscountRequestTypes.APPROVED]: 'discountRequestApproved',
    [DiscountRequestTypes.REJECTED]: 'discountRequestRejected',
  };
  return status ? titleMap[status] : false;
}
export function TitleAsPerType({
  type,
  description,
  details,
}: Readonly<{
  type: NotificationTypes;
  description: string;
  details: NotificationListDataProps['details'];
}>) {
  const { t } = useUIContext();
  const {
    customerName,
    leadId,
    documentType,
    status,
    agentTeam,
    agent,
    orderId,
  } = details;
  const documentTitle = GetDocumentTitle(documentType ?? '');

  if (type === NotificationTypes.APPOINTMENT) {
    return (
      <h3
        className="text-sm font-bold mb-1 mt-0 text-primary"
        data-testid="notification-heading"
      >
        {`${description} ${t('notification.with')} ${customerName}`}
        {leadId && (
          <span
            data-testid="notification-leadId"
            className="text-[10px] leading-[15px] font-normal"
          >
            {` (${leadId})`}
          </span>
        )}
      </h3>
    );
  }

  if (type === NotificationTypes.DOCUMENT_ATTACHED && documentType) {
    return (
      <h3
        className="text-sm font-bold mb-1 mt-0 text-primary max-w-[230px]"
        data-testid="notification-heading"
      >
        {documentTitle}
        <br />
        {leadId && customerName && (
          <span
            data-testid="notification-leadId"
            className="text-[10px] leading-[15px] font-normal"
          >
            {`(${leadId} - ${customerName})`}
          </span>
        )}
      </h3>
    );
  }

  if (type === NotificationTypes.DISCOUNT_REQUEST) {
    const discountTitle = getDiscountApprovalTitle(
      status as DiscountRequestTypes
    );
    return (
      <h3
        className="text-sm font-bold mb-1 mt-0 text-primary max-w-[250px]"
        data-testid="notification-heading"
      >
        {t(`notification.titles.${discountTitle}`)}
        <br />
        {customerName}
        {leadId && (
          <span
            data-testid="notification-leadId"
            className="text-[10px] leading-[15px] font-normal"
          >
            {` (${leadId})`}
          </span>
        )}
      </h3>
    );
  }

  const typeTitle = t(`notification.${type.split('/')[1]}Title`);
  if (type === NotificationTypes.APPROVAL_REQUEST && agent) {
    return (
      <h3
        className="text-sm font-bold mb-1 mt-0 text-primary"
        data-testid="notification-heading"
      >
        {`${typeTitle} ${agent} - ${agentTeam || ''} (${leadId})`}
      </h3>
    );
  }
  return (
    <h3
      className="text-sm font-bold mb-1 mt-0 text-primary"
      data-testid="notification-heading"
    >
      {`${typeTitle} - ${customerName}`}
      {(leadId || orderId) && (
        <span
          data-testid="notification-leadId"
          className="text-[10px] leading-[15px] font-normal"
        >
          {` (${leadId || orderId})`}
        </span>
      )}
    </h3>
  );
}
export function DateAsPerType({
  type,
  value,
  className,
  timeValues,
  status,
}: Readonly<{
  type: NotificationTypes;
  value: string | null;
  className?: string;
  timeValues?: Readonly<{ from: string; to: string }> | null;
  status?: Readonly<DiscountRequestTypes> | null;
}>) {
  const { t } = useUIContext();

  const formatDateTime = (from: string, to: string) => {
    const _from = moment(from).utc();
    const _to = moment(to).utc();

    const difference = _to.diff(_from, 'minutes');

    return `${_from.format('hh:mm')} - ${_to.format(
      'hh:mm'
    )} (${difference} ${t('notification.mins')})`;
  };

  const _value =
    timeValues?.from && type === NotificationTypes.APPOINTMENT
      ? formatDateTime(timeValues.from, timeValues.to)
      : value;

  const title =
    status && type === NotificationTypes.DISCOUNT_REQUEST
      ? getDiscountApprovalTitle(status)
      : type.split('/')[1];

  return (
    <span className={clsx(className ?? '')} data-testid="notification-date">
      {t(`notification.${title}Date`)}
      &nbsp;
      {_value ?? ''}
    </span>
  );
}

export function IconAsPerType({
  type,
  isNewNotifcation = false,
}: Readonly<{
  type: NotificationTypes;
  isNewNotifcation?: boolean;
}>) {
  const variant = isNewNotifcation ? 'new' : undefined;

  if (
    [
      NotificationTypes.DOCUMENT_ATTACHED,
      NotificationTypes.APPROVAL_REQUEST,
      NotificationTypes.CONTRACT_SIGNED,
    ].includes(type)
  )
    return <DocumentIcon variant={variant} />;

  if (type === NotificationTypes.APPOINTMENT)
    return <CalenderIcon variant={variant} />;

  if (type === NotificationTypes.EMAIL_REPLIED)
    return <EmailIcon variant={variant} />;

  return <ArrowRightCircleIcon variant={variant} />;
}

export function isNewLayout(
  type: NotificationTypes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flag: Record<string, boolean> | undefined
) {
  const flagsMap: Record<NotificationTypes, boolean | undefined> = {
    [NotificationTypes.APPOINTMENT]: true,
    [NotificationTypes.LEAD_ASSIGNMENT]: true,
    [NotificationTypes.QC_FAILED]: true,
    [NotificationTypes.QC_FIXED]: true,
    [NotificationTypes.DOCUMENT_ATTACHED]: true,
    [NotificationTypes.DISCOUNT_REQUEST]: true,
    [NotificationTypes.EMAIL_REPLIED]: true,

    [NotificationTypes.APPROVAL_REQUEST]: true,
    [NotificationTypes.CONTRACT_SIGNED]: true,
  };

  return type ? flagsMap[type] : false;
}

export const ExcludedDetailsFromTable = ['documentType'];
