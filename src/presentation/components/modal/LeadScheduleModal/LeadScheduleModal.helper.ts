import { date, object, string } from 'yup';

import { getString } from 'presentation/theme/localization';
import { add, format, set, DateType } from 'utils/datetime';

import ScheduleModalHelper, {
  IDays,
  MINUTE_PER_SLOT,
} from '../../scheduleModal/scheduleModalHelper';

interface ILeadDays extends IDays {
  paymentCalls: number;
}

export const leadScheduleModalValidationSchema = () =>
  object().shape({
    appointmentType: string().required(getString('text.required')),
    subject: string().trim().required(getString('text.required')),
    isPaymentCall: string().required(getString('text.required')),
    startTime: date().required(getString('text.required')),
  });

export const formatDateForAppointmentQuery = (passedDate: DateType) =>
  `${format(new Date(passedDate), "yyyy-MM-dd'T'HH:mm")}:00.000Z`;

export const getEndTime = (startTime: DateType, lengthOfCall: number) =>
  add(new Date(startTime), { minutes: lengthOfCall });

export const setTime = (dateData: string, time: string) => {
  const hr = parseInt(time.split(':')[0], 10);
  const min = parseInt(time.split(':')[1], 10);
  if (Number.isNaN(hr) || Number.isNaN(min)) {
    newrelic?.noticeError?.(`Selected timeslot is not a valid time: ${time}`);
  }

  return set(new Date(dateData), { hours: hr, minutes: min });
};

export const initialFormValue = {
  appointmentType: '',
  subject: '',
  isPaymentCall: '',
  startTime: undefined as undefined | DateType,
  lengthOfCall: undefined as undefined | number,
};

export const initialTimeSlotData = {
  date: '',
  start: '',
  end: '',
  slots: [],
  schedule: [],
};

export const appointmentOptions = () => [
  { id: 'requested', title: getString('text.customerRequested') },
  { id: 'agreed', title: getString('text.customerAgreed') },
  { id: 'assumed', title: getString('text.reminderCall') },
];

export const paymentCallOptions = () => [
  { id: 'yes', title: getString('text.yes') },
  { id: 'no', title: getString('text.no') },
];
export default class LeadScheduleModalHelper extends ScheduleModalHelper {
  buildDaysListData(): ILeadDays[] {
    const daysDataListOrigin = this.data?.days || [];
    const cookedDaysList: ILeadDays[] = [];
    daysDataListOrigin.forEach((dayItem) => {
      const tmpDay: ILeadDays = {
        date: '',
        freeSlots: 0,
        paymentCalls: 0,
        appointmentCalls: 0,
        isActive: false,
      };
      let totalPayCall = 0;
      let totalAppCall = 0;
      let takenSlots = 0;

      dayItem.schedule.forEach((callItem) => {
        if (callItem.isPayment) {
          totalPayCall += 1;
        } else {
          totalAppCall += 1;
        }
        takenSlots += parseInt(callItem.length, 10);
      });

      const maxFreeSlots = this.getMaxFreeSlotsPerDay(
        dayItem.start,
        dayItem.end
      );
      tmpDay.date = dayItem.date;
      tmpDay.freeSlots = maxFreeSlots - takenSlots / MINUTE_PER_SLOT;
      tmpDay.paymentCalls = totalPayCall;
      tmpDay.appointmentCalls = totalAppCall;

      cookedDaysList.push(tmpDay);
    });

    return cookedDaysList;
  }
}
