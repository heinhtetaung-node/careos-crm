import { isWithinInterval, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { FilterDateInterface } from 'presentation/pages/car-insurance/myLeads/myLeadsHelper';
import { formatDDMMYYYYHHMMSSUTC } from 'shared/helper/utilities';
import { stripTimezone } from 'utils/datetime';

export interface IAppointment {
  appointmentType: string;
  lead: string;
  payment: boolean;
  subject: string;
}

export interface IAppointmentDetail {
  appointment?: IAppointment;
  createBy?: string;
  createTime?: string;
  deleteTime?: string | null;
  endTime?: string;
  name?: string;
  startTime: string;
  updateTime?: string;
}

export const getTime = (date?: Date | string) =>
  date ? new Date(date).getTime() : 0;

export const getSortedDate = (appointments: IAppointmentDetail[]) =>
  JSON.parse(JSON.stringify(appointments)).sort(
    (a: IAppointmentDetail, b: IAppointmentDetail) =>
      getTime(a.startTime) - getTime(b.startTime)
  );

export const getValidAppointment = (
  appointment: any,
  searchRange?: FilterDateInterface
) => {
  if (searchRange?.range) {
    const appointmentTime = utcToZonedTime(appointment.startTime, 'UTC');

    const { startDate, endDate } = searchRange.range;
    const rangeStartDate = parseISO(startDate.toISOString());
    const rangeEndDate = parseISO(endDate.toISOString());

    return isWithinInterval(appointmentTime, {
      start: rangeStartDate,
      end: rangeEndDate,
    });
  }

  return appointment.deleteTime === null;
};

export const getValidAppointmentDate = (
  appointments: IAppointmentDetail[],
  searchRange?: FilterDateInterface
) => {
  const validAppointments = appointments.filter((appointment) =>
    getValidAppointment(appointment, searchRange)
  );

  if (validAppointments.length === 0) {
    return null;
  }

  if (validAppointments.length === 1) {
    return formatDDMMYYYYHHMMSSUTC(validAppointments[0].startTime);
  }

  const sortedDate = getSortedDate(validAppointments);
  const futureDates: IAppointmentDetail[] = [];
  const pastDates: IAppointmentDetail[] = sortedDate.filter(
    (date: IAppointmentDetail) => {
      const currentTime = new Date();
      const startTime = stripTimezone(date.startTime);
      const endTime = date.endTime ? stripTimezone(date.endTime) : null;

      const isFutureDate =
        currentTime < startTime || (endTime && currentTime < endTime);

      if (isFutureDate) {
        futureDates.push(date);
      }

      return !isFutureDate;
    }
  );

  if (futureDates.length) {
    return formatDDMMYYYYHHMMSSUTC(futureDates[0].startTime);
  }

  if (pastDates.length) {
    return formatDDMMYYYYHHMMSSUTC(pastDates[pastDates.length - 1].startTime);
  }

  return null;
};
