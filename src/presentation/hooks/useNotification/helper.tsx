import { BellIcon, NewBellIcon } from '@alphafounders/icons';
import {
  Button,
  NotificationListTemplate,
  AddNotificationPayload,
  NotificationListProps,
  NotificationToastProps,
} from '@alphafounders/ui';
import _uniqBy from 'lodash/uniqBy';
import React, { useRef } from 'react';
import { Id, toast as toastType } from 'react-toastify';
import { map } from 'rxjs/operators';
import { useOnClickOutside } from 'usehooks-ts';

import WebSocketGateway from 'data/gateway/websocket';
import { formatNotificationList } from 'data/slices/notificationSlice/helper';
import { NotificationResponse } from 'data/slices/notificationSlice/types';

const filterFlagNotification = (
  currentData: NotificationListProps,
  _flags: Record<string, boolean>
) => {
  const { today, older } = currentData;

  const flagValue: Record<string, boolean> = {
    'types/appointment': true,
    'types/leadAssignment': true,
    'types/orderQcFailed': true,
    'types/documentAdded': true,
    'types/mail': true,
    'types/discountRequestDecided': true,
    'types/discountApproval': true,
    'types/discountRequestCreated': true,
    'types/contractSigned': true,
  };

  const filteredToday = today.filter((data) => flagValue[data.type]);
  const filteredOlder = older.filter((data) => flagValue[data.type]);
  const todayUnreadCount = filteredToday.filter((data) => data.isNew).length;
  const olderUnreadCount = filteredOlder.filter((data) => data.isNew).length;

  return {
    today: filteredToday,
    older: filteredOlder,
    total: filteredOlder.length + filteredToday.length,
    unRead: olderUnreadCount + todayUnreadCount,
    token: currentData.token,
  };
};

export const MergeAndUpdateData = (
  prevData: NotificationListProps,
  currentData: NotificationListProps,
  setUnReadNotification: (data: boolean) => void,
  setNotificationsList: (data: NotificationListProps) => void,
  shouldAddPrevData: boolean,
  flags: Record<string, boolean>,
  isPrevToken = false
) => {
  if (currentData) {
    // filter notification for disabled flag types
    const filteredData: NotificationListProps = filterFlagNotification(
      currentData,
      flags
    );

    const { older, today, total } = filteredData;
    const allData: NotificationListProps = { ...filteredData };
    if (isPrevToken) {
      allData.token = prevData.token;
    }
    if (shouldAddPrevData) {
      allData.older = _uniqBy([...prevData.older, ...older], 'id');
      allData.today = _uniqBy([...prevData.today, ...today], 'id');
      allData.total = prevData.total + total;
    }
    setUnReadNotification(
      [...allData.older, ...allData.today].some((list) => list.isNew)
    );
    setNotificationsList(allData);
  }
};

export const handleWebSocket = (
  userId: string,
  handleAddNotification: ({ data }: AddNotificationPayload) => Id,
  refetch: () => void,
  toast: typeof toastType
) => {
  const URI = `notification/v1/targets/${userId}/notifications/*`;
  const ws = WebSocketGateway.getInstance()
    .subscribe(URI)
    ?.pipe(map((event: any) => event.body));

  const subscription = ws?.subscribe((resp: any) => {
    if (resp?.name && resp?.readTime == null && resp?.deleteTime == null) {
      const formattedResponse = formatNotificationList([
        resp,
      ] as NotificationResponse[]);
      const notificationId = handleAddNotification({
        data: formattedResponse[0],
      });
      if (document.hidden && notificationId) {
        toast.dismiss(notificationId);
      }
    }
    refetch();
  });
  return () => subscription?.unsubscribe();
};

interface NotificationListsProps {
  setDisplayDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  isDisplayDropdown: boolean;
  handleReadNotification: NotificationToastProps['handleRead'];
  notificationLists: NotificationListProps;
  isUnReadNotification: boolean;
  setPageToken: (token: string) => void;
  flags?: NotificationToastProps['flag'];
}
export function NotificationsList({
  setDisplayDropdown,
  isDisplayDropdown,
  handleReadNotification,
  notificationLists,
  isUnReadNotification,
  setPageToken,
  flags,
}: Readonly<NotificationListsProps>) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setDisplayDropdown(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        text=""
        variant="secondary"
        className="border-0 mr-2 ml-2 outline-none"
        dataTestId="notification-inbox-trigger"
        onClick={() => setDisplayDropdown((prev) => !prev)}
        icon={
          isUnReadNotification ? (
            <NewBellIcon fillColor="#005098" />
          ) : (
            <BellIcon />
          )
        }
      />
      {isDisplayDropdown && (
        <NotificationListTemplate
          handleRead={handleReadNotification}
          setPageToken={(data: string) => setPageToken(data)}
          data={notificationLists}
          flags={flags}
        />
      )}
    </div>
  );
}
