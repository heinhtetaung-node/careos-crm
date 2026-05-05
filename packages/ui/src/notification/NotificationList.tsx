import clsx from 'clsx';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';

import Button from 'common/Button';
import ProgressBar from 'common/ProgressBar';
import useUIContext from 'Context/useUIContext';
import { RedirectIcon } from '@alphafounders/icons';

import {
  GetDocumentTitle,
  DateAsPerType,
  IconAsPerType,
  TitleAsPerType,
  isNewLayout,
} from './helper';
import { TableContainer } from './NotificationTemplate';
import {
  DiscountRequestTypes,
  NotificationListPayload,
  NotificationListTemplatePayload,
  NotificationToastProps,
} from './types';

function TextDivider({ text, total }: { text: string; total: number }) {
  return (
    <div className="flex flex-row justify-start font-bold text-xs leading-tight  mt-3 mb-2">
      {text}
      {`(${total})`}
    </div>
  );
}

export function NotificationList({
  data,
  handleRead,
  isNewLayout: _isNewLayout,
}: NotificationListPayload) {
  const [showDetails, setShowDetails] = useState(false);
  const [isReadingNotification, setIsReadingNotification] = useState(false);
  const { t } = useUIContext();

  const { title, date, isNew, details, url, id, type, description, from, to } =
    data;

  const documentTitle = GetDocumentTitle(details?.documentType ?? '');
  const triggerReadNotification = useCallback(() => {
    if (isNew) {
      handleRead?.({
        notificationId: id,
        type,
        readTime: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      });
    }
  }, [isNew, handleRead, id, type]);

  const handleReadAndShowDetails = () => {
    setShowDetails(!showDetails);
    if (isNew) {
      setIsReadingNotification(true);
    }
    triggerReadNotification();
  };

  useEffect(() => {
    if (!isNew) {
      setIsReadingNotification(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleReadAndRedirect = useCallback(() => {
    triggerReadNotification();
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }, [triggerReadNotification, url]);

  return (
    <>
      <div
        className={clsx(
          'flex flex-row justify-around rounded p-2 pl-1 pr-1 mb-0 mt-2 items-center cursor-pointer',
          isNew && 'bg-slate-100'
        )}
        onClick={handleReadAndShowDetails}
        onKeyPress={handleReadAndShowDetails}
        role="button"
        tabIndex={0}
        data-testid="details-collapse-btn"
      >
        {_isNewLayout ? (
          <div className="flex h-5 w-5">
            <IconAsPerType type={type} isNewNotifcation={isNew} />
          </div>
        ) : (
          <div className="flex relative h-3 w-3">
            <span
              className={clsx(
                `absolute inline-flex h-full w-full rounded-full opacity-75`,
                {
                  'bg-red-500 animate-ping': isNew,
                  'bg-muted-dark': !isNew,
                }
              )}
            />
            <span
              className={clsx(`relative inline-flex rounded-full h-3 w-3`, {
                'bg-red-500': isNew,
                'bg-muted-dark': !isNew,
              })}
            />
          </div>
        )}
        {_isNewLayout ? (
          <div className="flex flex-col justify-items-center mx-3 w-[250px]">
            <TitleAsPerType
              type={type}
              description={description as string}
              details={details}
            />
            <DateAsPerType
              type={type}
              value={date ?? null}
              timeValues={!!from && !!to ? { from, to } : undefined}
              className="text-xs leading-[20px] text-slate-950"
              status={details.status as DiscountRequestTypes}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-items-start min-w-[200px]">
            <h3 className="text-lg font-extrabold m-1 mb-0 mt-0 text-primary">
              {documentTitle ?? t(title)}
            </h3>
            {date && (
              <DateAsPerType
                className="mt-2"
                type={type}
                value={date}
                status={details.status as DiscountRequestTypes}
              />
            )}
          </div>
        )}
        <Button
          dataTestId="notification-redirect-btn"
          text=""
          variant="secondary"
          className="border-none bg-transparent"
          icon={
            <RedirectIcon
              fillColor="#005098"
              className="h-4 w-4 cursor-pointer"
            />
          }
          onClick={handleReadAndRedirect}
        />
      </div>
      <ProgressBar shouldAnimate={isReadingNotification} />
      {showDetails && !_isNewLayout && Object.entries(details).length > 0 && (
        <div className="p-2 shadow-sm" data-testid="details">
          <TableContainer
            details={details}
            description={description}
            className="pl-[1.5rem]"
          />
        </div>
      )}
    </>
  );
}

export function NotificationListsGroup({
  data,
  handleRead,
  scrollToRef,
  flags,
}: {
  data: NotificationListTemplatePayload['data'];
  handleRead: NotificationListTemplatePayload['handleRead'];
  scrollToRef: React.MutableRefObject<HTMLDivElement | null>;
  flags: NotificationToastProps['flag'];
}) {
  const { t } = useUIContext();
  return (
    <div
      className="mt-3 mb-3 min-h-[380px] max-h-[386px] overflow-y-auto"
      data-testid="notification-list"
    >
      <TextDivider text={t('notification.today')} total={data.today.length} />
      {data.today.length ? (
        data.today.map((_list) => (
          <NotificationList
            handleRead={handleRead}
            key={_list.id}
            data={_list}
            isNewLayout={!!isNewLayout(_list.type, flags)}
          />
        ))
      ) : (
        <p className="color-muted-dark text-center">
          {t('notification.noNotification')}
        </p>
      )}

      {data.older.length ? (
        <TextDivider text={t('notification.older')} total={data.older.length} />
      ) : null}
      {data.older?.map((_list) => (
        <NotificationList
          handleRead={handleRead}
          key={_list.id}
          data={_list}
          isNewLayout={!!isNewLayout(_list.type, flags)}
        />
      ))}

      <div ref={scrollToRef} />
    </div>
  );
}
