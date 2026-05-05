import { NotificationListProps, NotificationTypes } from '@alphafounders/ui';
import { isToday } from 'date-fns';
import _omit from 'lodash/omit';
import _pick from 'lodash/pick';

import {
  NotificationListResponse,
  NotificationResponse,
} from 'data/slices/notificationSlice/types';
import { formatDDMMYYYYHHMMA, parseDate } from 'shared/helper/utilities';

export const DEFAULT_PAGE_SIZE = 4;

export const getNotificationTitle = (type: string) => {
  switch (type) {
    case NotificationTypes.LEAD_ASSIGNMENT:
      return 'leadAssigned';
    case NotificationTypes.APPOINTMENT:
      return 'appointment';
    case NotificationTypes.QC_FAILED:
      return 'orderQcFailed';
    case NotificationTypes.QC_FIXED:
      return 'orderQcFixed';
    default:
      return '';
  }
};

export const getUrlByType = (type: string, payload: Record<string, any>) => {
  const originURI = window.location.origin;
  if (
    [NotificationTypes.QC_FAILED, NotificationTypes.QC_FIXED].includes(
      type as NotificationTypes
    )
  ) {
    const productPath =
      payload?.product === 'products/health-insurance'
        ? 'health/orders/qc/'
        : 'orders/qc/';
    const qcDetailUrl = payload?.order.replace('orders/', productPath);

    return qcDetailUrl ? `${originURI}/${qcDetailUrl}` : null;
  }

  if (type === NotificationTypes.APPROVAL_REQUEST) {
    return `${originURI}/discounts/approval`;
  }
  return payload?.lead ? `${originURI}/${payload.lead}` : null;
};

export const formatNotificationList = (
  lists: NotificationListResponse['notifications']
) =>
  lists.map((list: NotificationResponse) => {
    const { payload, name, type, readTime } = list;

    const restPayload = _pick(
      _omit(payload, ['lead', 'order', 'description']),
      [
        'customerName',
        'leadId',
        'orderId',
        'earliestPolicyStartDate',
        'customerFullName',
        'leadHumanID',
        'documentType',
        'status',
        'agent',
        'agentTeam',
        'fixTime',
        'signedOn',
        'product',
      ]
    );

    if (restPayload?.earliestPolicyStartDate) {
      restPayload.earliestPolicyStartDate =
        formatDDMMYYYYHHMMA(restPayload.earliestPolicyStartDate) ?? '';
    }

    if (restPayload?.fixTime) {
      restPayload.fixTime = formatDDMMYYYYHHMMA(restPayload.fixTime) ?? '';
    }

    let dateCondition =
      type === NotificationTypes.QC_FIXED
        ? restPayload?.fixTime
        : formatDDMMYYYYHHMMA(list?.createTime ?? '');

    if (type === NotificationTypes.CONTRACT_SIGNED) {
      dateCondition = formatDDMMYYYYHHMMA(restPayload?.signedOn ?? '');
    }

    return {
      name,
      id: name,
      title: getNotificationTitle(type),
      date: dateCondition,
      from: payload?.startTime ?? '',
      to: payload?.endTime ?? '',
      type,
      isNew: !!readTime !== true,
      details: restPayload,
      description: payload?.description || null,
      url: getUrlByType(type, payload),
    };
  });

export const FilterListByDate = (
  lists: NotificationListResponse['notifications'],
  nextPageToken: string,
  unreadCount: number
) => {
  const notificationList: NotificationListProps = {
    today: [],
    older: [],
    total: 0,
    token: nextPageToken,
    unRead: unreadCount,
  };
  let listCount = 0;
  formatNotificationList(lists).forEach((list) => {
    listCount += 1;
    const currentDate = parseDate(list?.date as string, 'dd/MM/yyyy (hh:mm a)');
    if (isToday(new Date(currentDate))) {
      notificationList.today.push(list);
    } else {
      notificationList.older.push(list);
    }
  });
  notificationList.total = listCount;
  return notificationList;
};
