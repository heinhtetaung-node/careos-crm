import Popper from '@material-ui/core/Popper';
import { Close } from '@material-ui/icons';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';
import {
  format,
  set,
  momentUTCEquivalent,
  isValid,
  add,
  differenceInDays,
} from 'utils/datetime';

import TimeSlot from './Timeslot';
import TimeslotsHelper, {
  IUpdateData,
  ITimeslotsData,
  ITimeslot,
  ICookedData,
  IAppointmentTime,
} from './TimeslotsHelper';

import CancelAppointmentModal from '../modal/CancelAppointmentModal';
import CommonModal from '../modal/CommonModal';
import {
  IAppointmentDetail,
  IGetAppointmentCallback,
  IGetAppointmentDetail,
} from '../scheduleModal/scheduleModalHelper';
import './timeSlots.scss';

interface TimeSlotsProps {
  data: ITimeslotsData;
  viewOnly?: boolean;
  onUpdate: (data: IUpdateData) => void;
  onGetAppointmentDetail: IGetAppointmentDetail;
  handleDeleteAppointment?: (data: IDeleteAppointment) => Promise<void> | void;
}

const helperData = new TimeslotsHelper();

export const showCancelButton = (
  timeInfo: null | IAppointmentTime,
  appointmentInfo: null | IAppointmentDetail
) => {
  const CONTACTED_USER = 'CALLED';
  const endTime =
    timeInfo?.endTime && isValid(new Date(timeInfo.endTime))
      ? format(
          new Date(momentUTCEquivalent(new Date(timeInfo?.endTime))),
          'yyyy-MM-dd HH:mm'
        )
      : '';
  const currentTime = format(new Date(), 'yyyy-MM-dd HH:mm');

  if (differenceInDays(new Date(endTime), new Date(currentTime)) >= 0) {
    if (appointmentInfo?.status === CONTACTED_USER) {
      return false;
    }
    return true;
  }
  return false;
};

