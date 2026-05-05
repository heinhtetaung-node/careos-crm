import ScheduleModalHelper, {
  IDays,
  MINUTE_PER_SLOT,
} from '../../scheduleModal/scheduleModalHelper';

interface IOrderDays extends IDays {
  urgentCalls: number;
}

export default class OrderScheduleModalHelper extends ScheduleModalHelper {
  buildDaysListData(): IOrderDays[] {
    const daysDataListOrigin = this.data?.days || [];
    const cookedDaysList: IOrderDays[] = [];
    daysDataListOrigin.forEach((dayItem) => {
      const tmpDay: IOrderDays = {
        date: '',
        freeSlots: 0,
        urgentCalls: 0,
        appointmentCalls: 0,
        isActive: false,
      };
      let totalAppCall = 0;
      let takenSlots = 0;
      let totalUrgentCall = 0;

      dayItem.schedule.forEach((callItem) => {
        if (callItem.isUrgent) {
          totalUrgentCall += 1;
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
      tmpDay.urgentCalls = totalUrgentCall;
      tmpDay.appointmentCalls = totalAppCall;

      cookedDaysList.push(tmpDay);
    });

    return cookedDaysList;
  }
}
