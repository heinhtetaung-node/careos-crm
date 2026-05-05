import { sub, add } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

import {
  getTime,
  getSortedDate,
  getValidAppointmentDate,
  getValidAppointment,
} from 'shared/helper/AppointmentLogicHelper';

const unsortedDate = [
  { startTime: '2021-11-08T12:42:00Z' },
  { startTime: '2021-06-28T15:30:00Z' },
  { startTime: '2021-06-28T14:30:00Z' },
];

const sortedDate = [
  { startTime: '2021-06-28T14:30:00Z' },
  { startTime: '2021-06-28T15:30:00Z' },
  { startTime: '2021-11-08T12:42:00Z' },
];

const pastAppointment = [
  {
    endTime: sub(new Date(), { days: 1 }).toISOString(),
    startTime: sub(new Date(), { days: 1, minutes: 15 }).toISOString(),
    deleteTime: null,
  },
];

const futureAppointment = [
  {
    endTime: add(new Date(), { days: 1, minutes: 15 }).toISOString(),
    startTime: add(new Date(), { days: 1 }).toISOString(),
    deleteTime: null,
  },
];

const pastAppointments = [
  {
    endTime: sub(new Date(), { days: 10, minutes: 10 }).toISOString(),
    startTime: sub(new Date(), { days: 10 }).toISOString(),
    deleteTime: null,
  },
  {
    endTime: sub(new Date(), { days: 5, minutes: 10 }).toISOString(),
    startTime: sub(new Date(), { days: 5 }).toISOString(),
    deleteTime: null,
  },
  {
    endTime: sub(new Date(), { days: 1, minutes: 10 }).toISOString(),
    startTime: sub(new Date(), { days: 1 }).toISOString(),
    deleteTime: null,
  },
];

const futureAppointments = [
  {
    endTime: add(new Date(), { days: 12, minutes: 15 }).toISOString(),
    startTime: add(new Date(), { days: 12 }).toISOString(),
    deleteTime: null,
  },
  {
    endTime: add(new Date(), { days: 8, minutes: 15 }).toISOString(),
    startTime: add(new Date(), { days: 8 }).toISOString(),
    deleteTime: null,
  },
];

const mixedAppointments = [
  {
    endTime: sub(new Date(), { days: 1 }).toISOString(),
    startTime: sub(new Date(), { days: 1, minutes: 15 }).toISOString(),
    deleteTime: sub(new Date(), { minutes: 30 }).toISOString(),
  },
  {
    endTime: add(sub(new Date(), { days: 5 }), { minutes: 15 }).toISOString(),
    startTime: sub(new Date(), { days: 5 }).toISOString(),
    deleteTime: null,
  },
  {
    endTime: add(new Date(), { days: 10, minutes: 15 }).toISOString(),
    startTime: add(new Date(), { days: 10 }).toISOString(),
    deleteTime: null,
  },
];

const allDeletedAppointments = [
  {
    endTime: sub(new Date(), { days: 1 }).toISOString(),
    startTime: add(sub(new Date(), { days: 1 }), { minutes: 15 }).toISOString(),
    deleteTime: sub(new Date(), { minutes: 30 }).toISOString(),
  },
  {
    endTime: add(sub(new Date(), { days: 5 }), { minutes: 15 }).toISOString(),
    startTime: sub(new Date(), { days: 5 }).toISOString(),
    deleteTime: sub(new Date(), { minutes: 30 }).toISOString(),
  },
  {
    endTime: add(new Date(), { days: 10, minutes: 15 }).toISOString(),
    startTime: add(new Date(), { days: 10 }).toISOString(),
    deleteTime: sub(new Date(), { minutes: 30 }).toISOString(),
  },
];

describe('Lead Assignments', () => {
  describe('getTime', () => {
    it('returns 1636375320000 as time when', () => {
      expect(getTime('2021-11-08T12:42:00Z')).toEqual(1636375320000);
    });
    it('Should be return 0 if input is falsy', () => {
      expect(getTime('')).toEqual(0);
    });
  });

  describe('getSortedDate', () => {
    it('returns sortedDate when pass unsortedDate', () => {
      expect(getSortedDate(unsortedDate)).toEqual(sortedDate);
    });
  });

  describe('getValidAppointmentDate', () => {
    it('returns the new new appointment start date when passed only 1 appointment past data', () => {
      const expectedValue = format(
        utcToZonedTime(pastAppointment[0].startTime, 'UTC'),
        'dd/MM/yyyy (hh:mm:ss aa)'
      );
      expect(getValidAppointmentDate(pastAppointment)).toEqual(expectedValue);
    });

    it('returns the appointment start date when passed only 1 appointment future data', () => {
      expect(getValidAppointmentDate(futureAppointment)).toEqual(
        format(
          utcToZonedTime(futureAppointment[0].startTime, 'UTC'),
          'dd/MM/yyyy (hh:mm:ss aa)'
        )
      );
    });

    it('returns last appointment date when passed with past multiple appointments data', () => {
      expect(getValidAppointmentDate(pastAppointments)).toEqual(
        format(
          utcToZonedTime(pastAppointments[2].startTime, 'UTC'),
          'dd/MM/yyyy (hh:mm:ss aa)'
        )
      );
    });

    it('returns earliest appointment date when passed with future appointment data', () => {
      expect(getValidAppointmentDate(futureAppointments)).toEqual(
        format(
          utcToZonedTime(futureAppointments[1].startTime, 'UTC'),
          'dd/MM/yyyy (hh:mm:ss aa)'
        )
      );
    });

    it('returns earliest appointment date when passed with mixed appointments data', () => {
      expect(getValidAppointmentDate(mixedAppointments)).toEqual(
        format(
          utcToZonedTime(mixedAppointments[2].startTime, 'UTC'),
          'dd/MM/yyyy (hh:mm:ss aa)'
        )
      );
    });

    it('returns null as none of the appointment lies within the search range', () => {
      expect(
        getValidAppointmentDate(mixedAppointments, {
          criteria: 'appointmentData',
          range: {
            startDate: sub(new Date(), { days: 20 }),
            endDate: sub(new Date(), { days: 10 }),
          },
        })
      ).toEqual(null);
    });

    it('returns null when passed with all deleted appointments data', () => {
      expect(getValidAppointmentDate(allDeletedAppointments)).toEqual(null);
    });
  });

  describe('getValidAppointment', () => {
    const searchRange = {
      criteria: 'appointmentData',
      range: {
        startDate: sub(new Date(), { days: 5 }),
        endDate: new Date(),
      },
    };

    it('returns false when the appointment time(past) is not within search range', () => {
      expect(
        getValidAppointment(
          {
            startTime: sub(new Date(), { days: 10 }).toISOString(),
          },
          searchRange
        )
      ).toBeFalsy();
    });

    it('returns false when the appointment date(future) is not within search range', () => {
      expect(
        getValidAppointment(
          {
            startTime: add(new Date(), { days: 1 }).toISOString(),
          },
          searchRange
        )
      ).toBeFalsy();
    });

    it('returns true when the appointment date is within search range', () => {
      expect(
        getValidAppointment(
          {
            startTime: sub(new Date(), { days: 1, minutes: 15 }).toISOString(),
          },
          searchRange
        )
      ).toBeTruthy();
    });
  });
});
