import { format } from 'utils/datetime';

import DaysComponentHelper from './DaysComponentHelper';

describe('DaysComponentHelper', () => {
  const daysDataHelper = new DaysComponentHelper();

  it('should return newDaysData with selected date', () => {
    const daysDataArray = [
      {
        date: '2021-09-01',
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
      {
        date: '2021-09-02',
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
      {
        date: '2021-09-03',
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
    ];
    const selectedDate = '2021-09-02';

    const newDaysData = daysDataHelper.getDaysArray(
      daysDataArray,
      selectedDate
    );

    expect(newDaysData).toEqual([
      {
        appointmentCalls: 1,
        date: '2021-09-01',
        isActive: false,
        freeSlots: 1,
      },
      { appointmentCalls: 1, date: '2021-09-02', isActive: true, freeSlots: 1 },
      {
        appointmentCalls: 1,
        date: '2021-09-03',
        isActive: false,
        freeSlots: 1,
      },
    ]);
  });

  it('should return newDaysData with selected date', () => {
    const daysDataArray = [
      {
        appointmentCalls: 1,
        date: '2021-09-03',
        isActive: false,
        freeSlots: 1,
      },
      {
        date: format(new Date(), 'yyyy-MM-dd'),
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
    ];

    const newDaysData = daysDataHelper.getDaysArray(daysDataArray, undefined);

    expect(newDaysData).toEqual([
      {
        appointmentCalls: 1,
        date: '2021-09-03',
        freeSlots: 1,
        isActive: false,
      },
      {
        appointmentCalls: 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        freeSlots: 1,
        isActive: true,
      },
    ]);
  });

  it("should return true when date array doesnt has today's date", () => {
    const daysDataArray = [
      {
        date: format(new Date(), 'yyyy-MM-dd'),
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
    ];

    const hasToday = daysDataHelper.isHasToday(daysDataArray);

    expect(hasToday).toBeTruthy();
  });

  it("should return false when date array doesnt have today's date", () => {
    const daysDataArray = [
      {
        date: '2020-02-20',
        freeSlots: 1,
        appointmentCalls: 1,
        isActive: false,
      },
    ];

    const hasToday = daysDataHelper.isHasToday(daysDataArray);

    expect(hasToday).toBeFalsy();
  });
});