function TimeSlots({
  data,
  onUpdate,
  onGetAppointmentDetail,
  handleDeleteAppointment,
  viewOnly,
}: Readonly<TimeSlotsProps>) {
  const [arrowRef, setArrowRef] = React.useState<null | HTMLSpanElement>(null);
  const [inputData, setInputData] = useState<ICookedData>({});
  // INFO initialData is a version of inputData to handle case re-select slot
  const [initialData, setInitialData] = useState<ICookedData>({});
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLDivElement>(null);
  const [appointmentDetail, setAppointmentDetail] =
    React.useState<null | IAppointmentDetail>(null);
  const [timeDetail, setTimeDetail] = React.useState<null | IAppointmentTime>(
    null
  );
  const [displayCancelButton, setDisplayCancelButton] = useState(false);
  const [isShowAppointmentModal, setIsShowAppointmentModal] = useState(false);

  const [eventName, setEventName] = useState('');

  const id = useMemo(
    () => (anchorEl ? 'appointment-detail__popper' : undefined),
    [anchorEl]
  );

  const getSlotsData = (item: ITimeslot) =>
    helperData.getSlotsData(item, inputData);

  const handleSelectSlot = ({ startTime, length }: IUpdateData) => {
    const cookedData = helperData.handleSelectSlot(
      { startTime, length },
      initialData
    );

    setInputData(cookedData);
    onUpdate({
      startTime,
      length,
    });
  };

  useEffect(() => {
    helperData.data = data;
    const cookedData = helperData.cookTimesData();
    setInitialData(cookedData);
    setInputData(cookedData);
  }, [data]);

  useMemo(() => {
    const showButton = showCancelButton(timeDetail, appointmentDetail);
    setDisplayCancelButton(showButton);
  }, [timeDetail, appointmentDetail]);

  const handleShowAppointmentDetail = (
    { appointmentDetail: detail, timeDetail: appointmentTime }: any,
    currentTarget: HTMLDivElement
  ) => {
    const { subject, appointmentType } = detail;
    onGetAppointmentDetail(
      detail,
      ({ name, detailLink, humanId }: IGetAppointmentCallback) => {
        setAppointmentDetail({
          subject,
          appointmentType,
          name,
          detailLink,
          humanId,
          payment: detail.payment,
          status: detail.status,
        });

        setTimeDetail(appointmentTime);
        setAnchorEl(currentTarget);
      }
    );
  };

  const getTimeDetail = () =>
    timeDetail?.startTime && timeDetail?.endTime
      ? `${format(new Date(momentUTCEquivalent(new Date(timeDetail?.startTime))), 'H:mm')} - ${format(new Date(momentUTCEquivalent(new Date(timeDetail?.endTime))), 'H:mm')} (${timeDetail?.length} mins)`
      : '';

  const handleOpenCloseModal = () => {
    setIsShowAppointmentModal(!isShowAppointmentModal);
  };

  const onDeleteAppointmentModal = async () => {
    const [_, userId, __, appointmentId] = eventName.split('/');
    if (handleDeleteAppointment) {
      await handleDeleteAppointment({ userId, appointmentId });
    }
    handleOpenCloseModal();
    setAnchorEl(null);
  };

  const timeSlotData = useMemo(() => {
    let previousName: string | undefined;
    return Object.values(inputData).map((appointment) => {
      if (appointment.position === 'start') {
        previousName = appointment.name;
        return appointment;
      }

      if (appointment.position === 'last') {
        const result = {
          ...appointment,
          name: previousName,
        } as ITimeslot;
        previousName = undefined;
        return result;
      }

      return {
        ...appointment,
        name: previousName || appointment.name,
      } as ITimeslot;
    });
  }, [inputData]);

  return (
    <div
      className="time-slots"
      id="container"
      data-testid="time-slots-container"
    >
      {inputData &&
        timeSlotData.map((item) => (
          <TimeSlot
            data={item}
            showTimeSelection={!viewOnly}
            slots={getSlotsData(item)}
            onSelectSlot={(event: IUpdateData) => handleSelectSlot(event)}
            key={item.time}
            showAppointmentDetail={(currentTarget) => {
              handleShowAppointmentDetail(item, currentTarget);
              setEventName(item?.name ?? '');
            }}
          />
        ))}
      {!!anchorEl && (
        <div
          className="popper__overlay-container"
          role="presentation"
          onClick={() => setAnchorEl(null)}
        />
      )}
      <Popper
        id={id}
        data-testid="appointment-detail-popup"
        open={!!anchorEl}
        placement="top"
        anchorEl={anchorEl}
        disablePortal
        modifiers={{
          flip: {
            enabled: true,
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: 'scrollParent',
          },
          arrow: {
            enabled: true,
            element: arrowRef,
          },
        }}
      >
        <span className="popper-appointment-arrow" ref={setArrowRef} />

        <div className="popper__main-container">
          <div className="appointment-detail__close-icon">
            <Close
              onClick={() => setAnchorEl(null)}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              style={{
                transform: 'scale(0.7)',
              }}
              data-testid="appointment-detail-close-icon"
            />
          </div>

          {appointmentDetail && (
            <>
              <div className="appointment-detail__information-container">
                <div className="appointment-detail__header-section">
                  <span className="appointment-detail__main-title">
                    {getString('timeSlotCallBack.appointment')}
                  </span>
                  <span
                    className="appointment-detail__time-detail"
                    style={{
                      color: appointmentDetail.payment ? '#f90003' : '#27a886',
                    }}
                  >
                    {getTimeDetail()}
                  </span>
                </div>
                <div className="appointment-detail__information">
                  <span>{getString('timeSlotCallBack.appointmentType')}</span>
                  <span
                    className="appointment-detail__appointment-type"
                    data-testid="appointment-type"
                  >
                    {getString(
                      `appointmentType.${appointmentDetail.appointmentType}`
                    )}
                  </span>
                </div>
                <div className="appointment-detail__information">
                  <span>{getString('timeSlotCallBack.subject')}</span>
                  <span data-testid="appointment-subject">
                    {appointmentDetail.subject}
                  </span>
                </div>
                <div className="appointment-detail__information">
                  <span>{getString('timeSlotCallBack.customerName')}</span>
                  <span data-testid="appointment-name">
                    {appointmentDetail.name}
                  </span>
                </div>
                <div className="appointment-detail__information">
                  <span>{appointmentDetail.humanId.label}</span>
                  <span data-testid="appointment-humanId">
                    {appointmentDetail.humanId.id}
                  </span>
                </div>
              </div>
              <Link
                to={appointmentDetail.detailLink}
                target="_blank"
                style={{ textDecoration: 'none' }}
              >
                <Controls.Button
                  text={getString('timeSlotCallBack.viewMoreButton')}
                  color="primary"
                  style={{ textTransform: 'uppercase', width: '100%' }}
                  className="button"
                />
              </Link>
              {displayCancelButton && !viewOnly && (
                <div data-testid="timeslot-cancel-button">
                  <Controls.Button
                    text={getString('timeSlotCallBack.cancelAppointment')}
                    className="cancel-button"
                    variant=""
                    onClick={() => setIsShowAppointmentModal(true)}
                  />

                  <CommonModal
                    title=""
                    open={isShowAppointmentModal}
                    handleCloseModal={() => setIsShowAppointmentModal(false)}
                    wrapperClass="modal-lead-call"
                    maxWidth="sm"
                  >
                    <CancelAppointmentModal
                      handleOpenCloseModal={handleOpenCloseModal}
                      handleRemoveAppointment={onDeleteAppointmentModal}
                    />
                  </CommonModal>
                </div>
              )}
            </>
          )}
        </div>
      </Popper>
    </div>
  );
}

export default TimeSlots;
