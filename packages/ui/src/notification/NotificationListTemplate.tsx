import React, { useCallback, useEffect, useState } from 'react';

import Button from 'common/Button';
import ToggleSwitch from 'common/ToggleSwitch';
import useUIContext from 'Context/useUIContext';
import useScrollTo from 'utils/useScrollTo';

import { NotificationListsGroup } from './NotificationList';
import {
  NotificationListDataProps,
  NotificationListProps,
  NotificationListTemplatePayload,
} from './types';

const initialValue = {
  older: [],
  today: [],
  total: 0,
  token: '',
  unRead: 0,
};

function NotificationListTemplate({
  data,
  handleRead,
  setPageToken,
  flags,
}: Readonly<NotificationListTemplatePayload>) {
  const [isShowUnRead, setShowUnRead] = useState(false);
  const [unReadNotifications, setUnReadNotifications] =
    useState<NotificationListTemplatePayload['data']>(initialValue);

  const [scrollToRef, setShouldScrollTo] = useScrollTo();
  const [isGettingMoreNotification, setGetMoreNotification] = useState(false);
  const { t } = useUIContext();

  const { token } = data;

  useEffect(() => {
    setShouldScrollTo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleShowUnread = useCallback(
    () => setShowUnRead(!isShowUnRead),
    [isShowUnRead]
  );

  const handleShowMore = useCallback(() => {
    if (token) {
      setPageToken(token);
      setGetMoreNotification(true);
    }
  }, [setPageToken, token]);
  useEffect(() => {
    let notificationData: NotificationListProps = {
      ...initialValue,
    };

    Object.entries(data).forEach(
      ([key, _data]: [string, NotificationListDataProps[]]) => {
        if (['today', 'older'].includes(key) && _data?.length) {
          notificationData[key as 'today' | 'older'] = _data.filter(
            (list) => !!list.isNew
          );
        } else {
          notificationData = {
            ...notificationData,
            [key]: _data,
          };
        }
      }
    );
    setUnReadNotifications(notificationData);
    setGetMoreNotification(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowUnRead, data, handleRead]);

  return (
    <div
      className="absolute top-[2rem] -right-[3em] z-50 p-2 bg-white translate-y-6 card rounded min-w-[400px] max-h-[500px] drop-shadow-lg overflow-hidden"
      data-testid="notification-inbox"
    >
      <div className="flex flex-row justify-between  mb-2 mt-2 pl-3 pr-3">
        <h3 className="flex justify-center text-lg font-extrabold m-1 mb-0 mt-0 text-primary">
          {t('notification.title')}
          {` ( ${unReadNotifications.unRead} )`}
        </h3>
        <div className="flex flex-row justify-items-center">
          <span className="text-sm leading-tight text-primary">
            <ToggleSwitch
              label={t('notification.showUnRead')}
              checked={isShowUnRead}
              onClick={handleShowUnread}
            />
          </span>
        </div>
      </div>
      <NotificationListsGroup
        scrollToRef={scrollToRef}
        data={isShowUnRead ? unReadNotifications : data}
        handleRead={handleRead}
        flags={flags}
      />
      {!!token && (
        <Button
          onClick={handleShowMore}
          dataTestId="readmore-button"
          isLoading={isGettingMoreNotification}
          text={t('notification.showMore')}
          variant="secondary"
          className="text-center w-full p-3"
        />
      )}
    </div>
  );
}

export default NotificationListTemplate;
