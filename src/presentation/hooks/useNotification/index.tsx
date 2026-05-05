import {
  NotificationListProps,
  NotificationProps,
  AddNotificationPayload,
  NotificationTemplate,
} from '@alphafounders/ui';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useState, useEffect } from 'react';
import {
  ToastContainer,
  toast,
  ToastContainerProps,
  ToastPosition,
} from 'react-toastify';

import {
  useGetNotificationListQuery,
  useReadNotificationsMutation,
  useLazyGetNotificationListQuery,
} from 'data/slices/notificationSlice';
import {
  DEFAULT_PAGE_SIZE,
  getNotificationTitle,
} from 'data/slices/notificationSlice/helper';

import {
  MergeAndUpdateData,
  handleWebSocket,
  NotificationsList,
} from './helper';

import 'react-toastify/ReactToastify.min.css';

const initialNotificationList = {
  older: [],
  today: [],
  total: 0,
  unRead: 0,
};
interface NotificationConfigType {
  containerProps?: ToastContainerProps;
  toastClassName?: string;
  position: ToastPosition;
  limit: number;
  autoClose: number;
}
interface NotificationHookProps {
  userId: string | null;
  config?: NotificationConfigType;
}

let COUNT = 0;

function useNotification({
  userId,
  config = {
    position: 'top-right',
    limit: 3,
    autoClose: 10_000,
  },
}: NotificationHookProps): NotificationProps {
  const [isUnReadNotification, setUnReadNotification] =
    useState<boolean>(false);
  const [isDisplayDropdown, setDisplayDropdown] = useState<boolean>(false);
  const [notificationPageSize, setNotificationPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [pageToken, setPageToken] = useState('');
  const [notificationLists, setNotificationsList] =
    useState<NotificationListProps>(initialNotificationList);

  const notificationFlags = {};

  const [handleReadNotification, { data: updatedNotificationData }] =
    useReadNotificationsMutation({});
  const { data: notificationListData, refetch } = useGetNotificationListQuery(
    userId
      ? {
          pageSize: DEFAULT_PAGE_SIZE,
          user: userId,
        }
      : skipToken
  );

  const [
    getMoreNotificationList,
    { data: moreNotificationList, isLoading: gettingMoreNotification },
  ] = useLazyGetNotificationListQuery();

  const addNotification = ({ data }: AddNotificationPayload) =>
    toast(
      <NotificationTemplate
        handleRead={handleReadNotification}
        toastProps={{}}
        closeToast={() => {
          throw new Error('Function not implemented.');
        }}
        flag={notificationFlags}
      />,
      {
        toastId: data.id,
        data,
        role: 'alert',
        pauseOnFocusLoss: false,
        progressStyle: { borderRadius: '0 0 10px 10px' },
      }
    );

  // NOTE: fetch notifications and update it to the state
  useEffect(() => {
    if (notificationListData) {
      MergeAndUpdateData(
        notificationLists,
        notificationListData,
        setUnReadNotification,
        setNotificationsList,
        false,
        notificationFlags,
        notificationPageSize > DEFAULT_PAGE_SIZE
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationListData]);

  // NOTE: fetch and update to state more notifications
  useEffect(() => {
    if (!gettingMoreNotification && moreNotificationList) {
      MergeAndUpdateData(
        notificationLists,
        moreNotificationList,
        setUnReadNotification,
        setNotificationsList,
        true,
        notificationFlags,
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gettingMoreNotification, moreNotificationList]);

  // NOTE: to store the notification's length to fetch later
  useEffect(() => {
    if (updatedNotificationData) {
      setNotificationPageSize(notificationLists.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedNotificationData]);

  // NOTE: fetch more notification if clicked on "Show More" button
  useEffect(() => {
    if (pageToken && userId) {
      getMoreNotificationList({
        user: userId,
        nextPageToken: pageToken ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageToken, userId]);

  // NOTE: Web Socket subscription for popovers
  useEffect(() => {
    if (!userId || !notificationListData || COUNT !== 0) return;
    COUNT = 1;
    handleWebSocket(userId, addNotification, refetch, toast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, notificationListData]);

  const { position, autoClose, toastClassName, containerProps, limit } = config;

  const notificationListTemp = notificationLists;

  return {
    addNotification,
    NotificationContainer: (
      <div>
        <ToastContainer
          closeButton={false}
          closeOnClick={false}
          position={position}
          className="top-[6rem]"
          pauseOnFocusLoss={false}
          pauseOnHover
          draggable
          newestOnTop
          limit={limit}
          toastClassName={`Toast_wrapper overflow-visible shadow-toast rounded-10px ${toastClassName}`}
          autoClose={autoClose}
          {...containerProps}
        />
      </div>
    ),
    NotificationList: (
      <NotificationsList
        setDisplayDropdown={setDisplayDropdown}
        isDisplayDropdown={isDisplayDropdown}
        handleReadNotification={handleReadNotification}
        notificationLists={notificationListTemp}
        isUnReadNotification={isUnReadNotification}
        setPageToken={setPageToken}
        flags={notificationFlags}
      />
    ),
  };
}

export default useNotification;
