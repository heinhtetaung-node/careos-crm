import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  Dialog,
  Grid,
  makeStyles,
  withStyles,
} from '@material-ui/core';
import * as Icon from '@material-ui/icons';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';

import { dayComponent } from 'models/DayComponent';
import { hideSnackBar, showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';
import { SelectElement } from 'shared/types/controls';
import {
  format,
  add,
  sub,
  isValid as isValidDate,
  isSameDay,
  differenceInDays,
  startOfWeek,
} from 'utils/datetime';

import ScheduleModalHelper, {
  IScheduleData,
  ISaveAppointment,
  getEndTime,
  DAY_PER_WEEK,
  TIME_OUT_INVALID_SEARCH_DATE,
  checkBeforeCurrentTime,
  IGetAppointmentDetail,
} from './scheduleModalHelper';

import * as CONSTANTS from '../../../shared/constants';
import Controls from '../controls/Control';
import Loader from '../Loader';
import { ITimeslotsData, IUpdateData } from '../Timeslots/TimeslotsHelper';
import './index.scss';

import DaysComponent from '../DaysComponents/DaysComponent';

import TimeSlots from 'presentation/components/Timeslots';

export interface IScheduleModel {
  type: string;
  subject: string;
  isPayment?: boolean;
  isUrgent?: boolean;
}

interface IPropsScheduleModal {
  openDialog: boolean;
  closeDialog: () => void;
  appointmentOptions: () => {
    id: string;
    title: string;
  }[];
  HelperScheduleData: new () => ScheduleModalHelper;
  onSubmit: (payload: ISaveAppointment, filters: IScheduleModel) => void;
  onGetAppointment: (payload: string) => void;
  onGetAppointmentDetail: IGetAppointmentDetail;
  handleDeleteAppointment?: (data: IDeleteAppointment) => void;
  loading: boolean;
  schedulerData?: IScheduleData;
  initialFilter?: Record<string, unknown>;
}

const useStyles = makeStyles((theme) => ({
  scheduleModalHeader: {
    backgroundColor: theme.palette.info.dark,
    borderRadius: '7px 7px 0 0',
  },
  scheduleModalTimeLine: {
    backgroundColor: theme.palette.info.light,
  },
  formField: {
    '&& .MuiSelect-select': {
      color: Color.GREY_800,
    },
  },
}));

const Checkbox = withStyles(() => ({
  root: {
    '&:not($checked) .MuiIconButton-label:after': {
      content: '""',
      height: 21,
      width: 21,
      border: '2.5px solid #000',
      borderRadius: 5,
      position: 'absolute',
      backgroundColor: '#fff',
      zIndex: 0,
    },
    '&:not($checked) .MuiIconButton-label': {
      position: 'relative',
    },
  },
  checked: {},
}))(Controls.Checkbox);

function ScheduleModal({
  openDialog,
  closeDialog,
  initialFilter = {},
  appointmentOptions,
  HelperScheduleData,
  onSubmit,
  schedulerData,
  onGetAppointment,
  onGetAppointmentDetail,
  loading,
  handleDeleteAppointment,
}: Readonly<IPropsScheduleModal>) {
  const defaultFilter = {
    type: 'requested',
    subject: '',
    ...initialFilter,
  };
  const helperScheduleData = useMemo(
    () => new HelperScheduleData(),
    [HelperScheduleData]
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formFilter, setFormFilter] = useState<IScheduleModel>(defaultFilter);

  const [formCallData, setformCallData] = useState({
    dateTimeOfCall: '',
    lengthOfCall: 0,
  });

  const [isValid, setIsValid] = useState<boolean>(false);
  const [daysListData, setDaysListData] = useState<Array<dayComponent>>([]);
  const [timeSlotsData, setTimeSlotsData] = useState<ITimeslotsData>({
    date: '',
    start: '',
    end: '',
    slots: [],
    schedule: [],
  });

  const [selectedDateCallback, setSelectedDateCallback] = useState<string>('');
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<string>();

  const clearData = () => {
    setFormFilter(defaultFilter);
    setformCallData({
      dateTimeOfCall: '',
      lengthOfCall: 0,
    });
    setTimeSlotsData({
      date: '',
      start: '',
      end: '',
      slots: [],
      schedule: [],
    });
    setSelectedDateCallback('');
  };

  useEffect(() => {
    const newDate = new Date().toISOString();
    if (openDialog) {
      onGetAppointment(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog]);

  useEffect(() => {
    const dayListData = helperScheduleData.buildDaysListData();
    dayListData.forEach((item: any) => {
      const newItem = item;
      if (isSameDay(new Date(newItem.date), new Date(selectedDateCallback))) {
        newItem.isActive = true;
      }
    });

    setDaysListData(dayListData);
  }, [selectedDateCallback]);

  useEffect(() => {
    if (schedulerData) {
      helperScheduleData.data = schedulerData;
      const dayListData = helperScheduleData.buildDaysListData();
      const timeslotData = helperScheduleData.buildTimeslotData(new Date());
      if (dayListData) {
        setDaysListData(dayListData);
      }
      if (timeslotData) {
        setTimeSlotsData(timeslotData);
      }
      setTempDate(schedulerData.start);
    }
  }, [schedulerData]);

  const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const value =
      target.type && target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    setFormFilter({ ...formFilter, [name]: value });
  };
  const handleSelectInputChange = ({ target }: ChangeEvent<SelectElement>) => {
    const { name, value } = target;
    setFormFilter({ ...formFilter, [name as string]: value });
  };

  // INFO: Handle functions for Days List Block
  const handleDaysCompCallback = (day: dayComponent) => {
    const newScheduleData = helperScheduleData.buildTimeslotData(
      new Date(day.date)
    );
    if (newScheduleData) {
      setTimeSlotsData(newScheduleData);
      setSelectedDateCallback(day.date);
      setformCallData({
        dateTimeOfCall: '',
        lengthOfCall: 0,
      });
    }
  };

  // INFO: Handle functions for Time-slot Block
  const handleTimeSlotsDataCallback = (timeSlot: IUpdateData) => {
    const date = selectedDateCallback;
    const time = `${timeSlot.startTime}:00`;
    const dateCombined = new Date(`${date} ${time} +0000`);
    const dateTimeOfCallConverted = dateCombined.toISOString();
    setformCallData({
      ...formCallData,
      dateTimeOfCall: dateTimeOfCallConverted,
      lengthOfCall: timeSlot.length,
    });
  };

  useMemo(() => {
    const checkScheduleModelReadyToSave = () => {
      const defaultModel = {
        type: '',
        subject: '',
        dateTimeOfCall: '',
        lengthOfCall: 0,
      };
      if (
        formFilter.type !== defaultModel.type &&
        formFilter.subject !== defaultModel.subject &&
        formCallData.dateTimeOfCall !== defaultModel.dateTimeOfCall &&
        formCallData.lengthOfCall !== defaultModel.lengthOfCall
      ) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    };
    checkScheduleModelReadyToSave();
  }, [formFilter, formCallData]);

  const handleSubmit = () => {
    if (checkBeforeCurrentTime(formCallData.dateTimeOfCall)) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.passedBookingTime'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      const payload: ISaveAppointment = {
        startTime: formCallData.dateTimeOfCall,
        endTime: getEndTime(
          formCallData.dateTimeOfCall,
          formCallData.lengthOfCall
        ),
        appointment: {
          appointmentType: formFilter.type,
          subject: formFilter.subject,
        },
      };

      onSubmit(payload, formFilter);
      clearData();
      closeDialog();
    }
  };

  const handleDateSearchChange = (date: Date | null) => {
    const isNextWeek =
      date && schedulerData?.start
        ? differenceInDays(
            new Date(date),
            startOfWeek(new Date(schedulerData.start))
          ) >= DAY_PER_WEEK
        : false;
    const isLastWeek =
      date && schedulerData?.start
        ? differenceInDays(
            new Date(date),
            startOfWeek(new Date(schedulerData.start))
          ) <= 0
        : false;

    if (date && differenceInDays(new Date(date), new Date()) < 0) {
      dispatch(hideSnackBar());
      setTimeout(() => {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('text.invalidDateSearch'),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
      }, TIME_OUT_INVALID_SEARCH_DATE);
      return;
    }

    let newScheduleDays;
    if (isNextWeek) {
      newScheduleDays = date && new Date(date).toISOString();
      if (newScheduleDays) {
        onGetAppointment(newScheduleDays);
      }
    } else if (
      isLastWeek &&
      date &&
      differenceInDays(new Date(date), new Date()) >= 0
    ) {
      newScheduleDays = new Date(date).toISOString();
      onGetAppointment(newScheduleDays);
    }
    setSearchDate(date);
  };

  const handleDateSearch = () => {
    if (searchDate) {
      setSelectedDateCallback(searchDate.toDateString());
    }
  };

  const handleWeekChange = (action: string) => {
    const startDate = tempDate ? new Date(tempDate).toString() : new Date();
    const nextMonday = startOfWeek(add(new Date(startDate), { weeks: 1 }), {
      weekStartsOn: 1,
    }).toISOString();

    const previousMonday = startOfWeek(sub(new Date(startDate), { weeks: 1 }), {
      weekStartsOn: 1,
    }).toISOString();

    switch (action) {
      case 'NEXT_WEEK':
        onGetAppointment(nextMonday);
        break;
      case 'PREVIOUS_WEEK':
        onGetAppointment(previousMonday);
        break;
      default:
        break;
    }
  };

  // INFO: Using memo for render child comp
  const renderDays = useMemo(
    () => (
      <DaysComponent
        numberOfDays=""
        daysDataArray={daysListData}
        isLoading={loading}
        selectedDate={
          selectedDateCallback && isValidDate(new Date(selectedDateCallback))
            ? format(new Date(selectedDateCallback), 'yyyy-MM-dd')
            : undefined
        }
        onSelect={handleDaysCompCallback}
        onChange={handleWeekChange}
      />
    ),
    [daysListData, selectedDateCallback, loading]
  );

  const renderTimeSlots = useMemo(() => {
    if (!timeSlotsData.slots.length) {
      return <Loader />;
    }
    return (
      <TimeSlots
        data={timeSlotsData}
        onUpdate={handleTimeSlotsDataCallback}
        onGetAppointmentDetail={onGetAppointmentDetail}
        handleDeleteAppointment={handleDeleteAppointment}
      />
    );
  }, [timeSlotsData, selectedDateCallback]);

  return (
    <Dialog
      open={openDialog}
      aria-labelledby="form-dialog-title"
      className="shared-common-modal schedule-modal-override"
    >
      <div className="modal-header no-background">
        <div
          className="close-btn"
          data-testid="close-btn"
          onClick={() => closeDialog()}
          onKeyDown={() => closeDialog()}
          role="button"
          aria-label="Close"
          tabIndex={0}
        >
          <Icon.Close className="unittest__schedule__close-btn" />
        </div>
      </div>
      <Grid item xs={12} md={12} className="schedule-modal">
        <div
          className={`${classes.scheduleModalHeader} schedule-modal__header`}
        >
          <Grid container item spacing={6} className={classes.formField}>
            <Grid item xs={6} md={4}>
              <div className="schedule-modal__title">
                {getString('text.appointmentType')}
              </div>
              <Controls.Select
                name="type"
                className="schedule-modal__form"
                value={formFilter.type}
                onChange={handleSelectInputChange}
                options={appointmentOptions()}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <div className="schedule-modal__title">
                {getString('text.subjectAsterisk')}
              </div>
              <Controls.Input
                name="subject"
                className="schedule-modal__form"
                value={formFilter.subject}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6} md={4} className="schedule-modal__payment-call">
              {initialFilter.isPayment !== undefined && (
                <Checkbox
                  name="isPayment"
                  value={formFilter.isPayment}
                  label={getString('text.paymentCall')}
                  onChange={handleChange}
                  data-testid="is-payment"
                />
              )}
              {initialFilter.isUrgent !== undefined && (
                <Checkbox
                  name="isUrgent"
                  value={formFilter.isUrgent}
                  label={getString('text.urgent')}
                  onChange={handleChange}
                  data-testid="is-urgent"
                />
              )}
            </Grid>
          </Grid>
        </div>
        <div
          className={`${classes.scheduleModalTimeLine} schedule-modal__time-line`}
        >
          <Grid container item spacing={2}>
            <Grid item xs={6} md={4}>
              <div className="schedule-modal__date-search">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="schedule-modal__date-search__date-input"
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="dateSearch"
                    value={searchDate}
                    onChange={handleDateSearchChange}
                    KeyboardButtonProps={{
                      'aria-label': 'date search',
                    }}
                    placeholder={getString('text.enterAppointmentDate')}
                  />
                </MuiPickersUtilsProvider>
                <Button
                  variant="contained"
                  className="schedule-modal-btn search-btn bg-primary text-white disabled:text-white hover:bg-primary hover:text-white"
                  disabled={!searchDate}
                  onClick={handleDateSearch}
                >
                  {getString('text.search')}
                </Button>
              </div>
            </Grid>
            <Grid item xs={6} md={8}>
              <div className="schedule-modal__save">
                <Button
                  variant="contained"
                  color="primary"
                  className="schedule-modal-btn"
                  disabled={!isValid}
                  onClick={() => handleSubmit()}
                >
                  {getString('text.save')}
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} md={12}>
              {renderDays}
            </Grid>
          </Grid>
        </div>
        <div className="schedule-modal__time-slot">{renderTimeSlots}</div>
      </Grid>
    </Dialog>
  );
}

export default ScheduleModal;
