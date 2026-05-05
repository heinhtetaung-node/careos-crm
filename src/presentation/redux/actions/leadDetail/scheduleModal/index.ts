import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadActionTypes {
  SAVE_APPOINTMENT = '[LeadsDetail] SAVE_APPOINTMENT',
  SAVE_APPOINTMENT_SUCCESS = '[LeadsDetail] SAVE_APPOINTMENT_SUCCESS',
  SAVE_APPOINTMENT_FAIL = '[LeadsDetail] SAVE_APPOINTMENT_FAIL',
  GET_APPOINTMENT = '[LeadsDetail] GET_APPOINTMENT',
  GET_APPOINTMENT_SUCCESS = '[LeadsDetail] GET_APPOINTMENT_SUCCESS',
  GET_APPOINTMENT_FAIL = '[LeadsDetail] GET_APPOINTMENT_FAIL',
  DESTROY_MODAL_SCHEDULE = '[LeadsDetail] DESTROY_MODAL_SCHEDULE',
}

export const saveAppointment = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.SAVE_APPOINTMENT,
  payload,
});

export const saveAppointmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.SAVE_APPOINTMENT_SUCCESS,
  payload,
});

export const saveAppointmentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.SAVE_APPOINTMENT_FAIL,
  payload,
});

export const getAppointment = (date: any, filter = ''): IAction<any> => {
  const newPayload = {
    startDate: date,
    filter,
  };

  return {
    type: LeadActionTypes.GET_APPOINTMENT,
    payload: newPayload,
  };
};

export const getAppointmentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_APPOINTMENT_SUCCESS,
  payload,
});

export const getAppointmentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_APPOINTMENT_FAIL,
  payload,
});

export const destroyModalSchedule = (): IAction<any> => ({
  type: LeadActionTypes.DESTROY_MODAL_SCHEDULE,
});
