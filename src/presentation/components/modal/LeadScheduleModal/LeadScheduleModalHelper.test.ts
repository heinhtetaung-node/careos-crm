import { startOfDay } from 'utils/datetime';

import {
  formatDateForAppointmentQuery,
  getEndTime,
  setTime,
} from './LeadScheduleModal.helper';

describe('formatDateForAppointmentQuery', () => {
  it('should return the formatted date for appointment query', () => {
    const result = formatDateForAppointmentQuery(
      startOfDay(new Date('2023-10-24T00:00:00.000Z'))
    );
    expect(result).toEqual('2023-10-24T00:00:00.000Z');
  });

  it('should return the formatted date for appointment query', () => {
    const result = formatDateForAppointmentQuery(
      startOfDay(new Date('2023-10-24T12:00:00.000Z'))
    );
    expect(result).toEqual('2023-10-24T00:00:00.000Z');
  });
});

describe('getEndTime', () => {
  it('should return the end time', () => {
    const result = getEndTime(
      new Date('2023-10-24T00:00:00.000Z'),
      30
    ).toISOString();
    expect(result).toEqual('2023-10-24T00:30:00.000Z');
  });

  it('should return the end time', () => {
    const result = getEndTime(
      new Date('2024-02-29T06:00:00.000Z'),
      15
    ).toISOString();
    expect(result).toEqual('2024-02-29T06:15:00.000Z');
  });
});

describe('setTime', () => {
  it('should return the set time', () => {
    const result = setTime('2023-10-24T00:00:00.000Z', '10:15');
    expect(result).toEqual(new Date('2023-10-24T03:15:00.000Z'));
  });

  it('should return the set time', () => {
    const result = setTime('2020-02-20T00:00:00.000Z', '03:15');
    expect(result).toEqual(new Date('2020-02-19T20:15:00.000Z'));
  });
});
