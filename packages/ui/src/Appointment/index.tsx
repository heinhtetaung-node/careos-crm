'use client';

/* eslint-disable import/no-unresolved */
import React from 'react';

import Button from 'common/Button';
import useUIContext from 'Context/useUIContext';
import { ArrowLeftOutline, ArrowRightOutline } from '@alphafounders/icons';

import DayCard, { DayCardProps } from './DayCard';
import clsx from 'clsx';

interface Props {
  timeSlots: React.ReactNode;
  Inputs: { id: string; label: string; Component: React.ReactNode }[];
  days: DayCardProps[];
  onAddClick: () => void;
  onCancelClick: () => void;
  onLeftArrowClick?: () => void;
  onRightArrowClick?: () => void;
  disableLeftArrow?: boolean;
  disableRightArrow?: boolean;
  loading?: boolean;
  disableSubmit?: boolean;
  isViewOnly?: boolean;
  showCancelBtn?: boolean;
  includeTitleBar?: boolean;
  submitting?: boolean;
}

function AppointmentModal({
  timeSlots,
  Inputs,
  days,
  onAddClick,
  onCancelClick,
  onLeftArrowClick,
  onRightArrowClick,
  loading,
  submitting = false,
  showCancelBtn = true,
  disableSubmit = false,
  disableLeftArrow = false,
  disableRightArrow = false,
  isViewOnly = false,
  includeTitleBar = true,
}: Props) {
  const { t } = useUIContext();
  return (
    <div className="max-w-[1350px]" data-testid="appointment-modal">
      {includeTitleBar && (
        <div className="rounded-t-[20px] bg-primary text-white p-4 font-bold text-[18px] text-center">
          {t('appointment')}
        </div>
      )}
      <form
        className={clsx(
          'py-5 px-7 bg-white rounded-b-[1.25rem] overflow-x-scroll',
          { 'max-h-[80vh]': includeTitleBar }
        )}
      >
        <div className="flex flex-wrap gap-[20px]">
          {Inputs.map(({ id, label, Component }) => (
            <div key={id} className="w-[20%] min-w-[300px] grow">
              <div className="py-2">{label}</div>
              {Component}
            </div>
          ))}
        </div>
        <div className="flex items-center my-6 justify-center">
          <button
            type="button"
            data-testid="left-arrow"
            className="inline-flex p-3 text-primary border-0 bg-white cursor-pointer hover:bg-muted-light disabled:text-muted-dark"
            onClick={onLeftArrowClick}
            disabled={disableLeftArrow}
          >
            <ArrowLeftOutline />
          </button>
          <div className="inline-flex gap-3 overflow-x-scroll">
            {loading
              ? Array.from({ length: 5 }, (x, i) => i.toString()).map((p) => (
                  // eslint-disable-next-line react/jsx-indent
                  <DayCard key={p} id={p} loading />
                ))
              : days.map((p) => <DayCard key={p.id} {...p} />)}
          </div>
          <button
            type="button"
            data-testid="right-arrow"
            className="inline-flex p-3 text-primary border-0 bg-white cursor-pointer hover:bg-muted-light disabled:text-muted-dark"
            onClick={onRightArrowClick}
            disabled={disableRightArrow}
          >
            <ArrowRightOutline />
          </button>
        </div>
        {!isViewOnly && <div>{t('selectTheTime')}</div>}
        <div className="mt-2 flex flex-wrap gap-3">{timeSlots}</div>
        {!isViewOnly && (
          <div className="flex justify-center my-4 gap-5">
            {showCancelBtn && (
              <Button
                className="px-6 py-3"
                text={t('cancel')}
                variant="secondary"
                onClick={onCancelClick}
              />
            )}
            <Button
              className="px-8 py-3"
              text={t('save')}
              isLoading={submitting}
              onClick={onAddClick}
              disabled={disableSubmit}
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default AppointmentModal;
