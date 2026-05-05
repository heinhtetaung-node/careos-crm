import TimeslotsHelper from './TimeslotsHelper';

describe('TimeSlots Component', () => {
  const timeSlotData: any = {
    date: '2022-07-19',
    end: '20:00',
    events: [
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: false,
          subject: 'ok',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:50.159311Z',
        deleteTime: null,
        endTime: '2022-07-19T18:33:00Z',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/dc9a75eb-fe45-4286-94fe-9559d1727972',
        startTime: '2022-07-19T18:30:00Z',
        updateTime: '2022-07-19T03:04:50.159311Z',
      },
    ],
    schedule: [
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: false,
          subject: 'ok',
          status: 'CALLED',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:50.159311Z',
        deleteTime: null,
        endTime: '2022-07-19T18:33:00Z',
        isPayment: false,
        length: '3',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/dc9a75eb-fe45-4286-94fe-9559d1727972',
        startTime: '2022-07-19T18:30:00Z',
        time: '2022-07-19T18:30:00Z',
        updateTime: '2022-07-19T03:04:50.159311Z',
      },
    ],
    slots: [3, 6, 9, 12, 15],
    start: '09:00',
  };

  const timeSlotHelper = new TimeslotsHelper();
  timeSlotHelper.data = timeSlotData;

  it('returns slot in correct format', () => {
    const slotData = timeSlotHelper.cookTimesData();
    expect(slotData).toMatchObject({
      '18:30': {
        time: '18:30',
        appointmentDetail: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: false,
          subject: 'ok',
          status: null,
        },
        timeDetail: {
          length: '3',
          startTime: '2022-07-19T18:30:00Z',
          endTime: '2022-07-19T18:33:00Z',
        },
        type: 'default',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/dc9a75eb-fe45-4286-94fe-9559d1727972',
      },
    });
  });

  it('returns slot in correct format', () => {
    const item = { time: '09:30' };
    const inputData = {
      '9:00': { time: '9:00', isStartRow: true },
      '9:03': { time: '9:03' },
      '9:06': { time: '9:06' },
      '9:09': { time: '9:09' },
      '9:12': { time: '9:12' },
      '9:15': { time: '9:15' },
      '9:18': { time: '9:18' },
      '9:21': { time: '9:21' },
      '9:24': { time: '9:24' },
      '9:27': { time: '9:27' },
      '9:30': { time: '9:30' },
      '9:33': { time: '9:33' },
      '9:36': { time: '9:36' },
      '9:39': { time: '9:39' },
      '9:42': { time: '9:42' },
      '9:45': { time: '9:45' },
      '9:48': { time: '9:48' },
      '9:51': { time: '9:51' },
      '9:54': { time: '9:54' },
      '9:57': { time: '9:57' },
    };

    const slotData = timeSlotHelper.getSlotsData(item, inputData);
    expect(slotData).toEqual([3, 6, 9, 12, 15]);
  });

  it('returns slot in correct format', () => {
    const inputData = {
      '9:00': { time: '9:00', isStartRow: true },
      '9:03': { time: '9:03' },
      '9:06': { time: '9:06' },
      '9:09': { time: '9:09' },
      '9:12': { time: '9:12' },
      '9:15': { time: '9:15' },
      '9:18': { time: '9:18' },
      '9:21': { time: '9:21' },
      '9:24': { time: '9:24' },
      '9:27': { time: '9:27' },
      '9:30': { time: '9:30' },
      '9:33': { time: '9:33' },
      '9:36': { time: '9:36' },
      '9:39': { time: '9:39' },
      '9:42': { time: '9:42' },
      '9:45': { time: '9:45' },
      '9:48': { time: '9:48' },
      '9:51': { time: '9:51' },
      '9:54': { time: '9:54' },
      '9:57': { time: '9:57' },
    };

    const slotData = timeSlotHelper.handleSelectSlot(
      { startTime: '9:30', length: 15 },
      inputData
    );
    expect(slotData).toEqual({
      '9:00': { isStartRow: true, time: '9:00' },
      '9:03': { time: '9:03' },
      '9:06': { time: '9:06' },
      '9:09': { time: '9:09' },
      '9:12': { time: '9:12' },
      '9:15': { time: '9:15' },
      '9:18': { time: '9:18' },
      '9:21': { time: '9:21' },
      '9:24': { time: '9:24' },
      '9:27': { time: '9:27' },
      '9:30': {
        group: 'active',
        isActive: true,
        position: 'start',
        time: '9:30',
      },
      '9:33': { group: 'active', isActive: true, time: '9:33' },
      '9:36': { group: 'active', isActive: true, time: '9:36' },
      '9:39': { group: 'active', isActive: true, time: '9:39' },
      '9:42': {
        group: 'active',
        isActive: true,
        position: 'last',
        time: '9:42',
      },
      '9:45': { time: '9:45' },
      '9:48': { time: '9:48' },
      '9:51': { time: '9:51' },
      '9:54': { time: '9:54' },
      '9:57': { time: '9:57' },
    });
  });
});
