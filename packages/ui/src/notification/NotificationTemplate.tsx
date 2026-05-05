import clsx from 'clsx';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';

import Button from 'common/Button';
import useUIContext from 'Context/useUIContext';
import { RedirectIcon, NewBellIcon, CloseIcon } from '@alphafounders/icons';

import {
  IconAsPerType,
  ExcludedDetailsFromTable,
  isNewLayout,
  TitleAsPerType,
  DateAsPerType,
} from './helper';
import {
  NotificationToastProps,
  NotificationActionProps,
  NotificationListDataProps,
  DiscountRequestTypes,
} from './types';

export function TableContainer({
  className,
  details,
  description,
}: {
  className?: string;
  details: NotificationListDataProps['details'];
  description?: string | null;
}) {
  const { t } = useUIContext();

  return (
    <div className={clsx('table-container mt-2 mb-2', className ?? '')}>
      {Object.entries(details)?.map(([key, value]) => {
        if (ExcludedDetailsFromTable.includes(key)) return null;
        return (
          <div key={key + value} className="flex m-0 p-0 pl-[15px] pr-[15px]">
            <span className="flex w-1/2 font-bold text-black capitalize">
              {t(`notification.${key}`)}
            </span>
            <span className="pb-[6px] mr-[3px]">:</span>
            <span className="flex w-1/2 whitespace-nowrap overflow-hidden text-ellipsis">
              {value}
            </span>
          </div>
        );
      })}
      {description?.length && (
        <p
          className="font-medium leading-tight m-1"
          data-testid="notification-desc"
        >
          {description}
        </p>
      )}
    </div>
  );
}

function NotificationActions({
  handleClose,
  handleOpen,
  closeBtnText = 'close',
  openBtnText = 'open',
}: NotificationActionProps) {
  const { t } = useUIContext();

  return (
    <div className="flex flex-row content-between mt-2">
      <Button
        variant="secondary"
        className="w-full p-3 pl-4 pr-4 mr-2"
        text={t(closeBtnText)}
        onClick={handleClose}
      />
      <Button
        dataTestId="notification-redirect-btn"
        className="w-full p-3 pl-4 pr-4"
        text={t(openBtnText)}
        icon={<RedirectIcon className="mr-1" />}
        onClick={handleOpen}
      />
    </div>
  );
}

function NotificationTemplate({
  toastProps,
  closeToast,
  handleRead,
  flag,
}: NotificationToastProps) {
  const { t } = useUIContext();

  const { title, details, date, description, url, id, type, from, to } =
    toastProps.data as NotificationListDataProps;
  const handleClose = useCallback(() => {
    handleRead?.({
      notificationId: id,
      type,
      readTime: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    });
    closeToast();
  }, [closeToast, handleRead, id, type]);

  const handleOpen = useCallback(() => {
    handleRead?.({
      notificationId: id,
      type,
      readTime: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
    });
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
    closeToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, url]);

  const titleIcon = useMemo(() => {
    return <IconAsPerType type={type} isNewNotifcation />;
  }, [type]);

  if (isNewLayout(type, flag)) {
    return (
      <div
        className="relative font-['Poppins']"
        data-testid="notification-template"
      >
        <div
          className="absolute -right-6 -top-6 rounded-full bg-white p-1.5 w-6 h-6 inline-flex items-center justify-center shadow-closeBtn cursor-pointer"
          data-testid="notification-close-btn"
          onClick={handleClose}
          onKeyDown={handleClose}
          tabIndex={0}
          role="button"
        >
          <CloseIcon />
        </div>
        <div className="flex flex-row justify-items-start">
          <div className="shrink-0">{titleIcon}</div>
          <div className="flex flex-col justify-items-center mx-3">
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
          <div className="shrink-0">
            <div
              className="cursor-pointer"
              data-testid="notification-redirect-btn"
              onClick={handleOpen}
              onKeyDown={handleClose}
              tabIndex={0}
              role="button"
            >
              <RedirectIcon fillColor="#005098" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" data-testid="notification-template">
      <div
        className="absolute right-[-10px] top-[-10px] rounded-full p-[0.2rem] pl-2 pr-2 bg-primary shadow-outline cursor-pointer"
        onClick={handleClose}
        onKeyPress={handleClose}
        tabIndex={0}
        role="button"
      >
        <CloseIcon fillColor="white" className="h-2 w-2" />
      </div>
      <div className="flex flex-row justify-items-center">
        <NewBellIcon />
        <div className="flex flex-col justify-items-start">
          <h3
            className="text-lg font-extrabold m-1 mb-0 mt-0 text-primary"
            data-testid="notification-heading"
          >
            {t(title)}
          </h3>
          <DateAsPerType
            type={type}
            value={date ?? null}
            timeValues={!!from && !!to ? { from, to } : undefined}
          />
        </div>
      </div>
      {Object.entries(details).length > 0 && (
        <TableContainer details={details} />
      )}
      {description?.length && (
        <p
          className="font-medium leading-tight m-1"
          data-testid="notification-desc"
        >
          {description}
        </p>
      )}
      <NotificationActions handleOpen={handleOpen} handleClose={handleClose} />
    </div>
  );
}

export default NotificationTemplate;
