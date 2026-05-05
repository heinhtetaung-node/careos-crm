import OrderScheduleModalHelper from './OrderScheduleModal.helper';

describe('OrderScheduleModalHelper', () => {
  it('builds days list data with urgent calls number', () => {
    const orderScheduleModalHelper = new OrderScheduleModalHelper();

    orderScheduleModalHelper.data = {
      start: 'today',
      length: 6,
      days: [
        {
          date: '2021-10-05',
          start: '09:00',
          end: '20:00',
          slots: [3, 6, 9, 12, 15],
          schedule: [
            {
              startTime: '2021-10-04T09:30:00Z',
              endTime: '2021-10-04T09:39:00Z',
              time: '2021-10-04T09:30:00Z',
              length: '9',
              appointment: {
                order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
                appointmentType: 'wrong_document',
                subject: 'bbb',
                urgent: true,
                purpose: 'WRONG_DOCUMENT',
              },
              isUrgent: true,
            },
          ],
        },
      ],
    };

    expect(orderScheduleModalHelper.buildDaysListData()).toEqual([
      {
        date: '2021-10-05',
        freeSlots: 217,
        urgentCalls: 1,
        appointmentCalls: 0,
        isActive: false,
      },
    ]);
  });
});
