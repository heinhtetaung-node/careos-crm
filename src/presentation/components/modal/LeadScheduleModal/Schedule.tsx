import { AppointmentModal } from '@alphafounders/ui';
import { Badge, Box } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useFormik } from 'formik';
import _isEmpty from 'lodash/isEmpty';
import React, { useEffect, useMemo, useState } from 'react';

import {
  useDeleteAppointmentMutation,
  useLazyGetAppointmentsQuery,
} from 'data/slices/leadDetailSlices/appointmentSlice';
import { dayComponent } from 'models/DayComponent';
import Controls from 'presentation/components/controls/Control';
import { ITimeslotsData } from 'presentation/components/Timeslots/TimeslotsHelper';
import { handleData } from 'presentation/redux/epics/leadDetail/scheduleModal/scheduleModal.helper';
import { getString } from 'presentation/theme/localization';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';
import {
  isValid,
  add,
  differenceInDays,
  toDate,
  isSameWeek,
  format,
  isSameDay,
  DateType,
} from 'utils/datetime';
import useSnackbar from 'utils/snackbar';

import { getAppointmentHelper } from './helper';
import LeadScheduleModalHelper, {
  appointmentOptions,
  formatDateForAppointmentQuery,
  initialFormValue,
  initialTimeSlotData,
  leadScheduleModalValidationSchema,
  paymentCallOptions,
  setTime,
} from './LeadScheduleModal.helper';

import TimeSlots from 'presentation/components/Timeslots';

const style = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export interface ScheduleProps {
  onClose: () => void;
  isViewOnly?: boolean;
  isSaveOnly?: boolean;
  onSubmitClick?: () => unknown;
  handleSubmit: (values: {
    appointmentType: string;
    subject: string;
    isPaymentCall: string;
    startTime: string | Date | number | undefined;
    lengthOfCall: number | undefined;
  }) => Promise<unknown>;
  includeTitleBar?: boolean;
  disableSubmit?: boolean;
  refreshOnCancelAppointment?: boolean;
  leadData?: any;
}

function Schedule({
  onClose,
  handleSubmit,
  onSubmitClick,
  isViewOnly = false,
  isSaveOnly = false,
  includeTitleBar = true,
  disableSubmit = false,
  refreshOnCancelAppointment = false,
  leadData,
}: ScheduleProps) {
  const [daysListData, setDaysListData] = useState<dayComponent[]>([]);
  const [timeSlotsData, setTimeSlotsData] =
    useState<ITimeslotsData>(initialTimeSlotData);
  const [selectedDate, setSelectedDate] = useState<DateType>(new Date());

  const [getAppointments, { isFetching: getAppointmentLoading }] =
    useLazyGetAppointmentsQuery();

  const [deleteAppointment] = useDeleteAppointmentMutation();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const pastDateData = useMemo(
    () => differenceInDays(new Date(selectedDate as string), new Date()) < 0,
    [selectedDate]
  );

  const form = useFormik({
    initialValues: initialFormValue,
    validationSchema: leadScheduleModalValidationSchema(),
    validateOnChange: true,
    validateOnMount: false,
    onSubmit: handleSubmit,
  });

  const helperScheduleData = useMemo(() => new LeadScheduleModalHelper(), []);

  const fetchAppointments = async (startDate: string) => {
    const response = await getAppointments({
      startDate,
      days: 7,
    });
    if (response.isError) {
      showErrorSnackbar((response.error as any).data?.message);
    } else {
      helperScheduleData.data = handleData(
        response.data,
        leadData?.data?.sundayContactable ?? false
      );
      setDaysListData(helperScheduleData.buildDaysListData());
    }
  };

  const handleDayChange = (date: DateType) => {
    setSelectedDate(date);
    setTimeSlotsData(
      helperScheduleData.buildTimeslotData(toDate(new Date(date))) ??
        initialTimeSlotData
    );
    if (!_isEmpty(form.values.startTime)) {
      form.setFieldValue('startTime', undefined);
    }
    if (!_isEmpty(form.values.lengthOfCall)) {
      form.setFieldValue('lengthOfCall', undefined);
    }
  };

  const handleWeekChange = async (direction: 1 | -1) => {
    const weekDay = add(new Date(selectedDate), { weeks: direction, days: 0 });

    await fetchAppointments(formatDateForAppointmentQuery(weekDay));
    if (isSameWeek(weekDay, new Date())) {
      handleDayChange(new Date());
    } else {
      handleDayChange(weekDay);
    }
  };

  const handleCalendarInputChange = async (date: Date) => {
    const dateData = new Date(date);
    if (!isValid(dateData)) {
      return;
    }
    await fetchAppointments(formatDateForAppointmentQuery(dateData));
    handleDayChange(dateData);
  };

  const handleSelectTimeslot = (timeslot: {
    startTime: string;
    length: number;
  }) => {
    const startTimeValue = setTime(
      format(new Date(selectedDate), 'yyyy-MM-dd'),
      timeslot.startTime
    );
    form.setFieldValue('lengthOfCall', timeslot.length);
    form.setFieldValue('startTime', startTimeValue);
  };

  const handleDeleteAppointment = async (data: IDeleteAppointment) => {
    const response = await deleteAppointment(data);
    if (refreshOnCancelAppointment) {
      fetchAppointments(formatDateForAppointmentQuery(selectedDate)).then(
        () => {
          handleDayChange(selectedDate);
        }
      );
    }
    if ('error' in response) {
      showErrorSnackbar((response.error as any).data?.message);
    } else {
      showSuccessSnackbar(getString('text.deleteAppointmentSuccess'));
      onClose();
    }
  };

  const renderTimeSlots = useMemo(
    () => (
      <TimeSlots
        viewOnly={isViewOnly || pastDateData}
        data={timeSlotsData}
        onUpdate={handleSelectTimeslot}
        onGetAppointmentDetail={getAppointmentHelper}
        handleDeleteAppointment={handleDeleteAppointment}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeSlotsData]
  );

  useEffect(() => {
    const asnycFn = async () => {
      await fetchAppointments(formatDateForAppointmentQuery(selectedDate));
      handleDayChange(selectedDate);
    };
    asnycFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={style} className="text-left">
      <Badge
        badgeContent={
          includeTitleBar &&
          !isSaveOnly && (
            <span
              className="bg-white w-8 h-8 rounded-full flex justify-center items-center"
              role="button"
              data-testid="appointment-close-x"
              tabIndex={0}
              onKeyDown={() => onClose()}
              onClick={() => onClose()}
              aria-label="Close appointment modal"
            >
              <Close className="unittest__schedule__close-btn" />
            </span>
          )
        }
      >
        <AppointmentModal
          timeSlots={renderTimeSlots}
          loading={getAppointmentLoading}
          isViewOnly={isViewOnly}
          showCancelBtn={!isSaveOnly}
          includeTitleBar={includeTitleBar}
          Inputs={[
            ...(isViewOnly || pastDateData
              ? []
              : [
                  {
                    id: 'appointmentType',
                    label: getString('timeSlotCallBack.appointmentType'),
                    Component: (
                      <Controls.Select
                        name="appointmentType"
                        placeholder={getString('text.pleaseSelect')}
                        value={form.values.appointmentType}
                        onChange={(e) =>
                          form.setFieldValue('appointmentType', e.target.value)
                        }
                        options={appointmentOptions()}
                        error={
                          !form.isValid && Boolean(form.errors.appointmentType)
                        }
                        errorType={!form.isValid && form.errors.appointmentType}
                      />
                    ),
                  },
                  {
                    id: 'subject',
                    label: getString('text.subject'),
                    Component: (
                      <Controls.Input
                        name="subject"
                        placeholder={getString('text.enterSubject')}
                        value={form.values.subject}
                        onChange={(e: any) =>
                          form.setFieldValue('subject', e.target.value)
                        }
                        error={!form.isValid && form.errors.subject}
                      />
                    ),
                  },
                  {
                    id: 'paymentCall',
                    label: getString('text.paymentCall'),
                    Component: (
                      <Controls.Select
                        name="paymentType"
                        placeholder={getString('text.pleaseSelect')}
                        value={form.values.isPaymentCall}
                        onChange={(e) =>
                          form.setFieldValue('isPaymentCall', e.target.value)
                        }
                        options={paymentCallOptions()}
                        error={
                          !form.isValid && Boolean(form.errors.isPaymentCall)
                        }
                        errorType={!form.isValid && form.errors.isPaymentCall}
                      />
                    ),
                  },
                ]),
            {
              id: 'date',
              label: getString('text.date'),
              Component: (
                <Controls.KeyBoardDatePicker
                  name="appointmentDate"
                  data-testid="appointmentDate"
                  className="rounded-xl"
                  value={toDate(new Date(selectedDate)).toDateString()}
                  onChange={(val) => handleCalendarInputChange(val as Date)}
                  invalidDateMessage={false}
                  minDateMessage={false}
                  autoOk
                  disableToolbar
                  fixedLabel={false}
                />
              ),
            },
          ]}
          days={daysListData.map((day) => {
            const newSelectedDate = new Date(day.date);
            return {
              id: day.date,
              day: isSameDay(new Date(newSelectedDate), new Date())
                ? getString('text.today')
                : getString(
                    `weekDayFull.${format(new Date(newSelectedDate), 'EEEE')}`
                  ),
              date: format(new Date(newSelectedDate), 'dd/MM/yyyy'),
              free: day.freeSlots,
              appointment: day.appointmentCalls,
              paymentCall: day.paymentCalls as number,
              active: isSameDay(
                new Date(newSelectedDate),
                new Date(selectedDate)
              ),
              disabled: false,
              onClick: (date) => handleDayChange(new Date(date)),
            };
          })}
          disableLeftArrow={false}
          onLeftArrowClick={() => handleWeekChange(-1)}
          onRightArrowClick={() => handleWeekChange(1)}
          onAddClick={() => {
            onSubmitClick?.();
            form.handleSubmit();
          }}
          submitting={form.isSubmitting}
          onCancelClick={() => onClose()}
          disableSubmit={!form.isValid || pastDateData || disableSubmit}
        />
      </Badge>
    </Box>
  );
}

export default Schedule;
